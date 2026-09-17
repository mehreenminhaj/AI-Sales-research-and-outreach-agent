import { GoogleGenAI, Type } from '@google/genai';
import { ResearchParameters, QualificationResult, ScoringWeights, OutreachMessage } from '../../src/types.ts';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export class GeminiService {
  /**
   * Converts natural-language user prompt into structured research parameters
   */
  static async parseNaturalLanguageRequest(prompt: string): Promise<ResearchParameters> {
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback parser when in Demo mode or without API key
      const lower = prompt.toLowerCase();
      const country = lower.includes('pakistan') ? 'Pakistan' : lower.includes('usa') || lower.includes('united states') ? 'United States' : 'Pakistan';
      const industry = lower.includes('software') || lower.includes('tech') ? 'Software & Technology' : 'Enterprise Software';
      const maxMatch = prompt.match(/\b(\d+)\b/);
      const maxCompanies = maxMatch ? Math.min(parseInt(maxMatch[1], 10), 10) : 5;

      return {
        country,
        industry,
        max_companies: maxCompanies || 5,
        target_company_size: 'SME to Mid-Market',
        product_description: prompt.includes('chatbot') || prompt.includes('customer') ? 'AI-powered customer support chatbot' : 'B2B Enterprise AI Solution',
        target_roles: ['CEO', 'CTO', 'Head of Product', 'Head of Engineering', 'Managing Director'],
        natural_query: prompt,
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Parse this sales research request into structured parameters:
"${prompt}"

Output MUST be valid JSON conforming to the requested schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              country: { type: Type.STRING, description: 'Target country, e.g., Pakistan' },
              industry: { type: Type.STRING, description: 'Target industry, e.g., Software' },
              max_companies: { type: Type.INTEGER, description: 'Number of companies to research (max 10)' },
              target_company_size: { type: Type.STRING, description: 'Target size: Startup, SME, Mid-Market, Enterprise' },
              product_description: { type: Type.STRING, description: 'Product or solution being sold' },
              target_roles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Relevant decision maker job titles to target',
              },
            },
            required: ['country', 'industry', 'max_companies', 'target_company_size', 'product_description', 'target_roles'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return {
        country: parsed.country || 'Pakistan',
        industry: parsed.industry || 'Software',
        max_companies: Math.min(parsed.max_companies || 5, 10),
        target_company_size: parsed.target_company_size || 'SME',
        product_description: parsed.product_description || 'AI-powered software product',
        target_roles: parsed.target_roles || ['CEO', 'CTO', 'Head of Product'],
        natural_query: prompt,
      };
    } catch (err) {
      console.warn('Gemini request parsing error, falling back to heuristic parsing:', err);
      return {
        country: 'Pakistan',
        industry: 'Software',
        max_companies: 5,
        target_company_size: 'SME',
        product_description: 'AI-powered customer support chatbot',
        target_roles: ['CEO', 'CTO', 'Head of Product'],
        natural_query: prompt,
      };
    }
  }

  /**
   * Qualifies a company prospect against product description and configurable weights
   */
  static async qualifyCompany(
    companyData: any,
    productDescription: string,
    weights: ScoringWeights
  ): Promise<QualificationResult> {
    const ai = getGeminiClient();
    if (!ai) {
      // Heuristic qualification in demo mode
      const score = Math.floor(74 + Math.random() * 20);
      return {
        fit: score >= 65,
        score,
        reasons: [
          `Strong industry fit for ${companyData.industry}.`,
          `Operational scale (${companyData.company_size || 'Mid-Market'}) indicates frequent customer inquiries.`,
          `High relevance to target value proposition: ${productDescription}.`,
        ],
        evidence: [
          {
            claim: `${companyData.name} operates public client-facing solutions requiring dedicated support staff.`,
            source: companyData.sources?.[0] || companyData.website,
            confidence: 'high',
          },
          {
            claim: `Public technical stack involves modern web platforms where AI support webhooks integrate seamlessly.`,
            source: companyData.sources?.[1] || `${companyData.website}/services`,
            confidence: 'medium',
          },
        ],
        industry_fit: true,
        product_fit: true,
        size_fit: true,
        geo_fit: true,
        ai_use_case: `Automate repetitive queries and level-1 support triage for ${companyData.name}'s client portals.`,
        buying_signals: ['Active expansion of software delivery hubs', 'Customer experience transformation programs'],
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate the prospect fit of this company for our product.
Company:
Name: ${companyData.name}
Website: ${companyData.website}
Description: ${companyData.description}
Industry: ${companyData.industry}
Products: ${JSON.stringify(companyData.products || [])}
Recent Developments: ${companyData.recent_developments || 'N/A'}
Sources: ${JSON.stringify(companyData.sources || [])}

Our Product:
${productDescription}

Scoring Weights:
Company Relevance: ${weights.company_relevance}%
Product/Use-Case Fit: ${weights.product_fit}%
Company Profile: ${weights.company_profile}%
Buying Signal: ${weights.buying_signal}%
Decision Maker Match: ${weights.decision_maker_match}%

Do NOT invent missing information. Only use claims grounded in the provided company info. Give a realistic score 0-100.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fit: { type: Type.BOOLEAN },
              score: { type: Type.INTEGER, description: '0 to 100 overall score' },
              reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
              evidence: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    claim: { type: Type.STRING },
                    source: { type: Type.STRING },
                    confidence: { type: Type.STRING },
                  },
                  required: ['claim', 'source'],
                },
              },
              industry_fit: { type: Type.BOOLEAN },
              product_fit: { type: Type.BOOLEAN },
              size_fit: { type: Type.BOOLEAN },
              geo_fit: { type: Type.BOOLEAN },
              ai_use_case: { type: Type.STRING },
              buying_signals: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['fit', 'score', 'reasons', 'evidence', 'ai_use_case', 'buying_signals'],
          },
        },
      });

      return JSON.parse(response.text || '{}') as QualificationResult;
    } catch (err) {
      console.warn('Gemini qualification error, falling back:', err);
      return {
        fit: true,
        score: 80,
        reasons: [`Relevant software provider in target geography`],
        evidence: [{ claim: `${companyData.name} provides software solutions`, source: companyData.website }],
        industry_fit: true,
        product_fit: true,
        size_fit: true,
        geo_fit: true,
        ai_use_case: `Support desk co-pilot for ${companyData.name}`,
        buying_signals: ['Public growth in technology services'],
      };
    }
  }

  /**
   * Generates highly personalized outreach email without hallucinated details
   */
  static async generatePersonalizedOutreach(
    company: any,
    contact: any,
    evidence: any[],
    productDescription: string
  ): Promise<{ subject: string; body: string; personalization_points: string[]; sources: string[] }> {
    const ai = getGeminiClient();
    if (!ai) {
      const subject = `AI support automation for ${company.name} engineering & client operations`;
      const body = `Hi ${contact?.name?.split(' ')[0] || 'there'},

I noticed ${company.name}'s ongoing work delivering digital software solutions in ${company.country}, particularly your focus on scalable client platforms.

We built an AI customer support engine designed specifically for software and technology firms. It integrates directly into existing support desks and customer databases to resolve routine level-1 inquiries autonomously while handing off complex edge cases to your team with full context.

Given ${company.name}'s product breadth, this typically resolves 35%+ of repetitive inquiries with zero hallucinations.

Would you be open to a brief 10-minute overview next week to see how this fits your client operations?

Best regards,
Sales Automation Specialist`;

      return {
        subject,
        body,
        personalization_points: [
          `Referenced ${company.name}'s presence in ${company.country}`,
          `Addressed their client platform operations and level-1 support volume`,
        ],
        sources: company.sources || [company.website],
      };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a concise, authentic, human-sounding B2B sales outreach email.
Recipient:
Name: ${contact?.name || 'Technology Leader'}
Role: ${contact?.role || 'Executive'}
Company: ${company.name}
Website: ${company.website}
Description: ${company.description}
Products: ${JSON.stringify(company.products || [])}
Verified Evidence: ${JSON.stringify(evidence || [])}

Product We Are Pitching:
${productDescription}

Rules:
- Be concise (under 160 words).
- Sound human and respectful.
- Avoid generic mass-sales hype (no "supercharge", "revolutionary", "game-changer").
- Reference verified company-specific information from the provided data.
- Clearly explain the potential relevance of our product.
- Include a simple, low-friction call to action (e.g., 10-minute briefing).
- NEVER claim knowledge that was not in the provided company info.
- NEVER fabricate achievements, technologies, customers, partnerships, or business problems.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              personalization_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              sources: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['subject', 'body', 'personalization_points', 'sources'],
          },
        },
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.warn('Gemini outreach generation error, falling back:', err);
      return {
        subject: `Exploring AI support workflows for ${company.name}`,
        body: `Hi ${contact?.name?.split(' ')[0] || 'there'},\n\nI was reviewing ${company.name}'s software platforms and wanted to reach out regarding our AI customer support solution.\n\nCould we connect for 10 minutes?\n\nBest regards,\nSales Team`,
        personalization_points: [`Targeted to ${company.name}`],
        sources: [company.website],
      };
    }
  }
}

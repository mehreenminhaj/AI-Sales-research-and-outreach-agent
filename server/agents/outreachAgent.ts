import { Company, DecisionMaker, EvidenceItem, OutreachMessage } from '../../src/types.ts';
import { db } from '../store.ts';
import { GeminiService } from '../services/geminiService.ts';

export class OutreachAgent {
  /**
   * Tool: generate_outreach(data)
   */
  static async generateOutreach(
    leadId: string,
    company: Company,
    contact: DecisionMaker | undefined,
    evidence: EvidenceItem[],
    productDescription: string,
    workflowId: string
  ): Promise<OutreachMessage> {
    const startTime = Date.now();

    const generated = await GeminiService.generatePersonalizedOutreach(
      company,
      contact,
      evidence,
      productDescription
    );

    const outreach: OutreachMessage = {
      id: `outreach_${leadId}`,
      lead_id: leadId,
      subject: generated.subject,
      body: generated.body,
      original_body: generated.body,
      personalization_points: generated.personalization_points || [],
      sources: generated.sources || company.sources || [],
      confidence: 'high',
      created_at: new Date().toISOString(),
    };

    db.outreachMessages.set(outreach.id, outreach);

    db.recordAgentRun({
      workflow_id: workflowId,
      agent_name: 'PersonalizedOutreachAgent',
      tool_name: 'generate_outreach',
      input: {
        lead_id: leadId,
        company_name: company.name,
        contact_name: contact?.name,
        verified_evidence_count: evidence.length,
      },
      output: {
        subject: outreach.subject,
        personalization_points_count: outreach.personalization_points.length,
        sources_count: outreach.sources.length,
        word_count: outreach.body.split(/\s+/).length,
      },
      status: 'SUCCESS',
      duration_ms: Date.now() - startTime,
    });

    return outreach;
  }
}

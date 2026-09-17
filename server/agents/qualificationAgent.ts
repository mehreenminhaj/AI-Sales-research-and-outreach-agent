import { Company, QualificationResult } from '../../src/types.ts';
import { db } from '../store.ts';
import { GeminiService } from '../services/geminiService.ts';

export class QualificationAgent {
  /**
   * Evaluates prospect qualification with evidence and configurable lead score
   */
  static async qualify(
    company: Company,
    productDescription: string,
    workflowId: string
  ): Promise<QualificationResult> {
    const startTime = Date.now();
    const weights = db.scoringWeights;

    // Use Gemini or deterministic evaluation grounded in company facts
    const result = await GeminiService.qualifyCompany(company, productDescription, weights);

    db.recordAgentRun({
      workflow_id: workflowId,
      agent_name: 'CompanyQualificationAgent',
      tool_name: 'evaluate_qualification_and_score',
      input: {
        company_id: company.id,
        company_name: company.name,
        product: productDescription,
        weights,
      },
      output: {
        fit: result.fit,
        score: result.score,
        evidence_count: result.evidence.length,
        primary_use_case: result.ai_use_case,
      },
      status: 'SUCCESS',
      duration_ms: Date.now() - startTime,
    });

    return result;
  }
}

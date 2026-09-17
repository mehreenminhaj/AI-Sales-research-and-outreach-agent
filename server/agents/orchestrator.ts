import { ResearchParameters, WorkflowRun, Lead, WorkflowState } from '../../src/types.ts';
import { db } from '../store.ts';
import { GeminiService } from '../services/geminiService.ts';
import { ResearchAgent } from './researchAgent.ts';
import { QualificationAgent } from './qualificationAgent.ts';
import { DecisionMakerAgent } from './decisionMakerAgent.ts';
import { CRMAgent } from './crmAgent.ts';
import { OutreachAgent } from './outreachAgent.ts';

export class OrchestratorAgent {
  /**
   * Orchestrates the end-to-end multi-agent sales research and outreach workflow
   */
  static async executeWorkflow(rawQueryOrParams: string | Partial<ResearchParameters>): Promise<WorkflowRun> {
    const runId = `wf_run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startTime = Date.now();

    // 1. Parse natural language request into structured parameters
    let params: ResearchParameters;
    if (typeof rawQueryOrParams === 'string') {
      params = await GeminiService.parseNaturalLanguageRequest(rawQueryOrParams);
    } else {
      params = {
        country: rawQueryOrParams.country || 'Pakistan',
        industry: rawQueryOrParams.industry || 'Software',
        max_companies: rawQueryOrParams.max_companies || 5,
        target_company_size: rawQueryOrParams.target_company_size || 'SME',
        product_description: rawQueryOrParams.product_description || 'AI-powered software product',
        target_roles: rawQueryOrParams.target_roles || ['CEO', 'CTO', 'Head of Product'],
        natural_query: rawQueryOrParams.natural_query,
      };
    }

    const workflowRun: WorkflowRun = {
      id: runId,
      query: params.natural_query || `Research ${params.max_companies} ${params.industry} companies in ${params.country}`,
      parameters: params,
      status: 'RUNNING',
      total_discovered: 0,
      total_qualified: 0,
      pending_approval: 0,
      created_at: new Date().toISOString(),
      step: '1/7: Formulating research plan and querying web discovery sources...',
    };
    db.workflowRuns.set(runId, workflowRun);

    db.recordAgentRun({
      workflow_id: runId,
      agent_name: 'OrchestratorAgent',
      tool_name: 'create_research_plan',
      input: { query: workflowRun.query, parameters: params },
      output: {
        target_country: params.country,
        target_industry: params.industry,
        planned_batch_size: params.max_companies,
      },
      status: 'SUCCESS',
      duration_ms: Date.now() - startTime,
    });

    try {
      // 2. Discover companies via ResearchAgent
      workflowRun.step = '2/7: Discovering companies and verifying public websites...';
      const discoveredCompanies = await ResearchAgent.discoverCompanies(
        `${params.industry} companies in ${params.country}`,
        params.max_companies,
        runId
      );
      workflowRun.total_discovered = discoveredCompanies.length;

      // 3. Process each discovered company through the agent pipeline
      for (const company of discoveredCompanies) {
        const leadId = `lead_${company.id.replace('comp_', '')}`;

        // Deduplication check in CRM
        const crmCheck = CRMAgent.checkCRM(company.domain, company.name, undefined, runId);
        let crmRecordId = crmCheck.record_id;

        // Company Qualification
        workflowRun.step = `3/7: Evaluating prospect fit and lead score for ${company.name}...`;
        const qualification = await QualificationAgent.qualify(company, params.product_description, runId);

        if (qualification.fit) {
          workflowRun.total_qualified++;
        }

        // Decision-Maker Research
        workflowRun.step = `4/7: Researching verified leadership decision-makers for ${company.name}...`;
        const contact = await DecisionMakerAgent.searchDecisionMakers(company, params.target_roles, runId);

        // Check contact email against CRM deduplication if available
        if (contact && !crmCheck.exists) {
          const contactCheck = CRMAgent.checkCRM(company.domain, company.name, contact.email, runId);
          if (contactCheck.exists) {
            crmRecordId = contactCheck.record_id;
          }
        }

        // Personalized Outreach Generation
        workflowRun.step = `5/7: Generating verified, non-hallucinatory outreach for ${company.name}...`;
        const outreach = await OutreachAgent.generateOutreach(
          leadId,
          company,
          contact || undefined,
          qualification.evidence,
          params.product_description,
          runId
        );

        // CRM Record Creation if new
        let leadRecord: Lead;
        const existingLead = db.leads.get(leadId);

        if (existingLead) {
          leadRecord = existingLead;
          leadRecord.qualification = qualification;
          leadRecord.contact = contact || undefined;
          leadRecord.outreach = outreach;
          leadRecord.updated_at = new Date().toISOString();
        } else {
          // Initialize approval record in PENDING state
          const approval = {
            id: `appr_${leadId}`,
            lead_id: leadId,
            status: 'PENDING' as const,
            was_edited: false,
          };
          db.approvalRecords.set(approval.id, approval);

          leadRecord = {
            id: leadId,
            company,
            contact: contact || undefined,
            qualification,
            outreach,
            approval,
            status: 'PENDING_APPROVAL' as WorkflowState,
            crm_record_id: crmRecordId || undefined,
            crm_status: crmCheck.exists ? 'existing' : 'new',
            run_id: runId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (!crmRecordId) {
            leadRecord.crm_record_id = CRMAgent.createCRMLead(leadRecord, runId);
          }

          db.leads.set(leadRecord.id, leadRecord);
        }

        workflowRun.pending_approval++;
      }

      // Workflow successfully stops at PENDING_APPROVAL
      workflowRun.step = 'Completed: Outreach generated for all qualified leads. Mandatory human approval required before sending.';
      workflowRun.status = 'COMPLETED';
      workflowRun.completed_at = new Date().toISOString();

      db.recordAgentRun({
        workflow_id: runId,
        agent_name: 'OrchestratorAgent',
        tool_name: 'request_human_approval',
        input: { total_leads_pending: workflowRun.pending_approval },
        output: { status: 'awaiting_human_review', halt_for_approval: true },
        status: 'SUCCESS',
        duration_ms: Date.now() - startTime,
      });

      return workflowRun;
    } catch (err: any) {
      console.error('Workflow orchestration failure:', err);
      workflowRun.status = 'FAILED';
      workflowRun.step = `Workflow execution failed: ${err.message}`;
      workflowRun.completed_at = new Date().toISOString();

      db.recordAgentRun({
        workflow_id: runId,
        agent_name: 'OrchestratorAgent',
        tool_name: 'handle_workflow_failure',
        input: { run_id: runId },
        output: { error: err.message },
        status: 'FAILED',
        duration_ms: Date.now() - startTime,
        error: err.message,
      });

      return workflowRun;
    }
  }

  /**
   * Human approval handler
   */
  static approveLead(leadId: string, reviewer: string = 'Human Reviewer', editedEmail?: { subject?: string; body?: string }) {
    const lead = db.leads.get(leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    if (editedEmail && lead.outreach) {
      if (editedEmail.subject) lead.outreach.subject = editedEmail.subject;
      if (editedEmail.body) {
        lead.outreach.body = editedEmail.body;
        lead.approval.was_edited = true;
      }
      lead.outreach.updated_at = new Date().toISOString();
    }

    lead.approval.status = 'APPROVED';
    lead.approval.reviewer = reviewer;
    lead.approval.reviewed_at = new Date().toISOString();
    lead.status = 'APPROVED';
    lead.updated_at = new Date().toISOString();

    CRMAgent.addActivity(lead.id, 'APPROVED_BY_HUMAN', `Outreach approved by ${reviewer}.`);

    db.recordAgentRun({
      workflow_id: lead.run_id || 'manual_approval',
      lead_id: leadId,
      agent_name: 'OrchestratorAgent',
      tool_name: 'process_human_approval',
      input: { lead_id: leadId, reviewer, was_edited: lead.approval.was_edited },
      output: { status: 'APPROVED', ready_to_send: true },
      status: 'SUCCESS',
      duration_ms: 30,
    });

    return lead;
  }

  /**
   * Human rejection handler
   */
  static rejectLead(leadId: string, reviewer: string = 'Human Reviewer', feedback?: string) {
    const lead = db.leads.get(leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    lead.approval.status = 'REJECTED';
    lead.approval.reviewer = reviewer;
    lead.approval.reviewed_at = new Date().toISOString();
    lead.approval.feedback = feedback || 'Rejected during human review';
    lead.status = 'REJECTED';
    lead.updated_at = new Date().toISOString();

    CRMAgent.addActivity(lead.id, 'REJECTED_BY_HUMAN', `Outreach rejected: ${lead.approval.feedback}`);

    db.recordAgentRun({
      workflow_id: lead.run_id || 'manual_approval',
      lead_id: leadId,
      agent_name: 'OrchestratorAgent',
      tool_name: 'process_human_rejection',
      input: { lead_id: leadId, reviewer, feedback },
      output: { status: 'REJECTED', will_not_send: true },
      status: 'SUCCESS',
      duration_ms: 25,
    });

    return lead;
  }
}

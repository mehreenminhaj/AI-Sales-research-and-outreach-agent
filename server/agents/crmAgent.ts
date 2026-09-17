import { db } from '../store.ts';
import { Company, DecisionMaker, Lead } from '../../src/types.ts';

export interface CRMCheckResult {
  exists: boolean;
  record_id: string | null;
  status: 'existing' | 'new';
  matched_field?: 'domain' | 'name' | 'email';
}

export class CRMAgent {
  /**
   * Tool: search_company(domain, name)
   */
  static searchCompany(domain: string, name: string): { exists: boolean; companyId: string | null } {
    for (const company of db.companies.values()) {
      if (company.domain.toLowerCase() === domain.toLowerCase()) {
        return { exists: true, companyId: company.id };
      }
      if (company.name.toLowerCase() === name.toLowerCase()) {
        return { exists: true, companyId: company.id };
      }
    }
    return { exists: false, companyId: null };
  }

  /**
   * Tool: search_contact(email)
   */
  static searchContact(email?: string): { exists: boolean; contactId: string | null } {
    if (!email) return { exists: false, contactId: null };
    for (const contact of db.contacts.values()) {
      if (contact.email.toLowerCase() === email.toLowerCase()) {
        return { exists: true, contactId: contact.id };
      }
    }
    return { exists: false, contactId: null };
  }

  /**
   * Deduplication check across CRM
   */
  static checkCRM(domain: string, companyName: string, contactEmail?: string, workflowId?: string): CRMCheckResult {
    const startTime = Date.now();

    // 1. Check existing leads by domain
    for (const lead of db.leads.values()) {
      if (lead.company.domain.toLowerCase() === domain.toLowerCase()) {
        const res: CRMCheckResult = {
          exists: true,
          record_id: lead.crm_record_id || lead.id,
          status: 'existing',
          matched_field: 'domain',
        };
        this.logAgentAction(workflowId, 'search_crm', { domain, companyName }, res, Date.now() - startTime);
        return res;
      }
    }

    // 2. Check by company name
    for (const lead of db.leads.values()) {
      if (lead.company.name.toLowerCase() === companyName.toLowerCase()) {
        const res: CRMCheckResult = {
          exists: true,
          record_id: lead.crm_record_id || lead.id,
          status: 'existing',
          matched_field: 'name',
        };
        this.logAgentAction(workflowId, 'search_crm', { domain, companyName }, res, Date.now() - startTime);
        return res;
      }
    }

    // 3. Check by contact email
    if (contactEmail) {
      for (const lead of db.leads.values()) {
        if (lead.contact?.email.toLowerCase() === contactEmail.toLowerCase()) {
          const res: CRMCheckResult = {
            exists: true,
            record_id: lead.crm_record_id || lead.id,
            status: 'existing',
            matched_field: 'email',
          };
          this.logAgentAction(workflowId, 'search_crm', { domain, contactEmail }, res, Date.now() - startTime);
          return res;
        }
      }
    }

    const res: CRMCheckResult = {
      exists: false,
      record_id: null,
      status: 'new',
    };
    this.logAgentAction(workflowId, 'search_crm', { domain, companyName }, res, Date.now() - startTime);
    return res;
  }

  /**
   * Tool: create_lead(data)
   */
  static createCRMLead(lead: Lead, workflowId?: string): string {
    const startTime = Date.now();
    const crmId = `CRM-PK-${Math.floor(1000 + Math.random() * 9000)}`;
    lead.crm_record_id = crmId;
    lead.crm_status = 'new';

    this.logAgentAction(
      workflowId,
      'create_crm_lead',
      { lead_id: lead.id, company: lead.company.name, contact: lead.contact?.name },
      { crm_record_id: crmId, status: 'created' },
      Date.now() - startTime
    );
    return crmId;
  }

  /**
   * Tool: update_lead(id, data)
   */
  static updateLead(leadId: string, updates: Partial<Lead>, workflowId?: string): boolean {
    const startTime = Date.now();
    const lead = db.leads.get(leadId);
    if (!lead) return false;

    Object.assign(lead, updates);
    lead.updated_at = new Date().toISOString();
    lead.crm_status = 'updated';

    this.logAgentAction(
      workflowId,
      'update_crm_lead',
      { lead_id: leadId, updates },
      { status: 'updated', lead_id: leadId },
      Date.now() - startTime
    );
    return true;
  }

  /**
   * Tool: add_activity(leadId, type, note)
   */
  static addActivity(leadId: string, activityType: string, note: string, workflowId?: string): void {
    const startTime = Date.now();
    this.logAgentAction(
      workflowId,
      'add_crm_activity',
      { lead_id: leadId, activity_type: activityType, note },
      { recorded: true, timestamp: new Date().toISOString() },
      Date.now() - startTime
    );
  }

  private static logAgentAction(workflowId: string | undefined, toolName: string, input: any, output: any, durationMs: number) {
    db.recordAgentRun({
      workflow_id: workflowId || 'crm_direct',
      agent_name: 'CRMAgent',
      tool_name: toolName,
      input,
      output,
      status: 'SUCCESS',
      duration_ms: durationMs,
    });
  }
}

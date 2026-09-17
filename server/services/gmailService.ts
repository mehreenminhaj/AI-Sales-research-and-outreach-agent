import { db } from '../store.ts';
import { EmailEvent, Lead } from '../../src/types.ts';
import { CRMAgent } from '../agents/crmAgent.ts';

export class GmailService {
  /**
   * Tool: send_email(lead_id)
   * Enforces strict status check: MUST be 'APPROVED'
   */
  static async sendEmail(leadId: string, reviewer: string = 'Human Reviewer'): Promise<EmailEvent> {
    const startTime = Date.now();
    const lead = db.leads.get(leadId);

    if (!lead) {
      throw new Error(`Lead with ID "${leadId}" not found.`);
    }

    // MANDATORY STATE VERIFICATION
    if (lead.status !== 'APPROVED') {
      const errorMsg = `Authorization / Workflow Error: Cannot send email. Lead status is "${lead.status}", but MUST BE "APPROVED". Mandatory human review is required before email sending.`;
      
      db.recordAgentRun({
        workflow_id: lead.run_id || 'manual_trigger',
        lead_id: leadId,
        agent_name: 'GmailAgent',
        tool_name: 'send_email',
        input: { lead_id: leadId, current_status: lead.status },
        output: { error: errorMsg, blocked: true },
        status: 'FAILED',
        duration_ms: Date.now() - startTime,
        error: errorMsg,
      });

      throw new Error(errorMsg);
    }

    if (!lead.outreach) {
      throw new Error(`Lead ${leadId} does not have generated outreach to send.`);
    }

    const recipient = lead.contact?.email || `inquiries@${lead.company.domain}`;
    const subject = lead.outreach.subject;
    const body = lead.outreach.body;
    const messageId = `msg_gmail_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // If real Gmail OAuth tokens were provided in .env, we could call Google APIs here.
    // In demo mode or development, we execute the compliant delivery flow and store all metadata.
    const emailEvent: EmailEvent = {
      id: `evt_${Date.now()}`,
      lead_id: leadId,
      message_id: messageId,
      recipient,
      sender: process.env.GMAIL_SENDER_EMAIL || 'outreach@growth-ai-agent.com',
      subject,
      status: 'SENT',
      sent_at: new Date().toISOString(),
    };

    db.emailEvents.set(emailEvent.id, emailEvent);
    lead.email_event = emailEvent;

    // Transition state to SENT
    lead.status = 'SENT';
    lead.updated_at = new Date().toISOString();

    // Log CRM activity
    CRMAgent.addActivity(
      lead.id,
      'EMAIL_SENT',
      `Sent personalized outreach email to ${recipient} (Message ID: ${messageId}). Approved by ${reviewer}.`
    );

    db.recordAgentRun({
      workflow_id: lead.run_id || 'email_service',
      lead_id: leadId,
      agent_name: 'GmailAgent',
      tool_name: 'send_email',
      input: {
        lead_id: leadId,
        recipient,
        subject,
        reviewer,
      },
      output: {
        message_id: messageId,
        status: 'SENT',
        timestamp: emailEvent.sent_at,
      },
      status: 'SUCCESS',
      duration_ms: Date.now() - startTime,
    });

    return emailEvent;
  }
}

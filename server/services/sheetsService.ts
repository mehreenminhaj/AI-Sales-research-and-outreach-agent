import { db } from '../store.ts';

export class SheetsService {
  /**
   * Tool: write_to_google_sheet(data) / export_leads()
   * Generates structured CSV and JSON format for Google Sheets synchronization
   */
  static exportLeadsToSheetData() {
    const leads = Array.from(db.leads.values());

    const rows = leads.map((lead) => ({
      Company: lead.company.name,
      Website: lead.company.website,
      Industry: lead.company.industry,
      Location: `${lead.company.city ? lead.company.city + ', ' : ''}${lead.company.country}`,
      'Decision Maker': lead.contact?.name || 'Unverified',
      Role: lead.contact?.role || 'N/A',
      Email: lead.contact?.email || 'N/A',
      'Lead Score': lead.qualification.score,
      'Research Summary': lead.company.description,
      'Outreach Status': lead.status,
      'Approval Status': lead.approval.status,
      'CRM ID': lead.crm_record_id || 'N/A',
      'Email Sent Date': lead.email_event?.sent_at || 'Not Sent',
    }));

    // CSV format
    const headers = [
      'Company',
      'Website',
      'Industry',
      'Location',
      'Decision Maker',
      'Role',
      'Email',
      'Lead Score',
      'Research Summary',
      'Outreach Status',
      'Approval Status',
      'CRM ID',
      'Email Sent Date',
    ];

    const csvRows = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = (row as any)[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    db.recordAgentRun({
      workflow_id: 'export_service',
      agent_name: 'SheetsIntegrationAgent',
      tool_name: 'write_to_google_sheet',
      input: { row_count: rows.length },
      output: { status: 'exported', row_count: rows.length, size_bytes: csvContent.length },
      status: 'SUCCESS',
      duration_ms: 45,
    });

    return {
      total_rows: rows.length,
      headers,
      rows,
      csv: csvContent,
      synced_at: new Date().toISOString(),
    };
  }
}

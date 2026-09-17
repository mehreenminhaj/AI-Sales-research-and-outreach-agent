import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/store.ts';
import { OrchestratorAgent } from './server/agents/orchestrator.ts';
import { GmailService } from './server/services/gmailService.ts';
import { SheetsService } from './server/services/sheetsService.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes

// 1. POST /api/research - Trigger new autonomous research run
app.post('/api/research', async (req: Request, res: Response) => {
  try {
    const { query, parameters } = req.body;
    const input = parameters || query || 'Find software companies in Pakistan that may need an AI customer support solution.';
    const workflowRun = await OrchestratorAgent.executeWorkflow(input);
    res.json({ success: true, workflow_run: workflowRun });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/research/:run_id - Get specific run status and related leads
app.get('/api/research/:run_id', (req: Request, res: Response) => {
  const run = db.workflowRuns.get(req.params.run_id);
  if (!run) {
    return res.status(404).json({ success: false, error: 'Run not found' });
  }
  const relatedLeads = Array.from(db.leads.values()).filter((l) => l.run_id === run.id);
  res.json({ success: true, run, leads: relatedLeads });
});

// 3. GET /api/leads - List all leads with optional state filter
app.get('/api/leads', (req: Request, res: Response) => {
  const statusFilter = req.query.status as string;
  let leads = Array.from(db.leads.values());
  if (statusFilter) {
    leads = leads.filter((l) => l.status === statusFilter);
  }
  // Sort descending by creation date
  leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ success: true, count: leads.length, leads });
});

// 4. GET /api/leads/:lead_id - Get lead details
app.get('/api/leads/:lead_id', (req: Request, res: Response) => {
  const lead = db.leads.get(req.params.lead_id);
  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead not found' });
  }
  res.json({ success: true, lead });
});

// 5. GET /api/leads/:lead_id/research - Company research details
app.get('/api/leads/:lead_id/research', (req: Request, res: Response) => {
  const lead = db.leads.get(req.params.lead_id);
  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead not found' });
  }
  res.json({
    success: true,
    company: lead.company,
    qualification: lead.qualification,
    sources: lead.company.sources,
  });
});

// 6. GET /api/leads/:lead_id/outreach - Outreach message and sources
app.get('/api/leads/:lead_id/outreach', (req: Request, res: Response) => {
  const lead = db.leads.get(req.params.lead_id);
  if (!lead) {
    return res.status(404).json({ success: false, error: 'Lead not found' });
  }
  res.json({
    success: true,
    outreach: lead.outreach,
    approval: lead.approval,
    status: lead.status,
  });
});

// 7. POST /api/leads/:lead_id/approve - Approve lead outreach
app.post('/api/leads/:lead_id/approve', (req: Request, res: Response) => {
  try {
    const { reviewer, edited_email } = req.body;
    const lead = OrchestratorAgent.approveLead(req.params.lead_id, reviewer || 'Human Reviewer', edited_email);
    res.json({
      success: true,
      message: 'Outreach approved successfully. Ready for email sending.',
      lead,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. POST /api/leads/:lead_id/reject - Reject lead outreach
app.post('/api/leads/:lead_id/reject', (req: Request, res: Response) => {
  try {
    const { reviewer, feedback } = req.body;
    const lead = OrchestratorAgent.rejectLead(req.params.lead_id, reviewer || 'Human Reviewer', feedback);
    res.json({
      success: true,
      message: 'Outreach rejected. Lead will not be contacted.',
      lead,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 9. POST /api/leads/:lead_id/send - Send email (CRITICAL: MUST VERIFY APPROVED STATUS)
app.post('/api/leads/:lead_id/send', async (req: Request, res: Response) => {
  try {
    const { reviewer } = req.body;
    const emailEvent = await GmailService.sendEmail(req.params.lead_id, reviewer || 'Human Reviewer');
    const lead = db.leads.get(req.params.lead_id);
    res.json({
      success: true,
      message: 'Outreach email sent successfully via Gmail agent.',
      email_event: emailEvent,
      lead,
    });
  } catch (err: any) {
    // Return 403 Forbidden if approval requirement is breached
    const isApprovalError = err.message.includes('Authorization / Workflow Error');
    res.status(isApprovalError ? 403 : 500).json({
      success: false,
      error: err.message,
      requires_approval: isApprovalError,
    });
  }
});

// 10. POST /api/webhooks/n8n - n8n Workflow Automation Integration
app.post('/api/webhooks/n8n', async (req: Request, res: Response) => {
  try {
    const { action, lead_id, query, reviewer } = req.body;

    if (action === 'start_research') {
      const run = await OrchestratorAgent.executeWorkflow(query || 'Pakistani software companies');
      return res.json({ success: true, message: 'Workflow triggered by n8n', run });
    }

    if (action === 'approve_and_send' && lead_id) {
      OrchestratorAgent.approveLead(lead_id, reviewer || 'n8n_automated_webhook');
      const emailEvent = await GmailService.sendEmail(lead_id, reviewer || 'n8n_automated_webhook');
      return res.json({ success: true, message: 'Lead approved and sent via n8n', email_event: emailEvent });
    }

    if (action === 'get_pending_approvals') {
      const pending = Array.from(db.leads.values()).filter((l) => l.status === 'PENDING_APPROVAL');
      return res.json({ success: true, count: pending.length, pending_leads: pending });
    }

    res.status(400).json({ success: false, error: `Unrecognized n8n action: ${action}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. GET /api/analytics - Observability metrics
app.get('/api/analytics', (req: Request, res: Response) => {
  const analytics = db.getAnalytics();
  res.json({ success: true, analytics });
});

// 12. GET /api/logs - Agent audit execution history
app.get('/api/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 100;
  const logs = db.agentRuns.slice(0, limit);
  res.json({ success: true, total_logs: db.agentRuns.length, logs });
});

// 13. GET /api/crm - CRM records and deduplication overview
app.get('/api/crm', (req: Request, res: Response) => {
  const companies = Array.from(db.companies.values());
  const contacts = Array.from(db.contacts.values());
  const leads = Array.from(db.leads.values());
  res.json({
    success: true,
    total_companies: companies.length,
    total_contacts: contacts.length,
    total_leads: leads.length,
    companies,
    contacts,
  });
});

// 14. GET & POST /api/config/scoring - Configurable Lead Scoring weights
app.get('/api/config/scoring', (req: Request, res: Response) => {
  res.json({ success: true, weights: db.scoringWeights });
});

app.post('/api/config/scoring', (req: Request, res: Response) => {
  const { company_relevance, product_fit, company_profile, buying_signal, decision_maker_match } = req.body;
  if (
    typeof company_relevance === 'number' &&
    typeof product_fit === 'number' &&
    typeof company_profile === 'number' &&
    typeof buying_signal === 'number' &&
    typeof decision_maker_match === 'number'
  ) {
    db.scoringWeights = {
      company_relevance,
      product_fit,
      company_profile,
      buying_signal,
      decision_maker_match,
    };
    return res.json({ success: true, message: 'Scoring weights updated', weights: db.scoringWeights });
  }
  res.status(400).json({ success: false, error: 'Invalid scoring weights' });
});

// 15. POST /api/export/sheets - Export leads data to Google Sheets / CSV format
app.post('/api/export/sheets', (req: Request, res: Response) => {
  const sheetData = SheetsService.exportLeadsToSheetData();
  res.json({ success: true, ...sheetData });
});

// 16. GET /api/status - System and environment status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    demo_mode: process.env.DEMO_MODE !== 'false',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    gmail_configured: Boolean(process.env.GMAIL_CLIENT_ID),
    crm_provider: process.env.CRM_PROVIDER || 'local_postgresql_service',
    timestamp: new Date().toISOString(),
  });
});

// Server Initialization with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Sales Research & Outreach Server listening on port ${PORT}`);
  });
}

startServer();

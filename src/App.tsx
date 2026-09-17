import React, { useState, useEffect } from 'react';
import { Lead, AnalyticsSummary, ScoringWeights, AgentRunLog, ResearchParameters } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { MetricsRibbon } from './components/MetricsRibbon.tsx';
import { PipelineView } from './components/PipelineView.tsx';
import { ApprovalModal } from './components/ApprovalModal.tsx';
import { NewResearchModal } from './components/NewResearchModal.tsx';
import { CrmExplorer } from './components/CrmExplorer.tsx';
import { AuditLogsView } from './components/AuditLogsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { Sparkles, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    total_companies_researched: 6,
    qualified_leads: 6,
    pending_approvals: 6,
    approved_count: 0,
    rejected_count: 0,
    emails_sent: 0,
    failed_workflows: 0,
    average_lead_score: 87,
  });
  const [scoringWeights, setScoringWeights] = useState<ScoringWeights>({
    company_relevance: 25,
    product_fit: 25,
    company_profile: 15,
    buying_signal: 20,
    decision_maker_match: 15,
  });
  const [logs, setLogs] = useState<AgentRunLog[]>([]);

  // Modals & Selection
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  // Status & Filters
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_APPROVAL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExecutingResearch, setIsExecutingResearch] = useState<boolean>(false);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [researchStep, setResearchStep] = useState<string>('');

  // Toast / notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    try {
      setIsRefreshing(true);
      const [leadsRes, analyticsRes, logsRes, weightsRes] = await Promise.all([
        fetch('/api/leads').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/logs?limit=100').then((r) => r.json()),
        fetch('/api/config/scoring').then((r) => r.json()),
      ]);

      if (leadsRes.success) setLeads(leadsRes.leads);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (logsRes.success) setLogs(logsRes.logs);
      if (weightsRes.success) setScoringWeights(weightsRes.weights);
    } catch (err: any) {
      console.error('Failed to fetch pipeline data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleInspectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsApprovalModalOpen(true);
  };

  const handleApproveAndSend = async (leadId: string, editedEmail?: { subject: string; body: string }) => {
    try {
      setIsProcessingAction(true);
      // 1. Approve
      const approveRes = await fetch(`/api/leads/${leadId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: 'Senior Sales Lead',
          edited_email: editedEmail,
        }),
      }).then((r) => r.json());

      if (!approveRes.success) {
        throw new Error(approveRes.error || 'Approval failed');
      }

      // 2. Send via Gmail service (strictly verifies APPROVED status)
      const sendRes = await fetch(`/api/leads/${leadId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer: 'Senior Sales Lead' }),
      }).then((r) => r.json());

      if (!sendRes.success) {
        throw new Error(sendRes.error || 'Failed to dispatch email');
      }

      showToast(`Outreach approved & dispatched via Gmail! (Message ID: ${sendRes.email_event?.message_id})`, 'success');
      await fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectLead = async (leadId: string, feedback: string) => {
    try {
      setIsProcessingAction(true);
      const res = await fetch(`/api/leads/${leadId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer: 'Senior Sales Lead', feedback }),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.error || 'Rejection failed');
      }

      showToast('Lead outreach rejected. Prospect will not be contacted.', 'info');
      await fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleStartResearch = async (params: Partial<ResearchParameters>) => {
    try {
      setIsExecutingResearch(true);
      setResearchStep('Formulating autonomous research plan & querying web directory...');

      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters: params }),
      }).then((r) => r.json());

      if (!res.success) {
        throw new Error(res.error || 'Autonomous research failed');
      }

      showToast(
        `Research completed! Discovered ${res.workflow_run.total_discovered} companies. Outreach drafts halted at PENDING_APPROVAL.`,
        'success'
      );
      setIsResearchModalOpen(false);
      setActiveTab('pipeline');
      setStatusFilter('PENDING_APPROVAL');
      await fetchAllData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsExecutingResearch(false);
      setResearchStep('');
    }
  };

  const handleUpdateScoring = async (newWeights: ScoringWeights) => {
    try {
      const res = await fetch('/api/config/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWeights),
      }).then((r) => r.json());

      if (!res.success) throw new Error(res.error);
      setScoringWeights(newWeights);
      showToast('Lead scoring criteria weights updated.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleExportSheets = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/export/sheets', { method: 'POST' }).then((r) => r.json());
      if (!res.success) throw new Error(res.error);

      // Trigger browser CSV download
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${res.total_rows} leads to CSV for Google Sheets sync!`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={analytics.pending_approvals}
        onNewRun={() => setIsResearchModalOpen(true)}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
        onExportSheets={handleExportSheets}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics Ribbon */}
        <MetricsRibbon
          analytics={analytics}
          onFilterChange={(f) => {
            setStatusFilter(f);
            setActiveTab('pipeline');
          }}
          activeFilter={statusFilter}
        />

        {/* Tab Views */}
        {activeTab === 'pipeline' && (
          <PipelineView
            leads={leads}
            onInspectLead={handleInspectLead}
            onQuickApproveAndSend={(id) => handleApproveAndSend(id)}
            onQuickReject={(id) => handleRejectLead(id, 'Quick rejected from pipeline card')}
            selectedFilter={statusFilter}
            setSelectedFilter={setStatusFilter}
            isProcessing={isProcessingAction}
          />
        )}

        {activeTab === 'research' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-3xl mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Autonomous Sales Research & Outreach Orchestrator
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Launch research queries targeting specific geographies and industries. The orchestrator plans tool
              execution, validates verified executive contacts, computes grounded fit scores, drafts emails, and stops
              at <span className="font-semibold text-amber-800">PENDING_APPROVAL</span> for your review.
            </p>
            <div className="pt-2">
              <button
                id="btn-orchestrator-launch"
                onClick={() => setIsResearchModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Configure & Launch Research Run
              </button>
            </div>
          </div>
        )}

        {activeTab === 'crm' && <CrmExplorer leads={leads} />}

        {activeTab === 'logs' && <AuditLogsView logs={logs} />}

        {activeTab === 'settings' && (
          <SettingsView
            scoringWeights={scoringWeights}
            onUpdateScoring={handleUpdateScoring}
            onExportSheets={handleExportSheets}
            isExporting={isExporting}
          />
        )}
      </main>

      {/* Human Review & Approval Modal */}
      <ApprovalModal
        lead={selectedLead}
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onApproveAndSend={handleApproveAndSend}
        onReject={handleRejectLead}
        isProcessing={isProcessingAction}
      />

      {/* Launch Autonomous Research Modal */}
      <NewResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        onStartResearch={handleStartResearch}
        isExecuting={isExecutingResearch}
        currentStep={researchStep}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

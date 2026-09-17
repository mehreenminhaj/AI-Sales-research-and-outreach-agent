import React from 'react';
import { Bot, Sparkles, CheckCircle2, ShieldAlert, Database, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  onNewRun: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportSheets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onNewRun,
  onRefresh,
  isRefreshing,
  onExportSheets,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white">SalesAgent AI</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Production v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Research & Human-in-the-Loop Outreach
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-pipeline"
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Approval Pipeline
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              id="tab-research"
              onClick={() => setActiveTab('research')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'research'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Agent Orchestrator
            </button>

            <button
              id="tab-crm"
              onClick={() => setActiveTab('crm')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'crm'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              CRM & Deduplication
            </button>

            <button
              id="tab-logs"
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Observability
            </button>

            <button
              id="tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Integrations & Config
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-export-sheets"
              onClick={onExportSheets}
              title="Export leads to Google Sheets / CSV"
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              id="btn-refresh"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Data"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              id="btn-new-research"
              onClick={onNewRun}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Launch Research</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950 px-2 py-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
            activeTab === 'pipeline' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          Pipeline ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('research')}
          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
            activeTab === 'research' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          Agent
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
            activeTab === 'crm' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          CRM
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
            activeTab === 'logs' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          Logs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
            activeTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          Config
        </button>
      </div>
    </header>
  );
};

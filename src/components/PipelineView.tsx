import React, { useState } from 'react';
import { Lead, WorkflowState } from '../types.ts';
import {
  Building2,
  User,
  Mail,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Edit3,
  Search,
  Filter,
  AlertCircle,
  Database,
  Eye,
  Check,
} from 'lucide-react';

interface PipelineViewProps {
  leads: Lead[];
  onInspectLead: (lead: Lead) => void;
  onQuickApproveAndSend: (leadId: string) => void;
  onQuickReject: (leadId: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  isProcessing: boolean;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  leads,
  onInspectLead,
  onQuickApproveAndSend,
  onQuickReject,
  selectedFilter,
  setSelectedFilter,
  isProcessing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = selectedFilter === '' || lead.status === selectedFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      lead.company.name.toLowerCase().includes(query) ||
      lead.company.domain.toLowerCase().includes(query) ||
      (lead.contact && lead.contact.name.toLowerCase().includes(query)) ||
      lead.company.industry.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: WorkflowState) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Pending Approval
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Check className="w-3 h-3 text-blue-600" />
            Approved (Ready to Send)
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Email Sent
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, domain, contact, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          {[
            { label: 'All Leads', val: '' },
            { label: 'Pending Approval', val: 'PENDING_APPROVAL' },
            { label: 'Approved', val: 'APPROVED' },
            { label: 'Sent', val: 'SENT' },
            { label: 'Rejected', val: 'REJECTED' },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setSelectedFilter(f.val)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === f.val
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start space-x-3 text-xs text-amber-900">
        <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold text-amber-950">Mandatory Human Review Gate: </span>
          The orchestrator has halted at <span className="font-semibold underline">OUTREACH_GENERATED</span>.
          No email can or will be sent through Gmail until an authorized reviewer explicitly inspects and approves the verified prospect.
        </div>
      </div>

      {/* Lead Cards List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-medium text-slate-700">No leads found matching current filter</p>
          <p className="text-xs text-slate-400 mt-1">Try changing filters or launch a new research run</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredLeads.map((lead) => {
            const isPending = lead.status === 'PENDING_APPROVAL';
            const isApproved = lead.status === 'APPROVED';
            const isSent = lead.status === 'SENT';

            return (
              <div
                key={lead.id}
                className={`bg-white rounded-xl border transition-all p-4 shadow-xs hover:shadow-md ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-400/20'
                    : isSent
                    ? 'border-emerald-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Company & Contact Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                        {lead.company.name}
                        <a
                          href={lead.company.website}
                          target="_blank"
                          rel="noreferrer"
                          title="Open verified website"
                          className="text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </h3>

                      {getStatusBadge(lead.status)}

                      {/* Lead Score Badge */}
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          lead.qualification.score >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.qualification.score >= 70
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Score: {lead.qualification.score}/100
                      </span>

                      {/* CRM Status */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        <Database className="w-3 h-3 text-slate-400" />
                        CRM: {lead.crm_record_id || 'New Lead'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                      {lead.company.description}
                    </p>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {lead.company.city ? `${lead.company.city}, ` : ''}{lead.company.country} • {lead.company.company_size}
                      </span>

                      {lead.contact && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          {lead.contact.name} ({lead.contact.role})
                        </span>
                      )}

                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {lead.qualification.evidence.length} Verified Evidence Points
                      </span>
                    </div>

                    {/* Generated Email Subject Preview */}
                    {lead.outreach && (
                      <div className="mt-2 text-xs bg-slate-50 border border-slate-100 rounded-lg p-2.5 max-w-3xl">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Subject: {lead.outreach.subject}</span>
                          {lead.approval.was_edited && (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1 rounded">
                              Edited by human
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                          "{lead.outreach.body.substring(0, 180)}..."
                        </p>
                      </div>
                    )}

                    {/* Sent metadata if applicable */}
                    {isSent && lead.email_event && (
                      <div className="text-[11px] text-emerald-700 font-mono bg-emerald-50/80 p-1.5 rounded border border-emerald-200 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Dispatched via Gmail • Message ID: {lead.email_event.message_id} • {new Date(lead.email_event.sent_at).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <button
                      id={`btn-inspect-${lead.id}`}
                      onClick={() => onInspectLead(lead)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isPending ? 'Review & Edit Email' : 'Inspect Lead'}
                    </button>

                    {isPending && (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          id={`btn-quick-approve-${lead.id}`}
                          onClick={() => onQuickApproveAndSend(lead.id)}
                          disabled={isProcessing}
                          title="Directly approve and send via Gmail"
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Approve & Send
                        </button>

                        <button
                          id={`btn-quick-reject-${lead.id}`}
                          onClick={() => onQuickReject(lead.id)}
                          disabled={isProcessing}
                          title="Reject prospect"
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isApproved && (
                      <button
                        id={`btn-send-approved-${lead.id}`}
                        onClick={() => onQuickApproveAndSend(lead.id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        Dispatch Email Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

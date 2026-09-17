import React, { useState } from 'react';
import { Lead } from '../types.ts';
import {
  X,
  CheckCircle2,
  XCircle,
  Send,
  Edit3,
  Building2,
  User,
  ShieldCheck,
  Link,
  Mail,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  History,
  FileText,
} from 'lucide-react';

interface ApprovalModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveAndSend: (leadId: string, editedEmail?: { subject: string; body: string }) => Promise<void>;
  onReject: (leadId: string, feedback: string) => Promise<void>;
  isProcessing: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  lead,
  isOpen,
  onClose,
  onApproveAndSend,
  onReject,
  isProcessing,
}) => {
  if (!isOpen || !lead) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(lead.outreach?.subject || '');
  const [body, setBody] = useState(lead.outreach?.body || '');
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reviewerName, setReviewerName] = useState('Senior Sales Lead');

  const hasChanges =
    subject !== (lead.outreach?.subject || '') || body !== (lead.outreach?.body || '');

  const handleApproveAndSend = async () => {
    const editedEmail = hasChanges ? { subject, body } : undefined;
    await onApproveAndSend(lead.id, editedEmail);
    onClose();
  };

  const handleReject = async () => {
    await onReject(lead.id, rejectFeedback || 'Rejected during human review');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Human Approval Center
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {lead.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Review verified company evidence and generated message before email authorization
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Company & Decision-Maker Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Target Company
                </span>
                <a
                  href={lead.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  Visit Site <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <h3 className="text-base font-bold text-slate-900">{lead.company.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{lead.company.description}</p>
              <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap gap-2">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  {lead.company.city ? `${lead.company.city}, ` : ''}{lead.company.country}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  {lead.company.industry}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                  {lead.company.company_size}
                </span>
              </div>
            </div>

            {/* Decision-Maker Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Verified Decision Maker
                </span>
                {lead.contact?.verified && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Verified High Confidence
                  </span>
                )}
              </div>
              {lead.contact ? (
                <>
                  <h3 className="text-base font-bold text-slate-900">{lead.contact.name}</h3>
                  <p className="text-xs font-medium text-emerald-800">{lead.contact.role}</p>
                  <p className="text-xs text-slate-600 font-mono">{lead.contact.email}</p>
                  <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap gap-2">
                    {lead.contact.linkedin_url && (
                      <a
                        href={lead.contact.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200"
                      >
                        LinkedIn Profile <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]" title={lead.contact.source}>
                      Source: {lead.contact.source.replace(/^https?:\/\//, '')}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 italic">No direct executive contact found; defaulting to company outreach inbox.</p>
              )}
            </div>
          </div>

          {/* Qualification & Evidence Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Prospect Qualification & Evidence Grounding
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Fit Score:</span>
                <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {lead.qualification.score} / 100
                </span>
              </div>
            </div>

            {/* Reasons */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-800">Scoring Reasons:</span>
              <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                {lead.qualification.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Evidence items with citations */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-800">Verified Evidence & Source Claims:</span>
              <div className="space-y-1.5">
                {lead.qualification.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="text-emerald-950 font-medium">{ev.claim}</span>
                    <a
                      href={ev.source}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 font-semibold hover:underline shrink-0 flex items-center gap-1"
                    >
                      <Link className="w-3 h-3" />
                      Verify Citation
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personalized Outreach Email Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                Personalized Outreach Draft (Gmail Service)
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Preview Mode' : 'Edit Email'}
              </button>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Line
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {subject}
                </p>
              )}
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Body
              </label>
              {isEditing ? (
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed"
                />
              ) : (
                <div className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {body}
                </div>
              )}
            </div>

            {/* Personalization Reasoning */}
            {lead.outreach?.personalization_points && lead.outreach.personalization_points.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                <span className="font-semibold text-slate-700">Agent Personalization Strategy:</span>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {lead.outreach.personalization_points.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Rejection Feedback Prompt (Conditional) */}
          {showRejectInput && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-rose-900">
                Reason for Rejection:
              </label>
              <input
                type="text"
                placeholder="e.g. Incompatible ICP, company recently acquired, or email needs rework..."
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowRejectInput(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="px-3.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-medium text-slate-700">Reviewer:</span>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="px-2 py-0.5 text-xs rounded border border-slate-300 w-36 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!showRejectInput && (
              <button
                id="btn-modal-reject"
                onClick={() => setShowRejectInput(true)}
                disabled={isProcessing}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200"
              >
                <XCircle className="w-3.5 h-3.5 inline mr-1" />
                Reject Lead
              </button>
            )}

            <button
              id="btn-modal-approve-send"
              onClick={handleApproveAndSend}
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {hasChanges ? 'Save Changes & Send Outreach' : 'Approve & Send Outreach'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

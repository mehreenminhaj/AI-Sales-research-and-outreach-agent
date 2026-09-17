import React, { useState } from 'react';
import { ScoringWeights } from '../types.ts';
import {
  Sliders,
  FileSpreadsheet,
  Workflow,
  Mail,
  CheckCircle2,
  Copy,
  Download,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface SettingsViewProps {
  scoringWeights: ScoringWeights;
  onUpdateScoring: (weights: ScoringWeights) => Promise<void>;
  onExportSheets: () => void;
  isExporting: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  scoringWeights,
  onUpdateScoring,
  onExportSheets,
  isExporting,
}) => {
  const [weights, setWeights] = useState<ScoringWeights>(scoringWeights);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSliderChange = (key: keyof ScoringWeights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const totalWeights =
    weights.company_relevance +
    weights.product_fit +
    weights.company_profile +
    weights.buying_signal +
    weights.decision_maker_match;

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateScoring(weights);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const webhookUrl = `${window.location.origin}/api/webhooks/n8n`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Configurable Lead Scoring */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Configurable Lead Scoring Weights</h3>
              <p className="text-xs text-slate-500">
                Adjust criteria weights used by the Qualification Agent. (Total must equal 100%)
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              totalWeights === 100
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-300'
            }`}
          >
            Total: {totalWeights}%
          </span>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Company Relevance (Target Industry & Geography):</span>
                <span className="text-emerald-700 font-bold">{weights.company_relevance}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights.company_relevance}
                onChange={(e) => handleSliderChange('company_relevance', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Product Fit (Use Case Alignment):</span>
                <span className="text-emerald-700 font-bold">{weights.product_fit}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights.product_fit}
                onChange={(e) => handleSliderChange('product_fit', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Company Profile (Size & Maturity):</span>
                <span className="text-emerald-700 font-bold">{weights.company_profile}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights.company_profile}
                onChange={(e) => handleSliderChange('company_profile', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Buying Signal (Active Expansion / Modernization):</span>
                <span className="text-emerald-700 font-bold">{weights.buying_signal}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights.buying_signal}
                onChange={(e) => handleSliderChange('buying_signal', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Decision-Maker Match (Verified Executive Found):</span>
                <span className="text-emerald-700 font-bold">{weights.decision_maker_match}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={weights.decision_maker_match}
                onChange={(e) => handleSliderChange('decision_maker_match', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {isSaved ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Scoring weights successfully saved!
              </span>
            ) : (
              <span className="text-xs text-slate-400">Claims are strictly grounded in verified facts</span>
            )}

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              Save Weights
            </button>
          </div>
        </form>
      </div>

      {/* 2. n8n Automation Integration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">n8n Workflow Automation Engine</h3>
            <p className="text-xs text-slate-500">
              Low-code orchestrator integration for recurring cron triggers, lead distribution, and webhooks
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <span className="font-semibold text-slate-700">Webhook Receiver Endpoint:</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="w-full bg-slate-50 font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
            />
            <button
              onClick={copyWebhook}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copiedWebhook ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Supports actions: <code>start_research</code>, <code>get_pending_approvals</code>, and <code>approve_and_send</code>.
          </p>
        </div>
      </div>

      {/* 3. Google Sheets Synchronization */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Sheets / CSV Sync</h3>
              <p className="text-xs text-slate-500">
                Exports all research attributes: Company, Decision-Maker, Lead Score, Research Summary, CRM ID
              </p>
            </div>
          </div>

          <button
            onClick={onExportSheets}
            disabled={isExporting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Syncing...' : 'Export & Download CSV'}
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Syncs company details, verified decision-maker emails, evidence citations, outreach status, and delivery timestamps into spreadsheet format.
        </p>
      </div>

      {/* 4. Safety & Human Gate Status */}
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 flex items-start space-x-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Human-in-the-Loop Safety Enforcer Active: </span>
          The Gmail agent strictly verifies <code>lead.status === 'APPROVED'</code> before dispatching any message.
          Automatic sending after generation is completely forbidden and programmatically blocked.
        </div>
      </div>
    </div>
  );
};

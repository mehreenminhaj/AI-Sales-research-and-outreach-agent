import React, { useState } from 'react';
import { ResearchParameters } from '../types.ts';
import { Sparkles, X, Play, Sliders, CheckCircle2, Loader2, Bot, Layers, ArrowRight } from 'lucide-react';

interface NewResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartResearch: (params: Partial<ResearchParameters>) => Promise<void>;
  isExecuting: boolean;
  currentStep?: string;
}

export const NewResearchModal: React.FC<NewResearchModalProps> = ({
  isOpen,
  onClose,
  onStartResearch,
  isExecuting,
  currentStep,
}) => {
  if (!isOpen) return null;

  const [naturalQuery, setNaturalQuery] = useState(
    'Find potential software companies in Pakistan that could be prospects for our AI customer support solution.'
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [country, setCountry] = useState('Pakistan');
  const [industry, setIndustry] = useState('Software & IT Services');
  const [maxCompanies, setMaxCompanies] = useState(5);
  const [companySize, setCompanySize] = useState('SME to Enterprise');
  const [productDesc, setProductDesc] = useState(
    'AI-powered customer support chatbot that automates level-1 inquiries and drafts contextual responses for human agents'
  );
  const [targetRoles, setTargetRoles] = useState('CEO, CTO, Head of Product, Head of Engineering, Managing Director');

  const presetQueries = [
    {
      title: 'Pakistani Software & IT Services (Default)',
      query: 'Find potential software companies in Pakistan that could be prospects for our AI customer support solution.',
    },
    {
      title: 'Enterprise Tech in Lahore & Islamabad',
      query: 'Find 5 enterprise software consulting and IT firms in Lahore and Islamabad needing ticket triage automation.',
    },
    {
      title: 'FinTech & Asset Finance Firms',
      query: 'Find Pakistani FinTech and SaaS software engineering companies that manage large user inquiry volumes.',
    },
  ];

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const rolesArray = targetRoles.split(',').map((r) => r.trim()).filter(Boolean);

    await onStartResearch({
      natural_query: naturalQuery,
      country,
      industry,
      max_companies: maxCompanies,
      target_company_size: companySize,
      product_description: productDesc,
      target_roles: rolesArray,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Launch Autonomous Sales Agent</h2>
              <p className="text-xs text-slate-500">
                Orchestrates discovery, qualification, decision-maker research & outreach draft
              </p>
            </div>
          </div>

          {!isExecuting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleLaunch} className="p-6 space-y-4">
          {isExecuting ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Agentic Workflow Running</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {currentStep || 'Orchestrating agents and coordinating tools...'}
                </p>
              </div>

              {/* Visual Pipeline Steps */}
              <div className="max-w-md mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Orchestrator parsed intent and research plan</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Web search & company extraction active</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Qualification scoring & evidence citations</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700 font-semibold animate-pulse">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block"></span>
                  <span>4. Generating outreach & pausing for human review</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Natural Query Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 tracking-wider">
                  Natural-Language Research Request
                </label>
                <textarea
                  rows={3}
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  placeholder="e.g. Find 20 software companies in Pakistan that may need an AI customer support solution..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
                  required
                />
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Quick Prompt Templates:</span>
                <div className="flex flex-col gap-1.5">
                  {presetQueries.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNaturalQuery(p.query)}
                      className="text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 border border-slate-200 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate pr-2 font-medium">{p.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Parameters Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  {showAdvanced ? 'Hide Structured Parameters' : 'Customize Structured Parameters'}
                </button>
              </div>

              {/* Advanced Parameters Section */}
              {showAdvanced && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Max Companies: {maxCompanies}
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={maxCompanies}
                        onChange={(e) => setMaxCompanies(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Size</label>
                      <input
                        type="text"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Product Description</label>
                    <input
                      type="text"
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Decision-Maker Roles (comma separated)
                    </label>
                    <input
                      type="text"
                      value={targetRoles}
                      onChange={(e) => setTargetRoles(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-research"
                  type="submit"
                  disabled={isExecuting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute Autonomous Pipeline
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

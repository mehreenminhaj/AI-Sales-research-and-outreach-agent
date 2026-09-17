import React, { useState, useEffect } from 'react';
import { Company, DecisionMaker, Lead } from '../types.ts';
import { Database, ShieldCheck, Search, Building2, User, CheckCircle2, ArrowRight } from 'lucide-react';

interface CrmExplorerProps {
  leads: Lead[];
}

export const CrmExplorer: React.FC<CrmExplorerProps> = ({ leads }) => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'dedup_test'>('leads');
  const [testDomain, setTestDomain] = useState('systemsltd.com');
  const [testName, setTestName] = useState('Systems Limited');
  const [testEmail, setTestEmail] = useState('asif.peer@systemsltd.com');
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestDedup = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate CRM Agent search_company & search_contact
    const matchedByDomain = leads.find(
      (l) => l.company.domain.toLowerCase() === testDomain.toLowerCase()
    );
    const matchedByName = leads.find(
      (l) => l.company.name.toLowerCase() === testName.toLowerCase()
    );
    const matchedByEmail = leads.find(
      (l) => l.contact?.email.toLowerCase() === testEmail.toLowerCase()
    );

    if (matchedByDomain || matchedByName || matchedByEmail) {
      const match = matchedByDomain || matchedByName || matchedByEmail;
      setTestResult({
        exists: true,
        record_id: match?.crm_record_id,
        matched_company: match?.company.name,
        matched_field: matchedByDomain ? 'domain' : matchedByName ? 'name' : 'contact_email',
        status: 'existing',
        action_taken: 'Prevented duplicate lead creation; retrieved existing record ID.',
      });
    } else {
      setTestResult({
        exists: false,
        record_id: null,
        status: 'new',
        action_taken: 'Clean record. Approved for new lead registration.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">CRM & Deduplication Service</h2>
            <p className="text-xs text-slate-500">
              PostgreSQL relational CRM layer with automatic domain, name, and contact email deduplication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('leads')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === 'leads' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Registered CRM Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveSubTab('dedup_test')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === 'dedup_test' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'
            }`}
          >
            Deduplication Tester
          </button>
        </div>
      </div>

      {activeSubTab === 'leads' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>CRM Registered Organizations & Contacts</span>
            <span className="text-[11px] text-slate-500 font-normal">Source of truth: PostgreSQL Database</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">CRM ID</th>
                  <th className="px-4 py-2.5">Company & Domain</th>
                  <th className="px-4 py-2.5">Primary Contact</th>
                  <th className="px-4 py-2.5">Industry & Region</th>
                  <th className="px-4 py-2.5">Lead Status</th>
                  <th className="px-4 py-2.5">Dedup Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {lead.crm_record_id || 'CRM-PENDING'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{lead.company.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{lead.company.domain}</div>
                    </td>
                    <td className="px-4 py-3">
                      {lead.contact ? (
                        <>
                          <div className="font-medium text-slate-800">{lead.contact.name}</div>
                          <div className="text-[11px] text-slate-500">{lead.contact.role}</div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">No contact</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{lead.company.industry}</div>
                      <div className="text-[11px] text-slate-400">{lead.company.country}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Unique
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Deduplication Interactive Simulator */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Interactive CRM Deduplication Check</h3>
            <p className="text-xs text-slate-500">
              Test how the CRMAgent checks existing domains, company names, and contact emails before registering records.
            </p>
          </div>

          <form onSubmit={handleTestDedup} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Domain</label>
              <input
                type="text"
                value={testDomain}
                onChange={(e) => setTestDomain(e.target.value)}
                placeholder="e.g. systemsltd.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="e.g. Systems Limited"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Decision Maker Email (Optional)</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="e.g. asif.peer@systemsltd.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              Run CRM Deduplication Check
            </button>
          </form>

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                testResult.exists
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {testResult.exists ? 'Duplicate Record Detected!' : 'No Existing Match Found'}
              </div>
              <p>{testResult.action_taken}</p>
              {testResult.exists && (
                <div className="text-[11px] font-mono bg-white/70 p-2 rounded border border-amber-200 space-y-0.5">
                  <div>Existing CRM ID: {testResult.record_id}</div>
                  <div>Matched Field: {testResult.matched_field}</div>
                  <div>Company: {testResult.matched_company}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { AnalyticsSummary } from '../types.ts';
import { Building2, CheckCircle2, Clock, Mail, ShieldAlert, XCircle, TrendingUp } from 'lucide-react';

interface MetricsRibbonProps {
  analytics: AnalyticsSummary;
  onFilterChange: (status: string) => void;
  activeFilter: string;
}

export const MetricsRibbon: React.FC<MetricsRibbonProps> = ({ analytics, onFilterChange, activeFilter }) => {
  const cards = [
    {
      label: 'Researched',
      value: analytics.total_companies_researched,
      icon: Building2,
      filter: '',
      color: 'text-slate-700 bg-slate-100 border-slate-200',
    },
    {
      label: 'Qualified Leads',
      value: analytics.qualified_leads,
      icon: TrendingUp,
      filter: '',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: `${analytics.average_lead_score}% avg score`,
    },
    {
      label: 'Pending Approval',
      value: analytics.pending_approvals,
      icon: Clock,
      filter: 'PENDING_APPROVAL',
      color: 'text-amber-700 bg-amber-50 border-amber-300 ring-2 ring-amber-400/30',
      highlight: true,
    },
    {
      label: 'Approved',
      value: analytics.approved_count,
      icon: CheckCircle2,
      filter: 'APPROVED',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      label: 'Emails Sent',
      value: analytics.emails_sent,
      icon: Mail,
      filter: 'SENT',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      label: 'Rejected',
      value: analytics.rejected_count,
      icon: XCircle,
      filter: 'REJECTED',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filter && card.filter !== '';
        return (
          <button
            key={idx}
            onClick={() => card.filter !== undefined && onFilterChange(card.filter)}
            className={`text-left p-3 rounded-xl border transition-all cursor-pointer bg-white shadow-xs hover:shadow-md ${
              isSelected ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
              <div className={`p-1 rounded-md ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</span>
              {card.badge && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {card.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

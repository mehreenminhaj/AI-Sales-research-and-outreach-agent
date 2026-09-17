import React, { useState } from 'react';
import { AgentRunLog } from '../types.ts';
import { Terminal, Clock, CheckCircle2, XCircle, ChevronDown, ChevronRight, Filter, Search } from 'lucide-react';

interface AuditLogsViewProps {
  logs: AgentRunLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesAgent = !selectedAgent || log.agent_name === selectedAgent;
    const matchesSearch =
      !search ||
      log.tool_name.toLowerCase().includes(search.toLowerCase()) ||
      log.agent_name.toLowerCase().includes(search.toLowerCase()) ||
      (log.workflow_id && log.workflow_id.toLowerCase().includes(search.toLowerCase()));
    return matchesAgent && matchesSearch;
  });

  const agentNames = Array.from(new Set(logs.map((l) => l.agent_name)));

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-slate-900 text-white">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Agent Observability & Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Deterministic trace log of tool invocations, inputs, schema outputs, and durations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Agent Filter */}
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="">All Agents ({logs.length} runs)</option>
            {agentNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tool or run..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 w-44"
            />
          </div>
        </div>
      </div>

      {/* Logs Table / Feed */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-hidden shadow-md">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Execution Stream</span>
          <span>Showing {filteredLogs.length} events</span>
        </div>

        <div className="divide-y divide-slate-900 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isSuccess = log.status === 'SUCCESS';

            return (
              <div key={log.id} className="p-3 hover:bg-slate-900/50 transition-colors">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                >
                  <div className="flex items-center space-x-2.5">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}

                    {isSuccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    )}

                    <span className="text-emerald-400 font-bold">{log.agent_name}</span>
                    <span className="text-slate-500">→</span>
                    <span className="text-teal-300 font-semibold">{log.tool_name}()</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                      {log.duration_ms}ms
                    </span>
                    <span className="text-slate-500">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Expanded JSON Inspector */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-2 bg-slate-900/80 p-3 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                          Input Payload
                        </span>
                        <pre className="bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto text-slate-300">
                          {JSON.stringify(log.input, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                          Output / Returned State
                        </span>
                        <pre className="bg-slate-950 p-2 rounded border border-slate-800 overflow-x-auto text-emerald-300">
                          {JSON.stringify(log.output, null, 2)}
                        </pre>
                      </div>
                    </div>
                    {log.error && (
                      <div className="p-2 bg-rose-950/50 border border-rose-800 text-rose-300 rounded">
                        Error: {log.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

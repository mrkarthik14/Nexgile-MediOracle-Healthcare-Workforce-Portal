import React, { useState } from 'react';
import { AuditLog } from '../types';
import { Download, ShieldCheck, Search, Eye, X } from 'lucide-react';

interface AuditTrailSidebarProps {
  logs: AuditLog[];
  onExportLogs: () => void;
}

export const AuditTrailSidebar: React.FC<AuditTrailSidebarProps> = ({
  logs,
  onExportLogs
}) => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    log.actor.toLowerCase().includes(filterQuery.toLowerCase()) ||
    log.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getLogDotColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return { bg: 'bg-orange-100', dot: 'bg-orange-600' };
      case 'success':
        return { bg: 'bg-green-100', dot: 'bg-green-600' };
      case 'critical':
        return { bg: 'bg-red-100', dot: 'bg-red-600' };
      default:
        return { bg: 'bg-blue-100', dot: 'bg-blue-600' };
    }
  };

  return (
    <section id="audit-trail-panel" className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden h-[540px] lg:h-[580px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-slate-800 text-sm">Immutable Audit Trail</h2>
        </div>
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          SHA-256 Chained
        </span>
      </div>

      {/* Quick Search */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search audit trail..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-md pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No audit records match your query.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const { bg, dot } = getLogDotColor(log.severity);
            return (
              <div 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className="flex space-x-3 group cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                title="Click to view immutable audit proof"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <div className={`w-2 h-2 ${dot} rounded-full`}></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {log.title}
                    </p>
                    <Eye className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                    {log.details}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-medium">
                    {log.timestamp} • ID: <span className="font-mono font-semibold text-slate-600">{log.code}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer matching Design HTML */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
        <button
          id="export-audit-btn"
          onClick={onExportLogs}
          className="w-full py-2 text-xs font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-white transition-colors flex items-center justify-center space-x-1.5 cursor-pointer uppercase tracking-wider"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT COMPLIANCE LOG</span>
        </button>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Immutable Record #{selectedLog.code}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{selectedLog.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px] mb-0.5">Actor & Role:</span>
                <p className="font-semibold text-slate-800">{selectedLog.actor} <span className="text-slate-400 font-normal">({selectedLog.actorRole})</span></p>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold uppercase text-[10px] mb-0.5">Event Description:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-sans">
                  {selectedLog.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Target Type:</span>
                  <p className="font-medium text-slate-800">{selectedLog.targetType}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold uppercase text-[10px]">Target Record ID:</span>
                  <p className="font-mono text-slate-800">{selectedLog.targetId}</p>
                </div>
              </div>

              {selectedLog.metadata && (
                <div className="mt-2">
                  <span className="text-slate-400 block font-semibold uppercase text-[10px] mb-1">Attached Audit Metadata:</span>
                  <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-800">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-[11px] font-medium">Cryptographically anchored in compliance ledger.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

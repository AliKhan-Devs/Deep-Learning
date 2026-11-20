'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '../../lib/types';
import { getAuditHistory, clearAuditHistory } from '../../lib/api';
import { History, Trash2, ShieldCheck, AlertTriangle, AlertCircle, RefreshCw, Search } from 'lucide-react';

export default function HistoryPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getAuditHistory();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all audit history logs?')) {
      await clearAuditHistory();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.scan_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.patient_id && log.patient_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.predicted_class.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'all' || log.predicted_class === selectedClass;

    return matchesSearch && matchesClass;
  });

  const getClassBadge = (cls: string) => {
    switch (cls) {
      case 'glioma':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'meningioma':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'pituitary':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'notumor':
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-pacs-900 border border-pacs-700/80 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Neuroradiology Diagnostic Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable SQLite record of patient scans, differential verdicts, and entropy triage levels.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchHistory}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-pacs-850 hover:bg-pacs-800 text-xs font-semibold text-slate-300 border border-pacs-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {logs.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Scan ID, Patient ID, or Pathology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-pacs-900 border border-pacs-750 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 text-xs bg-pacs-900 border border-pacs-750 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Differential Pathologies</option>
          <option value="glioma">Glioma</option>
          <option value="meningioma">Meningioma</option>
          <option value="pituitary">Pituitary</option>
          <option value="notumor">No Tumor</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-pacs-900 border border-pacs-750 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-pacs-850 border-b border-pacs-750 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Scan / Patient ID</th>
                <th className="py-3 px-4">Diagnosis</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Shannon Entropy</th>
                <th className="py-3 px-4">Risk Triage</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pacs-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No diagnostic records found in audit log.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pacs-850/50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">#{log.scan_id.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400">{log.patient_id || 'ANONYMOUS'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-bold uppercase ${getClassBadge(
                          log.predicted_class
                        )}`}
                      >
                        {log.predicted_class}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {(log.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-cyan-300">
                      {log.entropy.toFixed(3)} bits
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          log.risk_level === 'CONFIDENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : log.risk_level === 'REVIEW_RECOMMENDED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {log.risk_level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

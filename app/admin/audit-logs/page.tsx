"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Loader2 
} from "lucide-react";

interface AuditLog {
  id: string;
  adminAuthUserId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  adminName: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const toggleExpandMetadata = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Audit Logs</h1>
        <p className="text-sm text-[#071E4A]/60 mt-1">
          Read-only history of administrative actions, changes, and security operations.
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
            <p className="text-xs font-semibold text-[#071E4A]/60">Loading system logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-[#071E4A]/60">No administrative logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-[#E8E8E8] text-[#071E4A] font-extrabold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Administrator</th>
                  <th className="py-4 px-6">Operation Action</th>
                  <th className="py-4 px-6">Target Resource</th>
                  <th className="py-4 px-6">Timestamp Date</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8] text-[#071E4A] text-xs font-semibold">
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <>
                      <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-bold">{log.adminName}</span>
                          <span className="block text-[9px] text-[#071E4A]/40 font-normal font-mono">{log.adminAuthUserId}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            log.actionType === "approve"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : log.actionType === "reject"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : log.actionType === "delete"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-gray-50 text-gray-800 border border-gray-200"
                          }`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="capitalize">{log.targetType}</span>
                          <span className="block text-[9px] text-[#071E4A]/45 font-normal font-mono">ID: {log.targetId}</span>
                        </td>
                        <td className="py-4 px-6 text-[#071E4A]/60 font-medium">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => toggleExpandMetadata(log.id)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-[#E8E8E8] text-[10px] font-bold text-[#071E4A] hover:bg-gray-50 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5 mr-1 text-[#0B2D6B]" /> Hide payload
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 mr-1 text-[#0B2D6B]" /> Inspect data
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Payload row */}
                      {isExpanded && (
                        <tr className="bg-gray-50/70 border-b border-[#E8E8E8]">
                          <td colSpan={5} className="p-4 px-6">
                            <div className="bg-white border border-[#E8E8E8] rounded-xl p-4 shadow-inner space-y-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                Metadata JSON Payload Parameters
                              </span>
                              <pre className="text-[10px] font-mono text-gray-600 bg-slate-50 p-3 rounded-lg overflow-x-auto border border-gray-100 max-h-60">
                                {log.metadata ? JSON.stringify(log.metadata, null, 2) : "{}"}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-[#E8E8E8] flex items-center justify-between">
            <div className="text-xs text-[#071E4A]/60 font-semibold">
              Showing page <span className="font-bold text-[#071E4A]">{pagination.page}</span> of{" "}
              <span className="font-bold text-[#071E4A]">{pagination.totalPages}</span> ({pagination.total} entries)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setLoading(true);
                  setPage((p) => Math.max(p - 1, 1));
                }}
                disabled={page === 1}
                className="p-2 border border-[#E8E8E8] rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-[#071E4A]" />
              </button>
              <button
                onClick={() => {
                  setLoading(true);
                  setPage((p) => Math.min(p + 1, pagination.totalPages));
                }}
                disabled={page === pagination.totalPages}
                className="p-2 border border-[#E8E8E8] rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-[#071E4A]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

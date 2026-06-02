"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  Bell, 
  Settings, 
  Calendar, 
  History, 
  ArrowRight,
  Loader2
} from "lucide-react";

interface Metrics {
  totalContestants: number;
  totalApplications: number;
  pendingCount: number;
  shortlistedCount: number;
  approvedCount: number;
  rejectedCount: number;
}

interface Application {
  id: string;
  userId: string;
  status: string;
  appliedAt: string;
  country: string;
  user: {
    fullName: string;
    phone: string;
  };
}

interface AuditLog {
  id: string;
  adminAuthUserId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

interface DashboardData {
  metrics: Metrics;
  countryBreakdown: { country: string; count: number }[];
  recentApplications: Application[];
  recentLogs: AuditLog[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError("Failed to fetch dashboard statistics");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred loading dashboard statistics");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
        <span className="ml-2 text-sm text-[#071E4A]/70">Loading stats...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-800 font-semibold">{error || "Could not load stats"}</p>
      </div>
    );
  }

  const { metrics, recentApplications, recentLogs } = data;

  const statCards = [
    {
      title: "Total Users",
      value: metrics.totalContestants,
      icon: Users,
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      title: "Applications Submitted",
      value: metrics.totalApplications,
      icon: FileText,
      color: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      title: "Pending Reviews",
      value: metrics.pendingCount,
      icon: Clock,
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      title: "Approved Contestants",
      value: metrics.approvedCount,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];

  const quickActions = [
    { name: "Broadcast Msg", href: "/admin/notifications", icon: Bell, bg: "hover:border-[#E8C97A]" },
    { name: "Create Event", href: "/admin/events", icon: Calendar, bg: "hover:border-[#0B2D6B]" },
    { name: "View System Logs", href: "/admin/audit-logs", icon: History, bg: "hover:border-slate-400" },
    { name: "System Settings", href: "/admin/settings", icon: Settings, bg: "hover:border-stone-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Dashboard Overview</h1>
        <p className="text-sm text-[#071E4A]/60 mt-1">
          Real-time metrics, recent registrations, and system configurations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-transform duration-200 hover:-translate-y-0.5`}
          >
            <div>
              <p className="text-xs font-semibold text-[#071E4A]/60 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-3xl font-extrabold text-[#071E4A] mt-2">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl border ${card.color.split(" ")[0]} ${card.color.split(" ")[1]} ${card.color.split(" ")[2]}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-base font-bold text-[#071E4A] mb-4">Quick Administrative Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link 
              key={idx} 
              href={action.href} 
              className={`flex items-center p-4 bg-white border border-[#E8E8E8] rounded-xl hover:shadow-md transition-all duration-200 ${action.bg}`}
            >
              <div className="p-2 rounded-lg bg-gray-50 text-[#0B2D6B] mr-3">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#071E4A]">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Double Column Grid: Recent Registrations & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Recent Applications */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E8]">
            <h2 className="text-base font-bold text-[#071E4A]">Recent Applications</h2>
            <Link 
              href="/admin/applications" 
              className="text-xs font-bold text-[#0B2D6B] hover:text-[#071E4A] flex items-center"
            >
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-[#E8E8E8] flex-1">
            {recentApplications.length === 0 ? (
              <p className="text-xs text-[#071E4A]/60 py-6 text-center">No applications submitted yet.</p>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-[#071E4A]">{app.user.fullName}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-[#071E4A]/60">{app.country}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] text-[#071E4A]/50">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      app.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : app.status === "pending"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : app.status === "shortlisted"
                        ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                        : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                      {app.status}
                    </span>
                    <Link 
                      href={`/admin/applications/${app.id}`}
                      className="p-1 rounded bg-[#0B2D6B]/5 text-[#0B2D6B] hover:bg-[#0B2D6B] hover:text-white transition-colors"
                      title="Review application"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Auditing */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E8]">
            <h2 className="text-base font-bold text-[#071E4A]">Recent Security Logs</h2>
            <Link 
              href="/admin/audit-logs" 
              className="text-xs font-bold text-[#0B2D6B] hover:text-[#071E4A] flex items-center"
            >
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="mt-4 divide-y divide-[#E8E8E8] flex-1">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-[#071E4A]/60 py-6 text-center">No system actions logged yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#071E4A] capitalize">
                      {log.actionType} {log.targetType}
                    </p>
                    <p className="text-[10px] text-[#071E4A]/60 mt-1">
                      Target ID: <span className="font-mono text-gray-500">{log.targetId.substring(0, 8)}...</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#071E4A]/40">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

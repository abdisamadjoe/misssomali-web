"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Send,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardMetrics {
  totalApplications: number;
  draftCount: number;
  submittedCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  approvedCount: number;
  rejectedCount: number;
}

interface RecentApplication {
  id: string;
  applicationNumber: string | null;
  fullName: string | null;
  country: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
  user: {
    fullName: string;
  };
}

interface DashboardData {
  metrics: DashboardMetrics;
  recentApplications: RecentApplication[];
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Submitted", variant: "default" },
  pending: { label: "Pending", variant: "outline" },
  under_review: { label: "Under Review", variant: "outline", className: "border-amber-500 text-amber-600 dark:text-amber-400" },
  shortlisted: { label: "Shortlisted", variant: "outline", className: "border-purple-500 text-purple-600 dark:text-purple-400" },
  approved: { label: "Approved", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.metrics) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-1 dark:bg-gray-dark">
        <p className="text-dark-6">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { metrics, recentApplications } = data;

  const statCards = [
    { label: "Total Applications", value: metrics.totalApplications, icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Submitted", value: metrics.submittedCount, icon: Send, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-900/20" },
    { label: "Under Review", value: metrics.underReviewCount, icon: Search, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Shortlisted", value: metrics.shortlistedCount, icon: Star, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { label: "Approved", value: metrics.approvedCount, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Rejected", value: metrics.rejectedCount, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[10px] bg-white p-4 sm:p-6 shadow-1 dark:bg-gray-dark"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="mt-5">
              <h4 className="text-heading-6 font-bold text-dark dark:text-white">
                {card.value}
              </h4>
              <p className="mt-1 text-sm font-medium text-dark-6">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        {/* Recent Submissions */}
        <div className="col-span-12 xl:col-span-8">
          <div className="rounded-[10px] bg-white p-4 sm:p-6 shadow-1 dark:bg-gray-dark">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark dark:text-white">
                Recent Submissions
              </h3>
              <Link
                href="/admin/applications"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <p className="py-8 text-center text-dark-6">No submissions yet.</p>
            ) : (
              <>
                {/* Desktop View: Table (visible md and up) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stroke dark:border-dark-3">
                        <th className="pb-3 text-left font-medium text-dark-6">Name</th>
                        <th className="pb-3 text-left font-medium text-dark-6">Country</th>
                        <th className="pb-3 text-left font-medium text-dark-6">Status</th>
                        <th className="pb-3 text-left font-medium text-dark-6">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-stroke last:border-0 dark:border-dark-3"
                        >
                          <td className="py-3 font-medium text-dark dark:text-white">
                            <Link href={`/admin/applications/${app.id}`} className="hover:text-primary">
                              {app.user?.fullName || app.fullName || "—"}
                            </Link>
                          </td>
                          <td className="py-3 text-dark-6">{app.country || "—"}</td>
                          <td className="py-3">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="py-3 text-dark-6">{formatDate(app.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: List (visible below md) */}
                <div className="block md:hidden space-y-4">
                  {recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="border-b border-stroke pb-4 last:border-0 last:pb-0 dark:border-dark-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="font-semibold text-dark hover:text-primary dark:text-white"
                        >
                          {app.user?.fullName || app.fullName || "—"}
                        </Link>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex justify-between text-xs text-dark-6">
                        <span>{app.country || "—"}</span>
                        <span>{formatDate(app.updatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 xl:col-span-4">
          <div className="rounded-[10px] bg-white p-4 sm:p-6 shadow-1 dark:bg-gray-dark">
            <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                href="/admin/applications"
                className="flex items-center justify-between rounded-lg border border-stroke px-4 py-3 font-medium text-dark transition-colors hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                View All Applications
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/applications?status=submitted"
                className="flex items-center justify-between rounded-lg border border-stroke px-4 py-3 font-medium text-dark transition-colors hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                Review Pending
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/contestants"
                className="flex items-center justify-between rounded-lg border border-stroke px-4 py-3 font-medium text-dark transition-colors hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                View Contestants
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

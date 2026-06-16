"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Search,
  MoreHorizontal,
  Eye,
  Star,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Application {
  id: string;
  applicationNumber: string | null;
  fullName: string | null;
  country: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string | null;
    role: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

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

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [countryFilter, setCountryFilter] = useState(searchParams.get("country") || "all");
  const [countries, setCountries] = useState<string[]>([]);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    appId: string;
    appName: string;
    action: string;
    status: string;
  }>({ open: false, appId: "", appName: "", action: "", status: "" });

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (countryFilter && countryFilter !== "all") params.set("country", countryFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      const data = await res.json();
      setApplications(data.applications || []);
      setPagination(data.pagination || null);
      if (data.countries) {
        setCountries(data.countries);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, countryFilter, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setActionLoading(appId);
    try {
      const res = await fetch(`/api/admin/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
      });
      if (res.ok) {
        await fetchApplications();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ open: false, appId: "", appName: "", action: "", status: "" });
    }
  };

  const openConfirmDialog = (appId: string, appName: string, action: string, status: string) => {
    setConfirmDialog({ open: true, appId, appName, action, status });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading("Generating applications PDF report...");
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
      if (countryFilter && countryFilter !== "all") params.set("country", countryFilter);
      if (searchQuery) params.set("search", searchQuery);
      
      const res = await fetch(`/api/admin/download-applications-pdf?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate PDF");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `applications-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Download error:", err);
      toast.error(err.message || "Failed to download PDF", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark dark:text-white">Applications</h1>
          <p className="mt-1 text-sm text-dark-6">
            {pagination ? `${pagination.total} total applications` : "Loading..."}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing download...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-6" />
            <Input
              type="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => { setPage(1); fetchApplications(); }}
              className="pl-9"
            />
          </form>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-dark-6">No applications found.</p>
          </div>
        ) : (
          <>
            {/* Desktop View: Table (visible md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-dark-3">
                    <th className="px-6 py-4 text-left font-medium text-dark-6">App #</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Full Name</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Country</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Status</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Submitted</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Updated</th>
                    <th className="px-6 py-4 text-right font-medium text-dark-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-dark-6">
                        {app.applicationNumber || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="font-medium text-dark hover:text-primary dark:text-white"
                        >
                          {app.user?.fullName || app.fullName || "—"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-dark-6">{app.country || "—"}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 text-dark-6">{formatDate(app.appliedAt)}</td>
                      <td className="px-6 py-4 text-dark-6">{formatDate(app.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === app.id}>
                              {actionLoading === app.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/applications/${app.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog(app.id, app.user?.fullName || "Applicant", "Shortlist", "shortlisted")}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Shortlist
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openConfirmDialog(app.id, app.user?.fullName || "Applicant", "Approve", "approved")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => openConfirmDialog(app.id, app.user?.fullName || "Applicant", "Reject", "rejected")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards list (visible below md) */}
            <div className="block md:hidden divide-y divide-stroke dark:divide-dark-3 px-4">
              {applications.map((app) => (
                <div key={app.id} className="py-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-dark-5">
                      {app.applicationNumber || "Pending"}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="font-semibold text-dark hover:text-primary dark:text-white"
                      >
                        {app.user?.fullName || app.fullName || "—"}
                      </Link>
                      <p className="text-xs text-dark-6 mt-0.5">{app.country || "—"}</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={actionLoading === app.id}>
                          {actionLoading === app.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/applications/${app.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openConfirmDialog(app.id, app.user?.fullName || "Applicant", "Shortlist", "shortlisted")}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openConfirmDialog(app.id, app.user?.fullName || "Applicant", "Approve", "approved")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => openConfirmDialog(app.id, app.user?.fullName || "Applicant", "Reject", "rejected")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex justify-between text-[11px] text-dark-6">
                    <span>Submitted: {formatDate(app.appliedAt)}</span>
                    <span>Updated: {formatDate(app.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-dark-3">
            <p className="text-sm text-dark-6">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.action} Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog.action.toLowerCase()} the application for{" "}
              <strong>{confirmDialog.appName}</strong>? This action will update their status to{" "}
              <strong>{confirmDialog.status}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog((d) => ({ ...d, open: false }))}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog.status === "rejected" ? "destructive" : "default"}
              onClick={() => handleStatusChange(confirmDialog.appId, confirmDialog.status)}
              disabled={actionLoading === confirmDialog.appId}
            >
              {actionLoading === confirmDialog.appId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {confirmDialog.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

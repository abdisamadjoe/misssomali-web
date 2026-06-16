"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Search,
  Eye,
  User,
  Star,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
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

interface Photo {
  id: string;
  url: string;
  type: "profile" | "full_body" | "gallery";
}

interface Contestant {
  id: string;
  applicationNumber: string | null;
  fullName: string | null;
  phone: string | null;
  country: string | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string | null;
    country: string | null;
    photos: Photo[];
  };
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  shortlisted: { label: "Shortlisted", variant: "outline", className: "border-purple-500 text-purple-600 dark:text-purple-400" },
  approved: { label: "Approved", variant: "default", className: "bg-emerald-600 hover:bg-emerald-700 text-white" },
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

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchContestants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/admin/contestants?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setContestants(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch contestants:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContestants();
  }, [fetchContestants]);

  // Client-side filtering by name
  const filteredContestants = contestants.filter((c) => {
    const name = c.fullName || c.user?.fullName || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark dark:text-white">Active Contestants</h1>
          <p className="mt-1 text-sm text-dark-6">
            {filteredContestants.length} contestants listed (Approved & Shortlisted)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-6" />
            <Input
              type="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Active Statuses</SelectItem>
              <SelectItem value="shortlisted">Shortlisted Only</SelectItem>
              <SelectItem value="approved">Approved Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contestants Table */}
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredContestants.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-dark-6">No active contestants found.</p>
          </div>
        ) : (
          <>
            {/* Desktop View: Table (visible md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stroke dark:border-dark-3">
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Contestant</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">App #</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Country</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Status</th>
                    <th className="px-6 py-4 text-left font-medium text-dark-6">Approved Date</th>
                    <th className="px-6 py-4 text-right font-medium text-dark-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContestants.map((con) => {
                    const profilePhoto = con.user?.photos?.find((p) => p.type === "profile")?.url;
                    const displayName = con.fullName || con.user?.fullName || "—";
                    return (
                      <tr
                        key={con.id}
                        className="border-b border-stroke last:border-0 hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {profilePhoto ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stroke dark:border-dark-3">
                                <Image
                                  src={profilePhoto}
                                  alt={displayName}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stroke text-dark-6 dark:bg-dark-3">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-dark dark:text-white">
                                {displayName}
                              </p>
                              <p className="text-xs text-dark-6">
                                {con.user?.phone || con.phone || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-dark-6">
                          {con.applicationNumber || "—"}
                        </td>
                        <td className="px-6 py-4 text-dark-6">
                          {con.country || con.user?.country || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={con.status} />
                        </td>
                        <td className="px-6 py-4 text-dark-6">
                          {formatDate(con.updatedAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/applications/${con.id}`} passHref>
                            <Button variant="outline" size="sm" className="inline-flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              View Application
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards list (visible below md) */}
            <div className="block md:hidden divide-y divide-stroke dark:divide-dark-3 px-4">
              {filteredContestants.map((con) => {
                const profilePhoto = con.user?.photos?.find((p) => p.type === "profile")?.url;
                const displayName = con.fullName || con.user?.fullName || "—";
                return (
                  <div key={con.id} className="py-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {profilePhoto ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stroke dark:border-dark-3">
                            <Image
                              src={profilePhoto}
                              alt={displayName}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stroke text-dark-6 dark:bg-dark-3">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-dark dark:text-white text-sm">
                            {displayName}
                          </p>
                          <p className="text-xs text-dark-6">
                            {con.user?.phone || con.phone || "—"}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={con.status} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-dark-6">
                      <div>
                        <span className="block">App #: <span className="font-mono text-dark dark:text-white">{con.applicationNumber || "—"}</span></span>
                        <span className="block mt-0.5">Country: <span className="text-dark dark:text-white">{con.country || con.user?.country || "—"}</span></span>
                      </div>
                      <div className="text-right">
                        <span className="block">Approved Date</span>
                        <span className="block font-medium mt-0.5 text-dark dark:text-white">{formatDate(con.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link href={`/admin/applications/${con.id}`} passHref className="w-full">
                        <Button variant="outline" size="sm" className="w-full inline-flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Application
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

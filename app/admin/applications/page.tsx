"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Loader2 
} from "lucide-react";

interface Application {
  id: string;
  userId: string;
  bio: string;
  city: string;
  country: string;
  status: string;
  appliedAt: string;
  user: {
    fullName: string;
    phone: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);

  const fetchApplications = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        status,
        country,
        search,
      });

      const res = await fetch(`/api/admin/applications?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [page, status, country, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setStatus(e.target.value);
    setPage(1);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    setCountry(e.target.value);
    setPage(1);
  };

  const countries = ["Somalia", "Kenya", "Ethiopia", "United Kingdom", "United States", "Canada", "Sweden", "Other"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Applicant Profiles</h1>
        <p className="text-sm text-[#071E4A]/60 mt-1">
          Review, filter, and manage applicant dossiers and application statuses.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by full name..."
            value={search}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] focus:border-transparent text-[#071E4A]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={status}
              onChange={handleStatusChange}
              className="bg-white border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Country filter */}
          <select
            value={country}
            onChange={handleCountryChange}
            className="bg-white border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
          >
            <option value="all">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
            <p className="text-xs font-semibold text-[#071E4A]/60">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-[#071E4A]/60">No applicant profiles match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-[#E8E8E8] text-[#071E4A] font-extrabold text-xs uppercase tracking-wider">
                  <th className="py-4 px-6">Applicant Name</th>
                  <th className="py-4 px-6">Country / City</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8] text-[#071E4A] text-xs">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{app.user.fullName}</td>
                    <td className="py-4 px-6 font-semibold">
                      {app.country} <span className="text-[#071E4A]/40 font-normal">({app.city})</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {new Date(app.appliedAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/applications/${app.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#E8E8E8] text-[10px] font-bold text-[#0B2D6B] bg-white hover:bg-[#0B2D6B] hover:text-white transition-all shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
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

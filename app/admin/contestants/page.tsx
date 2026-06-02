"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, 
  Search, 
  Sliders, 
  MapPin,
  CheckCircle,
  Bookmark,
  Loader2 
} from "lucide-react";

interface Photo {
  id: string;
  url: string;
  type: string;
}

interface Contestant {
  id: string;
  userId: string;
  bio: string;
  city: string;
  country: string;
  status: string;
  appliedAt: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
    photos?: Photo[];
  };
}

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchContestants = useCallback(async () => {
    try {
      const url = statusFilter !== "all" 
        ? `/api/admin/contestants?status=${statusFilter}` 
        : "/api/admin/contestants";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setContestants(data);
      }
    } catch (error) {
      console.error("Error fetching contestants:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContestants();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchContestants]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetch("/api/admin/contestants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, newStatus }),
      });

      if (res.ok) {
        // update local state
        setContestants((prev) => 
          prev.map((c) => c.id === applicationId ? { ...c, status: newStatus } : c)
        );
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating contestant status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredContestants = contestants.filter((c) => 
    c.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Approved Contestants</h1>
        <p className="text-sm text-[#071E4A]/60 mt-1">
          Manage profiles, toggle publication status (shortlisted vs fully approved), and review contestant details.
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
            placeholder="Search by name, country or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-[#E8E8E8] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Sliders className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setLoading(true);
              setStatusFilter(e.target.value);
            }}
            className="bg-white border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
          >
            <option value="all">All (Approved & Shortlisted)</option>
            <option value="approved">Approved Only</option>
            <option value="shortlisted">Shortlisted Only</option>
          </select>
        </div>
      </div>

      {/* Grid of Contestant Cards */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
          <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
          <p className="text-xs font-semibold text-[#071E4A]/60">Loading contestant list...</p>
        </div>
      ) : filteredContestants.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-[#071E4A]/60">No approved contestants found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContestants.map((c) => {
            // Find profile photo url, default to placeholder if not exists
            const profilePhoto = c.user.photos?.find((p) => p.type === "profile") || c.user.photos?.[0];
            return (
              <div key={c.id} className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all duration-200">
                
                {/* Image & Status Tag */}
                <div className="relative aspect-[4/3] bg-gray-50">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto.url} 
                      alt={c.user.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#0B2D6B]/20">
                      <Users className="h-12 w-12" />
                      <span className="text-[10px] font-bold mt-2">No Photo</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase shadow-sm ${
                      c.status === "approved"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-indigo-50 text-indigo-800 border-indigo-200"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-[#071E4A]">{c.user.fullName}</h3>
                    <div className="flex items-center text-xs font-semibold text-[#071E4A]/60">
                      <MapPin className="h-4 w-4 mr-1 text-[#0B2D6B]" />
                      <span>{c.city}, {c.country}</span>
                    </div>
                    <p className="text-[11px] text-[#071E4A]/70 line-clamp-2 leading-relaxed">
                      {c.bio || "No biography details available."}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 pt-4 border-t border-[#E8E8E8] flex items-center justify-between gap-3">
                    
                    {/* Status Toggle Switch */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-[#071E4A]/60 uppercase tracking-wider">Status:</span>
                      {updatingId === c.id ? (
                        <Loader2 className="animate-spin h-4 w-4 text-[#0B2D6B]" />
                      ) : (
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className="bg-white border border-[#E8E8E8] rounded-lg px-2 py-1 text-[10px] font-extrabold text-[#071E4A] focus:outline-none"
                        >
                          <option value="approved">Approved</option>
                          <option value="shortlisted">Shortlisted</option>
                        </select>
                      )}
                    </div>

                    <a
                      href={`/admin/applications/${c.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-[#E8E8E8] rounded-xl text-[10px] font-bold text-[#071E4A] bg-white hover:bg-gray-50 transition-colors"
                    >
                      Dossier
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

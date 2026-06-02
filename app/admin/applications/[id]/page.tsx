"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Check, 
  X, 
  Bookmark, 
  Loader2, 
  Calendar,
  MapPin,
  Maximize2,
  FileText,
  User,
  Info
} from "lucide-react";

interface Photo {
  id: string;
  url: string;
  type: string;
}

interface FormData {
  personalInfo: Record<string, unknown> | null;
  backgroundInfo: Record<string, unknown> | null;
  motivation: string;
  achievements: Record<string, unknown> | null;
}

interface Application {
  id: string;
  userId: string;
  bio: string;
  dateOfBirth: string;
  city: string;
  country: string;
  height: number;
  occupation: string;
  educationLevel: string;
  status: string;
  appliedAt: string;
  user: {
    fullName: string;
    phone: string;
    formData?: FormData | null;
    photos?: Photo[];
  };
}

export default function ApplicationDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data);
      } else {
        router.push("/admin/applications");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      router.push("/admin/applications");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDetail();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDetail]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus, notes }),
      });

      if (res.ok) {
        setConfirmStatus(null);
        setNotes("");
        setLoading(true);
        await fetchDetail(); // reload
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center bg-white rounded-2xl border border-[#E8E8E8]">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
        <p className="text-xs font-semibold text-[#071E4A]/60">Loading applicant details...</p>
      </div>
    );
  }

  if (!application) return null;

  const renderJsonFields = (data: Record<string, unknown> | null) => {
    if (!data) return <p className="text-[#071E4A]/60">Not provided</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="border-b border-[#E8E8E8] pb-2">
            <span className="text-[10px] font-extrabold text-[#071E4A]/55 uppercase tracking-wider block">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </span>
            <span className="text-xs font-bold text-[#071E4A] mt-0.5 block">
              {typeof val === "object" ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back to Applications Link */}
      <button
        onClick={() => router.push("/admin/applications")}
        className="flex items-center text-xs font-bold text-[#0B2D6B] hover:text-[#071E4A] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Applicants
      </button>

      {/* Dossier Header Info */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-[#071E4A]">{application.user.fullName}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
              application.status === "approved"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : application.status === "pending"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : application.status === "shortlisted"
                ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {application.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 text-xs font-semibold text-[#071E4A]/60">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-[#0B2D6B]" /> {application.city}, {application.country}</span>
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 text-[#0B2D6B]" /> DOB: {new Date(application.dateOfBirth).toLocaleDateString()}</span>
            <span className="flex items-center"><Maximize2 className="h-4 w-4 mr-1 text-[#0B2D6B]" /> Height: {application.height} cm</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          {application.status !== "approved" && (
            <button
              onClick={() => setConfirmStatus("approved")}
              className="inline-flex items-center px-4 py-2 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <Check className="h-4 w-4 mr-1" /> Approve
            </button>
          )}
          {application.status !== "shortlisted" && (
            <button
              onClick={() => setConfirmStatus("shortlisted")}
              className="inline-flex items-center px-4 py-2 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-sm"
            >
              <Bookmark className="h-4 w-4 mr-1" /> Shortlist
            </button>
          )}
          {application.status !== "rejected" && (
            <button
              onClick={() => setConfirmStatus("rejected")}
              className="inline-flex items-center px-4 py-2 border border-red-200 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors shadow-sm"
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Overlay Modal */}
      {confirmStatus && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#071E4A] flex items-center">
              <Info className="h-5 w-5 mr-2 text-[#0B2D6B]" />
              Confirm {confirmStatus.toUpperCase()} Action
            </h3>
            <p className="text-xs text-[#071E4A]/70 font-semibold leading-relaxed">
              Are you sure you want to change the status of <strong>{application.user.fullName}</strong> to <strong>{confirmStatus}</strong>? 
              This will update their system access profile and notify them.
            </p>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Add administrative comment or feedback (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write feedback/notes here..."
                rows={3}
                className="w-full border border-[#E8E8E8] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmStatus(null)}
                className="px-4 py-2 border border-[#E8E8E8] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(confirmStatus)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors shadow-sm ${
                  confirmStatus === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : confirmStatus === "shortlisted"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={updating}
              >
                {updating ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Dossier Details Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Bio, Background, Questions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bio Box */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#071E4A] mb-3 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
              <User className="h-4 w-4 mr-2 text-[#0B2D6B]" /> Applicant Biography
            </h2>
            <p className="text-xs font-semibold text-[#071E4A]/80 leading-relaxed whitespace-pre-line">
              {application.bio || "No biography provided."}
            </p>
          </div>

          {/* Detailed Form Questions */}
          {application.user.formData && (
            <div className="space-y-6">
              {/* Personal */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#071E4A] mb-3 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
                  <Info className="h-4 w-4 mr-2 text-[#0B2D6B]" /> Personal Questionnaire
                </h2>
                {renderJsonFields(application.user.formData.personalInfo)}
              </div>

              {/* Background */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#071E4A] mb-3 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
                  <FileText className="h-4 w-4 mr-2 text-[#0B2D6B]" /> Educational & Career Background
                </h2>
                {renderJsonFields(application.user.formData.backgroundInfo)}
              </div>

              {/* Motivation */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#071E4A] mb-3 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
                  <FileText className="h-4 w-4 mr-2 text-[#0B2D6B]" /> Motivation Statement
                </h2>
                <p className="text-xs font-semibold text-[#071E4A]/80 leading-relaxed whitespace-pre-line">
                  {application.user.formData.motivation || "No statement provided."}
                </p>
              </div>

              {/* Achievements */}
              <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#071E4A] mb-3 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
                  <FileText className="h-4 w-4 mr-2 text-[#0B2D6B]" /> Key Achievements
                </h2>
                {renderJsonFields(application.user.formData.achievements)}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Photo Gallery and Info List */}
        <div className="space-y-6">
          
          {/* Contestant Photos */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#071E4A] mb-4 uppercase tracking-wider border-b border-[#E8E8E8] pb-2">
              Applicant Gallery
            </h2>
            {application.user.photos && application.user.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {application.user.photos.map((photo) => (
                  <div key={photo.id} className="relative group overflow-hidden rounded-xl border border-[#E8E8E8] aspect-[3/4] bg-gray-50">
                    <img 
                      src={photo.url} 
                      alt={photo.type} 
                      className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-[#0B2D6B] text-white px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shadow-sm">
                      {photo.type.replace("_", " ")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#071E4A]/60">No photos uploaded by this applicant.</p>
            )}
          </div>

          {/* Technical Info */}
          <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm text-xs space-y-3 font-semibold text-[#071E4A]">
            <h2 className="text-sm font-extrabold uppercase tracking-wider border-b border-[#E8E8E8] pb-2">
              Registration Dossier
            </h2>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-[#071E4A]/60">Occupation</span>
              <span>{application.occupation}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-[#071E4A]/60">Education</span>
              <span>{application.educationLevel}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-[#071E4A]/60">Phone Number</span>
              <span>{application.user.phone || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#071E4A]/60">Applied At</span>
              <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

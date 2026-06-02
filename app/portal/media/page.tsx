"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  Trash2,
  User,
  Image as ImageIcon,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle
} from "lucide-react";

interface Photo {
  id: string;
  url: string;
  type: "profile" | "full_body" | "gallery";
}

export default function MediaHub() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMediaAndStatus = useCallback(async () => {
    try {
      // 1. Fetch application status to see if edits are locked
      const appRes = await fetch("/api/portal/application");
      if (appRes.ok) {
        const appData = await appRes.json();
        if (appData) {
          setIsSubmitted(appData.isSubmitted);
        }
      }

      // 2. Fetch photos
      const mediaRes = await fetch("/api/portal/media");
      if (mediaRes.ok) {
        const photosData = await mediaRes.json();
        setPhotos(photosData || []);
      }
    } catch (err) {
      console.error("Error loading media hub:", err);
      setErrorMessage("Failed to load contestant media files.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMediaAndStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMediaAndStatus]);

  const handleMockUpload = async (type: "profile" | "full_body" | "gallery") => {
    if (isSubmitted) return;

    setUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Simulate R2 delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockUrls: Record<string, string> = {
      profile: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      full_body: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=350",
      gallery: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
    };

    const targetUrl = mockUrls[type];

    try {
      const res = await fetch("/api/portal/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, type })
      });

      if (res.ok) {
        setSuccessMessage(`Successfully uploaded ${type} image!`);
        fetchMediaAndStatus(); // Refresh media
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to register photo.");
      }
    } catch {
      setErrorMessage("Network error uploading photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (isSubmitted) return;

    if (!confirm("Are you sure you want to delete this photo?")) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/portal/media?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setSuccessMessage("Photo removed successfully.");
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to delete photo.");
      }
    } catch {
      setErrorMessage("Network error deleting photo.");
    }
  };

  const handleSetProfilePic = async (id: string) => {
    if (isSubmitted) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/portal/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type: "profile" })
      });

      if (res.ok) {
        setSuccessMessage("Set as profile picture successfully.");
        fetchMediaAndStatus(); // Refresh to update type maps
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to update profile picture.");
      }
    } catch {
      setErrorMessage("Network error updating profile picture.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    );
  }

  const profilePic = photos.find((p) => p.type === "profile");
  const fullBodyPic = photos.find((p) => p.type === "full_body");
  const galleryPics = photos.filter((p) => p.type === "gallery");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E8E8] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071E4A]">Media Upload Hub</h1>
          <p className="text-sm text-[#071E4A]/60">Manage your pageant pictures. Upload portraits, full body poses, and event snaps.</p>
        </div>
        {isSubmitted && (
          <span className="mt-4 sm:mt-0 flex items-center px-4 py-2 text-xs font-bold border border-red-200 rounded-full text-red-600 bg-red-50">
            <Lock className="h-4 w-4 mr-2" /> Media Uploads Locked
          </span>
        )}
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-sm font-semibold text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Core Portrait & Full Body Photo Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Picture Card */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#071E4A]/60">Contestant Profile Picture</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">Official</span>
            </div>

            <div className="h-48 w-48 rounded-full border-4 border-[#0B2D6B]/15 overflow-hidden mx-auto flex items-center justify-center bg-gray-50 relative group">
              {profilePic ? (
                <>
                  <img src={profilePic.url} className="h-full w-full object-cover" alt="Profile" />
                  {!isSubmitted && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeletePhoto(profilePic.id)}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <User className="h-16 w-16 text-gray-300" />
              )}
            </div>
            <p className="text-xs text-[#071E4A]/50 max-w-[200px] mx-auto mt-2">
              Used as your primary contestant card face thumbnail.
            </p>
          </div>

          {!isSubmitted && !profilePic && (
            <button
              onClick={() => handleMockUpload("profile")}
              disabled={uploading}
              className="mt-6 flex items-center py-2.5 px-6 rounded-full text-xs font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Profile Photo
            </button>
          )}
        </div>

        {/* Full Body Picture Card */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="space-y-2 w-full">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#071E4A]/60">Full-Body Portrait</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">Official</span>
            </div>

            <div className="h-48 w-36 rounded-xl border border-[#E8E8E8] overflow-hidden mx-auto flex items-center justify-center bg-gray-50 relative group">
              {fullBodyPic ? (
                <>
                  <img src={fullBodyPic.url} className="h-full w-full object-cover" alt="Full Body" />
                  {!isSubmitted && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeletePhoto(fullBodyPic.id)}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <ImageIcon className="h-16 w-16 text-gray-300" />
              )}
            </div>
            <p className="text-xs text-[#071E4A]/50 max-w-[200px] mx-auto mt-2">
              Used to demonstrate posture and presence parameters.
            </p>
          </div>

          {!isSubmitted && !fullBodyPic && (
            <button
              onClick={() => handleMockUpload("full_body")}
              disabled={uploading}
              className="mt-6 flex items-center py-2.5 px-6 rounded-full text-xs font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload Full Body Photo
            </button>
          )}
        </div>

      </div>

      {/* Gallery Section */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E8E8] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#071E4A]">Personal Gallery Photos</h3>
            <p className="text-xs text-[#071E4A]/60 mt-0.5">Share additional lifestyle, advocacy, or backstage photos.</p>
          </div>
          {!isSubmitted && (
            <button
              onClick={() => handleMockUpload("gallery")}
              disabled={uploading}
              className="flex items-center py-2 px-4 rounded-full text-xs font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Append Gallery Photo
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {galleryPics.map((photo) => (
            <div key={photo.id} className="relative group border border-[#E8E8E8] rounded-xl overflow-hidden h-40 bg-gray-50">
              <img src={photo.url} className="h-full w-full object-cover" alt="Gallery item" />
              {!isSubmitted && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 px-2">
                  <button
                    onClick={() => handleSetProfilePic(photo.id)}
                    className="w-full text-[10px] font-bold py-1.5 px-2 bg-white text-[#071E4A] rounded hover:bg-gray-100 transition-colors"
                  >
                    Set Profile Picture
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="w-full text-[10px] font-bold py-1.5 px-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete Photo
                  </button>
                </div>
              )}
            </div>
          ))}

          {galleryPics.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-[#E8E8E8] rounded-xl p-8 text-center text-gray-400">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <span className="text-xs font-medium">No additional gallery pictures uploaded.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

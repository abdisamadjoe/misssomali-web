"use client";

import { useEffect, useState } from "react";
import { Loader2, User, Phone, MapPin, Mail, Check, CheckCircle, Camera } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePortal } from "../layout";
import { Button } from "@/components/ui/button";

type ProfileData = {
  fullName: string;
  phone: string;
  country: string;
  email: string;
  profilePhotoUrl?: string;
  isSubmitted?: boolean;
};

export default function ProfilePage() {
  const { refreshProfile } = usePortal();
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    phone: "",
    country: "",
    email: "",
    profilePhotoUrl: "",
    isSubmitted: false,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/portal/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          phone: profile.phone,
          country: profile.country,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        refreshProfile();
        // Hide success alert after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to update profile details");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  // Photo reader helper
  function readFileAsDataURL(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Upload helper with progress tracking
  function uploadImageWithProgress(
    base64Data: string, 
    onProgress: (pct: number) => void
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/image", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(errResponse.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error"));
      xhr.send(JSON.stringify({ image: base64Data }));
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("File too large. Max allowed size is 1.5MB");
      return;
    }

    setUploadProgress(0);

    try {
      const base64 = await readFileAsDataURL(file);
      
      // Step 1: Upload to Cloudinary with progress updates
      const cloudinaryResult = await uploadImageWithProgress(base64, (pct) => {
        setUploadProgress(pct);
      });

      // Step 2: Save metadata to Neon database
      const res = await fetch("/api/portal/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: cloudinaryResult.secure_url, 
          publicId: cloudinaryResult.public_id,
          type: "profile" 
        }),
      });

      if (res.ok) {
        const photoData = await res.json();
        setProfile(prev => ({
          ...prev,
          profilePhotoUrl: photoData.url
        }));
        setSuccess(true);
        refreshProfile();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Failed to save profile picture to database.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload profile photo.");
    } finally {
      setUploadProgress(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Profile Settings</h1>
        <p className="text-body-sm text-dark-5">
          View and manage your applicant profile details.
        </p>
      </div>

      {profile.isSubmitted && (
        <div className="rounded-[10px] border border-stroke bg-white p-4 text-sm text-dark-5 text-center dark:bg-gray-dark dark:border-dark-3 font-semibold flex items-center justify-center gap-2 shadow-1">
          <span>🔒 Application Submitted (Locked)</span>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green/10 border border-green/20 p-4 text-green text-sm font-semibold mb-4">
              <CheckCircle className="h-4 w-4" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Profile Picture Avatar Section */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-6 border-b border-stroke dark:border-dark-3">
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-stroke dark:border-dark-3 bg-gray-2 dark:bg-dark-2 flex items-center justify-center shadow-md">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt="Profile Picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-dark-5 opacity-40" />
              )}

              {/* Upload Overlay */}
              {!profile.isSubmitted && (
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-white text-xs font-semibold">
                  <Camera className="h-6 w-6 mb-1 text-white" />
                  Change Photo
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadProgress !== null}
                  />
                </label>
              )}
            </div>

            {uploadProgress !== null && (
              <div className="w-full max-w-[200px] space-y-1.5">
                <Progress value={uploadProgress} />
                <span className="text-[10px] text-dark-5 block text-center font-semibold">
                  Uploading: {uploadProgress}%
                </span>
              </div>
            )}
            
            <span className="text-xs text-dark-5 font-medium">
              {profile.isSubmitted 
                ? "Profile picture is locked" 
                : "Click photo to upload a new profile picture (Max 1.5MB)"}
            </span>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
              Full Name
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                required
                disabled={profile.isSubmitted}
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Hodan Warsame"
                className={`h-12 w-full rounded-lg border border-stroke bg-gray-2 pl-11 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 ${
                  profile.isSubmitted ? "cursor-not-allowed opacity-75 bg-gray-1 text-dark-5 dark:bg-dark-3/55" : ""
                }`}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-5" />
            </div>
          </div>

          {/* Email Address (Read-only) */}
          <div>
            <label htmlFor="email" className="mb-2 block text-body-sm font-medium text-dark-5">
              Email Address (Read-only)
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                disabled
                value={profile.email}
                className="h-12 w-full rounded-lg border border-stroke bg-gray-1 pl-11 pr-4 text-sm outline-none cursor-not-allowed opacity-75 dark:border-dark-3 dark:bg-dark-3/55 text-dark-5"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-5" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                type="text"
                required
                disabled={profile.isSubmitted}
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+252 61..."
                className={`h-12 w-full rounded-lg border border-stroke bg-gray-2 pl-11 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 ${
                  profile.isSubmitted ? "cursor-not-allowed opacity-75 bg-gray-1 text-dark-5 dark:bg-dark-3/55" : ""
                }`}
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-5" />
            </div>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
              Country of Residence
            </label>
            <div className="relative">
              <input
                id="country"
                type="text"
                required
                disabled={profile.isSubmitted}
                value={profile.country}
                onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Somalia"
                className={`h-12 w-full rounded-lg border border-stroke bg-gray-2 pl-11 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 ${
                  profile.isSubmitted ? "cursor-not-allowed opacity-75 bg-gray-1 text-dark-5 dark:bg-dark-3/55" : ""
                }`}
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-5" />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-3 border-t border-stroke dark:border-dark-3">
            <Button
              type="submit"
              disabled={updating || profile.isSubmitted}
              className="flex items-center gap-1.5 font-bold"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

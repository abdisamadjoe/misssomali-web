"use client";

import { useEffect, useState } from "react";
import { Loader2, User, Phone, MapPin, Mail, Save, CheckCircle } from "lucide-react";

type ProfileData = {
  fullName: string;
  phone: string;
  country: string;
  email: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    phone: "",
    country: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

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

      {/* Profile Form Card */}
      <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green/10 border border-green/20 p-4 text-green text-sm font-semibold mb-4">
              <CheckCircle className="h-4 w-4" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

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
                value={profile.fullName}
                onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Hodan Warsame"
                className="h-12 w-full rounded-lg border border-stroke bg-gray-2 pl-11 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
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
            <p className="text-[10px] text-dark-5 mt-1.5 font-medium">
              * Sourced from your active Neon Auth identity. Email modifications are locked.
            </p>
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
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+252 61..."
                className="h-12 w-full rounded-lg border border-stroke bg-gray-2 pl-11 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
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
                value={profile.country}
                onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Somalia"
                className="h-12 w-full rounded-lg border border-stroke bg-gray-2 pl-11 pr-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-5" />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-3 border-t border-stroke dark:border-dark-3">
            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 text-white px-6 py-2.5 font-bold transition-all shadow-md"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

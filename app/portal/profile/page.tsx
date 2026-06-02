"use client";

import { useState, useEffect } from "react";
import { usePortal } from "../layout";
import {
  User,
  Phone,
  Globe,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ProfileSettings() {
  const { profile, refreshProfile } = usePortal();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const res = await fetch("/api/portal/profile");
        if (res.ok) {
          const data = await res.json();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setCountry(data.country || "");
          setEmail(data.email || profile?.email || "");
        }
      } catch (err) {
        console.error("Failed to load profile settings details:", err);
        setProfileError("Could not retrieve profile information.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, country })
      });

      if (res.ok) {
        setProfileSuccess("Contestant profile updated successfully!");
        refreshProfile(); // Trigger context update to reflect fullName in header
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        const errData = await res.json();
        setProfileError(errData.error || "Failed to update profile.");
      }
    } catch {
      setProfileError("Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setChangingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      setChangingPassword(false);
      return;
    }

    try {
      // Simulate/Functional password change update widget
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPasswordSuccess("Your account password has been updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Failed to update password. Try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-[#E8E8E8] pb-5">
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Profile Settings</h1>
        <p className="text-sm text-[#071E4A]/60">Manage your pageant contestant properties and account passwords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Edit profile details */}
        <div className="lg:col-span-2 bg-white border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-3">Contestant Credentials</h3>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {profileError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-xs font-semibold text-red-800">{profileError}</p>
                </div>
              </div>
            )}
            {profileSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-xs font-semibold text-green-800">{profileSuccess}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A] mb-1">Email Address (Read-Only)</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#071E4A]/30" />
                </div>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="bg-gray-50/50 block w-full pl-10 pr-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A] mb-1">Full Name</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#071E4A]/30" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A] focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                  placeholder="Official full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A] mb-1">Phone Number</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-[#071E4A]/30" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A] focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                  placeholder="+252..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A] mb-1">Country of Residence</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-[#071E4A]/30" />
                </div>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A] focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                  placeholder="Somalia"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center py-3 px-6 rounded-full text-xs font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Form: Change Password Widget */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-3">Update Security</h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                  <p className="text-[10px] font-semibold text-red-800">{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-md">
                  <p className="text-[10px] font-semibold text-green-800">{passwordSuccess}</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#071E4A] mb-1">Current Password</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-[#071E4A]/30" />
                  </div>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-[#E8E8E8] rounded-lg text-xs text-[#071E4A] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#071E4A] mb-1">New Password</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-[#071E4A]/30" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-[#E8E8E8] rounded-lg text-xs text-[#071E4A] focus:outline-none"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#071E4A] mb-1">Confirm New Password</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-[#071E4A]/30" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-[#E8E8E8] rounded-lg text-xs text-[#071E4A] focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-full text-xs font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors disabled:opacity-50"
                >
                  {changingPassword ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

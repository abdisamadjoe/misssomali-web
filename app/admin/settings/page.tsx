"use client";

import { useEffect, useState } from "react";
import { Loader2, Settings, User, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AdminProfile {
  fullName: string;
  email: string;
  role: string;
}

interface SystemSettings {
  applicationOpen: boolean;
  registrationLimit: number;
  finaleDate: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profile/role info
      const profileRes = await fetch("/api/auth/role", { cache: "no-store" });
      let profileData = null;
      if (profileRes.ok) {
        profileData = await profileRes.json();
        if (profileData.authenticated) {
          setProfile({
            fullName: profileData.fullName,
            email: profileData.email,
            role: profileData.role,
          });
        }
      }

      // 2. Fetch global settings
      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Failed to load settings data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccessMsg("Settings updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-heading-5 font-bold text-dark dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Settings & Configuration
        </h1>
        <p className="mt-1 text-sm text-dark-6">
          Manage system configurations and view your administrator profile.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark flex flex-col justify-between">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Admin Profile
            </h3>
            {profile ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-dark-6">Full Name</p>
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {profile.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-6">Email Address</p>
                  <p className="text-sm font-semibold text-dark dark:text-white font-mono">
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-6">System Role</p>
                  <p className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                    {profile.role.toUpperCase()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-dark-6">Profile information unavailable.</p>
            )}
          </div>


        </div>

        {/* Global System Settings Card */}
        {settings && (
          <form onSubmit={handleSave} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark flex flex-col justify-between">
            <div>
              <h3 className="mb-6 text-lg font-semibold text-dark dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" /> Application Portal Controls
              </h3>
              
              <div className="space-y-5">
                <div className="flex items-center space-x-3 rounded-lg border border-stroke p-4 dark:border-dark-3">
                  <Checkbox
                    id="applicationOpen"
                    checked={settings.applicationOpen}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, applicationOpen: !!checked })
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="applicationOpen"
                      className="text-sm font-semibold text-dark dark:text-white cursor-pointer"
                    >
                      Registration Open
                    </Label>
                    <p className="text-xs text-dark-6">
                      Toggle to allow or block new candidates from submitting applications.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="registrationLimit" className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Registration Capacity Limit
                  </Label>
                  <Input
                    type="number"
                    id="registrationLimit"
                    value={settings.registrationLimit}
                    onChange={(e) =>
                      setSettings({ ...settings, registrationLimit: parseInt(e.target.value) || 0 })
                    }
                    min={1}
                  />
                  <p className="mt-1 text-xs text-dark-6">
                    The maximum number of finalized submissions the system will accept.
                  </p>
                </div>

                <div>
                  <Label htmlFor="finaleDate" className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Scheduled Finale Date
                  </Label>
                  <Input
                    type="text"
                    id="finaleDate"
                    value={settings.finaleDate}
                    onChange={(e) =>
                      setSettings({ ...settings, finaleDate: e.target.value })
                    }
                    placeholder="YYYY-MM-DDTHH:MM:SS.sssZ"
                  />
                  <p className="mt-1 text-xs text-dark-6">
                    ISO-8601 formatted date for the grand finale countdown.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button type="submit" disabled={saving} className="flex items-center gap-1.5 font-bold">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Changes
              </Button>
              {successMsg && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> {successMsg}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}

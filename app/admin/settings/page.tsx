"use client";

import { useEffect, useState } from "react";
import { 
  Sliders, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  Loader2, 
  CheckCircle2, 
  ListOrdered 
} from "lucide-react";

interface SettingsData {
  finaleDate: string;
  applicationOpen: boolean;
  registrationLimit: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Editable Form states
  const [finaleDate, setFinaleDate] = useState("");
  const [applicationOpen, setApplicationOpen] = useState(true);
  const [registrationLimit, setRegistrationLimit] = useState(500);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          
          // Format ISO date to yyyy-MM-ddThh:mm for datetime-local input
          if (data.finaleDate) {
            const date = new Date(data.finaleDate);
            // offset timezone to local ISO string
            const pad = (num: number) => String(num).padStart(2, "0");
            const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
            setFinaleDate(localIso);
          }
          
          setApplicationOpen(data.applicationOpen);
          setRegistrationLimit(data.registrationLimit);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const updatedSettings = {
        finaleDate: new Date(finaleDate).toISOString(),
        applicationOpen,
        registrationLimit: Number(registrationLimit),
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        alert("Failed to update settings");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col justify-center items-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
        <p className="text-xs font-semibold text-[#071E4A]/60">Loading system parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">System Settings</h1>
        <p className="text-sm text-[#071E4A]/60 mt-1">
          Adjust countdown thresholds, control application registration states, and limit contestant intakes.
        </p>
      </div>

      {/* Main settings form */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-extrabold text-[#071E4A] mb-6 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
          <Sliders className="h-4.5 w-4.5 mr-2 text-[#0B2D6B]" /> Platform Variables
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center shadow-sm">
              <CheckCircle2 className="h-5 w-5 mr-2" /> System parameters updated successfully!
            </div>
          )}

          {/* Application open/close status */}
          <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-xl hover:bg-gray-50/20 transition-colors">
            <div className="space-y-1 pr-4">
              <h4 className="text-xs font-bold text-[#071E4A]">Application Sign-ups Open</h4>
              <p className="text-[10px] text-[#071E4A]/60 font-semibold leading-relaxed">
                When toggled off, applicants will not be able to create new registrations or submit drafts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setApplicationOpen(!applicationOpen)}
              className="text-[#0B2D6B] focus:outline-none transition-transform active:scale-95"
            >
              {applicationOpen ? (
                <ToggleRight className="h-10 w-10 text-[#0B2D6B]" />
              ) : (
                <ToggleLeft className="h-10 w-10 text-gray-300" />
              )}
            </button>
          </div>

          {/* Grand Finale Countdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Grand Finale Countdown Target
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4.5 w-4.5 text-[#0B2D6B]" />
              </span>
              <input
                type="datetime-local"
                required
                value={finaleDate}
                onChange={(e) => setFinaleDate(e.target.value)}
                className="w-full border border-[#E8E8E8] rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
              />
            </div>
            <p className="text-[9px] text-[#071E4A]/50 font-medium">
              This date will set the countdown timer displayed globally inside the Contestant Portal.
            </p>
          </div>

          {/* Registration Limit count */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Registration Cap Limit
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ListOrdered className="h-4.5 w-4.5 text-[#0B2D6B]" />
              </span>
              <input
                type="number"
                required
                min={1}
                max={10000}
                value={registrationLimit}
                onChange={(e) => setRegistrationLimit(Number(e.target.value))}
                className="w-full border border-[#E8E8E8] rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
              />
            </div>
            <p className="text-[9px] text-[#071E4A]/50 font-medium">
              Caps total profile sign-ups. Prevents database overload during peak registrations.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#0B2D6B] hover:bg-[#071E4A] text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              {saving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                "Save Configuration Parameters"
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

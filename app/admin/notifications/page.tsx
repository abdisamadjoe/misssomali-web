"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  Send, 
  Users, 
  User, 
  History, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

interface Contestant {
  id: string;
  city: string;
  country: string;
  user: {
    id: string;
    fullName: string;
  };
}

interface NotificationLog {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  user: {
    fullName: string;
  };
}

export default function NotificationsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [history, setHistory] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [target, setTarget] = useState("all"); // "all" or specific userProfile ID
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("system");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch contestant list for targeting dropdown
        const resContestants = await fetch("/api/admin/contestants");
        if (resContestants.ok) {
          const data = await resContestants.json();
          setContestants(data);
        }

        // Fetch dispatch log history
        const resHistory = await fetch("/api/admin/notifications");
        if (resHistory.ok) {
          const data = await resHistory.json();
          setHistory(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || !type) {
      alert("Please fill in all fields");
      return;
    }

    setSending(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, title, message, type }),
      });

      if (res.ok) {
        const json = await res.json();
        setSuccessMsg(`Successfully sent notification to ${json.count} contestant(s)!`);
        setTitle("");
        setMessage("");
        
        // Refresh history
        const resHistory = await fetch("/api/admin/notifications");
        if (resHistory.ok) {
          const data = await resHistory.json();
          setHistory(data);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send notification");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Broadcast Hub</h1>
        <p className="text-sm text-[#071E4A]/60 mt-1">
          Send platform announcements, preliminary update bulletins, or direct private feedback notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Dispatch Wizard */}
        <div className="lg:col-span-2 bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-[#071E4A] mb-6 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
            <Send className="h-4.5 w-4.5 mr-2 text-[#0B2D6B]" /> Dispatch Notification
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" /> {successMsg}
              </div>
            )}

            {/* Target selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Recipient Target
              </label>
              <div className="relative">
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
                >
                  <option value="all">📢 Broadcast (All Approved & Shortlisted Contestants)</option>
                  {contestants.map((c) => (
                    <option key={c.user.id} value={c.user.id}>
                      👤 {c.user.fullName} ({c.city}, {c.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Alert Category Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
              >
                <option value="system">System Broadcast (Maintenance, Rules)</option>
                <option value="application_update">Application Bulletin (Status changes, steps updates)</option>
                <option value="event">Event Alert (Timeline updates, rehearsals schedules)</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Notification Subject / Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Grand Coronation Schedule Announcement"
                className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Detailed Message
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message description here. This will display in the contestant portal inbox."
                rows={5}
                className="w-full border border-[#E8E8E8] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B] text-[#071E4A]"
              />
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#0B2D6B] hover:bg-[#071E4A] text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {sending ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Dispatch Alert Message
              </button>
            </div>

          </form>
        </div>

        {/* Right 1 Column: Dispatch History */}
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col max-h-[600px] overflow-hidden">
          <h2 className="text-sm font-extrabold text-[#071E4A] mb-4 uppercase tracking-wider flex items-center border-b border-[#E8E8E8] pb-2">
            <History className="h-4.5 w-4.5 mr-2 text-[#0B2D6B]" /> Sent History
          </h2>
          
          <div className="mt-2 space-y-4 overflow-y-auto pr-1 flex-1">
            {loading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 className="animate-spin h-6 w-6 text-[#0B2D6B]" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-[#071E4A]/60 text-center py-8">No notifications sent yet.</p>
            ) : (
              history.map((log) => (
                <div key={log.id} className="p-3 border border-[#E8E8E8] rounded-xl space-y-1.5 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-gray-50 border border-gray-200">
                      {log.type}
                    </span>
                    <span className="text-[9px] text-[#071E4A]/40 font-semibold">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#071E4A]">{log.title}</h4>
                  <p className="text-[10px] text-[#071E4A]/70 line-clamp-2 leading-relaxed">
                    {log.message}
                  </p>
                  <div className="text-[8px] font-bold text-[#0B2D6B] pt-1 flex items-center">
                    <User className="h-3 w-3 mr-0.5" /> Sent to: {log.user?.fullName || "Contestant"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

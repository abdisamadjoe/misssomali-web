"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePortal } from "./layout";
import {
  FileText,
  CheckCircle2,
  Calendar,
  Image as ImageIcon,
  Bell,
  ArrowRight,
  ClipboardList,
  Clock,
  Loader2
} from "lucide-react";

interface ApplicationData {
  id: string;
  isSubmitted: boolean;
  status: string;
  updatedAt: string;
}

export default function PortalDashboard() {
  const { profile } = usePortal();
  const [appData, setAppData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch("/api/portal/application");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setAppData(data);
          }
        }
      } catch (err) {
        console.error("Failed to load application status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, []);

  const getApplicationStatus = () => {
    if (!appData) return { label: "Not Started", color: "text-gray-500 bg-gray-50 border-gray-200", desc: "You have not started your application yet." };
    if (!appData.isSubmitted) return { label: "Draft Saved", color: "text-amber-600 bg-amber-50 border-amber-200", desc: "You have saved your application details but haven't submitted yet." };
    
    switch (appData.status) {
      case "pending":
        return { label: "Under Review", color: "text-blue-600 bg-blue-50 border-blue-200", desc: "Your application is locked and currently being reviewed by our team." };
      case "shortlisted":
        return { label: "Shortlisted", color: "text-purple-600 bg-purple-50 border-purple-200", desc: "Congratulations! You have been shortlisted for the next round." };
      case "approved":
        return { label: "Approved (Finalist)", color: "text-green-600 bg-green-50 border-green-200", desc: "Excellent! You are approved as an official Miss Somali finalist." };
      case "rejected":
        return { label: "Not Selected", color: "text-red-600 bg-red-50 border-red-200", desc: "We regret to inform you that your application was not selected." };
      default:
        return { label: "Unknown Status", color: "text-gray-500 bg-gray-50 border-gray-200", desc: "System status is unavailable." };
    }
  };

  const statusInfo = getApplicationStatus();

  const timelineSteps = [
    { name: "Registration", completed: true, current: false },
    { name: "Application Draft", completed: !!appData, current: !appData },
    { name: "Under Review", completed: !!appData?.isSubmitted, current: !!(appData && !appData.isSubmitted) },
    { name: "Selection Results", completed: appData?.status === "approved" || appData?.status === "shortlisted" || appData?.status === "rejected", current: !!(appData?.isSubmitted && appData.status === "pending") }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-[#0B2D6B] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 w-1/3">
          {/* Subtle decoration pattern */}
          <div className="w-full h-full border-4 border-[#E8C97A] rounded-full translate-x-1/2 translate-y-1/3" />
        </div>
        <div className="relative z-10 space-y-2 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {profile?.fullName}!
          </h1>
          <p className="text-sm md:text-base text-white/80">
            Track your contestant progress, upload media gallery folders, manage your registration information, and view scheduled Miss Somali events.
          </p>
        </div>
      </div>

      {/* Main Grid: Application Status & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application Status Card */}
        <div className="lg:col-span-1 bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#071E4A]/60">Application State</span>
              <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-[#071E4A]">Miss Somali 2026 Application</h3>
            <p className="text-sm text-[#071E4A]/70 leading-relaxed">
              {statusInfo.desc}
            </p>
          </div>

          <div className="mt-8">
            {!appData ? (
              <Link
                href="/portal/application"
                className="w-full flex items-center justify-center py-3 px-4 rounded-full text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors shadow-sm"
              >
                Start Application <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : !appData.isSubmitted ? (
              <Link
                href="/portal/application"
                className="w-full flex items-center justify-center py-3 px-4 rounded-full text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors shadow-sm"
              >
                Continue Application Draft <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/portal/status"
                className="w-full flex items-center justify-center py-3 px-4 border border-[#0B2D6B]/20 rounded-full text-sm font-bold text-[#0B2D6B] hover:bg-gray-50 transition-colors"
              >
                View Submission Details
              </Link>
            )}
          </div>
        </div>

        {/* Progress Timeline Card */}
        <div className="lg:col-span-2 bg-white border border-[#E8E8E8] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#071E4A]">Your Selection Timeline</h3>
            <p className="text-sm text-[#071E4A]/60">
              The selection procedure moves through these steps. Wait for updates from our review board.
            </p>
          </div>

          {/* Timeline Graphic */}
          <div className="mt-8 relative">
            {/* Desktop Timeline */}
            <div className="hidden sm:block absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#E8E8E8] z-0 rounded-full" />
            <div className="hidden sm:flex justify-between items-center relative z-10">
              {timelineSteps.map((step, idx) => {
                const CircleIcon = step.completed ? CheckCircle2 : step.current ? Clock : ClipboardList;
                return (
                  <div key={idx} className="flex flex-col items-center text-center max-w-[120px]">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        step.completed
                          ? "bg-[#0B2D6B] border-[#0B2D6B] text-white"
                          : step.current
                          ? "bg-amber-50 border-[#E8C97A] text-[#E8C97A]"
                          : "bg-white border-[#E8E8E8] text-[#071E4A]/30"
                      }`}
                    >
                      <CircleIcon className="h-5 w-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-bold ${
                        step.completed ? "text-[#071E4A]" : step.current ? "text-[#E8C97A]" : "text-[#071E4A]/40"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Timeline */}
            <div className="sm:hidden flex flex-col space-y-4">
              {timelineSteps.map((step, idx) => {
                const CircleIcon = step.completed ? CheckCircle2 : step.current ? Clock : ClipboardList;
                return (
                  <div key={idx} className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                        step.completed
                          ? "bg-[#0B2D6B] border-[#0B2D6B] text-white"
                          : step.current
                          ? "bg-amber-50 border-[#E8C97A] text-[#E8C97A]"
                          : "bg-white border-[#E8E8E8] text-[#071E4A]/30"
                      }`}
                    >
                      <CircleIcon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        step.completed ? "text-[#071E4A]" : step.current ? "text-[#E8C97A]" : "text-[#071E4A]/40"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#071E4A]">Quick Dashboard Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/portal/application"
            className="group block bg-white hover:bg-gray-50 border border-[#E8E8E8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-lg bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#071E4A] mb-1">Contestant Application</h4>
            <p className="text-xs text-[#071E4A]/60">Complete your contestant wizard data files and submit details.</p>
          </Link>

          <Link
            href="/portal/media"
            className="group block bg-white hover:bg-gray-50 border border-[#E8E8E8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-lg bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#071E4A] mb-1">Media Management</h4>
            <p className="text-xs text-[#071E4A]/60">Upload official portraits, full-body images, and public video gallery clips.</p>
          </Link>

          <Link
            href="/portal/notifications"
            className="group block bg-white hover:bg-gray-50 border border-[#E8E8E8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-lg bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4">
              <Bell className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#071E4A] mb-1">Notification Inbox</h4>
            <p className="text-xs text-[#071E4A]/60">Read direct feedback, schedule announcements, and admin alerts.</p>
          </Link>

          <Link
            href="/portal/events"
            className="group block bg-white hover:bg-gray-50 border border-[#E8E8E8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="h-10 w-10 rounded-lg bg-[#0B2D6B]/5 text-[#0B2D6B] flex items-center justify-center group-hover:bg-[#0B2D6B] group-hover:text-white transition-all duration-200 mb-4">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-[#071E4A] mb-1">Pageant Calendar</h4>
            <p className="text-xs text-[#071E4A]/60">Track upcoming interviews, selection rounds, and live countdown timers.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

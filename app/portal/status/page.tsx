"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  UserCheck,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  Loader2
} from "lucide-react";

interface ApplicationStatusData {
  id: string;
  isSubmitted: boolean;
  status: "pending" | "shortlisted" | "approved" | "rejected";
  updatedAt: string;
  appliedAt: string;
}

export default function StatusPage() {
  const [appData, setAppData] = useState<ApplicationStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/portal/application");
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) {
            setAppData(data);
          }
        }
      } catch (err) {
        console.error("Error loading application status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    );
  }

  // Not started state
  if (!appData) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 animate-fadeIn">
        <div className="h-16 w-16 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#071E4A] mb-2">No Application Found</h2>
        <p className="text-sm text-[#071E4A]/60 mb-6 leading-relaxed">
          You haven&apos;t initiated your pageant application. Start compiling your attributes and photos in our step wizard.
        </p>
        <Link
          href="/portal/application"
          className="inline-flex items-center py-3 px-6 rounded-full text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors shadow-sm"
        >
          Start Application Wizard <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Draft state (Not submitted yet)
  if (!appData.isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 animate-fadeIn">
        <div className="h-16 w-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-500 mb-4">
          <Clock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#071E4A] mb-2">Application Draft Active</h2>
        <p className="text-sm text-[#071E4A]/60 mb-6 leading-relaxed">
          Your questionnaire is currently in draft format and has not been submitted for evaluation yet. Complete all steps to locked-submit.
        </p>
        <Link
          href="/portal/application"
          className="inline-flex items-center py-3 px-6 rounded-full text-sm font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors shadow-sm"
        >
          Continue Application Draft <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Submitted states
  const getStatusDisplay = () => {
    switch (appData.status) {
      case "pending":
        return {
          title: "Under Administrative Review",
          description: "Your questionnaire is locked and currently being evaluated by our cultural review board.",
          step: 2,
          color: "border-blue-200 bg-blue-50/50 text-blue-700",
          remarks: "We have received your forms and media portfolio. Reviewing typically takes 3-5 business days. Please keep an eye on your Inbox for feedback."
        };
      case "shortlisted":
        return {
          title: "Shortlisted for Preliminary Round",
          description: "Congratulations! You have been chosen for the Miss Somali preliminary selection interviews.",
          step: 3,
          color: "border-purple-200 bg-purple-50/50 text-purple-700",
          remarks: "Your submissions have met the guidelines. A coordinator will email you instructions for your virtual interview schedule shortly."
        };
      case "approved":
        return {
          title: "Official Pageant Finalist",
          description: "Outstanding! You are approved as an official candidate for the Miss Somali 2026 Finals.",
          step: 4,
          color: "border-green-200 bg-green-50/50 text-green-700",
          remarks: "Welcome to the pageant candidate roster! Check the Events Calendar to see the schedule for the orientation and preparation sessions."
        };
      case "rejected":
        return {
          title: "Application Not Selected",
          description: "We regret to inform you that your application was not chosen for the 2026 pageant selection.",
          step: 4,
          color: "border-red-200 bg-red-50/50 text-red-700",
          remarks: "Thank you for your application and interest. While you were not chosen for this edition, we invite you to participate in upcoming regional events and advocate for cultural integration in other channels."
        };
    }
  };

  const statusView = getStatusDisplay();

  const pipeline = [
    { label: "Submitted & Locked", desc: "Questionnaire forms successfully finalized.", stepNum: 1, done: true },
    { label: "Administrative Review", desc: "Verifying contestant attributes & profile photos.", stepNum: 2, done: statusView.step >= 2 },
    { label: "Shortlisted Candidate", desc: "Preliminary interview round evaluation.", stepNum: 3, done: statusView.step >= 3 && appData.status !== "rejected" },
    { label: "Official Finalist", desc: "Final selection roster confirmation.", stepNum: 4, done: statusView.step === 4 && appData.status === "approved" }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Selection Status</h1>
        <p className="text-sm text-[#071E4A]/60">Track your candidacy in real-time as we evaluate candidate files.</p>
      </div>

      {/* Main Status Panel */}
      <div className={`border rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-6 ${statusView.color}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#071E4A]">{statusView.title}</h2>
            <p className="text-sm text-[#071E4A]/75 mt-1 leading-relaxed">{statusView.description}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Last Updated: {new Date(appData.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Admin Feedback Box */}
        <div className="bg-white/70 border border-white/80 rounded-xl p-4 flex items-start space-x-3 text-[#071E4A]/90">
          <MessageSquare className="h-5 w-5 text-[#0B2D6B] mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-[#0B2D6B]">Administrative Feedback Remarks:</span>
            <p className="text-xs sm:text-sm mt-1 leading-relaxed">{statusView.remarks}</p>
          </div>
        </div>
      </div>

      {/* Evaluation Pipeline Tracker */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold text-[#071E4A] mb-6">Evaluation Pipeline</h3>
        
        <div className="space-y-6 relative">
          {/* Vertical connection line */}
          <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-[#E8E8E8]" />

          {pipeline.map((item) => {
            const isFailed = appData.status === "rejected" && item.stepNum >= 3;
            let icon = <Clock className="h-5 w-5 text-gray-300" />;
            let colorClass = "bg-white border-gray-200 text-gray-300";

            if (item.done) {
              icon = <UserCheck className="h-5 w-5 text-[#0B2D6B]" />;
              colorClass = "bg-blue-50 border-[#0B2D6B] text-[#0B2D6B]";
            } else if (isFailed) {
              icon = <AlertCircle className="h-5 w-5 text-red-500" />;
              colorClass = "bg-red-50 border-red-500 text-red-500";
            }

            return (
              <div key={item.stepNum} className="flex items-start space-x-4 relative z-10">
                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${colorClass}`}>
                  {icon}
                </div>
                <div className="self-center">
                  <h4 className={`text-sm font-bold ${item.done ? "text-[#071E4A]" : isFailed ? "text-red-500" : "text-[#071E4A]/40"}`}>
                    {item.label}
                  </h4>
                  <p className="text-xs text-[#071E4A]/60 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

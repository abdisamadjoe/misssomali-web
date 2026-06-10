"use client";

import { useEffect, useState } from "react";
import { Loader2, Clock, CheckCircle2, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

type ApplicationData = {
  id?: string;
  isSubmitted: boolean;
  status: string;
  updatedAt?: string;
};

export default function StatusPage() {
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/application");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Error loading application status:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const status = data?.status || "draft";
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt) : null;

  // Timeline states mapping
  const timelineStates = [
    { key: "draft", label: "Draft Created", desc: "Application file created and auto-saved as a draft." },
    { key: "submitted", label: "Application Submitted", desc: "Successfully locked and submitted for official vetting." },
    { key: "under_review", label: "Vetting & Under Review", desc: "The selection panel is checking credentials and platforms." },
    { key: "shortlisted", label: "Candidate Shortlisted", desc: "Selected for the preliminary virtual interview round." },
    { key: "decision", label: "Final Selection Decision", desc: "Crowning cohort delegate selection complete." },
  ];

  // Determine active states indices
  const getStatusIndex = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "draft":
        return 0;
      case "submitted":
      case "pending":
        return 1;
      case "under_review":
        return 2;
      case "shortlisted":
        return 3;
      case "approved":
      case "rejected":
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  // Status feedback guidelines
  const getStatusFeedback = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "draft":
        return {
          title: "Setup Pending",
          type: "info",
          text: "Your application is still in draft mode. Complete all segments and upload your photos under the 'Application' tab to lock your files and submit them for committee review.",
        };
      case "submitted":
      case "pending":
        return {
          title: "Successfully Received",
          type: "success",
          text: "We have received your application documents. Vetting checks have been queued. Once our team begins verification, your status will update to 'Under Review'. No action is required from you at this stage.",
        };
      case "under_review":
        return {
          title: "Vetting In Progress",
          type: "review",
          text: "Vetting checks are currently in progress. The selection committee is evaluating your background, educational fields, and motivation statement. Check back soon for schedule updates.",
        };
      case "shortlisted":
        return {
          title: "Interview Shortlist",
          type: "shortlist",
          text: "Congratulations! You have been shortlisted. Our delegate relations manager will contact you at your registered phone number/email to schedule your video screening interview. Please keep your portfolio handy.",
        };
      case "approved":
        return {
          title: "Registration Approved",
          type: "approved",
          text: "Welcome to the Miss Somali 2026 Pageant cohort! Your application has been approved. You are officially designated as a delegate representing your community. Further details regarding bootcamps and materials will follow shortly.",
        };
      case "rejected":
        return {
          title: "Review Complete",
          type: "rejected",
          text: "Thank you for applying to Miss Somali 2026. After thorough review of all profiles, we regret to inform you that you have not been selected for this cycle. We thank you for sharing your story and encourage you to apply for future pageants.",
        };
      default:
        return {
          title: "Vetting Queue",
          type: "info",
          text: "Application files are active and waiting to process.",
        };
    }
  };

  const feedback = getStatusFeedback(status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Application Status</h1>
          <p className="text-body-sm text-dark-5">
            Real-time visual tracking of your Miss Somali registration lifecycle.
          </p>
        </div>
        <button
          onClick={loadStatus}
          className="flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-xs font-bold hover:shadow-1 dark:border-dark-3 dark:bg-gray-dark text-dark dark:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Timeline column */}
        <div className="col-span-12 md:col-span-7 rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
          <h2 className="text-base font-bold text-dark dark:text-white mb-6">Vetting Timeline</h2>

          <div className="relative pl-6 border-l-2 border-stroke dark:border-dark-3 space-y-8 ml-3">
            {timelineStates.map((tStep, idx) => {
              const isPassed = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isLast = idx === timelineStates.length - 1;

              // Handle approved/rejected details on final decision node
              let nodeLabel = tStep.label;
              let nodeDesc = tStep.desc;
              if (isLast && status === "approved") {
                nodeLabel = "Application Approved";
                nodeDesc = "Official cohort delegate invitation extended.";
              } else if (isLast && status === "rejected") {
                nodeLabel = "Review Complete";
                nodeDesc = "Folder closed for this pageacy cycle.";
              }

              return (
                <div key={tStep.key} className="relative">
                  {/* Circle Indicator */}
                  <span className={`absolute -left-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                    isPassed 
                      ? "bg-green border-green text-white" 
                      : isCurrent 
                        ? "bg-primary border-primary text-white ring-4 ring-primary/10 animate-pulse" 
                        : "bg-white border-stroke text-dark-5 dark:bg-gray-dark dark:border-dark-3"
                  }`}>
                    {isPassed ? "✓" : idx + 1}
                  </span>

                  <div>
                    <h3 className={`text-sm font-bold ${
                      isCurrent 
                        ? "text-primary" 
                        : isPassed 
                          ? "text-dark dark:text-white" 
                          : "text-dark-5"
                    }`}>
                      {nodeLabel}
                    </h3>
                    <p className="text-xs text-dark-5 mt-1 leading-relaxed">{nodeDesc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel for messages/feedback */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex items-center gap-3 border-b border-stroke pb-4 mb-4 dark:border-dark-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-dark dark:text-white">Review Feedback</h3>
            </div>

            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
              feedback.type === "success" || feedback.type === "approved"
                ? "bg-green/5 border-green/15 text-green"
                : feedback.type === "rejected"
                  ? "bg-red/5 border-red/15 text-red"
                  : feedback.type === "review" || feedback.type === "shortlist"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/5 dark:border-yellow-800/20 dark:text-yellow-400"
                    : "bg-gray-2 border-stroke text-dark-5 dark:bg-dark-2 dark:border-dark-3"
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                {feedback.type === "rejected" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {feedback.title}
              </div>
              <p className="text-body-sm font-medium">{feedback.text}</p>
            </div>

            {updatedAt && (
              <p className="text-[10px] text-dark-5 text-right mt-4 font-semibold">
                Status updated: {`${updatedAt.getFullYear()}-${String(updatedAt.getMonth() + 1).padStart(2, '0')}-${String(updatedAt.getDate()).padStart(2, '0')} ${String(updatedAt.getHours()).padStart(2, '0')}:${String(updatedAt.getMinutes()).padStart(2, '0')}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

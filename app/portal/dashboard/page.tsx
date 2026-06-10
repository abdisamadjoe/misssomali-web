"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Circle, FileText, UserCheck, Eye, Trophy } from "lucide-react";

type ApplicationData = {
  id?: string;
  isSubmitted: boolean;
  status: string;
  updatedAt?: string;
  photos?: any[];
  formData?: {
    personalInfo?: any;
    backgroundInfo?: any;
    motivation?: string;
    achievements?: any;
  } | null;
};

export default function PortalDashboard() {
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplication() {
      try {
        const res = await fetch("/api/portal/application");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Error loading application on dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadApplication();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate completion percentage and steps status
  const status = data?.status || "draft";
  const isSubmitted = status !== "draft";
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt) : null;

  const hasPersonalInfo = !!(data?.formData?.personalInfo?.fullName && data?.formData?.personalInfo?.phone);
  const hasBackground = !!(data?.formData?.backgroundInfo?.educationLevel && data?.formData?.backgroundInfo?.occupation);
  const hasMotivation = !!(data?.formData?.motivation);
  const hasPhotos = !!(data?.photos && data.photos.length > 0);
  const hasSubmitted = isSubmitted;

  const steps = [
    { name: "Personal Information", completed: hasPersonalInfo },
    { name: "Background & Education", completed: hasBackground },
    { name: "Motivation Statement", completed: hasMotivation },
    { name: "Required Photos Upload", completed: hasPhotos },
    { name: "Review & Submit", completed: hasSubmitted },
  ];

  const completedStepsCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedStepsCount / steps.length) * 100);

  // Status visual configurations
  const getStatusConfig = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "draft":
        return {
          label: "Draft",
          color: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-300 dark:border-neutral-800",
          message: "Almost done, complete your submission.",
        };
      case "submitted":
        return {
          label: "Submitted",
          color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
          message: "Your application is successfully submitted and queued for review.",
        };
      case "pending":
        return {
          label: "Pending",
          color: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-300 dark:border-neutral-800",
          message: "Your application is pending review.",
        };
      case "under_review":
        return {
          label: "Under Review",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
          message: "Our committee is currently reviewing your credentials.",
        };
      case "shortlisted":
        return {
          label: "Shortlisted",
          color: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
          message: "Congratulations! You have been shortlisted for the next round.",
        };
      case "approved":
        return {
          label: "Approved",
          color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
          message: "Congratulations! Your registration has been approved.",
        };
      case "rejected":
        return {
          label: "Not Selected",
          color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
          message: "Thank you for applying. We are unable to accept your application at this time.",
        };
      default:
        return {
          label: statusStr,
          color: "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-300 dark:border-neutral-800",
          message: "Application status check.",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark dark:text-white">Dashboard</h1>
        <p className="text-body-sm text-dark-5">
          Welcome back! Track your Miss Somali 2026 application status.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main overview status card */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stroke pb-5 dark:border-dark-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-dark-5">
                  Current Application Status
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-xl font-bold text-dark dark:text-white">Miss Somali 2026</h2>
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              {updatedAt && (
                <div className="text-left sm:text-right">
                  <span className="block text-xs text-dark-5">Last Updated</span>
                  <span className="text-sm font-semibold text-dark dark:text-white">
                    {updatedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>

            <div className="py-6">
              <p className="text-body-sm font-medium text-dark dark:text-white mb-6">
                {statusConfig.message}
              </p>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-dark dark:text-white">
                  <span>Application Progress</span>
                  <span>{progressPercent}% Complete</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-stroke dark:bg-dark-3">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracker Steps Card */}
          <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="text-base font-bold text-dark dark:text-white mb-5">
              Submission Checklist
            </h3>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-stroke pb-3 last:border-0 last:pb-0 dark:border-dark-3">
                  <div className="flex items-center gap-3">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green" />
                    ) : (
                      <Circle className="h-5 w-5 text-stroke dark:text-dark-3" />
                    )}
                    <span className={`text-sm font-medium ${step.completed ? "text-dark dark:text-white" : "text-dark-5"}`}>
                      {step.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold uppercase">
                    {step.completed ? (
                      <span className="text-green">Complete</span>
                    ) : (
                      <span className="text-dark-5">Pending</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark text-center">
            <h3 className="text-base font-bold text-dark dark:text-white mb-2">
              Action Center
            </h3>
            <p className="text-xs text-dark-5 mb-6">
              {isSubmitted 
                ? "Your application is locked and under review. Editing is disabled." 
                : "Complete all form sections to submit your registration files."}
            </p>

            {isSubmitted ? (
              <div className="space-y-3">
                <Link
                  href="/portal/status"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary py-3 text-sm font-bold transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Timeline Status
                </Link>
                <div className="rounded-lg bg-gray-2 p-3 text-xs text-dark-5 text-center dark:bg-dark-2 font-semibold">
                  🔒 Application Submitted (Locked)
                </div>
              </div>
            ) : (
              <Link
                href="/portal/application"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 text-white py-3 text-sm font-bold transition-all shadow-md"
              >
                <FileText className="h-4 w-4" />
                {data === null ? "Start Application" : "Continue Application"}
              </Link>
            )}
          </div>

          <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
            <h3 className="text-base font-bold text-dark dark:text-white mb-4">
              Miss Somali Guidelines
            </h3>
            <ul className="space-y-3 text-xs text-dark-5">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                Ensure all background data aligns with your passport identity profile.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                A full-body photo and close-up profile portrait photo are required.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                Your motivation statement should reflect your community ambitions.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

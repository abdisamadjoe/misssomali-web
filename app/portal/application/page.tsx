"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "../layout";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Lock,
  Upload,
  AlertCircle,
  FileCheck,
  Loader2,
  Trash2
} from "lucide-react";

interface FormState {
  fullName: string;
  dateOfBirth: string;
  city: string;
  country: string;
  phone: string;
  educationLevel: string;
  occupation: string;
  skills: string;
  languages: string;
  height: string;
  bio: string;
  motivationWhy: string;
  personalStory: string;
  goals: string;
  photos: { id: string; url: string; type: string }[];
}

export default function ApplicationWizard() {
  const router = useRouter();
  const { profile } = usePortal();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    dateOfBirth: "",
    city: "",
    country: "Somalia",
    phone: "",
    educationLevel: "",
    occupation: "",
    skills: "",
    languages: "",
    height: "",
    bio: "",
    motivationWhy: "",
    personalStory: "",
    goals: "",
    photos: []
  });

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await fetch("/api/portal/application");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setIsSubmitted(data.isSubmitted);
            
            // Map saved DB data & schema structures to wizard fields
            const personal = data.formData?.personalInfo || {};
            const background = data.formData?.backgroundInfo || {};
            const achievements = data.formData?.achievements || {};
            
            setFormData({
              fullName: personal.fullName || profile?.fullName || "",
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : "",
              city: data.city || personal.city || "",
              country: data.country || personal.country || "Somalia",
              phone: personal.phone || "",
              educationLevel: data.educationLevel || background.educationLevel || "",
              occupation: data.occupation || background.occupation || "",
              skills: background.skills || "",
              languages: background.languages || "",
              height: data.height ? String(data.height) : "",
              bio: data.bio || "",
              motivationWhy: data.formData?.motivation || "",
              personalStory: achievements.personalStory || "",
              goals: achievements.goals || "",
              photos: data.photos || []
            });
          }
        }
      } catch (err) {
        console.error("Error loading application draft:", err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchApplication();
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/portal/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isSubmitted: false })
      });
      if (res.ok) {
        setSuccessMessage("Draft application saved successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to save draft.");
      }
    } catch {
      setErrorMessage("Network error saving draft application.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/portal/application", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsSubmitted(true);
        setActiveStep(6);
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || "Failed to submit application.");
      }
    } catch {
      setErrorMessage("Network error submitting application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mock Photo Upload for Step 4
  const handlePhotoMockUpload = (type: string) => {
    const randomId = Math.random().toString(36).substring(7);
    const mockUrls: Record<string, string> = {
      profile: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
      full_body: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=350",
      gallery: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
    };

    setFormData((prev) => {
      // Avoid duplicate profile/full_body types, just replace or append
      const filtered = prev.photos.filter((p) => !(p.type === type && type !== "gallery"));
      return {
        ...prev,
        photos: [...filtered, { id: randomId, url: mockUrls[type], type }]
      };
    });
  };

  const handleDeletePhoto = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id)
    }));
  };

  const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    );
  }

  // If application is already submitted and locked, redirect to status or show locked wizard
  if (isSubmitted && activeStep < 6) {
    return (
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-8 max-w-2xl mx-auto text-center shadow-md animate-fadeIn">
        <Lock className="h-16 w-16 text-[#0B2D6B] mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-[#071E4A] mb-2">Application Already Submitted</h2>
        <p className="text-sm text-[#071E4A]/70 mb-6 leading-relaxed">
          Your contestant application for Miss Somali 2026 has been locked down and is currently under review by our administrative board. You cannot make any further modifications.
        </p>
        <button
          onClick={() => router.push("/portal/status")}
          className="py-3 px-6 rounded-full font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors"
        >
          Track Review Pipeline
        </button>
      </div>
    );
  }

  const stepsList = [
    { num: 1, name: "Personal Info" },
    { num: 2, name: "Background" },
    { num: 3, name: "Motivation" },
    { num: 4, name: "Photos" },
    { num: 5, name: "Review" },
    { num: 6, name: "Complete" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E8E8] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071E4A]">Miss Somali Application Wizard</h1>
          <p className="text-xs sm:text-sm text-[#071E4A]/60">Fill in the questionnaire details. Progress is auto-savable.</p>
        </div>
        {activeStep < 6 && (
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center px-4 py-2 text-xs font-bold border border-[#0B2D6B]/20 rounded-full text-[#0B2D6B] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </button>
          </div>
        )}
      </div>

      {/* Wizard Step Tracker */}
      <div className="bg-white border border-[#E8E8E8] rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#E8E8E8] z-0" />
          {stepsList.map((step) => (
            <button
              key={step.num}
              disabled={activeStep === 6}
              onClick={() => setActiveStep(step.num)}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-200 ${
                  activeStep === step.num
                    ? "bg-[#0B2D6B] border-[#0B2D6B] text-white"
                    : activeStep > step.num
                    ? "bg-[#E8C97A] border-[#E8C97A] text-[#071E4A]"
                    : "bg-white border-[#E8E8E8] text-[#071E4A]/40"
                }`}
              >
                {activeStep > step.num ? <Check className="h-4 w-4" /> : step.num}
              </div>
              <span className="hidden md:block mt-1 text-[10px] font-extrabold uppercase tracking-wider text-[#071E4A]/55">
                {step.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <p className="text-sm font-semibold text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Wizard Steps Form Panel */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* Step 1: Personal Info */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-2">Step 1: Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="Official Contestant Name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Country of Residence</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="e.g. Somalia"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">City / Location</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="e.g. Mogadishu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="+252..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Background & Attributes */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-2">Step 2: Educational & Background Attributes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Highest Education Level</label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                >
                  <option value="">Select Level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Current Occupation / Major</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="e.g. Student, Graphic Designer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="e.g. 172"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Languages Spoken</label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="e.g. Somali, English, Arabic"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Skills & Hobbies</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="e.g. Public speaking, poetry, singing"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Motivation */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-2">Step 3: Intent & Motivation</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Brief Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="Write a brief professional background bio..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Why do you want to represent Miss Somali Pageant?</label>
                <textarea
                  name="motivationWhy"
                  rows={4}
                  value={formData.motivationWhy}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="Explain why you wish to enter this cultural advocacy pageant..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">Share a personal story of achievement</label>
                <textarea
                  name="personalStory"
                  rows={3}
                  value={formData.personalStory}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="Share a milestone or obstacle you successfully overcame..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071E4A]">What are your future career/social goals?</label>
                <textarea
                  name="goals"
                  rows={3}
                  value={formData.goals}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm text-[#071E4A]"
                  placeholder="Where do you see yourself in the next 5 years?"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photo Selection */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-2">Step 4: Cloudflare R2 Mock Photo Uploads</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Photo */}
              <div className="border border-[#E8E8E8] rounded-xl p-4 flex flex-col items-center justify-between text-center bg-gray-50/50">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E4A]/60">Type: Profile (Portrait)</span>
                  <div className="h-32 w-32 bg-white rounded-lg border border-[#E8E8E8] flex items-center justify-center overflow-hidden relative mx-auto">
                    {formData.photos.find((p) => p.type === "profile") ? (
                      <img
                        src={formData.photos.find((p) => p.type === "profile")?.url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-[#071E4A]/20" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePhotoMockUpload("profile")}
                  className="mt-4 flex items-center px-4 py-2 text-xs font-semibold rounded-full bg-[#0B2D6B] text-white hover:bg-[#071E4A] transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 mr-2" /> Upload Portrait
                </button>
              </div>

              {/* Full Body Photo */}
              <div className="border border-[#E8E8E8] rounded-xl p-4 flex flex-col items-center justify-between text-center bg-gray-50/50">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E4A]/60">Type: Full Body</span>
                  <div className="h-32 w-32 bg-white rounded-lg border border-[#E8E8E8] flex items-center justify-center overflow-hidden relative mx-auto">
                    {formData.photos.find((p) => p.type === "full_body") ? (
                      <img
                        src={formData.photos.find((p) => p.type === "full_body")?.url}
                        alt="Full Body"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-[#071E4A]/20" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePhotoMockUpload("full_body")}
                  className="mt-4 flex items-center px-4 py-2 text-xs font-semibold rounded-full bg-[#0B2D6B] text-white hover:bg-[#071E4A] transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 mr-2" /> Upload Full Body
                </button>
              </div>

              {/* Gallery Addition */}
              <div className="border border-[#E8E8E8] rounded-xl p-4 flex flex-col items-center justify-between text-center bg-gray-50/50">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#071E4A]/60">Type: Gallery Photos</span>
                  <div className="h-32 w-32 bg-white rounded-lg border border-[#E8E8E8] flex items-center justify-center overflow-hidden relative mx-auto">
                    <Upload className="h-8 w-8 text-[#071E4A]/20" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handlePhotoMockUpload("gallery")}
                  className="mt-4 flex items-center px-4 py-2 text-xs font-semibold rounded-full bg-[#0B2D6B] text-white hover:bg-[#071E4A] transition-colors"
                >
                  <Upload className="h-3.5 w-3.5 mr-2" /> Append Gallery Pic
                </button>
              </div>
            </div>

            {/* List of uploaded photos */}
            {formData.photos.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-bold text-[#071E4A] mb-3">All Active Photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.photos.map((photo) => (
                    <div key={photo.id} className="relative group border border-[#E8E8E8] rounded-lg overflow-hidden h-28">
                      <img src={photo.url} className="h-full w-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded">
                          {photo.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Validate Details */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#071E4A] border-b border-[#E8E8E8] pb-2">Step 5: Review & Submit Details</h3>
            
            <div className="space-y-6 divide-y divide-[#E8E8E8]">
              {/* Section 1 */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-[#0B2D6B]">Personal details</h4>
                  <button onClick={() => setActiveStep(1)} className="text-xs font-semibold text-[#0B2D6B] hover:underline">Edit</button>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Full Name</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.fullName || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Date of Birth</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.dateOfBirth || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Phone</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Residence</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.city}, {formData.country}</dd>
                  </div>
                </dl>
              </div>

              {/* Section 2 */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-[#0B2D6B]">Background & Attributes</h4>
                  <button onClick={() => setActiveStep(2)} className="text-xs font-semibold text-[#0B2D6B] hover:underline">Edit</button>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Education Level</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.educationLevel || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Occupation / Major</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.occupation || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Height</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.height ? `${formData.height} cm` : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 font-medium">Languages</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.languages || "—"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-gray-500 font-medium">Skills</dt>
                    <dd className="font-semibold text-[#071E4A]">{formData.skills || "—"}</dd>
                  </div>
                </dl>
              </div>

              {/* Section 3 */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-[#0B2D6B]">Motivation Essay Responses</h4>
                  <button onClick={() => setActiveStep(3)} className="text-xs font-semibold text-[#0B2D6B] hover:underline">Edit</button>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block font-medium">Brief Bio</span>
                    <p className="font-medium text-[#071E4A] leading-relaxed whitespace-pre-wrap">{formData.bio || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block font-medium">Why Miss Somali Pageant?</span>
                    <p className="font-medium text-[#071E4A] leading-relaxed whitespace-pre-wrap">{formData.motivationWhy || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-[#0B2D6B]">Uploaded Contestant Images</h4>
                  <button onClick={() => setActiveStep(4)} className="text-xs font-semibold text-[#0B2D6B] hover:underline">Edit</button>
                </div>
                <div className="flex gap-4">
                  {formData.photos.map((p) => (
                    <div key={p.id} className="h-16 w-16 border rounded overflow-hidden">
                      <img src={p.url} className="h-full w-full object-cover" alt="" />
                    </div>
                  ))}
                  {formData.photos.length === 0 && <span className="text-sm text-gray-400">No photos uploaded yet.</span>}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8E8E8] pt-6 text-center bg-amber-50/50 rounded-xl p-4 border">
              <h4 className="text-sm font-bold text-[#071E4A] mb-1">Declaration Statement</h4>
              <p className="text-xs text-[#071E4A]/70 mb-4 max-w-xl mx-auto leading-relaxed">
                By clicking &quot;Submit Final Application&quot;, you declare that all provided attributes, personal details, photos, and essay answers are authentic and accurate. Your form will be locked down and edits disabled.
              </p>
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="py-3 px-6 rounded-full font-bold text-[#071E4A] bg-[#E8C97A] hover:bg-[#F0D898] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileCheck className="h-5 w-5 mr-2" />}
                Submit Final Application
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation Screen */}
        {activeStep === 6 && (
          <div className="text-center py-10 space-y-6">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
              <Check className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#071E4A]">Application Submitted Successfully!</h2>
            <p className="text-sm text-[#071E4A]/70 max-w-lg mx-auto leading-relaxed">
              Congratulations! Your contestant entry has been successfully submitted and locked. The Miss Somali Review Board has been notified. You can track your status in the Selection Pipeline menu.
            </p>
            <button
              onClick={() => router.push("/portal/status")}
              className="py-3 px-6 rounded-full font-bold text-white bg-[#0B2D6B] hover:bg-[#071E4A] transition-colors"
            >
              Go to Selection Status
            </button>
          </div>
        )}

        {/* Wizard Footer Nav Buttons */}
        {activeStep < 6 && (
          <div className="mt-8 pt-6 border-t border-[#E8E8E8] flex justify-between">
            <button
              onClick={prevStep}
              disabled={activeStep === 1}
              className="flex items-center px-4 py-2 border border-[#E8E8E8] rounded-full text-xs font-bold text-[#071E4A]/75 hover:bg-gray-50 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous Step
            </button>

            {activeStep < 5 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-4 py-2 bg-[#0B2D6B] hover:bg-[#071E4A] rounded-full text-xs font-bold text-white transition-colors"
              >
                Next Step <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-400 self-center">Proceed to final declaration below</span>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

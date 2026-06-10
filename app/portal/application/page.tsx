"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, ArrowRight, Save, Lock, Upload, Image as ImageIcon, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import flatpickr from "flatpickr";

// Form validation schema
const applicationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(5, "Phone number is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  dateOfBirth: z.string().min(10, "Valid date of birth is required").refine((val) => {
    if (!val) return false;
    const dob = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 18;
  }, {
    message: "You must be at least 18 years old to apply",
  }),
  educationLevel: z.string().min(2, "Education level is required"),
  occupation: z.string().min(2, "Occupation is required"),
  height: z.string().min(1, "Height is required"),
  skills: z.string().optional(),
  languages: z.string().optional(),
  motivationWhy: z.string().min(20, "Motivation statement must be at least 20 characters"),
  personalStory: z.string().optional(),
  goals: z.string().optional(),
  bio: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function ApplicationPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [profileUploadProgress, setProfileUploadProgress] = useState<number | null>(null);
  const [fullBodyUploadProgress, setFullBodyUploadProgress] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      city: "",
      country: "Somalia",
      dateOfBirth: "",
      educationLevel: "",
      occupation: "",
      height: "",
      skills: "",
      languages: "",
      motivationWhy: "",
      personalStory: "",
      goals: "",
      bio: "",
    },
  });

  const formValues = watch();

  // Load draft data initially
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch("/api/portal/application");
        if (res.ok) {
          let data = await res.json();

          if (!data) {
            // No draft exists! The user clicked "Start Application" or first-time load.
            // Let's create a new application in DRAFT state.
            const createRes = await fetch("/api/portal/application", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            });
            if (createRes.ok) {
              const createdData = await createRes.json();
              // Load the newly created draft mapping details from a fresh GET query
              const refetchRes = await fetch("/api/portal/application");
              if (refetchRes.ok) {
                data = await refetchRes.json();
              } else {
                data = createdData;
              }
            }
          }

          if (data) {
            setIsSubmitted(data.status !== "draft");
            setPhotos(data.photos || []);

            // Set simple attributes directly from returned database columns
            setValue("fullName", data.fullName || "");
            setValue("phone", data.phone || "");
            setValue("city", data.city || "");
            setValue("country", data.country || "Somalia");
            setValue("dateOfBirth", data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "");
            setValue("educationLevel", data.educationLevel || "");
            setValue("occupation", data.occupation || "");
            setValue("height", data.height ? data.height.toString() : "");
            setValue("skills", data.skills || "");
            setValue("languages", data.languages || "");
            setValue("motivationWhy", data.motivationWhy || "");
            setValue("personalStory", data.personalStory || "");
            setValue("goals", data.goals || "");
            setValue("bio", data.bio || "");
          }
        }
      } catch (err) {
        console.error("Error loading application draft:", err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadDraft();
  }, [setValue]);

  // Debounced draft auto-save
  useEffect(() => {
    if (isSubmitted || initialLoading) return;

    const timer = setTimeout(async () => {
      setAutoSaving(true);
      try {
        await fetch("/api/portal/application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
      } catch (err) {
        console.error("Auto-save draft failed:", err);
      } finally {
        setAutoSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formValues, isSubmitted, initialLoading]);

  // Initialize flatpickr on Date of Birth field
  useEffect(() => {
    if (initialLoading || activeStep !== 0) return;

    // Calculate maximum date allowed (18 years ago today)
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    const fp = flatpickr("#date-of-birth-picker", {
      mode: "single",
      dateFormat: "Y-m-d",
      maxDate: maxDate,
      defaultDate: watch("dateOfBirth") || undefined,
      onChange: (selectedDates, dateStr) => {
        setValue("dateOfBirth", dateStr, { shouldValidate: true, shouldDirty: true });
      },
    });

    return () => {
      if (fp) {
        if (Array.isArray(fp)) {
          fp.forEach((instance) => instance.destroy());
        } else {
          fp.destroy();
        }
      }
    };
  }, [initialLoading, activeStep, setValue, watch]);

  // Photo reader helper
  function readFileAsDataURL(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Reusable upload helper with progress tracking
  function uploadImageWithProgress(
    base64Data: string, 
    onProgress: (pct: number) => void
  ): Promise<{ secure_url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload/image", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errResponse = JSON.parse(xhr.responseText);
            reject(new Error(errResponse.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error"));
      xhr.send(JSON.stringify({ image: base64Data }));
    });
  }

  // Handle image uploads (Base64 saved to Neon/Prisma via media endpoint)
  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>, type: "profile" | "full_body") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("File too large. Max allowed size is 1.5MB");
      return;
    }

    const setProgress = type === "profile" ? setProfileUploadProgress : setFullBodyUploadProgress;
    setProgress(0);

    try {
      const base64 = await readFileAsDataURL(file);
      
      // Step 1: Upload to Cloudinary with progress updates
      const cloudinaryResult = await uploadImageWithProgress(base64, (pct) => {
        setProgress(pct);
      });

      // Step 2: Save metadata to Neon database
      const res = await fetch("/api/portal/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: cloudinaryResult.secure_url, 
          publicId: cloudinaryResult.public_id,
          type 
        }),
      });

      if (res.ok) {
        const photoData = await res.json();
        setPhotos(prev => {
          const filtered = prev.filter(p => p.type !== type);
          return [...filtered, photoData];
        });
      } else {
        alert("Failed to save photo registration details to database.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload photo.");
    } finally {
      setProgress(null);
    }
  }

  // Submit complete application
  async function onSubmitForm(data: ApplicationFormValues) {
    const hasProfilePhoto = photos.some(p => p.type === "profile");
    const hasFullBodyPhoto = photos.some(p => p.type === "full_body");

    if (!hasProfilePhoto || !hasFullBodyPhoto) {
      alert("Please upload both a Profile Close-up Photo and a Full-body Photo before submitting.");
      return;
    }

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit? This locks your application files permanently. You won't be able to edit these fields afterward."
    );
    if (!confirmSubmit) return;

    setSubmitting(true);
    try {
      // Step 1: Save final draft details first
      const saveRes = await fetch("/api/portal/application", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        alert(err.error || "Failed to save final updates before submission.");
        setSubmitting(false);
        return;
      }

      // Step 2: Finalize the lock and change status to SUBMITTED
      const res = await fetch("/api/portal/application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setIsSubmitted(true);
        alert("Application submitted successfully!");
        router.push("/portal/status");
      } else {
        const err = await res.json();
        alert(err.error || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Submission error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const stepsList = [
    "Personal Info",
    "Background & Education",
    "Motivation Statement",
    "Photo Uploads",
    "Review & Submit",
  ];

  if (initialLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Application Form</h1>
          <p className="text-body-sm text-dark-5">
            {isSubmitted 
              ? "Your application is completed and locked for edits." 
              : "Complete the form segments below. Progress is saved automatically."}
          </p>
        </div>
        {!isSubmitted && (
          <div className="flex items-center gap-2 text-xs font-semibold text-dark-5 bg-gray-2 px-3 py-1 rounded-full dark:bg-dark-2">
            {autoSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Auto-saving draft...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 text-green" />
                <span>Draft saved</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stepper Steps Navigation */}
      <div className="flex items-center justify-between border-b border-stroke pb-4 overflow-x-auto dark:border-dark-3 scrollbar-none">
        {stepsList.map((stepName, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-all whitespace-nowrap px-4 ${
              activeStep === idx
                ? "border-primary text-primary"
                : "border-transparent text-dark-5 hover:text-dark dark:hover:text-white"
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs border ${
              activeStep === idx 
                ? "bg-primary text-white border-primary" 
                : "bg-neutral-100 text-dark-5 border-stroke dark:bg-dark-2 dark:border-dark-3"
            }`}>
              {idx + 1}
            </span>
            {stepName}
          </button>
        ))}
      </div>

      {/* Stepper Panels content */}
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <fieldset disabled={isSubmitted} className="space-y-6">
          {/* Step 1: Personal Info */}
          {activeStep === 0 && (
            <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-5">
              <h2 className="text-base font-bold text-dark dark:text-white">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-body-sm font-medium">Full Name</label>
                  <input
                    {...register("fullName")}
                    placeholder="Enter Your Full name"
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  />
                  {errors.fullName && <p className="text-red text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-body-sm font-medium">Phone Number</label>
                  <input
                    {...register("phone")}
                    placeholder="+254..."
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  />
                  {errors.phone && <p className="text-red text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-body-sm font-medium">City</label>
                  <input
                    {...register("city")}
                    placeholder="Nairobi"
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  />
                  {errors.city && <p className="text-red text-xs mt-1">{errors.city.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-body-sm font-medium">Country</label>
                  <select
                    {...register("country")}
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  >
                    <option value="Somalia">Somalia</option>
                    <option value="Kenya">Kenya</option>
                  </select>
                  {errors.country && <p className="text-red text-xs mt-1">{errors.country.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-2 block text-body-sm font-medium">Date of Birth</label>
                  <input
                    id="date-of-birth-picker"
                    type="text"
                    placeholder="Select Date of Birth"
                    {...register("dateOfBirth")}
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  />
                  {errors.dateOfBirth && <p className="text-red text-xs mt-1">{errors.dateOfBirth.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Background Info */}
          {activeStep === 1 && (
            <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-5">
              <h2 className="text-base font-bold text-dark dark:text-white">Education & Career</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-body-sm font-medium">Education Level</label>
                  <select
                    {...register("educationLevel")}
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  >
                    <option value="">Select Education Level</option>
                    <option value="High School Diploma">High School Diploma</option>
                    <option value="Associate Degree">Associate Degree</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.educationLevel && <p className="text-red text-xs mt-1">{errors.educationLevel.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-body-sm font-medium">Current Occupation</label>
                  <select
                    {...register("occupation")}
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  >
                    <option value="">Select Occupation</option>
                    <option value="Student">Student</option>
                    <option value="Designer">Designer</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Model">Model</option>
                    <option value="Artist">Artist</option>
                    <option value="Teacher / Educator">Teacher / Educator</option>
                    <option value="Nurse / Health Professional">Nurse / Health Professional</option>
                    <option value="Software Developer / IT">Software Developer / IT</option>
                    <option value="Marketing Professional">Marketing Professional</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.occupation && <p className="text-red text-xs mt-1">{errors.occupation.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-2 block text-body-sm font-medium">Height (cm)</label>
                  <select
                    {...register("height")}
                    className="h-12 w-full rounded-lg border border-stroke bg-gray-2 px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white"
                  >
                    <option value="">Select Height</option>
                    {Array.from({ length: 51 }, (_, i) => 150 + i).map(h => (
                      <option key={h} value={h}>{h} cm</option>
                    ))}
                  </select>
                  {errors.height && <p className="text-red text-xs mt-1">{errors.height.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-3 block text-body-sm font-semibold text-dark dark:text-white">Languages Spoken (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg border border-stroke bg-gray-2 dark:border-dark-3 dark:bg-dark-2">
                    {["Somali", "English", "Arabic", "Kiswahili", "Italian", "French"].map(lang => {
                      const currentLangs = (watch("languages") || "").split(", ").filter(Boolean);
                      const isChecked = currentLangs.includes(lang);
                      return (
                        <label key={lang} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-dark dark:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let next;
                              if (e.target.checked) {
                                next = [...currentLangs, lang];
                              } else {
                                next = currentLangs.filter(l => l !== lang);
                              }
                              setValue("languages", next.join(", "));
                            }}
                            className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-3 dark:bg-dark-2"
                          />
                          {lang}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="mb-3 block text-body-sm font-semibold text-dark dark:text-white">Special Skills / Talent (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg border border-stroke bg-gray-2 dark:border-dark-3 dark:bg-dark-2">
                    {[
                      "Public Speaking",
                      "Traditional Dancing",
                      "Poetry",
                      "Writing",
                      "Painting",
                      "Singing",
                      "Acting",
                      "Styling",
                      "Community Advocacy"
                    ].map(skill => {
                      const currentSkills = (watch("skills") || "").split(", ").filter(Boolean);
                      const isChecked = currentSkills.includes(skill);
                      return (
                        <label key={skill} className="flex items-center gap-2.5 text-sm font-medium cursor-pointer text-dark dark:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let next;
                              if (e.target.checked) {
                                next = [...currentSkills, skill];
                              } else {
                                next = currentSkills.filter(s => s !== skill);
                              }
                              setValue("skills", next.join(", "));
                            }}
                            className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary dark:border-dark-3 dark:bg-dark-2"
                          />
                          {skill}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Motivation Statement */}
          {activeStep === 2 && (
            <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-5">
              <h2 className="text-base font-bold text-dark dark:text-white">Motivation & Objectives</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-body-sm font-medium">Why do you want to represent Somali women in Miss Somali 2026? *</label>
                  <textarea
                    {...register("motivationWhy")}
                    placeholder="State your clear platform objectives and community campaign vision..."
                    rows={6}
                    className="w-full rounded-lg border border-stroke bg-gray-2 p-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
                  />
                  {errors.motivationWhy && <p className="text-red text-xs mt-1">{errors.motivationWhy.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-body-sm font-medium">Tell us about your personal achievements or history</label>
                  <textarea
                    {...register("personalStory")}
                    placeholder="Share any special challenges you overcame or notable project contributions..."
                    rows={4}
                    className="w-full rounded-lg border border-stroke bg-gray-2 p-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-body-sm font-medium">Short Bio Overview</label>
                  <textarea
                    {...register("bio")}
                    placeholder="A concise applicant profile summary..."
                    rows={3}
                    className="w-full rounded-lg border border-stroke bg-gray-2 p-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photo Uploads */}
          {activeStep === 3 && (
            <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-6">
              <h2 className="text-base font-bold text-dark dark:text-white">Required Media Assets</h2>
              <p className="text-xs text-dark-5">
                Two clear high-quality photographs are required to review qualifications:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Close up upload */}
                <div className="border border-dashed border-stroke p-5 rounded-xl flex flex-col items-center justify-center bg-gray-2 dark:border-dark-3 dark:bg-dark-2">
                  <span className="text-sm font-semibold text-dark dark:text-white mb-3">
                    1. Profile Portrait (Close-up)
                  </span>

                  {photos.some(p => p.type === "profile") ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-stroke dark:border-dark-3 mb-4">
                      <img
                        src={photos.find(p => p.type === "profile").url}
                        alt="Profile Close Up"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-white border border-stroke dark:bg-gray-dark dark:border-dark-3 mb-4 text-dark-5">
                      <ImageIcon className="h-10 w-10 opacity-40" />
                    </div>
                  )}

                  {!isSubmitted && (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <label className={`flex items-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 text-white px-4 py-2 text-xs font-bold transition-all ${profileUploadProgress !== null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        <Upload className="h-3.5 w-3.5" />
                        Upload Portrait
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => handlePhotoUpload(e, "profile")}
                          className="hidden"
                          disabled={profileUploadProgress !== null}
                        />
                      </label>

                      {profileUploadProgress !== null && (
                        <div className="w-full max-w-[200px] mt-2 space-y-1">
                          <Progress value={profileUploadProgress} />
                          <span className="text-[10px] text-dark-5 block text-center font-semibold">
                            Uploading: {profileUploadProgress}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Full body shot upload */}
                <div className="border border-dashed border-stroke p-5 rounded-xl flex flex-col items-center justify-center bg-gray-2 dark:border-dark-3 dark:bg-dark-2">
                  <span className="text-sm font-semibold text-dark dark:text-white mb-3">
                    2. Full-Body Photograph
                  </span>

                  {photos.some(p => p.type === "full_body") ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-stroke dark:border-dark-3 mb-4">
                      <img
                        src={photos.find(p => p.type === "full_body").url}
                        alt="Full Body Shot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-white border border-stroke dark:bg-gray-dark dark:border-dark-3 mb-4 text-dark-5">
                      <ImageIcon className="h-10 w-10 opacity-40" />
                    </div>
                  )}

                  {!isSubmitted && (
                    <div className="flex flex-col items-center gap-3 w-full">
                      <label className={`flex items-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 text-white px-4 py-2 text-xs font-bold transition-all ${fullBodyUploadProgress !== null ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        <Upload className="h-3.5 w-3.5" />
                        Upload Full Body
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={(e) => handlePhotoUpload(e, "full_body")}
                          className="hidden"
                          disabled={fullBodyUploadProgress !== null}
                        />
                      </label>

                      {fullBodyUploadProgress !== null && (
                        <div className="w-full max-w-[200px] mt-2 space-y-1">
                          <Progress value={fullBodyUploadProgress} />
                          <span className="text-[10px] text-dark-5 block text-center font-semibold">
                            Uploading: {fullBodyUploadProgress}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {activeStep === 4 && (
            <div className="rounded-[10px] border border-stroke bg-white p-7 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-6">
              <h2 className="text-base font-bold text-dark dark:text-white">Platform Information Review</h2>
              <div className="rounded-xl bg-gray-2 p-6 dark:bg-dark-2 space-y-5 text-sm">
                <div className="border-b border-stroke pb-3 dark:border-dark-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Full Name</span>
                  <p className="font-semibold text-dark dark:text-white text-base">{formValues.fullName || "—"}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-stroke pb-3 dark:border-dark-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Phone</span>
                    <p className="font-semibold text-dark dark:text-white">{formValues.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Location</span>
                    <p className="font-semibold text-dark dark:text-white">
                      {formValues.city && formValues.country ? `${formValues.city}, ${formValues.country}` : "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-stroke pb-3 dark:border-dark-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Education</span>
                    <p className="font-semibold text-dark dark:text-white">{formValues.educationLevel || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Occupation</span>
                    <p className="font-semibold text-dark dark:text-white">{formValues.occupation || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Height</span>
                    <p className="font-semibold text-dark dark:text-white">{formValues.height ? `${formValues.height} cm` : "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-stroke pb-3 dark:border-dark-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Languages Spoken</span>
                    <p className="font-semibold text-dark dark:text-white">{formValues.languages || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Special Skills / Talent</span>
                    <p className="font-semibold text-dark dark:text-white">{formValues.skills || "—"}</p>
                  </div>
                </div>

                <div className="border-b border-stroke pb-3 dark:border-dark-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-1">Motivation Statement</span>
                  <p className="font-medium text-dark/90 dark:text-white/90 leading-relaxed">
                    {formValues.motivationWhy || "—"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-dark-5 block mb-2">Photos Uploaded</span>
                  <div className="flex flex-wrap gap-4">
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${
                      photos.some(p => p.type === "profile") 
                        ? "bg-green/10 text-green border-green/20" 
                        : "bg-red/10 text-red border-red/20"
                    }`}>
                      Portrait Photo: {photos.some(p => p.type === "profile") ? "Uploaded" : "Missing"}
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${
                      photos.some(p => p.type === "full_body") 
                        ? "bg-green/10 text-green border-green/20" 
                        : "bg-red/10 text-red border-red/20"
                    }`}>
                      Full-body Photo: {photos.some(p => p.type === "full_body") ? "Uploaded" : "Missing"}
                    </span>
                  </div>
                </div>
              </div>

              {!isSubmitted && (
                <div className="p-4 bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-lg text-xs font-medium dark:bg-yellow-900/10 dark:border-yellow-800/30 dark:text-yellow-400">
                  ⚠️ **Final Lock Notice**: Submitting your application locks the fields from further editing. Ensure all details are precise before locking.
                </div>
              )}
            </div>
          )}
        </fieldset>

        {/* Navigation Controls buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => setActiveStep(prev => prev - 1)}
            className="flex items-center gap-2 rounded-lg border border-stroke px-5 py-2.5 font-bold hover:shadow-1 disabled:opacity-50 dark:border-dark-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {activeStep < stepsList.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep(prev => prev + 1)}
              className="flex items-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 text-white px-5 py-2.5 font-bold"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            !isSubmitted && (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-primary hover:bg-opacity-90 text-white px-8 py-3 font-bold transition-all shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Application
                  </>
                )}
              </button>
            )
          )}
        </div>
      </form>

      {isSubmitted && (
        <div className="flex items-center justify-center gap-3 p-6 border border-green/20 bg-green/10 text-green rounded-xl">
          <Lock className="h-5 w-5" />
          <span className="text-sm font-bold">This application has been finalized and cannot be modified.</span>
        </div>
      )}
    </div>
  );
}

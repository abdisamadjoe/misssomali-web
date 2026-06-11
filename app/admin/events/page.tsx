"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Calendar,
  MapPin,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface Event {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  location: string;
  coverImage: string;
  eventDate: string;
  countdownDate: string | null;
  featuredContestants: string[] | null;
  ticketLink: string | null;
  isGrandFinale: boolean;
  isFeatured: boolean;
  isPublished: boolean;
}

interface Contestant {
  id: string;
  fullName: string | null;
  user: {
    fullName: string;
  };
}

export default function GrandFinaleSettingsPage() {
  const [grandFinale, setGrandFinale] = useState<Event | null>(null);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [contestantSearch, setContestantSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    location: "",
    coverImage: "",
    eventDate: "",
    countdownDate: "",
    ticketLink: "",
    isPublished: false,
    isFeatured: false,
    featuredContestants: [] as string[],
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch grand finale configuration
      const finaleRes = await fetch("/api/admin/events?isGrandFinale=true");
      if (finaleRes.ok) {
        const finaleData = await finaleRes.json();
        setGrandFinale(finaleData);
        if (finaleData) {
          setForm({
            title: finaleData.title || "",
            subtitle: finaleData.subtitle || "",
            description: finaleData.description || "",
            location: finaleData.location || "",
            coverImage: finaleData.coverImage || "",
            eventDate: finaleData.eventDate ? new Date(finaleData.eventDate).toISOString().slice(0, 16) : "",
            countdownDate: finaleData.countdownDate ? new Date(finaleData.countdownDate).toISOString().slice(0, 16) : "",
            ticketLink: finaleData.ticketLink || "",
            isPublished: finaleData.isPublished || false,
            isFeatured: finaleData.isFeatured || false,
            featuredContestants: finaleData.featuredContestants || [],
          });
        }
      }

      // 2. Fetch contestants (for selection list)
      const contestantsRes = await fetch("/api/admin/contestants");
      if (contestantsRes.ok) {
        const contestantsData = await contestantsRes.json();
        setContestants(contestantsData || []);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Read file as base64 utility
  function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Upload to Cloudinary with progress bar tracking
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
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error"));
      xhr.send(JSON.stringify({ image: base64Data }));
    });
  }

  // Handle Cover Image Upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("Cover image size cannot exceed 2MB.");
      return;
    }

    setUploadProgress(0);
    try {
      const base64 = await readFileAsDataURL(file);
      const res = await uploadImageWithProgress(base64, (pct) => {
        setUploadProgress(pct);
      });
      setForm((prev) => ({ ...prev, coverImage: res.secure_url }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload cover banner.");
    } finally {
      setUploadProgress(null);
    }
  };

  // Toggle Featured Finalists
  const handleToggleContestant = (contestantId: string) => {
    setForm((prev) => {
      const current = prev.featuredContestants || [];
      if (current.includes(contestantId)) {
        return {
          ...prev,
          featuredContestants: current.filter((id) => id !== contestantId),
        };
      } else {
        return {
          ...prev,
          featuredContestants: [...current, contestantId],
        };
      }
    });
  };

  // Cancel edits and restore original settings
  const handleCancel = () => {
    if (grandFinale) {
      setForm({
        title: grandFinale.title || "",
        subtitle: grandFinale.subtitle || "",
        description: grandFinale.description || "",
        location: grandFinale.location || "",
        coverImage: grandFinale.coverImage || "",
        eventDate: grandFinale.eventDate ? new Date(grandFinale.eventDate).toISOString().slice(0, 16) : "",
        countdownDate: grandFinale.countdownDate ? new Date(grandFinale.countdownDate).toISOString().slice(0, 16) : "",
        ticketLink: grandFinale.ticketLink || "",
        isPublished: grandFinale.isPublished || false,
        isFeatured: grandFinale.isFeatured || false,
        featuredContestants: grandFinale.featuredContestants || [],
      });
    } else {
      setForm({
        title: "",
        subtitle: "",
        description: "",
        location: "",
        coverImage: "",
        eventDate: "",
        countdownDate: "",
        ticketLink: "",
        isPublished: false,
        isFeatured: false,
        featuredContestants: [],
      });
    }
    setIsEditing(false);
  };

  // Submit form data
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        description: form.description,
        location: form.location,
        coverImage: form.coverImage,
        eventDate: form.eventDate,
        countdownDate: form.eventDate || null,
        ticketLink: form.ticketLink || null,
        featuredContestants: form.featuredContestants,
        isGrandFinale: true,
        isPublished: form.isPublished,
        isFeatured: true,
      };

      const method = grandFinale ? "PUT" : "POST";
      const url = "/api/admin/events";
      const body = grandFinale ? { id: grandFinale.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccessMsg("Grand Finale settings saved successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(""), 3000);
        await fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save Grand Finale settings");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  const filteredContestants = contestants.filter((con) => {
    const name = con.fullName || con.user?.fullName || "";
    return name.toLowerCase().includes(contestantSearch.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Panel */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-5 font-bold text-dark dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" /> Grand Finale Settings
          </h1>
          <p className="mt-1 text-sm text-dark-6">
            Manage the official Grand Finale event details, countdown schedule, featured contestants, and public visibility settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 font-bold"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving || uploadProgress !== null}
                className="font-bold border-stroke dark:border-dark-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || uploadProgress !== null}
                className="bg-primary hover:bg-opacity-90 text-white font-bold flex items-center gap-1.5"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left main forms columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Event Details */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Event Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title" className="mb-2 block text-sm font-medium text-dark dark:text-white">Event Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grand Finale — Miss Somali 2026"
                  required
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="mb-2 block text-sm font-medium text-dark dark:text-white">Event Subtitle</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. The Coronation Night"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block text-sm font-medium text-dark dark:text-white">Event Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write description and details of the coronation ceremony..."
                rows={5}
                required
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Card 2: Logistics & Schedule */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Logistics & Schedule
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="location" className="mb-2 flex items-center gap-1 text-sm font-medium text-dark dark:text-white">
                  <MapPin className="h-4 w-4 text-primary" /> Venue Location
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. National Hall, Mogadishu"
                  required
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="ticketLink" className="mb-2 flex items-center gap-1 text-sm font-medium text-dark dark:text-white">
                  <LinkIcon className="h-4 w-4 text-primary" /> Ticket Link
                </Label>
                <Input
                  id="ticketLink"
                  value={form.ticketLink}
                  onChange={(e) => setForm({ ...form, ticketLink: e.target.value })}
                  placeholder="e.g. https://tickets.misssomali.com"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="eventDate" className="mb-2 flex items-center gap-1 text-sm font-medium text-dark dark:text-white">
                  <Calendar className="h-4 w-4 text-primary" /> Grand Finale Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  id="eventDate"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  required
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Visibility checkbox */}
            <div className="pt-2 border-t border-stroke dark:border-dark-3">
              <div className="flex items-start space-x-2.5">
                <Checkbox
                  id="isPublished"
                  checked={form.isPublished}
                  onCheckedChange={(checked) => setForm({ ...form, isPublished: !!checked })}
                  disabled={!isEditing}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="isPublished" className="cursor-pointer font-bold text-sm text-dark dark:text-white">
                    Publish to Landing Page (Public Event)
                  </Label>
                  <p className="text-xs text-dark-6">
                    Make this event public and start the landing page countdown clock.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side panels column */}
        <div className="space-y-6">
          {/* Card 3: Banner Image Uploader */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Banner Image
            </h3>
            <div className="rounded-xl border border-stroke bg-gray-50 p-4 dark:border-dark-3 dark:bg-dark-2 flex flex-col items-center justify-center text-center">
              {form.coverImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-stroke dark:border-dark-3 mb-3">
                  <Image
                    src={form.coverImage}
                    alt="Banner Preview"
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-dark-5">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No image uploaded</p>
                </div>
              )}

              {isEditing ? (
                <div className="w-full">
                  <div className="relative flex justify-center items-center">
                    <input
                      type="file"
                      id="hero-file-picker"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                      disabled={uploadProgress !== null}
                    />
                    <Label
                      htmlFor="hero-file-picker"
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-stroke bg-white px-4 py-2 text-xs font-semibold text-dark shadow-sm hover:bg-gray-50 cursor-pointer dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:bg-dark-2 ${
                        uploadProgress !== null ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {form.coverImage ? "Change Image" : "Upload Banner"}
                    </Label>
                  </div>

                  {uploadProgress !== null && (
                    <div className="mt-3 space-y-1.5 w-full">
                      <Progress value={uploadProgress} className="h-1.5" />
                      <p className="text-center text-[10px] text-dark-6">Uploading ({uploadProgress}%)</p>
                    </div>
                  )}
                </div>
              ) : (
                !form.coverImage && (
                  <p className="text-xs text-dark-6 italic">Enable editing to upload a banner image.</p>
                )
              )}
            </div>
            <p className="text-[10px] text-dark-6 leading-normal text-left">
              Recommended size: 16:9 ratio. Supported formats: PNG, JPG, WebP. Maximum size: 2MB.
            </p>
          </div>

          {/* Card 4: Featured Contestants selection list */}
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark space-y-4">
            <h3 className="text-base font-bold text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Featured Contestants
            </h3>
            
            {/* Search filter input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search contestants..."
                value={contestantSearch}
                onChange={(e) => setContestantSearch(e.target.value)}
                disabled={!isEditing}
                className="h-10 w-full rounded-lg border border-stroke bg-gray-2 px-3 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white disabled:opacity-50"
              />
            </div>

            <div className="rounded-lg border border-stroke p-3 dark:border-dark-3 max-h-[200px] overflow-y-auto space-y-2.5 bg-gray-50 dark:bg-dark-2">
              {filteredContestants.length === 0 ? (
                <p className="text-xs text-dark-6 text-center py-2">
                  {contestants.length === 0 ? "No approved/shortlisted contestants found." : "No matching contestants."}
                </p>
              ) : (
                filteredContestants.map((con) => {
                  const name = con.fullName || con.user?.fullName || "Unnamed Contestant";
                  const isChecked = (form.featuredContestants || []).includes(con.id);
                  return (
                    <div key={con.id} className="flex items-center space-x-2.5">
                      <Checkbox
                        id={`con-${con.id}`}
                        checked={isChecked}
                        onCheckedChange={() => handleToggleContestant(con.id)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor={`con-${con.id}`} className={`cursor-pointer text-xs ${!isEditing ? "cursor-not-allowed opacity-80" : ""}`}>
                        {name}
                      </Label>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-[10px] text-dark-6 leading-normal text-left">
              Select contestants to highlight on the Grand Finale page.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {isEditing && (
        <div className="border-t border-stroke pt-4 dark:border-dark-3 flex items-center justify-end gap-4">
          {successMsg && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> {successMsg}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving || uploadProgress !== null}
            className="font-bold border-stroke dark:border-dark-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || uploadProgress !== null}
            className="bg-primary hover:bg-opacity-90 text-white font-bold flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}

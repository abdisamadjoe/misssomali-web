"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Calendar,
  MapPin,
  Trophy,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  CheckCircle2,
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
          <Trophy className="h-6 w-6 text-[#E8C97A]" /> Grand Finale Settings
        </h1>
        <p className="mt-1 text-sm text-dark-6">
          Manage the official Grand Finale details, countdown date, event information, and visibility settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Left Columns: Core parameters (Professional grid) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Finale Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grand Finale — Miss Somali 2026"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Slogan / Subtitle</Label>
                <Input
                  id="subtitle"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. The Coronation Night"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write description and details of the coronation ceremony..."
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-primary" /> Venue / Location
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. National Hall, Mogadishu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ticketLink" className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4 text-primary" /> Ticket / External CTA URL
                </Label>
                <Input
                  id="ticketLink"
                  value={form.ticketLink}
                  onChange={(e) => setForm({ ...form, ticketLink: e.target.value })}
                  placeholder="e.g. https://tickets.misssomali.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="eventDate" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-primary" /> Coronation Date & Time
                </Label>
                <Input
                  type="datetime-local"
                  id="eventDate"
                  value={form.eventDate}
                  onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Visibility checkboxes */}
            <div className="pt-2 border-t border-stroke dark:border-dark-3 flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={form.isPublished}
                  onCheckedChange={(checked) => setForm({ ...form, isPublished: !!checked })}
                />
                <Label htmlFor="isPublished" className="cursor-pointer font-bold text-dark dark:text-white">
                  Publish to Landing Page (Public Event)
                </Label>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Cover Uploader & Finalists */}
          <div className="space-y-4">
            {/* Banner/Hero Cover Uploader */}
            <div>
              <Label>Hero Cover Banner Image</Label>
              <div className="mt-1.5 rounded-lg border-2 border-dashed border-stroke p-4 dark:border-dark-3 flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-2">
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
                  <div className="flex h-20 w-full items-center justify-center rounded-lg bg-stroke/30 text-dark-6 dark:bg-dark-3 mb-3">
                    <ImageIcon className="h-8 w-8 text-dark-5" />
                  </div>
                )}

                {/* Upload Action */}
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
                    <div className="mt-3 space-y-1.5">
                      <Progress value={uploadProgress} className="h-1.5" />
                      <p className="text-center text-[10px] text-dark-6">Uploading ({uploadProgress}%)</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-1 text-[10px] text-dark-6">
                Recommended aspect ratio: 16:9. Supported files: PNG, JPG, WebP. Max size: 2MB.
              </p>
            </div>

            {/* Featured Contestants List */}
            <div>
              <Label className="mb-2 block">Featured Contestants (Select Finalists)</Label>
              <div className="rounded-lg border border-stroke p-3 dark:border-dark-3 max-h-[200px] overflow-y-auto space-y-2.5 bg-gray-50 dark:bg-dark-2">
                {contestants.length === 0 ? (
                  <p className="text-xs text-dark-6">No approved/shortlisted contestants found.</p>
                ) : (
                  contestants.map((con) => {
                    const name = con.fullName || con.user?.fullName || "Unnamed Contestant";
                    const isChecked = (form.featuredContestants || []).includes(con.id);
                    return (
                      <div key={con.id} className="flex items-center space-x-2.5">
                        <Checkbox
                          id={`con-${con.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleToggleContestant(con.id)}
                        />
                        <Label htmlFor={`con-${con.id}`} className="cursor-pointer text-xs">
                          {name}
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
              <p className="mt-1 text-[10px] text-dark-6">
                Highlighted candidates on the Grand Finale landing page layout.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions footer */}
        <div className="border-t border-stroke pt-4 dark:border-dark-3 flex items-center justify-end gap-4">
          {successMsg && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> {successMsg}
            </span>
          )}
          <Button type="submit" disabled={saving || uploadProgress !== null} className="flex items-center gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Finale Settings
          </Button>
        </div>
      </form>
    </>
  );
}

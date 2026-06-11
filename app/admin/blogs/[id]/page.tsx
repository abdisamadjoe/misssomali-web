"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  Trash2,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Progress } from "@/components/ui/progress";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    coverImage: "",
    author: "",
    status: "",
  });

  useEffect(() => {
    async function loadBlog() {
      try {
        const res = await fetch(`/api/admin/blogs?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            title: data.title || "",
            content: data.content || "",
            coverImage: data.coverImage || "",
            author: data.author || "",
            status: data.status || "draft",
          });
        } else {
          alert("Blog post not found or failed to load.");
          router.push("/admin/blogs");
        }
      } catch (err) {
        console.error("Error loading blog details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [id, router]);

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
      alert(err.message || "Failed to upload cover image.");
    } finally {
      setUploadProgress(null);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, coverImage: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coverImage) {
      alert("Please upload a thumbnail cover image before saving.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      });

      if (res.ok) {
        router.push("/admin/blogs");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update blog post");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving the article.");
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
    <form onSubmit={handleSave} className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stroke pb-5 dark:border-dark-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/blogs")}
            className="h-9 w-9 rounded-xl text-dark-6 border-stroke dark:border-dark-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Edit Article
            </h1>
            <p className="text-xs text-dark-6">Update details and publication settings for this blog post.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blogs")}
            disabled={saving}
            className="font-bold border-stroke dark:border-dark-3 h-10 px-5 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || uploadProgress !== null}
            className="bg-primary hover:bg-opacity-90 text-white font-bold h-10 px-5 rounded-xl flex items-center gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Article Body Details */}
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Article Content
            </h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="blogTitle">Article Title</Label>
              <Input
                id="blogTitle"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Official Grand Finale Date Announced"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blogContent">Content Body</Label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Configuration Panel */}
        <div className="space-y-6">
          {/* Card 2: Settings Controls */}
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Publication Settings
            </h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="blogStatus">Article Status</Label>
              <select
                id="blogStatus"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-11 w-full rounded-xl border border-stroke bg-white px-4 text-sm outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 text-dark dark:text-white font-medium cursor-pointer"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="blogAuthor">Author</Label>
              <Input
                id="blogAuthor"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="e.g. Miss Somali Committee"
                required
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Card 3: Banner Image Upload */}
          <div className="rounded-2xl border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-dark dark:text-white border-b border-stroke pb-3 dark:border-dark-3">
              Banner Image
            </h3>
            
            <div className="rounded-xl border border-stroke bg-gray-2/30 p-4 dark:border-dark-3 dark:bg-dark-2/40 flex flex-col items-center justify-center text-center">
              {form.coverImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-stroke dark:border-dark-3 mb-4 group shadow-sm">
                  <Image
                    src={form.coverImage}
                    alt="Cover Image Preview"
                    fill
                    sizes="300px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="h-9 w-9 rounded-lg"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-dark-5 w-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-3 mb-3 text-dark-6">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-dark dark:text-white">Drag & drop cover banner</p>
                  <p className="text-[10px] text-dark-6 mt-1">Cover image thumbnail is required</p>
                </div>
              )}

              {uploadProgress !== null ? (
                <div className="w-full px-2 space-y-1.5">
                  <Progress value={uploadProgress} className="h-1.5" />
                  <p className="text-center text-[10px] text-dark-6">Uploading: {uploadProgress}%</p>
                </div>
              ) : (
                <div className="relative flex justify-center items-center">
                  <input
                    type="file"
                    id="blog-file-picker"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <Label
                    htmlFor="blog-file-picker"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stroke bg-white px-4 py-2 text-xs font-bold text-dark shadow-sm hover:bg-gray-50 cursor-pointer dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:bg-dark-2 transition-all duration-200"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {form.coverImage ? "Change Image" : "Upload Image"}
                  </Label>
                </div>
              )}
            </div>

            <p className="text-[10px] text-dark-6 leading-normal text-left">
              Recommended size: 16:9 ratio. PNG, JPG, WebP supported. Maximum size: 2MB.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

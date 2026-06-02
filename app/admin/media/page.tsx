"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Sliders,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  Lock
} from "lucide-react";

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Upload Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("image");
  const [category, setCategory] = useState("events");
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const url = categoryFilter !== "all" 
        ? `/api/admin/media?category=${categoryFilter}` 
        : "/api/admin/media";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMedia]);

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublished: !currentPublished }),
      });

      if (res.ok) {
        setItems((prev) => 
          prev.map((item) => item.id === id ? { ...item, isPublished: !currentPublished } : item)
        );
      }
    } catch (error) {
      console.error("Error toggling publish state:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete media item");
      }
    } catch (error) {
      console.error("Delete media error:", error);
    }
  };

  const handleMockUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      alert("Title and URL are required");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, type, category, isPublished }),
      });

      if (res.ok) {
        const newMedia = await res.json();
        setItems((prev) => [newMedia, ...prev]);
        setModalOpen(false);
        setTitle("");
        setUrl("");
        setIsPublished(true);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create media entry");
      }
    } catch (error) {
      console.error("Mock upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  // Helper to generate a placeholder Unsplash URL based on category
  const handleAutoGenerateUrl = () => {
    const randomId = Math.floor(Math.random() * 1000);
    let keyword = "pageant";
    if (category === "backstage") keyword = "backstage";
    if (category === "finalists") keyword = "somali-model";
    if (category === "promo") keyword = "fashion-show";

    setUrl(`https://images.unsplash.com/photo-${randomId % 2 === 0 ? "1596704017254-9b121068fb31" : "1509631179647-0177331693ae"}?auto=format&fit=crop&w=800&q=80`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071E4A]">Media Gallery</h1>
          <p className="text-sm text-[#071E4A]/60 mt-1">
            Publish event photos, promo videos, backstage highlight clips, and finalist cards.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-[#0B2D6B] hover:bg-[#071E4A] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="h-4.5 w-4.5 mr-1" /> Publish New Media
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:space-x-4">
        <div className="flex items-center space-x-2">
          <Sliders className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-bold text-[#071E4A]/60 uppercase tracking-wider">Category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "events", "backstage", "finalists", "promo"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setLoading(true);
                setCategoryFilter(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                categoryFilter === cat
                  ? "bg-[#0B2D6B] border-[#0B2D6B] text-white"
                  : "bg-white border-[#E8E8E8] text-[#071E4A] hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid gallery */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
          <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
          <p className="text-xs font-semibold text-[#071E4A]/60">Loading gallery items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-[#071E4A]/60">No media found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all duration-200">
              
              {/* Media Preview Box */}
              <div className="relative aspect-video bg-gray-50">
                {item.type === "video" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4 text-center">
                    <Video className="h-8 w-8 mb-2 text-[#E8C97A]" />
                    <span className="text-[10px] font-bold truncate w-full">{item.title}</span>
                  </div>
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Published status badge overlay */}
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm ${
                    item.isPublished 
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {item.isPublished ? "Public" : "Draft"}
                  </span>
                </div>

                {/* Category tag overlay */}
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#0B2D6B]/90 text-white rounded text-[8px] font-extrabold uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <h4 className="text-xs font-bold text-[#071E4A] line-clamp-1">{item.title}</h4>
                <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E8]">
                  <button
                    onClick={() => handleTogglePublish(item.id, item.isPublished)}
                    className={`inline-flex items-center text-[10px] font-bold ${
                      item.isPublished 
                        ? "text-amber-600 hover:text-amber-800" 
                        : "text-emerald-600 hover:text-emerald-800"
                    }`}
                  >
                    {item.isPublished ? (
                      <>
                        <Lock className="h-3.5 w-3.5 mr-1" /> Unpublish
                      </>
                    ) : (
                      <>
                        <Globe className="h-3.5 w-3.5 mr-1" /> Publish
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Upload/Creation Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#071E4A]">Publish Media Item</h3>
            
            <form onSubmit={handleMockUpload} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Media Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Preliminary Round Gala - Opening"
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Media Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                >
                  <option value="image">Image (Photo)</option>
                  <option value="video">Video Clip</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Category Gallery
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                >
                  <option value="events">Events</option>
                  <option value="backstage">Backstage</option>
                  <option value="finalists">Finalists</option>
                  <option value="promo">Promo</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Source Link (R2 URL)
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateUrl}
                    className="text-[10px] text-[#0B2D6B] font-bold hover:underline"
                  >
                    Generate Mock Image Link
                  </button>
                </div>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://r2.misssomali.com/uploads/..."
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                />
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="modalIsPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-[#E8E8E8] text-[#0B2D6B] focus:ring-[#0B2D6B]"
                />
                <label htmlFor="modalIsPublished" className="text-xs font-bold text-[#071E4A] cursor-pointer">
                  Publish immediately (Publicly visible in gallery)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E8E8] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2D6B] hover:bg-[#071E4A] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

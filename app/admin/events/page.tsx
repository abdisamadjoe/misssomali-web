"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  Globe, 
  Lock, 
  Loader2,
  Image as ImageIcon
} from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());
  
  // Create Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/admin/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublished: !currentPublished }),
      });

      if (res.ok) {
        setEvents((prev) => 
          prev.map((e) => e.id === id ? { ...e, isPublished: !currentPublished } : e)
        );
      }
    } catch (error) {
      console.error("Error updating event publication status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event? This action is permanent.")) return;

    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !eventDate || !coverImage) {
      alert("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, location, eventDate, coverImage, isPublished }),
      });

      if (res.ok) {
        const newEvent = await res.json();
        setEvents((prev) => [...prev, newEvent].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()));
        setModalOpen(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setEventDate("");
        setCoverImage("");
        setIsPublished(true);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Create event error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateCoverImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=1200&q=80"
    ];
    setCoverImage(images[Math.floor(Math.random() * images.length)]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#071E4A]">Events Calendar</h1>
          <p className="text-sm text-[#071E4A]/60 mt-1">
            Configure preliminary sessions, grand finales, fashion shows, and countdown milestones.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 bg-[#0B2D6B] hover:bg-[#071E4A] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="h-4.5 w-4.5 mr-1" /> Create New Event
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 flex flex-col justify-center items-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
          <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B] mb-2" />
          <p className="text-xs font-semibold text-[#071E4A]/60">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center bg-white border border-[#E8E8E8] rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-[#071E4A]/60">No events created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const isUpcoming = new Date(event.eventDate).getTime() > now;
            return (
              <div key={event.id} className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-all duration-200">
                
                {/* Cover Image & Indicators */}
                <div className="relative aspect-[21/9] bg-gray-50">
                  <img 
                    src={event.coverImage} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm ${
                      event.isPublished 
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {event.isPublished ? "Public" : "Draft"}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shadow-sm ${
                      isUpcoming 
                        ? "bg-blue-50 text-blue-800 border border-blue-200" 
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}>
                      {isUpcoming ? "Upcoming" : "Past"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-[#071E4A]">{event.title}</h3>
                    <p className="text-xs text-[#071E4A]/70 font-semibold line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-bold text-[#071E4A]/60">
                      <div className="flex items-center"><Calendar className="h-4 w-4 mr-1.5 text-[#0B2D6B]" /> {new Date(event.eventDate).toLocaleDateString()}</div>
                      <div className="flex items-center"><Clock className="h-4 w-4 mr-1.5 text-[#0B2D6B]" /> {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="flex items-center col-span-2"><MapPin className="h-4 w-4 mr-1.5 text-[#0B2D6B]" /> {event.location}</div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-[#E8E8E8] flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePublish(event.id, event.isPublished)}
                      className={`inline-flex items-center text-xs font-bold ${
                        event.isPublished 
                          ? "text-amber-600 hover:text-amber-800" 
                          : "text-emerald-600 hover:text-emerald-800"
                      }`}
                    >
                      {event.isPublished ? (
                        <>
                          <Lock className="h-4 w-4 mr-1" /> Unpublish Event
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-1" /> Publish Event
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Creation Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8E8] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-[#071E4A]">Create Preliminary or Final Event</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Grand Finale Coronation Night"
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide schedule details, ticket information, performance highlights..."
                  rows={3}
                  className="w-full border border-[#E8E8E8] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Location / Venue
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Royal Palace Hall, Mogadishu"
                    className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Cover Image URL
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCoverImage}
                    className="text-[10px] text-[#0B2D6B] font-bold hover:underline"
                  >
                    Generate Mock Image
                  </button>
                </div>
                <input
                  type="url"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://r2.misssomali.com/events/..."
                  className="w-full border border-[#E8E8E8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B2D6B]"
                />
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="eventIsPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-[#E8E8E8] text-[#0B2D6B] focus:ring-[#0B2D6B]"
                />
                <label htmlFor="eventIsPublished" className="text-xs font-bold text-[#071E4A] cursor-pointer">
                  Publish immediately (Publicly visible in timeline)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E8E8] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2D6B] hover:bg-[#071E4A] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

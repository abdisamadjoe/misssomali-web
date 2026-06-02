"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  Loader2
} from "lucide-react";

interface PageantEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  coverImage: string;
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<PageantEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextEvent, setNextEvent] = useState<PageantEvent | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/portal/events");
        if (res.ok) {
          const data = await res.json();
          setEvents(data || []);

          // Find the next upcoming event
          const now = new Date().getTime();
          const upcoming = data
            .filter((e: PageantEvent) => new Date(e.eventDate).getTime() > now)
            .sort((a: PageantEvent, b: PageantEvent) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

          if (upcoming.length > 0) {
            setNextEvent(upcoming[0]);
          }
        }
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Countdown timer calculations
  useEffect(() => {
    if (!nextEvent) return;

    const timer = setInterval(() => {
      const targetTime = new Date(nextEvent.eventDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        clearInterval(timer);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextEvent]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B2D6B]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div className="border-b border-[#E8E8E8] pb-5">
        <h1 className="text-2xl font-extrabold text-[#071E4A]">Pageant Events</h1>
        <p className="text-sm text-[#071E4A]/60">Track scheduled Miss Somali orientation rounds, interviews, and official stage finals.</p>
      </div>

      {/* Countdown Card (Next Event) */}
      {nextEvent && (
        <div className="bg-[#0B2D6B] text-white rounded-2xl p-6 sm:p-8 shadow-lg grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-center border border-[#0B2D6B]/15">
          <div className="lg:col-span-3 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#E8C97A] text-[#071E4A] uppercase tracking-wide">
              Next Live Event
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">{nextEvent.title}</h2>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">{nextEvent.description}</p>
            
            <div className="flex flex-wrap gap-4 text-xs font-semibold pt-2 text-white/70">
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5 text-[#E8C97A]" /> {new Date(nextEvent.eventDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5 text-[#E8C97A]" /> {nextEvent.location}</span>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="lg:col-span-2 bg-[#071E4A]/40 border border-white/5 rounded-xl p-4 sm:p-6 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/50 block mb-3">Countdown to Event</span>
            <div className="flex justify-center space-x-3 text-white">
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold">{String(countdown.days).padStart(2, "0")}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60 mt-1">Days</span>
              </div>
              <span className="text-2xl font-extrabold text-[#E8C97A] self-start mt-0.5">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold">{String(countdown.hours).padStart(2, "0")}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60 mt-1">Hrs</span>
              </div>
              <span className="text-2xl font-extrabold text-[#E8C97A] self-start mt-0.5">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold">{String(countdown.minutes).padStart(2, "0")}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60 mt-1">Min</span>
              </div>
              <span className="text-2xl font-extrabold text-[#E8C97A] self-start mt-0.5">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold">{String(countdown.seconds).padStart(2, "0")}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/60 mt-1">Sec</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events List Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#071E4A]">Complete Event Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((e) => {
            const isPast = new Date(e.eventDate).getTime() < new Date().getTime();
            return (
              <div
                key={e.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-opacity ${
                  isPast ? "opacity-55 border-gray-200" : "border-[#E8E8E8]"
                }`}
              >
                {/* Event Cover Photo */}
                <div className="h-40 bg-gray-100 relative">
                  <img src={e.coverImage} className="h-full w-full object-cover" alt="" />
                  {isPast && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold uppercase bg-gray-500 text-white rounded">
                      Concluded
                    </span>
                  )}
                </div>

                {/* Event Text Detail */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-[#071E4A] leading-tight">{e.title}</h4>
                    <p className="text-xs text-[#071E4A]/70 leading-relaxed">{e.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#E8E8E8] text-xs font-semibold text-[#071E4A]/60">
                    <div className="flex items-center"><Clock className="h-3.5 w-3.5 mr-2 text-[#0B2D6B]" /> {new Date(e.eventDate).toLocaleDateString()}</div>
                    <div className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-2 text-[#0B2D6B]" /> {e.location}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {events.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-[#E8E8E8] rounded-2xl p-12 text-center text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <span className="text-xs font-medium">No pageant events have been scheduled yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

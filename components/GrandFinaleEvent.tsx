"use client";

import { useEffect, useState, MouseEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import Link from "next/link";
import PillBadge from "@/components/ui/PillBadge";
import { MapPin, CalendarDays, ArrowRight } from "lucide-react";

interface EventData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  location: string;
  coverImage: string;
  eventDate: string;
  countdownDate: string | null;
  ticketLink: string | null;
}

const MinimalFlipNumber = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col items-center sm:items-start relative px-3 sm:px-6 md:px-8 w-1/4">
      <div className="relative h-10 sm:h-12 md:h-16 w-full overflow-hidden flex justify-center sm:justify-start">
        <AnimatePresence initial={false}>
          <motion.div
            key={value}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center sm:justify-start text-2xl sm:text-3xl md:text-4xl font-light text-white font-mono tracking-tighter"
          >
            {value.toString().padStart(2, "0")}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-[8px] sm:text-[9px] md:text-[10px] text-white/60 uppercase font-medium tracking-[0.2em] mt-1 w-full text-center sm:text-left">
        {label}
      </span>
    </div>
  );
};

export default function GrandFinaleEvent() {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPassed, setIsPassed] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(11, 45, 107, 0.03),
      transparent 80%
    )
  `;

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setEvent(data);
      })
      .catch((err) => console.error("Error fetching grand finale event:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!event) return;
    const targetDate = event.countdownDate ? new Date(event.countdownDate) : new Date(event.eventDate);
    const target = targetDate.getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsPassed(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true; 
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
      return false;
    };

    if (updateTimer()) return; 

    const interval = setInterval(() => {
      if (updateTimer()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (loading) return null; 
  if (!event) return null;

  const dateFormatted = new Date(event.eventDate).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const descriptionLines = event.description.split("\n").filter(line => line.trim() !== "");
  const mainDescription = descriptionLines[0] || "";

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] border-t border-white/5">
      {/* Ambient background elements to match the footer/cta */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8C97A]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Massive center glow effect behind the event card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] max-w-[1200px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(232,201,122,0.25)_0%,transparent_60%)] pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#E8C97A]/40 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10 pointer-events-none" />
        <div className="absolute inset-0 opacity-15 pointer-events-none z-15" style={{
          backgroundImage: `linear-gradient(to right, rgba(232, 201, 122, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 201, 122, 0.08) 1px, transparent 1px)`,
          backgroundSize: '45px 45px'
        }} />
      </div>

      <div className="grid-container relative z-10">
        <div className="grid-12">
          
          <div className="col-span-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onMouseMove={handleMouseMove}
              className="group relative rounded-[32px] sm:rounded-[40px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full flex flex-col lg:flex-row lg:h-[520px]"
            >
              {/* Mouse-tracking Spotlight Container */}
              <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none z-0">
                <motion.div
                  className="absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100 z-10"
                  style={{
                    background: spotlightBackground,
                  }}
                />
              </div>

              {/* Left Column: Content */}
              <div className="relative z-20 w-full lg:w-[55%] flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12">
                
                {/* Header Elements */}
                <div>
                  <div className="mb-6 relative z-20">
                    <PillBadge className="bg-white/40 border border-white/50 text-[#0B2D6B] backdrop-blur-md">
                      Upcoming Event
                    </PillBadge>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#0B2D6B] tracking-tighter leading-[1.1] mb-5 relative z-20">
                    {event.title}
                  </h2>
                  
                  <p className="text-[#071E4A]/80 font-light leading-relaxed text-sm sm:text-base md:text-lg max-w-xl relative z-20">
                    {mainDescription}
                  </p>
                </div>

                {/* Details & CTA */}
                <div className="mt-8 lg:mt-10 flex flex-col gap-8">
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-[#0B2D6B] relative z-20">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-[#0B2D6B]/50" />
                      <span className="font-medium tracking-wide text-sm">{dateFormatted}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#0B2D6B]/50" />
                      <span className="font-medium tracking-wide text-sm">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 relative z-20">
                    <Link 
                      href={`/events/${event.id}`}
                      className="group/btn relative inline-flex items-center justify-center px-8 py-3.5 bg-[#0B2D6B] text-white font-medium tracking-wide rounded-full overflow-hidden transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        View Details
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </span>
                    </Link>
                    
                    {event.ticketLink && (
                      <Link 
                        href={event.ticketLink}
                        target="_blank"
                        className="inline-flex items-center justify-center px-8 py-3.5 bg-white/30 border border-white/40 text-[#0B2D6B] font-medium tracking-wide rounded-full transition-colors hover:bg-white/50 backdrop-blur-md"
                      >
                        Get Tickets
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Free-Floating Image with Bottom Cropping */}
              <div className="relative z-50 w-full lg:w-[45%] h-[350px] sm:h-[450px] lg:h-full mt-8 lg:mt-0">
                
                {/* Directional Clip-Path Container (Allows L/R/Top overflow, crops Bottom exactly) */}
                <div 
                  className="absolute bottom-0 right-0 w-full h-[150%] pointer-events-none flex justify-center lg:block"
                  style={{ clipPath: "polygon(-100% -100%, 200% -100%, 200% 100%, -100% 100%)" }}
                >
                  
                  {/* Unconstrained Floating Image */}
                  <div className="absolute bottom-[-10%] lg:bottom-[-15%] w-full max-w-[90%] sm:max-w-md lg:max-w-none lg:w-[105%] pointer-events-auto lg:translate-x-8 lg:right-4">
                    
                    <motion.div
                      initial={{ opacity: 0, y: 80, scale: 0.95 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                      viewport={{ once: true, margin: "-50px" }}
                    >
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        width={1200}
                        height={1200}
                        priority
                        className="w-full h-auto object-contain"
                        sizes="(max-w-1024px) 100vw, 40vw"
                      />
                    </motion.div>
                    
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

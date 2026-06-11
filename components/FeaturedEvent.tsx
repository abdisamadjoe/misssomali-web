"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { AvatarStack } from "@/components/kibo-ui/avatar-stack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  location: string;
  coverImage: string;
  eventDate: string;
  ticketLink: string | null;
}

interface ContestantItem {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

export default function FeaturedEvent() {
  const [event, setEvent] = useState<EventData | null>(null);
  const [contestantsList, setContestantsList] = useState<ContestantItem[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data) setEvent(data);
      })
      .catch((err) => console.error("Error fetching featured event:", err));

    fetch("/api/contestants/featured")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) setContestantsList(data);
      })
      .catch((err) => console.error("Error fetching featured contestants:", err));
  }, []);

  const title = event ? event.title : "Miss Somali 2026 Grand Finale.";
  const slogan = event 
    ? (event.subtitle || event.description)
    : "The pinnacle of a global journey. A live showcase of confidence, culture, and leadership in Nairobi, Kenya.";
  const location = event ? event.location : "Nairobi, Kenya";
  const date = event 
    ? new Date(event.eventDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "August 25, 2026";
  const coverImage = event ? event.coverImage : "/images/image1.png";
  const ticketLink = event?.ticketLink || "#grand-finale";

  return (
    <section
      id="grand-finale"
      className="relative w-full py-24 md:py-32 overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] flex items-center border-t border-white/5"
    >
      {/* Background spotlights, ambient glows, and clean gold-accented grid lines */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Soft gold radial glowing lights */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8C97A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#E8C97A]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Ambient radial vignette mapping */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10 pointer-events-none" />

        {/* Fine gold-accented grid pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none z-15" style={{
          backgroundImage: `linear-gradient(to right, rgba(232, 201, 122, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 201, 122, 0.08) 1px, transparent 1px)`,
          backgroundSize: '45px 45px'
        }} />
      </div>

      <div className="relative w-full z-20">
        <div className="grid-container">
          <div className="grid-12 items-center gap-y-16 lg:gap-y-0 lg:gap-x-12">

            {/* Left Column: Content & Details */}
            <div className="col-span-12 lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              
              {/* Main Headline */}
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-[34px] sm:text-[44px] md:text-[54px] font-semibold text-white tracking-tight leading-[1.12] mb-6"
              >
                {title}
              </motion.h2>

              {/* Slogan */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
                className="text-[15px] sm:text-[16px] font-light text-[#F5F0E8]/75 leading-relaxed max-w-[480px] mb-8"
              >
                {slogan}
              </motion.p>

              {/* Featured Contestants (Avatar Stack) */}
              {contestantsList.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                  className="flex items-center justify-center lg:justify-start gap-3 mb-8"
                >
                  <AvatarStack size={38} animate>
                    {contestantsList.slice(0, 5).map((c) => (
                      <Avatar key={c.id} className="border-2 border-[#0B2D6B] w-[38px] h-[38px] shadow-sm">
                        {c.photoUrl && <AvatarImage src={c.photoUrl} alt={c.fullName} className="object-cover" />}
                        <AvatarFallback className="bg-[#E8C97A] text-[#071E4A] font-bold text-xs flex items-center justify-center">
                          {c.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarStack>
                  <span className="text-[13px] text-[#F5F0E8]/85 font-medium tracking-wide">
                    Meet the Finalists
                  </span>
                </motion.div>
              )}

              {/* Event Details (Date & Location Row) */}
              <motion.div
                 initial={{ opacity: 0, y: 15 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
                 className="flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-4 mb-10 w-full"
              >
                 <div className="flex flex-col items-center lg:items-start text-[#F5F0E8]">
                   <span className="text-[10px] uppercase tracking-widest text-[#E8C97A] font-medium mb-1.5">Location</span>
                   <span className="text-[15px] font-semibold">{location}</span>
                 </div>
                 <div className="flex flex-col items-center lg:items-start text-[#F5F0E8]">
                   <span className="text-[10px] uppercase tracking-widest text-[#E8C97A] font-medium mb-1.5">Date</span>
                   <span className="text-[15px] font-semibold">{date}</span>
                 </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full"
              >
                <PrimaryButton href={ticketLink} target={ticketLink.startsWith("http") ? "_blank" : undefined}>
                  Get Tickets & Packages
                </PrimaryButton>
                <SecondaryButton href="#journey">
                  Learn More
                </SecondaryButton>
              </motion.div>

            </div>

            {/* Right Column: Rounded Image Poster Card */}
            <div className="col-span-12 lg:col-span-6 flex justify-center items-center">
              
              {/* Premium Poster Frame with thick shadows, border, and glow */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative aspect-[16/9] w-full max-w-[580px] rounded-[24px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 bg-[#071E4A]/30 backdrop-blur-sm group"
              >
                {/* Glowing hover light overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E8C97A]/0 via-[#E8C97A]/5 to-[#E8C97A]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20" />
                
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  priority
                  sizes="(max-w-768px) 100vw, 40vw"
                  className="object-cover object-center z-10 transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </motion.div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}



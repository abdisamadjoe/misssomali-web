"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

const texts = {
  journeyLabel: "The Path to Glory",
  journeyTitle: "The Journey",
  journeyDesc: "Follow the journey of delegates as they undergo rigorous leadership training, cultural exploration, and community engagement.",
  journeyPhase1Number: "01",
  journeyPhase1Title: "Cultural Heritage",
  journeyPhase1Desc: "Delegates showcase and celebrate their rich Somali traditions, heritage, and values through arts, language, and cultural presentation.",
  journeyPhase2Number: "02",
  journeyPhase2Title: "Leadership & Impact",
  journeyPhase2Desc: "Rigorous bootcamps, workshops, and community advocacy projects designed to empower delegates to lead and create social change.",
  journeyPhase3Number: "03",
  journeyPhase3Title: "Grand Coronation",
  journeyPhase3Desc: "The final stage where delegates represent their platforms on a global stage, culminating in the crowning of Miss Somali 2026.",

  partnersLabel: "Global Affiliations & Partners",
  eventsLabel: "Key Highlights",
  eventsTitle: "Upcoming Events",
  eventsDesc: "Don't miss the key milestones in our search for the next cultural leader.",
  featuredLabel: "Featured Event",
  featuredDate: "October 30, 2026",
  featuredTitle: "The Grand Finale & Coronation",
  featuredDesc: "The crowning event held in Mogadishu, featuring cultural performances, designer showcases, and the crowning ceremony. Broadcasted globally to millions of viewers.",
  featuredCTA: "Get Tickets & Packages",
  aboutLabel: "Our Mission",
  aboutTitle: "Empowering Somali Beauty, Culture, and Intellect",
  aboutDesc1: "Miss Somali is more than a beauty pageant; it is a global leadership platform for young Somali women. We aim to celebrate the richness of Somali cultural heritage while encouraging delegates to lead and engage with pressing global issues.",
  aboutDesc2: "Our delegates represent the union of grace, cultural values, and academic excellence, carrying the torch of leadership on global stages like Miss World and Miss Universe.",
  footerDesc: "An international organization celebrating the union of Somali beauty, heritage, and values on a global stage.",
  footerQuickLinks: "Quick Links",
  footerContact: "Contact Us",
  footerContactEmail: "Email: info@misssomali.org",
  footerContactPhone: "Phone: +252 (61) 555-0199",
  footerContactOffice: "Office: Lido Beach, Mogadishu, Somalia",
  footerNewsletter: "Newsletter",
  footerNewsletterDesc: "Subscribe for news, event ticketing updates, and exclusive releases.",
  footerNewsletterPlaceholder: "Email Address",
  footerNewsletterCTA: "Go",
  footerCopyright: "© 2026 Miss Somali Pageant Organization. All Rights Reserved.",
  footerPrivacy: "Privacy Policy",
  footerTerms: "Terms of Service"
};



const contestants = [
  { id: 1, name: "Hodan Warsame", image: "/images/contestant1.jpeg", rank: "Contestant No. 1" },
  { id: 2, name: "Ayan Abdi", image: "/images/contestant2.jpeg", rank: "Contestant No. 2" },
  { id: 3, name: "Ifrah Mohamed", image: "/images/contestant3.jpeg", rank: "Contestant No. 3" },
  { id: 4, name: "Sahra Nur", image: "/images/contestant4.jpeg", rank: "Contestant No. 4" },
  { id: 5, name: "Ilhan Osman", image: "/images/contestant5.jpeg", rank: "Contestant No. 5" },
];


const partners = [
  { name: "Miss World", src: "/partners/MissWorld.svg" },
  { name: "Miss Universe", src: "/partners/MissUniverse.webp" },
  { name: "Miss Africa", src: "/partners/MissAfrica.webp" },
  { name: "Miss Earth", src: "/partners/missearth.webp" },
];

const events = [
  { date: "Oct 12, 2026", title: "Preliminary Interview", desc: "One-on-one sessions with the jury panel probing leadership and intellect." },
  { date: "Oct 18, 2026", title: "National Costume Show", desc: "A colorful exposition celebrating tribal and regional heritage." },
  { date: "Oct 24, 2026", title: "Charity Gala", desc: "Showcasing beauty with a purpose through community support initiatives." }
];

const values = [
  { title: "Cultural Integrity", desc: "Respecting and elevating the unique heritage, traditions, and values of the Somali people." },
  { title: "Empowering Leadership", desc: "Equipping delegates with critical skills, voice, and opportunities to lead community action." },
  { title: "Global Representation", desc: "Connecting local talent and narratives to international platforms, showing excellence to the world." }
];

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const targetDate = new Date("2026-08-25T20:00:00+03:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();

      // Grand Finale Countdown
      const difference = targetDate - now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        
        {/* Partners Section (Marquee Ticker) */}
        <section className="bg-[#FFFFFF] py-8 overflow-hidden border-b border-[#E8C97A]/15">
          <div className="grid-container">
            <div className="grid-12 items-center">
              <div className="col-span-12">
                <div className="relative w-full overflow-hidden">
                  {/* Left & right fade overlays for elegant masking */}
                  <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FFFFFF] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FFFFFF] to-transparent z-10 pointer-events-none" />
                  
                  {/* Ticker track */}
                  <div className="logo-ticker-track flex items-center gap-16 py-2">
                    {/* Render duplicated list for seamless looping */}
                    {[...partners, ...partners, ...partners, ...partners].map((p, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-44 h-16 flex items-center justify-center p-2 transition-all duration-300 filter grayscale opacity-100 hover:grayscale-0"
                      >
                        <Image
                          src={p.src}
                          alt={p.name}
                          width={140}
                          height={50}
                          className="max-h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Miss Somali Intro Section */}
        <section className="bg-[#FFFFFF] py-20 md:py-28 border-b border-[#0B2D6B]/5">
          <div className="grid-container">
            <div className="grid-12 items-center gap-y-12 lg:gap-x-12">
                            {/* Left Column: Text Content (Impressive Editorial Styling) */}
              <div className="col-span-12 lg:col-span-6 flex flex-col text-left items-start">
                {/* Pill Badge */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#0B2D6B] bg-[#E8C97A]/15 border border-[#E8C97A]/30 px-3.5 py-1 rounded-full inline-block">
                    About Miss Somali
                  </span>
                </div>
                
                {/* Impressive Section Title */}
                <h2 className="text-[32px] sm:text-[42px] font-extrabold text-[#0B2D6B] tracking-tight leading-[1.15] mb-6">
                  A Stage Built For <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B2D6B] to-[#0D3A8A]">Somali Women</span>
                </h2>
                
                {/* Impressive Lead Body Text */}
                <p className="text-[17px] sm:text-[20px] font-light leading-[1.65] text-[#111111]/90 max-w-xl">
                  Miss Somali was founded in Canada in 2025 to give Somali women a platform to be seen, celebrated, and heard on a global stage. We bring together talented Somali women from across the diaspora to compete, connect, and represent their culture with pride.
                </p>

                {/* Impressive Accent Callout Quote */}
                <div className="border-l-2 border-[#E8C97A] pl-5 py-1 mt-6 max-w-xl">
                  <p className="text-[16px] sm:text-[18px] font-semibold italic leading-[1.6] text-[#0D3A8A]">
                    "One woman will be crowned Miss Somali. But every woman who steps forward changes what the world knows about us."
                  </p>
                </div>
              </div>

              {/* Right Column: Image Grid (Matching Gargaara/Pearl style) */}
              <div className="col-span-12 lg:col-span-6">
                <div className="grid grid-cols-12 gap-4 h-[380px] sm:h-[480px] lg:h-[520px]">
                  {/* Left Big Image */}
                  <div className="col-span-7 h-full relative rounded-3xl overflow-hidden shadow-sm">
                    <Image
                      src="/images/aboutus.jpeg"
                      alt="About Miss Somali Pageant - Main"
                      fill
                      sizes="(max-w-768px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                  {/* Right Two Smaller Stacked Images */}
                  <div className="col-span-5 flex flex-col gap-4 h-full">
                    {/* Top Smaller Image */}
                    <div className="relative flex-1 rounded-3xl overflow-hidden shadow-sm">
                      <Image
                        src="/images/aboutus2.jpeg"
                        alt="About Miss Somali Pageant - Ceremony"
                        fill
                        sizes="(max-w-768px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                    {/* Bottom Smaller Image */}
                    <div className="relative flex-1 rounded-3xl overflow-hidden shadow-sm">
                      <Image
                        src="/images/aboutus3.jpeg"
                        alt="About Miss Somali Pageant - Team"
                        fill
                        sizes="(max-w-768px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Contestants Section */}
        <section id="contestants" className="bg-[#0B2D6B] py-28 border-t border-[#E8C97A]/5">
          <div className="grid-container">
            <div className="grid-12">
              <div className="col-span-12 text-center mb-16">
                <span className="text-[12px] font-semibold tracking-[0.02em] leading-[1.7] text-[#E8C97A] block mb-2">
                  Miss Somali 2026
                </span>
                <h2 className="text-[28px] lg:text-[40px] font-bold text-[#FFFFFF] tracking-[-0.02em] leading-[1.15] mb-6">
                  Meet The Contestants
                </h2>
                <p className="text-[#F5F0E8]/70 text-[16px] font-normal leading-[1.7] tracking-normal max-w-2xl mx-auto">
                  The women competing for the Miss Somali 2026 crown. Each one representing her community, her culture, and her story.
                </p>
              </div>

              {/* Centered Row Container for the 5 circles */}
              <div className="col-span-12 grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8 justify-items-center">
                {contestants.map((tc) => (
                  <div key={tc.id} className="flex flex-col items-center group w-full max-w-[200px]">
                    <div className="relative w-14 h-14 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-44 lg:h-44 rounded-full p-[2px] md:p-[3px] bg-gradient-to-tr from-[#E8C97A]/30 to-[#E8C97A] transition-all duration-300 group-hover:scale-[1.03]">
                      <div className="w-full h-full rounded-full bg-[#0B2D6B] p-[1.5px] md:p-[3px] flex items-center justify-center">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image
                            src={tc.image}
                            alt={tc.name}
                            fill
                            sizes="(max-w-768px) 100px, 200px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[10px] sm:text-[13px] md:text-[16px] lg:text-[18px] font-bold text-[#FFFFFF] mt-2 md:mt-4 text-center tracking-tight transition-colors duration-200 group-hover:text-[#E8C97A] truncate w-full">
                      {tc.name}
                    </h3>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-bold tracking-[0.05em] uppercase text-[#E8C97A] bg-[#E8C97A]/10 border border-[#E8C97A]/20 px-1.5 sm:px-2.5 py-0.5 mt-1 md:mt-2 rounded-full whitespace-nowrap">
                      {tc.rank}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Grand Finale Event Section */}
        <section id="grand-finale" className="bg-[#071E4A] py-28 border-b border-white/5 relative overflow-hidden">
          {/* Subtle Background Glow/Gradient */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0B2D6B]/50 to-transparent pointer-events-none" />
          
          <div className="grid-container relative z-10">
            <div className="grid-12 items-center gap-y-16 lg:gap-x-12">
              
              {/* Left Column: Event Info */}
              <div className="col-span-12 lg:col-span-6 flex flex-col justify-center text-left items-start">
                {/* Luxury Label Badge */}
                <div className="mb-8 inline-flex items-center gap-2 bg-[#E8C97A]/10 border border-[#E8C97A]/30 px-4 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#E8C97A] animate-pulse" />
                  <span className="text-[#E8C97A] tracking-[0.1em] uppercase text-[12px] font-bold">
                    Featured Event
                  </span>
                </div>
                
                {/* Clean Title */}
                <h2 className="text-[40px] sm:text-[48px] lg:text-[56px] font-black text-white tracking-[-0.02em] leading-[1.1] mb-6">
                  Miss Somali 2026 <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8C97A] to-[#DDBE6F]">Grand Finale</span>
                </h2>
                
                {/* Location & Date Details in Clean Text Row */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 mb-8 text-[16px] text-[#F5F0E8] font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <MapPin className="text-[#E8C97A] w-5 h-5" />
                    </div>
                    <span>Nairobi, Kenya</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Calendar className="text-[#E8C97A] w-5 h-5" />
                    </div>
                    <span>25 August 2026</span>
                  </div>
                </div>
                
                {/* Slogan Supporting Line */}
                <p className="text-[17px] font-light text-[#F5F0E8]/75 leading-[1.7] max-w-lg mb-10">
                  The crowning event of the year. Witness the culmination of grace, culture, and leadership as one extraordinary woman takes the global stage.
                </p>

                {/* Clean Countdown Timer (Solid Professional Look) */}
                <div className="flex items-center gap-3 sm:gap-5 mb-10">
                  {[
                    { label: "Days", value: isMounted ? timeLeft.days : 0 },
                    { label: "Hours", value: isMounted ? timeLeft.hours : 0 },
                    { label: "Mins", value: isMounted ? timeLeft.minutes : 0 },
                    { label: "Secs", value: isMounted ? timeLeft.seconds : 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center bg-[#0B2D6B] border border-[#0D3A8A] rounded-xl p-4 sm:p-5 w-20 sm:w-24 aspect-square text-center shadow-lg">
                      <span className="text-[28px] sm:text-[36px] font-black text-white leading-none tracking-tighter mb-2">
                        {String(item.value).padStart(2, "0")}
                      </span>
                      <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-[#E8C97A] uppercase font-bold">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Clean CTA Button */}
                <a
                  href="#events"
                  className="group inline-flex items-center gap-3 bg-[#E8C97A] hover:bg-[#F5F0E8] text-[#071E4A] px-8 py-4 rounded-full font-bold text-[15px] transition-all duration-300 shadow-[0_0_20px_rgba(232,201,122,0.2)] hover:shadow-[0_0_30px_rgba(232,201,122,0.4)]"
                >
                  View Event Details
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </a>
              </div>

              {/* Right Column: Event Image */}
              <div className="col-span-12 lg:col-span-6">
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 border border-white/10 rounded-3xl z-10 pointer-events-none" />
                  <Image
                    src="/images/image1.jpeg"
                    alt="Miss Somali 2026 Grand Finale Event"
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>



        {/* Journey Section */}
        <section id="journey" className="bg-[#071E4A] py-28 border-t border-[#E8C97A]/5">
          <div className="grid-container">
            <div className="grid-12">
              <div className="col-span-12 text-center mb-16">
                <span className="text-[12px] font-semibold tracking-[0.02em] leading-[1.7] text-[#E8C97A] block mb-2">
                  {texts.journeyLabel}
                </span>
                <h2 className="text-[28px] lg:text-[40px] font-bold text-[#FFFFFF] tracking-[-0.02em] leading-[1.15] mb-6">
                  {texts.journeyTitle}
                </h2>
                <p className="text-[#F5F0E8]/70 text-[16px] font-normal leading-[1.7] tracking-normal max-w-2xl mx-auto">
                  {texts.journeyDesc}
                </p>
              </div>

              {/* Journey Cards */}
              <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#0D3A8A] border border-[#0D3A8A] hover:border-[#E8C97A]/30 p-8 transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className="text-[32px] font-bold text-[#E8C97A]/30 group-hover:text-[#E8C97A]/80 transition-colors duration-300 mb-4">
                  {texts.journeyPhase1Number}
                </div>
                <h3 className="text-xl font-bold text-[#FFFFFF] mb-3">
                  {texts.journeyPhase1Title}
                </h3>
                <p className="text-[#F5F0E8]/70 text-[15px] font-light leading-[1.7] tracking-normal">
                  {texts.journeyPhase1Desc}
                </p>
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[#0D3A8A] border border-[#0D3A8A] hover:border-[#E8C97A]/30 p-8 transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className="text-[32px] font-bold text-[#E8C97A]/30 group-hover:text-[#E8C97A]/80 transition-colors duration-300 mb-4">
                  {texts.journeyPhase2Number}
                </div>
                <h3 className="text-xl font-bold text-[#FFFFFF] mb-3">
                  {texts.journeyPhase2Title}
                </h3>
                <p className="text-[#F5F0E8]/70 text-[15px] font-light leading-[1.7] tracking-normal">
                  {texts.journeyPhase2Desc}
                </p>
              </div>
              <div className="col-span-12 md:col-span-6 lg:col-span-4 md:col-start-4 lg:col-start-auto bg-[#0D3A8A] border border-[#0D3A8A] hover:border-[#E8C97A]/30 p-8 transition-all duration-300 group shadow-sm hover:shadow-md">
                <div className="text-[32px] font-bold text-[#E8C97A]/30 group-hover:text-[#E8C97A]/80 transition-colors duration-300 mb-4">
                  {texts.journeyPhase3Number}
                </div>
                <h3 className="text-xl font-bold text-[#FFFFFF] mb-3">
                  {texts.journeyPhase3Title}
                </h3>
                <p className="text-[#F5F0E8]/70 text-[15px] font-light leading-[1.7] tracking-normal">
                  {texts.journeyPhase3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>



        {/* Events Section */}
        <section id="events" className="bg-[#071E4A] py-28 border-t border-[#E8C97A]/5">
          <div className="grid-container">
            <div className="grid-12 gap-y-12">
              <div className="col-span-12 text-center mb-8">
                <span className="text-[12px] font-semibold tracking-[0.02em] leading-[1.7] text-[#E8C97A] block mb-2">
                  {texts.eventsLabel}
                </span>
                <h2 className="text-[28px] lg:text-[40px] font-bold text-[#FFFFFF] tracking-[-0.02em] leading-[1.15] mb-6">
                  {texts.eventsTitle}
                </h2>
                <p className="text-[#F5F0E8]/70 text-[16px] font-normal leading-[1.7] tracking-normal max-w-2xl mx-auto">
                  {texts.eventsDesc}
                </p>
              </div>

              {/* Asymmetrical layout: Featured Event spans 7 cols, right side spans 5 cols */}
              <div className="col-span-12 lg:col-span-7 bg-[#0D3A8A] border border-[#E8C97A]/35 p-8 md:p-12 flex flex-col justify-between shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#E8C97A] text-[#071E4A] font-semibold text-[12px] px-4 py-2">
                  {texts.featuredLabel}
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#E8C97A] tracking-wide block mb-3">
                    {texts.featuredDate}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#FFFFFF] mb-4 leading-tight">
                    {texts.featuredTitle}
                  </h3>
                  <p className="text-[#F5F0E8]/80 text-[15px] font-light leading-[1.7] mb-6">
                    {texts.featuredDesc}
                  </p>
                </div>
                <a
                  href="#apply"
                  className="inline-flex items-center space-x-2 text-[14px] font-bold tracking-[0.02em] leading-none text-[#E8C97A] hover:text-[#F0D898] transition-colors duration-200"
                >
                  <span>{texts.featuredCTA}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Right Side: List of events (5 cols) */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                {events.map((e, idx) => (
                  <div key={idx} className="bg-[#0D3A8A] border border-[#0D3A8A] p-6 hover:border-[#E8C97A]/20 transition-all duration-300 shadow-sm hover:shadow-md">
                    <span className="text-[12px] font-semibold text-[#E8C97A] block mb-2">{e.date}</span>
                    <h4 className="text-lg font-bold text-[#FFFFFF] mb-2">{e.title}</h4>
                    <p className="text-[#F5F0E8]/70 text-[15px] font-light leading-[1.7]">{e.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-[#0B2D6B] py-28 border-t border-[#E8C97A]/5">
          <div className="grid-container">
            <div className="grid-12 items-center gap-y-12">
              {/* Left Side: About Narrative (6 cols) */}
              <div className="col-span-12 lg:col-span-6">
                <span className="text-[12px] font-semibold tracking-[0.02em] leading-[1.7] text-[#E8C97A] block mb-2">
                  {texts.aboutLabel}
                </span>
                <h2 className="text-[28px] lg:text-[40px] font-bold text-[#FFFFFF] tracking-[-0.02em] leading-[1.15] mb-6">
                  {texts.aboutTitle}
                </h2>
                <p className="text-[#F5F0E8]/75 text-[15px] font-light leading-[1.7] mb-6">
                  {texts.aboutDesc1}
                </p>
                <p className="text-[#F5F0E8]/75 text-[15px] font-light leading-[1.7]">
                  {texts.aboutDesc2}
                </p>
              </div>

              {/* Right Side: Values list (6 cols) */}
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-6 lg:pl-10">
                {values.map((v, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#E8C97A] flex items-center justify-center text-[12px] font-semibold text-[#E8C97A]">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#FFFFFF] mb-2">{v.title}</h4>
                      <p className="text-[#F5F0E8]/75 text-[15px] font-light leading-[1.7]">{v.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Improved Apply CTA Section */}
        <section id="apply-cta" className="relative py-12 md:py-16 overflow-hidden bg-[#E8C97A] border-t border-[#E8C97A]/20">
          {/* Grid line low opacity bg (dark navy blue grid lines on yellowish background) */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `linear-gradient(to right, rgba(7, 30, 74, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(7, 30, 74, 0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />

          <div className="grid-container relative z-10">
            <div className="grid-12 items-center">
              {/* Left Column: Texts */}
              <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col text-left">
                <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-black text-[#071E4A] tracking-tight leading-[1.2] mb-3">
                  Applications for Miss Somali 2026 are open now.
                </h2>
                <p className="text-[#071E4A]/85 text-[15px] sm:text-[16px] md:text-[17px] font-light leading-[1.6]">
                  This is your chance to represent your culture, your community, and your story on the world stage. <b className="font-bold text-[#071E4A]"> Applications close soon. Do not miss your chance. </b>
                </p>
              </div>

              {/* Right Column: Button */}
              <div className="col-span-12 md:col-span-4 lg:col-span-3 flex md:justify-end items-center mt-6 md:mt-0">
                <a
                  href="#apply"
                  className="bg-[#071E4A] hover:bg-[#0B2D6B] text-[#FFFFFF] px-10 py-4 rounded-full font-bold text-[14px] leading-none tracking-[0.02em] transition-all duration-300 shadow-md hover:shadow-lg inline-block text-center whitespace-nowrap"
                >
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer id="contact" className="bg-[#071E4A] py-20 border-t border-[#E8C97A]/10 text-[#F5F0E8]">
        <div className="grid-container">
          <div className="grid-12 gap-y-12">
            {/* Column 1 (4 cols) */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 flex flex-col justify-between">
              <div>
                <div className="bg-[#0B2D6B] px-4 py-3.5 inline-block mb-6 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Miss Somali Logo"
                    width={130}
                    height={40}
                    className="w-auto h-8 object-contain"
                  />
                </div>
                <p className="text-[#F5F0E8]/75 text-[15px] font-light leading-[1.7] max-w-sm">
                  {texts.footerDesc}
                </p>
              </div>
              <div className="flex space-x-4 mt-6">
                {/* Social links */}
                {["twitter", "facebook", "instagram", "youtube"].map((social) => (
                  <a key={social} href="#" className="w-8 h-8 rounded-none border border-[#E8C97A]/15 flex items-center justify-center hover:border-[#E8C97A] hover:text-[#E8C97A] transition-all duration-300 text-[12px] flex items-center justify-center font-semibold text-[#F5F0E8]">
                    {social[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2 (3 cols) */}
            <div className="col-span-6 md:col-span-3 lg:col-span-3">
              <h4 className="text-[12px] font-semibold text-[#E8C97A] mb-6">
                {texts.footerQuickLinks}
              </h4>
              <ul className="flex flex-col gap-3 text-[13px] font-normal text-[#F5F0E8]/85">
                {[
                  { name: "Home", href: "#home" },
                  { name: "The Journey", href: "#journey" },
                  { name: "Contestants", href: "#contestants" },
                  { name: "Events", href: "#events" },
                  { name: "About", href: "#about" }
                ].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-[#F0D898] transition-colors duration-200">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 (3 cols) */}
            <div className="col-span-6 md:col-span-3 lg:col-span-3">
              <h4 className="text-[12px] font-semibold text-[#E8C97A] mb-6">
                {texts.footerContact}
              </h4>
              <ul className="flex flex-col gap-3 text-[13px] font-normal text-[#F5F0E8]/75">
                <li>{texts.footerContactEmail}</li>
                <li>{texts.footerContactPhone}</li>
                <li>{texts.footerContactOffice}</li>
              </ul>
            </div>

            {/* Column 4 (2 cols) */}
            <div className="col-span-12 md:col-span-12 lg:col-span-2">
              <h4 className="text-[12px] font-semibold text-[#E8C97A] mb-6">
                {texts.footerNewsletter}
              </h4>
              <p className="text-[15px] text-[#F5F0E8]/75 mb-4 leading-[1.7] font-light">
                {texts.footerNewsletterDesc}
              </p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder={texts.footerNewsletterPlaceholder}
                  className="bg-white border border-[#E8C97A]/15 px-3 py-2 text-[15px] font-normal focus:outline-none focus:border-[#E8C97A] w-full text-[#071E4A] rounded-none placeholder-[#071E4A]/50"
                />
                <button type="submit" className="bg-[#E8C97A] hover:bg-[#F0D898] text-[#071E4A] font-bold px-4 text-[14px] tracking-[0.02em] leading-none transition-colors duration-200 cursor-pointer">
                  {texts.footerNewsletterCTA}
                </button>
              </form>
            </div>

            {/* Copyright row */}
            <div className="col-span-12 border-t border-[#E8C97A]/10 pt-8 mt-4 text-center text-[13px] font-normal text-[#F5F0E8]/60 flex flex-col md:flex-row justify-between items-center gap-4">
              <span>{texts.footerCopyright}</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-[#E8C97A]">{texts.footerPrivacy}</a>
                <a href="#" className="hover:text-[#E8C97A]">{texts.footerTerms}</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}


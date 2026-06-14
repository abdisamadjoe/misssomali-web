"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeaturedEvent from "@/components/FeaturedEvent";
import BlogsSection from "@/components/BlogsSection";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";

const contentFadeVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const aboutLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const imageGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const mainImageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, x: -30 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const sideImageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, x: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const contestantsContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const contestantCardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

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
  footerContactEmail: "Email: info@misssomali.com",
  footerContactPhone: "Phone: +252 (61) 555-0199",
  footerContactOffice: "Office: Parklands, Nairobi, Kenya",
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
  const [targetDateStr, setTargetDateStr] = useState<string>("2026-08-25T20:00:00+03:00");

  useEffect(() => {
    fetch("/api/events")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.eventDate) {
          setTargetDateStr(data.eventDate);
        }
      })
      .catch((err) => console.error("Error fetching countdown date:", err));
  }, []);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
    const targetDate = new Date(targetDateStr).getTime();

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
  }, [targetDateStr]);

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
            <div className="grid-12 items-center gap-y-12 lg:gap-x-12">                             {/* Left Column: Text Content (Impressive Editorial Styling) */}
              <motion.div 
                className="col-span-12 lg:col-span-6 flex flex-col text-left items-start"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={aboutLeftVariants}
              >
                {/* Pill Badge */}
                <div className="mb-6">
                  <span className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#0B2D6B] bg-[#0B2D6B]/10 border border-[#0B2D6B]/20 px-3.5 py-1 rounded-full inline-block">
                    About Miss Somali
                  </span>
                </div>
                
                {/* Impressive Section Title */}
                <h2 className="text-[32px] sm:text-[42px] font-semibold text-[#0B2D6B] tracking-tight leading-[1.15] mb-6">
                  A Stage Built For <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0B2D6B] to-[#0D3A8A]">Somali Women</span>
                </h2>
                
                {/* Impressive Lead Body Text */}
                <p className="text-[17px] sm:text-[20px] font-light leading-[1.65] text-[#111111]/90 max-w-xl">
                  Miss Somali was founded in Canada in 2025 to give Somali women a platform to be seen, celebrated, and heard on a global stage. We bring together talented Somali women from across the diaspora to compete, connect, and represent their culture with pride.
                </p>

                {/* Impressive Accent Callout Quote */}
                <div className="border-l-2 border-[#E8C97A] pl-5 py-1 mt-6 max-w-xl">
                  <p className="text-[16px] sm:text-[18px] font-medium italic leading-[1.6] text-[#0D3A8A]">
                    &quot;One woman will be crowned Miss Somali. But every woman who steps forward changes what the world knows about us.&quot;
                  </p>
                </div>
              </motion.div>

              {/* Right Column: Image Grid (Matching Gargaara/Pearl style) */}
              <motion.div 
                className="col-span-12 lg:col-span-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={imageGridVariants}
              >
                <div className="grid grid-cols-12 gap-4 h-[380px] sm:h-[480px] lg:h-[520px]">
                  {/* Left Big Image */}
                  <motion.div 
                    className="col-span-7 h-full relative rounded-3xl overflow-hidden shadow-sm"
                    variants={mainImageVariants}
                  >
                    <Image
                      src="/images/about1.webp"
                      alt="About Miss Somali Pageant - Main"
                      fill
                      sizes="(max-w-768px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </motion.div>
                  {/* Right Two Smaller Stacked Images */}
                  <div className="col-span-5 flex flex-col gap-4 h-full">
                    {/* Top Smaller Image */}
                    <motion.div 
                      className="relative flex-1 rounded-3xl overflow-hidden shadow-sm"
                      variants={sideImageVariants}
                    >
                      <Image
                        src="/images/about2.webp"
                        alt="About Miss Somali Pageant - Ceremony"
                        fill
                        sizes="(max-w-768px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </motion.div>
                    {/* Bottom Smaller Image */}
                    <motion.div 
                      className="relative flex-1 rounded-3xl overflow-hidden shadow-sm"
                      variants={sideImageVariants}
                    >
                      <Image
                        src="/images/about3.webp"
                        alt="About Miss Somali Pageant - Team"
                        fill
                        sizes="(max-w-768px) 50vw, 20vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Contestants Section */}
        <section id="contestants" className="bg-[#0B2D6B] py-28 border-t border-[#E8C97A]/5">
          <div className="grid-container">
            <div className="grid-12">
              <motion.div 
                className="col-span-12 text-center mb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={contentFadeVariants}
              >
                <span className="text-[12px] font-medium tracking-[0.02em] leading-[1.7] text-[#E8C97A] block mb-2">
                  Miss Somali 2026
                </span>
                <h2 className="text-[28px] lg:text-[40px] font-semibold text-[#FFFFFF] tracking-[-0.02em] leading-[1.15] mb-6">
                  Meet The Contestants
                </h2>
                <p className="text-[#F5F0E8]/70 text-[16px] font-normal leading-[1.7] tracking-normal max-w-2xl mx-auto">
                  The women competing for the Miss Somali 2026 crown. Each one representing her community, her culture, and her story.
                </p>
              </motion.div>

              {/* Centered Row Container for the 5 circles */}
              <motion.div 
                className="col-span-12 grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8 justify-items-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={contestantsContainerVariants}
              >
                {contestants.map((tc) => (
                  <motion.div 
                    key={tc.id} 
                    className="flex flex-col items-center group w-full max-w-[200px]"
                    variants={contestantCardVariants}
                  >
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
                    <h3 className="text-[10px] sm:text-[13px] md:text-[16px] lg:text-[18px] font-semibold text-[#FFFFFF] mt-2 md:mt-4 text-center tracking-tight transition-colors duration-200 group-hover:text-[#E8C97A] truncate w-full">
                      {tc.name}
                    </h3>
                    <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] font-medium tracking-[0.05em] uppercase text-[#E8C97A] bg-[#E8C97A]/10 border border-[#E8C97A]/20 px-1.5 sm:px-2.5 py-0.5 mt-1 md:mt-2 rounded-full whitespace-nowrap">
                      {tc.rank}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <HowItWorks />
        <BlogsSection />

        <FeaturedEvent />



        {/* Rebuilt Apply CTA Section & Footer in one shared background container */}
      </main>

      <div className="relative overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] border-t border-white/5 text-[#F5F0E8]">
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

        <div className="relative z-10">
          {/* Apply CTA Section */}
          <section id="apply-cta" className="py-16 md:py-20 border-b border-white/5">
            <motion.div 
              className="grid-container relative z-20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="grid-12 items-center gap-y-6 md:gap-y-0">
                {/* Left Column: Texts */}
                <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col text-left items-start relative z-10">

                  <h2 className="text-[28px] sm:text-[34px] md:text-[38px] font-semibold text-white tracking-tight leading-[1.2] mb-3">
                    Applications for Miss Somali 2026 are open now.
                  </h2>
                  <p className="text-[#F5F0E8]/75 text-[15px] sm:text-[16px] md:text-[17px] font-light leading-[1.6]">
                    This is your chance to represent your culture, your community, and your story on the world stage. Applications close soon. Do not miss your chance.
                  </p>
                </div>

                {/* Right Column: Button */}
                <div className="col-span-12 md:col-span-4 lg:col-span-3 flex md:justify-end items-center mt-6 md:mt-0 relative z-10">
                  <PrimaryButton href="/portal">
                    Apply Now
                  </PrimaryButton>
                </div>
              </div>
            </motion.div>
          </section>

          <Footer className="bg-transparent" />
        </div>
      </div>
    </>
  );
}

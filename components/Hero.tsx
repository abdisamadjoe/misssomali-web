"use client";

import { useState, useEffect } from "react";
import Image from "next/image";


export default function Hero() {
  const [hasScrolled, setHasScrolled] = useState(false);

  // Listen to scroll to dismiss the bouncing chevron scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="home"
      className="relative w-full min-h-screen lg:h-screen flex items-center overflow-hidden bg-[#071E4A] py-28 lg:py-0"
    >
      {/* Background Image with Dark Blur Overlay */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <Image
          src="/images/background.png"
          alt="Miss Somali Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center blur-md scale-105 opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071E4A] via-[#071E4A]/60 to-[#071E4A]/35 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A/70_80%)] z-10" />
      </div>

      {/* Centered content block aligned to the 12-column grid */}
      <div className="relative w-full z-20 flex flex-col justify-center">
        <div className="grid-container">
          <div className="grid-12 items-center gap-y-12 lg:gap-y-0">
            
            {/* Left Column: Title and Slogan (Columns 1-4 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start animate-fade-up">
              <span className="text-[12px] font-semibold tracking-[0.05em] leading-[1.7] text-[#BF9200] block">
                Miss Somali 2026
              </span>
              
              {/* Custom Crown Divider */}
              <div className="flex items-center justify-center lg:justify-start space-x-4 my-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#BF9200] lg:hidden" />
                <svg className="w-6 h-6 text-[#BF9200]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5l3.5 5.5h-7L12 4.5zM2 19h20v2H2v-2zm2-7l3 7h10l3-7-4 2-4-8-4 8-4-2z" />
                </svg>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#BF9200]" />
              </div>

              {/* Main Headline */}
              <h1 className="text-[34px] xl:text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.2]">
                Who Wears <br className="hidden lg:block" /> the Crown?
              </h1>
              
              {/* Slogan */}
              <p className="mt-4 text-[14px] font-light text-[#F5F0E8]/80 leading-[1.6] max-w-[280px]">
                The Search for the Next Somali Queen Begins.
              </p>
            </div>

            {/* Center Column Spacer: reserves Columns 5-8 on desktop, hidden on mobile */}
            <div className="hidden lg:block lg:col-span-4 pointer-events-none" />

            {/* Center Column: Portrait Image (Columns 5-8 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-4 flex justify-center items-end py-6 lg:py-0 lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 lg:h-[82vh] xl:h-[90vh] lg:w-[32%] max-w-[480px] z-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative w-full h-[45vh] sm:h-[50vh] lg:h-full max-w-[320px] sm:max-w-[380px] lg:max-w-none mx-auto">
                <Image
                  src="/images/fatima.png"
                  alt="Fatima - Contestant"
                  fill
                  priority
                  sizes="(max-w-768px) 100vw, 33vw"
                  className="object-contain object-bottom hover:scale-103 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right Column: Description and CTAs (Columns 9-12 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-4 text-center lg:text-left flex flex-col items-center lg:items-start animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <p className="text-[14px] font-light text-[#F5F0E8]/70 leading-[1.7] mb-8 max-w-sm">
                Join us in celebrating leadership, cultural heritage, and academic excellence as delegates from global regions showcase beauty with a purpose.
              </p>
              
              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <a
                  href="#apply"
                  className="group w-full sm:w-auto bg-gradient-to-r from-[#BF9200] to-[#D4A800] hover:from-[#D4A800] hover:to-[#BF9200] text-white font-bold text-[13px] leading-none tracking-[0.02em] px-8 py-3.5 rounded-none transition-all duration-300 text-center shadow-[0_4px_18px_rgba(191,146,0,0.3)] flex items-center justify-center space-x-2"
                >
                  <span>Apply Now</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#journey"
                  className="w-full sm:w-auto bg-white/[0.03] hover:bg-white/[0.08] border border-white/20 hover:border-[#BF9200]/60 text-white font-bold text-[13px] leading-none tracking-[0.02em] px-8 py-3.5 rounded-none transition-all duration-300 text-center backdrop-blur-sm"
                >
                  Discover the Pageant
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>


      {/* Scroll Indicator (dismissed on scroll) */}
      <div
        className={`absolute bottom-40 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
          hasScrolled ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 pointer-events-auto"
        } hidden lg:flex`}
      >
        <span className="text-[10px] font-semibold tracking-[0.05em] text-[#F5F0E8]/40 mb-2">Scroll</span>
        <div className="w-[18px] h-7 border border-[#F5F0E8]/30 rounded-full flex justify-center pt-1.5 opacity-60">
          <div className="w-[3px] h-[3px] bg-[#BF9200] rounded-full animate-scroll-wheel" />
        </div>
      </div>

    </section>
  );
}

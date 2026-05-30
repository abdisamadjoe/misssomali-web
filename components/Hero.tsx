"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  { id: 1, path: "/images/image1.jpeg" },
  { id: 2, path: "/images/image2.jpeg" },
  { id: 3, path: "/images/image3.jpeg" },
];

const headlineWords = "You Already Know You Were Made for This.".split(" ");

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

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
      className="relative w-screen h-screen overflow-hidden bg-[#071E4A]"
    >
      {/* Background Images Slider */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.path}
              alt={`Miss Somali Pageant Background Scene ${slide.id}`}
              fill
              priority={index === 0}
              quality={90}
              sizes="100vw"
              className={`object-cover object-center transition-transform duration-[6000ms] ease-out ${
                index === currentSlide ? "scale-110" : "scale-100"
              }`}
            />
            {/* Dark Brand Blue Overlay: bottom to top gradient and radial shading */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071E4A] via-[#071E4A]/50 to-[#071E4A]/20 z-10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A/70_80%)] z-10" />
          </div>
        ))}
      </div>

      {/* Fixed Text Block (Centered horizontally, 45% from top) */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-6 text-center z-20 flex flex-col items-center animate-fade-up">
        {/* Small Label */}
        <span className="text-[12px] font-semibold tracking-[0.05em] leading-[1.7] text-[#BF9200] block">
          Miss Somali 2026
        </span>

        {/* Custom Crown Divider */}
        <div className="flex items-center justify-center space-x-4 my-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#BF9200]" />
          <svg className="w-6 h-6 text-[#BF9200]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5l3.5 5.5h-7L12 4.5zM2 19h20v2H2v-2zm2-7l3 7h10l3-7-4 2-4-8-4 8-4-2z" />
          </svg>
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#BF9200]" />
        </div>

        {/* Main Headline (staggered word fade-in) */}
        {/* Main Headline (staggered word fade-in with shimmering gold for the final word) */}
        <h1 className="text-[38px] lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.15] max-w-[850px] mx-auto">
          {headlineWords.map((word, idx) => {
            const isLast = idx === headlineWords.length - 1;
            return (
              <span
                key={idx}
                className={`inline-block animate-word-fade mr-[0.22em] last:mr-0 ${
                  isLast
                    ? "bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.2)]"
                    : "text-white"
                }`}
                style={{
                  animationDelay: `${0.3 + idx * 0.05}s`,
                }}
              >
                {word}
              </span>
            );
          })}
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-[15px] font-light text-[#F5F0E8]/80 max-w-[520px] mx-auto leading-[1.7] tracking-normal">
          An international pageant celebrating Somali beauty, culture, and
          leadership on a global stage.
        </p>

        {/* CTA Buttons Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
          <a
            href="#apply"
            className="group w-full sm:w-auto bg-gradient-to-r from-[#BF9200] to-[#D4A800] hover:from-[#D4A800] hover:to-[#BF9200] text-white font-bold text-[14px] leading-none tracking-[0.02em] px-10 py-4 rounded-none transition-all duration-300 text-center shadow-[0_4px_18px_rgba(191,146,0,0.35)] hover:shadow-[0_6px_28px_rgba(191,146,0,0.55)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
          >
            <span>Apply Now</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#journey"
            className="w-full sm:w-auto bg-white/[0.03] hover:bg-white/[0.08] border border-white/20 hover:border-[#BF9200]/60 text-white font-bold text-[14px] leading-none tracking-[0.02em] px-10 py-4 rounded-none transition-all duration-300 text-center backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            Discover the Pageant
          </a>
        </div>
      </div>

      {/* Premium Pageant Stats Ribbon */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-20 hidden lg:block animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.08] rounded-none py-5 px-8 grid grid-cols-3 gap-8 text-center shadow-2xl">
          <div className="border-r border-white/10 last:border-r-0 flex flex-col justify-center">
            <span className="text-[#BF9200] text-2xl font-bold tracking-tight">$50,000</span>
            <span className="text-white/60 text-[11px] font-semibold tracking-[0.02em] mt-1">Grand Prize</span>
          </div>
          <div className="border-r border-white/10 last:border-r-0 flex flex-col justify-center">
            <span className="text-[#BF9200] text-2xl font-bold tracking-tight">15+</span>
            <span className="text-white/60 text-[11px] font-semibold tracking-[0.02em] mt-1">Global Regions</span>
          </div>
          <div className="border-r border-white/10 last:border-r-0 flex flex-col justify-center">
            <span className="text-[#BF9200] text-2xl font-bold tracking-tight">October 2026</span>
            <span className="text-white/60 text-[11px] font-semibold tracking-[0.02em] mt-1">Grand Finale</span>
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

      {/* Slide Indicators / Dots Pagination */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide
                ? "bg-[#BF9200] scale-110"
                : "bg-[#F5F0E8]/40 hover:bg-[#F5F0E8]/70"
            }`}
            aria-label={`Navigate to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

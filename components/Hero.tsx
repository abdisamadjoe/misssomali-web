"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  { id: 1, path: "/images/image1.jpeg" },
  { id: 2, path: "/images/image2.jpeg" },
  { id: 3, path: "/images/image3.jpeg" },
];

const headlineWords = "BEAUTY IS KNOWING YOU BELONG ON THE STAGE".split(" ");

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
              className="object-cover object-center"
            />
            {/* Dark Brand Blue Overlay: bottom to top gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2D6B]/70 to-[#071E4A]/40 z-10" />
          </div>
        ))}
      </div>

      {/* Fixed Text Block (Centered horizontally, 45% from top) */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-6 text-center z-20 flex flex-col items-center animate-fade-up">
        {/* Small Label */}
        <span className="text-[13px] font-medium tracking-[0.25em] text-[#BF9200] uppercase block">
          Miss Somali 2026
        </span>

        {/* Thin Gold Line Divider */}
        <div className="w-10 h-[1px] bg-[#BF9200] my-4" />

        {/* Main Headline (staggered word fade-in) */}
        <h1 className="text-[30px] sm:text-[42px] lg:text-[72px] font-bold text-white tracking-[0.04em] leading-[1.15] max-w-[820px] mx-auto">
          {headlineWords.map((word, idx) => (
            <span
              key={idx}
              className="inline-block animate-word-fade mr-[0.22em] last:mr-0"
              style={{
                animationDelay: `${0.3 + idx * 0.05}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-[15px] lg:text-[18px] font-normal text-[#F5F0E8]/80 max-w-[520px] mx-auto leading-relaxed">
          An international pageant celebrating Somali beauty, culture, and
          leadership on a global stage.
        </p>

        {/* CTA Buttons Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#apply"
            className="w-full sm:w-auto bg-[#BF9200] hover:bg-[#D4A800] text-white font-bold text-[14px] uppercase tracking-[0.1em] px-10 py-4 rounded-none transition-colors duration-300 text-center shadow-lg"
          >
            Apply Now
          </a>
          <a
            href="#journey"
            className="w-full sm:w-auto bg-transparent hover:border-[#BF9200] border border-[#F5F0E8]/60 text-white font-bold text-[14px] uppercase tracking-[0.1em] px-10 py-4 rounded-none transition-colors duration-300 text-center"
          >
            Discover the Pageant
          </a>
        </div>
      </div>

      {/* Scroll Indicator (dismissed on scroll) */}
      <div
        className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
          hasScrolled ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 pointer-events-auto"
        }`}
      >
        <span className="text-[10px] tracking-[0.2em] text-[#F5F0E8]/50 uppercase mb-2">Scroll</span>
        <div className="text-white/50 animate-slow-bounce">
          <svg
            className="w-5 h-5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Slide Indicators / Dots Pagination */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
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

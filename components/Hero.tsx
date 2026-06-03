"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full min-h-screen lg:h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#0B2D6B] via-[#0D3A8A] to-[#071E4A] pt-28 pb-0 lg:py-0"
    >
      {/* Background Spotlights & Grid */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#071E4A_95%)] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35 z-15 pointer-events-none" />
      </div>

      {/* Centered content block aligned to the 12-column grid */}
      <div className="relative w-full z-20 flex flex-col flex-1">
        <div className="grid-container flex-1 flex flex-col justify-between">
          <div className="grid-12 items-center gap-y-12 lg:gap-y-0 flex-1 pt-12 pb-0 lg:py-0">

            {/* Left Column: Content & Stats (Columns 1-5 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Luxury Badge */}
              <div className="mb-6">
                <span className="text-[#E8C97A] tracking-[0.08em] uppercase text-[11px] font-bold">
                  Miss Somali 2026
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-[38px] lg:text-[58px] font-extrabold text-white tracking-[-0.02em] leading-[1.15] text-center lg:text-left">
                Miss Somali Is Searching For Its Next Queen.
              </h1>

              {/* Luxury Divider */}
              <div className="w-16 h-[2px] bg-[#E8C97A] my-6 rounded-full" />

              {/* Slogan */}
              <p className="text-[15px] font-light text-[#F5F0E8]/70 leading-[1.7] max-w-[420px] text-center lg:text-left">
                Are you the woman who will wear the crown and represent Somali women on the world stage?
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                <Link
                  href="/portal"
                  className="w-full sm:w-auto bg-[#E8C97A] hover:bg-[#F0D898] text-[#071E4A] px-8 py-4 rounded-full font-bold text-[14px] leading-none tracking-[0.02em] transition-colors duration-200 inline-block text-center border border-[#E8C97A]/25"
                >
                  Apply Now
                </Link>
                <a
                  href="#journey"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full border border-white/10 transition-colors duration-200"
                >
                  <span className="text-[14px] font-bold tracking-[0.02em] leading-none">Learn More</span>
                  <svg className="w-4 h-4 text-[#E8C97A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

            </div>

            {/* Right Column: Portrait Image & Backdrops (Columns 6-12 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-7 flex justify-center items-end relative lg:h-[86vh] xl:h-[95vh] z-10 lg:self-end pb-0 mb-0">

              {/* Glowing Gold Halo Spotlight */}
              <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-gradient-to-r from-[#E8C97A]/25 to-transparent blur-3xl rounded-full z-0 pointer-events-none hidden md:block" />

              {/* Model Image wrapper */}
              <div className="relative w-full h-[55vh] sm:h-[60vh] lg:h-full max-w-[380px] sm:max-w-[460px] lg:max-w-none mx-auto z-10 pb-0 mb-0">
                {/* Crown Background Image */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] sm:w-[160%] sm:h-[160%] lg:w-[180%] lg:h-[180%] z-0 pointer-events-none opacity-25">
                  <Image
                    src="/images/crown.png"
                    alt="Crown Backdrop"
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
                <Image
                  src="/images/misssomalipsd1.png"
                  alt="Miss Somali - Coronation"
                  fill
                  priority
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-contain object-bottom z-10"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

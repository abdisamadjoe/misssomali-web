"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full min-h-screen lg:h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#2C0A3B] via-[#3D1050] to-[#1A0524] pt-28 pb-0 lg:py-0"
    >
      {/* Background Spotlights & Grid */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#1A0524_95%)] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-35 z-15 pointer-events-none" />
      </div>

      {/* Centered content block aligned to the 12-column grid */}
      <div className="relative w-full z-20 flex flex-col flex-1">
        <div className="grid-container flex-1 flex flex-col justify-between">
          <div className="grid-12 items-center gap-y-12 lg:gap-y-0 flex-1 pt-12 pb-0 lg:py-0">
            
            {/* Left Column: Content & Stats (Columns 1-5 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Luxury Badge */}
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md mb-6">
                <span className="w-1.5 h-1.5 bg-[#E8C97A] rounded-full" />
                <span className="text-[12px] font-semibold tracking-normal text-[#F5F0E8]/90">
                  Miss Somali Pageant 2026
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-[38px] lg:text-[64px] font-extrabold text-white tracking-[-0.02em] leading-[1.15] text-center lg:text-left">
                Who Wears <br />
                the Crown?
              </h1>

              {/* Luxury Divider */}
              <div className="w-16 h-[2px] bg-[#E8C97A] my-6 rounded-full" />
              
              {/* Slogan */}
              <p className="text-[15px] font-light text-[#F5F0E8]/70 leading-[1.7] max-w-[360px] text-center lg:text-left">
                An extraordinary journey celebrating cultural heritage, intellect, and leadership. The search for the next global ambassador begins here.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                <a
                  href="#apply"
                  className="w-full sm:w-auto relative bg-[#E8C97A] text-[#1A0524] px-8 py-4 rounded-full font-bold text-[14px] leading-none tracking-[0.02em] transition-all duration-300 shadow-[0_5px_25px_rgba(232,201,122,0.3)] hover:shadow-[0_8px_35px_rgba(232,201,122,0.5)] hover:-translate-y-0.5 active:translate-y-0 inline-block text-center border border-[#E8C97A]/25"
                >
                  Register as Delegate
                </a>
                <a
                  href="#journey"
                  className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full border border-white/10 hover:border-[#E8C97A]/30 transition-all duration-300 group"
                >
                  <span className="w-5 h-5 rounded-full bg-[#E8C97A]/25 flex items-center justify-center text-[#E8C97A] group-hover:bg-[#E8C97A] group-hover:text-[#1A0524] transition-all duration-300">
                    <svg className="w-2.5 h-2.5 ml-0.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-bold tracking-[0.02em] leading-none">Watch Journey</span>
                </a>
              </div>

              {/* Statistics Block */}
              <div className="mt-12 flex items-center justify-center lg:justify-start space-x-6 sm:space-x-10 border-t border-white/10 pt-8 w-full max-w-[480px]">
                <div>
                  <div className="text-[26px] font-extrabold text-white leading-none">18</div>
                  <div className="text-[12px] font-semibold text-[#F5F0E8]/50 mt-1.5">Delegates</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div>
                  <div className="text-[26px] font-extrabold text-white leading-none">01</div>
                  <div className="text-[12px] font-semibold text-[#F5F0E8]/50 mt-1.5">Queen</div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div>
                  <div className="text-[26px] font-extrabold text-white leading-none">Global</div>
                  <div className="text-[12px] font-semibold text-[#F5F0E8]/50 mt-1.5">Broadcast</div>
                </div>
              </div>
            </div>

            {/* Right Column: Portrait Image & Backdrops (Columns 6-12 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-7 flex justify-center items-end relative lg:h-[86vh] xl:h-[95vh] z-10 lg:self-end pb-0 mb-0">
              
              {/* Glowing Gold Halo Spotlight */}
              <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-gradient-to-r from-[#E8C97A]/25 to-transparent blur-3xl rounded-full z-0 pointer-events-none hidden md:block" />

              {/* Model Image wrapper */}
              <div className="relative w-full h-[55vh] sm:h-[60vh] lg:h-full max-w-[380px] sm:max-w-[460px] lg:max-w-none mx-auto z-10 pb-0 mb-0">
                <Image
                  src="/images/misssomalipsd.png"
                  alt="Miss Somali - Coronation"
                  fill
                  priority
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-contain object-bottom"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

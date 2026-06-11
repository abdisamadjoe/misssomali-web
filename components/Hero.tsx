"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const dividerVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

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
            <motion.div 
              className="col-span-12 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Luxury Badge */}
              <motion.div className="mb-6" variants={itemVariants}>
                <span className="text-[#E8C97A] tracking-[0.08em] uppercase text-[11px] font-medium">
                  Miss Somali 2026
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                className="text-[38px] lg:text-[58px] font-bold text-white tracking-[-0.02em] leading-[1.15] text-center lg:text-left"
                variants={itemVariants}
              >
                Miss Somali Is Searching For Its Next Queen.
              </motion.h1>

              {/* Luxury Divider */}
              <motion.div 
                className="w-16 h-[2px] bg-[#E8C97A] my-6 rounded-full origin-left"
                variants={dividerVariants}
              />

              {/* Slogan */}
              <motion.p 
                className="text-[15px] font-light text-[#F5F0E8]/70 leading-[1.7] max-w-[420px] text-center lg:text-left"
                variants={itemVariants}
              >
                Are you the woman who will wear the crown and represent Somali women on the world stage?
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full"
                variants={itemVariants}
              >
                <PrimaryButton href="/portal">
                  Apply Now
                </PrimaryButton>
                <SecondaryButton href="#journey">
                  Learn More
                </SecondaryButton>
              </motion.div>
            </motion.div>

            {/* Right Column: Portrait Image & Backdrops (Columns 6-12 on desktop, 12 on mobile) */}
            <div className="col-span-12 lg:col-span-7 flex justify-center items-end relative lg:h-[86vh] xl:h-[95vh] z-10 lg:self-end pb-0 mb-0">

              {/* Glowing Gold Halo Spotlight */}
              <motion.div 
                className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] bg-gradient-to-r from-[#E8C97A]/25 to-transparent blur-3xl rounded-full z-0 pointer-events-none hidden md:block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />

              {/* Model Image wrapper */}
              <div className="relative w-full h-[55vh] sm:h-[60vh] lg:h-full max-w-[380px] sm:max-w-[460px] lg:max-w-none mx-auto z-10 pb-0 mb-0">
                {/* Crown Background Image */}
                <motion.div 
                  className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] sm:w-[130%] sm:h-[130%] lg:w-[145%] lg:h-[145%] z-0 pointer-events-none opacity-25"
                  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                  animate={{ opacity: 0.25, scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                >
                  <Image
                    src="/images/crown.png"
                    alt="Crown Backdrop"
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </motion.div>
                <motion.div
                  className="relative w-full h-full"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                >
                  <Image
                    src="/images/misssomalipsd1.png"
                    alt="Miss Somali - Coronation"
                    fill
                    priority
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-contain object-bottom z-10"
                  />
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

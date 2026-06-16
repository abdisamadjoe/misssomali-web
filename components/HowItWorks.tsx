"use client";

import { motion } from "framer-motion";
import PillBadge from "@/components/ui/PillBadge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  hasApplyLink?: boolean;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Create Your Account",
    description: "Create your Miss Somali account to begin your journey and access the application portal.",
    hasApplyLink: true,
  },
  {
    number: "2",
    title: "Submit Your Application",
    description: "Complete the online application and share your background, ambitions, and story with us.",
  },
  {
    number: "3",
    title: "Application Review",
    description: "Our selection team carefully reviews every submission from across the Somali community worldwide.",
  },
  {
    number: "4",
    title: "Selection & Confirmation",
    description: "Selected candidates will receive an official invitation to confirm participation in Miss Somali 2026.",
  },
  {
    number: "5",
    title: "Training & Preparation",
    description: "Contestants receive preparation sessions focused on confidence, presentation, leadership, and cultural representation.",
  },
  {
    number: "6",
    title: "Grand Finale",
    description: "Take the stage in Nairobi, Kenya and compete for the Miss Somali 2026 crown before a live audience.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#FFFFFF] py-24 md:py-32 border-t border-[#E8E8E8] overflow-hidden">
      
      {/* Subtle radial background glow for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(11,45,107,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="grid-container relative z-10">
        
        {/* HEADER AREA */}
        <div className="text-center mb-20 md:mb-28 flex flex-col items-center">
          <PillBadge className="mb-6 bg-white border border-[#0B2D6B]/10 text-black shadow-sm">
            How it works
          </PillBadge>
          
          <h2 className="text-[36px] sm:text-[46px] font-semibold text-black tracking-tighter leading-[1.1] mb-6">
            How The Selection Process Works
          </h2>
          
          <p className="text-slate-500 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
            Apply, Prepare, Succeed: Embark on an extraordinary journey of cultural pride, leadership, and personal growth. Follow our structured path to represent your heritage on the international stage.
          </p>
        </div>

        {/* HORIZONTAL TIMELINE */}
        <div className="grid-12">
          <div className="col-span-12">
            
            {/* Desktop Timeline (visible md and up) */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-y-16 lg:gap-y-24 gap-x-8 lg:gap-x-12">
              {steps.map((step, stepIdx) => (
                <motion.div 
                  key={step.title} 
                  className="relative flex flex-col items-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: stepIdx * 0.1 }}
                >
                  {/* Timeline Node and Connecting Line */}
                  <div className="relative flex items-center justify-center w-full mb-8 z-10">
                    
                    {/* Node */}
                    <div className="relative flex h-14 w-14 flex-none items-center justify-center bg-white border-2 border-[#0B2D6B]/20 rounded-full shadow-sm z-10 transition-all duration-500 group-hover:border-[#0B2D6B] group-hover:shadow-md group-hover:scale-110">
                      {/* Inner solid circle that fades in on hover */}
                      <div className="absolute inset-1 rounded-full bg-[#0B2D6B] opacity-0 scale-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100 z-0" />
                      
                      <span className="relative z-10 text-black text-lg font-semibold transition-colors duration-500 group-hover:text-white">
                        {step.number}
                      </span>
                    </div>
                    
                    {/* Base Connecting Line (Light Gray) */}
                    <div className={`
                      absolute left-1/2 top-1/2 h-[2px] -translate-y-1/2 bg-slate-100 z-0
                      w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)]
                      ${stepIdx === steps.length - 1 ? 'hidden' : 'block'}
                      ${(stepIdx + 1) % 3 === 0 ? 'lg:hidden' : ''}
                      ${(stepIdx + 1) % 2 === 0 ? 'md:hidden lg:block' : ''}
                    `} />
 
                    {/* Animated Fill Line (Blue) - Fills on scroll */}
                    <motion.div 
                      className={`
                        absolute left-1/2 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-[#0B2D6B] to-[#0B2D6B]/50 z-0 origin-left
                        w-[calc(100%+2rem)] lg:w-[calc(100%+3rem)]
                        ${stepIdx === steps.length - 1 ? 'hidden' : 'block'}
                        ${(stepIdx + 1) % 3 === 0 ? 'lg:hidden' : ''}
                        ${(stepIdx + 1) % 2 === 0 ? 'md:hidden lg:block' : ''}
                      `} 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 1, ease: "easeOut", delay: (stepIdx * 0.1) + 0.3 }}
                    />
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex flex-col items-center text-center transition-transform duration-500 group-hover:-translate-y-1">
                    <span className="text-[12px] font-bold tracking-[0.2em] text-[#0B2D6B] uppercase mb-3 block">
                      Step {step.number}
                    </span>
                    <h3 className="text-[22px] sm:text-[26px] font-semibold leading-[1.2] text-black tracking-tight mb-4">
                      {step.title}
                    </h3>
                    <p className="text-[16px] leading-[1.7] text-slate-500 font-light max-w-[320px] mx-auto">
                      {step.description}
                    </p>
                    
                    {/* Premium Call to Action Link */}
                    {step.hasApplyLink && (
                      <Link 
                        href="/portal" 
                        className="inline-flex items-center justify-center gap-2 mt-6 text-[#2563EB] font-semibold text-sm group/link overflow-hidden relative pb-1"
                      >
                        <span className="relative z-10">Apply Now</span>
                        <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover/link:translate-x-1" />
                        {/* Hover underline animation */}
                        <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#2563EB] transform origin-left scale-x-0 transition-transform duration-300 group-hover/link:scale-x-100" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile/Tablet Vertical Timeline (visible below md) */}
            <div className="block md:hidden space-y-10 relative pl-4 sm:pl-8">
              {/* Core Vertical Connecting Line */}
              <div className="absolute left-[40px] sm:left-[60px] top-6 bottom-6 w-[2px] bg-slate-100 z-0" />
              
              {steps.map((step, stepIdx) => (
                <motion.div 
                  key={step.title} 
                  className="relative flex gap-5 sm:gap-7 items-start group z-10"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: stepIdx * 0.08 }}
                >
                  {/* Timeline Node */}
                  <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 flex-none items-center justify-center bg-white border-2 border-[#0B2D6B]/20 rounded-full shadow-sm z-10">
                    <span className="text-black text-base sm:text-lg font-semibold">
                      {step.number}
                    </span>
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col pt-1">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#0B2D6B] uppercase mb-1 block">
                      Step {step.number}
                    </span>
                    <h3 className="text-[18px] sm:text-[22px] font-semibold leading-[1.2] text-black tracking-tight mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[14px] sm:text-[16px] leading-[1.6] text-slate-500 font-light max-w-md">
                      {step.description}
                    </p>
                    
                    {step.hasApplyLink && (
                      <Link 
                        href="/portal" 
                        className="inline-flex items-center gap-1.5 mt-3 text-[#2563EB] font-semibold text-sm group/link w-fit"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

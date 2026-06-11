"use client";

import { motion } from "framer-motion";

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "1",
    title: "Create Your Account",
    description: "Create your Miss Somali account to begin your journey and access the application portal.",
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

// Framer Motion Animation Variants (Sleek and minimal transitions)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      duration: 0.4,
      ease: "easeOut",
    },
  },
} as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#FFFFFF] py-20 md:py-28 border-t border-[#E8E8E8]">
      <div className="grid-container relative z-10">
        
        {/* ========================================================================= */}
        {/* HEADER AREA (Pill Label + Title + Subtitle)                               */}
        {/* ========================================================================= */}
        <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
          {/* Rounded Pill Label - matches screenshot */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-slate-200 bg-white text-slate-800 text-[12px] font-medium uppercase tracking-wider mb-6">
            How it works
          </div>
          
          {/* Large Editorial Heading */}
          <h2 className="text-[28px] sm:text-[36px] md:text-[42px] font-semibold text-[#071E4A] tracking-tight leading-[1.15] max-w-4xl mb-4">
            How The Selection Process Works
          </h2>
          
          {/* Editorial Divider */}
          <div className="w-12 h-[2px] bg-[#0B2D6B] mb-6 rounded-full" />
          
          {/* Fine Subtitle */}
          <p className="text-slate-500 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
            Apply, Prepare, Succeed: Embark on an extraordinary journey of cultural pride, leadership, and personal growth. Follow our structured path to represent your heritage on the international stage.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CARDS GRID LAYOUT (6 Steps: 2 Rows of 3 on Desktop)                       */}
        {/* ========================================================================= */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="relative flex flex-col h-full"
              variants={cardVariants}
            >
              {/* Slate-50 background card with solid borders to prevent background blending */}
              <div className="bg-[#F8FAFC] rounded-2xl border border-slate-200/90 p-8 flex flex-col h-full transition-all duration-300 hover:border-slate-350 hover:bg-white relative">
                
                {/* Step indicator block */}
                <span className="text-slate-400 font-medium text-xs uppercase tracking-wider block mb-2">
                  Step {step.number}
                </span>

                {/* Step Title */}
                <h3 className="text-[#071E4A] font-semibold text-xl leading-snug tracking-tight mb-3">
                  {step.title}
                </h3>

                {/* Description Paragraph */}
                <p className="text-slate-600 font-light text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

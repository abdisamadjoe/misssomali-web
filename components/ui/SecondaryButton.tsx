"use client";

import Link from "next/link";

interface SecondaryButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function SecondaryButton({ href, children, className = "" }: SecondaryButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("#");
  const Comp = isExternal ? "a" : Link;

  return (
    <Comp
      href={href}
      className={`w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-full border border-white/10 transition-colors duration-200 ${className}`}
    >
      <span className="text-[14px] font-bold tracking-[0.02em] leading-none">{children}</span>
      <svg className="w-4 h-4 text-[#E8C97A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </Comp>
  );
}

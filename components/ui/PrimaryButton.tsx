"use client";

import Link from "next/link";

interface PrimaryButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
}

export default function PrimaryButton({ href, children, className = "", target }: PrimaryButtonProps) {
  const isExternal = href.startsWith("http") || href.startsWith("mailto:");
  const Comp = isExternal ? "a" : Link;

  return (
    <Comp
      href={href}
      className={`w-full sm:w-auto bg-[#E8C97A] hover:bg-[#F0D898] text-[#071E4A] px-8 py-4 rounded-full font-bold text-[14px] leading-none tracking-[0.02em] transition-colors duration-200 inline-block text-center border border-[#E8C97A]/25 ${className}`}
      target={target || (isExternal ? "_blank" : undefined)}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </Comp>
  );
}

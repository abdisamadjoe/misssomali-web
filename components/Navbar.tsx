"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "The Process", href: "/#how-it-works" },
  { name: "Contestants", href: "/#contestants" },
  { name: "Events", href: "/#grand-finale" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blogs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Disable page scroll when mobile overlay is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (name: string) => {
    setActiveLink(name);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 py-3.5 backdrop-blur-xl transition-all duration-300 ${
          scrolled ? "bg-[#071E4A] shadow-md shadow-black/5" : "bg-[#071E4A]/70"
        }`}
      >
        <div className="grid-container">
          <div className="grid-12 items-center">
            {/* Logo: Columns 1-3 on Desktop, 1-6 on Mobile */}
            <div className="col-span-6 lg:col-span-3 flex items-center">
              <Link href="#home" className="flex items-center" onClick={() => handleLinkClick("Home")}>
                <Image
                  src="/logo.png"
                  alt="Miss Somali Logo"
                  width={170}
                  height={48}
                  priority
                  className="w-auto h-10 md:h-11 object-contain transition-transform duration-300 hover:scale-102"
                />
              </Link>
            </div>

            {/* Nav Links: Columns 4-9 (Desktop) */}
            <div className="hidden lg:flex lg:col-span-6 items-center justify-center space-x-2 xl:space-x-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => handleLinkClick(link.name)}
                  className={`group relative px-3 py-1.5 text-[13px] font-semibold tracking-[0.02em] leading-none transition-colors duration-200 ${
                    activeLink === link.name
                      ? "text-[#E8C97A]"
                      : "text-[#F5F0E8]/80 hover:text-[#E8C97A]"
                  }`}
                >
                  <span>{link.name}</span>
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#E8C97A] rounded-full transition-opacity duration-200 ${
                    activeLink === link.name ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`} />
                </a>
              ))}
            </div>

            {/* CTA Button: Columns 10-12 (Desktop) */}
            <div className="hidden lg:flex lg:col-span-3 items-center justify-end">
              <Link
                href="/portal"
                onClick={() => handleLinkClick("Apply")}
                className="bg-[#E8C97A] hover:bg-[#F0D898] text-[#071E4A] px-5 py-2.5 rounded-full font-bold text-[13px] leading-none tracking-[0.02em] transition-colors duration-200 inline-block text-center border border-[#E8C97A]/20"
              >
                Apply Now
              </Link>
            </div>

            {/* Hamburger Icon: Columns 7-12 (Mobile/Tablet) */}
            <div className="col-span-6 lg:hidden flex items-center justify-end">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-[#E8C97A] focus:outline-none z-50 p-2"
                aria-label="Toggle navigation menu"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span
                    className={`w-full h-0.5 bg-white transition-all duration-300 rounded ${
                      mobileMenuOpen ? "rotate-45 translate-y-2 bg-[#E8C97A]" : ""
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-white transition-all duration-300 rounded ${
                      mobileMenuOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-white transition-all duration-300 rounded ${
                      mobileMenuOpen ? "-rotate-45 -translate-y-2 bg-[#E8C97A]" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-Screen Overlay Menu (Mobile/Tablet) */}
      <div
        className={`fixed inset-0 bg-[#071E4A]/98 backdrop-blur-2xl z-40 lg:hidden flex flex-col justify-between pt-32 pb-12 px-6 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Stacked Links Center */}
        <div className="flex flex-col items-center justify-center flex-1 space-y-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => handleLinkClick(link.name)}
              className={`text-[14px] font-medium tracking-[0.02em] leading-none ${activeLink === link.name ? "text-[#E8C97A]" : "text-white/80 hover:text-white"}`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Gold CTA Button at Bottom */}
        <div className="flex justify-center">
          <Link
            href="/portal"
            onClick={() => handleLinkClick("Apply")}
            className="w-full max-w-xs bg-[#E8C97A] hover:bg-[#F0D898] text-[#071E4A] py-4 rounded-full font-bold text-[14px] leading-none tracking-[0.02em] text-center transition-colors duration-200"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </>
  );
}

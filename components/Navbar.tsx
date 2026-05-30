"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "The Journey", href: "#journey" },
  { name: "Contestants", href: "#contestants" },
  { name: "Apply", href: "#apply" },
  { name: "Events", href: "#events" },
  { name: "Media", href: "#media" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          scrolled
            ? "bg-[#071E4A]/80 border-b border-[#BF9200]/25 py-3.5 backdrop-blur-md shadow-2xl shadow-black/30"
            : "bg-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo Far Left */}
          <Link href="#home" className="flex items-center" onClick={() => handleLinkClick("Home")}>
            <Image
              src="/logo.png"
              alt="Miss Somali Logo"
              width={150}
              height={45}
              priority
              className="w-auto h-9 md:h-11 object-contain transition-transform duration-300 hover:scale-102"
            />
          </Link>

          {/* Nav Links Centered (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleLinkClick(link.name)}
                className="relative py-2 text-[14px] font-medium tracking-[0.02em] leading-none text-white hover:text-[#BF9200] transition-colors duration-200 group"
              >
                <span>{link.name}</span>
                <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#BF9200] to-transparent shadow-[0_0_8px_#BF9200] transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 ${
                  activeLink === link.name ? "scale-x-100" : ""
                }`} />
              </a>
            ))}
          </div>

          {/* CTA Button Far Right (Desktop) */}
          <div className="hidden lg:block">
            <a
              href="#apply"
              onClick={() => handleLinkClick("Apply")}
              className="bg-gradient-to-r from-[#BF9200] to-[#D4A800] hover:from-[#D4A800] hover:to-[#BF9200] text-white px-7 py-3 rounded-none font-bold text-[14px] leading-none tracking-[0.02em] transition-all duration-300 shadow-[0_4px_14px_rgba(191,146,0,0.35)] hover:shadow-[0_6px_20px_rgba(191,146,0,0.55)] hover:-translate-y-0.5 active:translate-y-0 inline-block text-center"
            >
              Apply Now
            </a>
          </div>

          {/* Hamburger Icon (Mobile/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:text-[#BF9200] focus:outline-none z-50 p-2"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-white transition-all duration-300 rounded ${
                  mobileMenuOpen ? "rotate-45 translate-y-2 bg-[#BF9200]" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white transition-all duration-300 rounded ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-full h-0.5 bg-white transition-all duration-300 rounded ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-2 bg-[#BF9200]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Full-Screen Overlay Menu (Mobile/Tablet) */}
      <div
        className={`fixed inset-0 bg-gradient-to-b from-[#071E4A] to-[#0B2D6B] z-40 lg:hidden flex flex-col justify-between pt-28 pb-12 px-6 transition-all duration-500 ease-in-out ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        {/* Stacked Links Center */}
        <div className="flex flex-col items-center justify-center flex-1 space-y-6">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => handleLinkClick(link.name)}
              style={{
                transitionDelay: mobileMenuOpen ? `${idx * 0.05}s` : "0s",
              }}
              className={`text-[14px] font-medium tracking-[0.02em] leading-none text-white hover:text-[#BF9200] transition-all duration-300 transform ${
                mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Gold CTA Button at Bottom */}
        <div
          className={`flex justify-center transition-all duration-500 transform ${
            mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: mobileMenuOpen ? "0.45s" : "0s" }}
        >
          <a
            href="#apply"
            onClick={() => handleLinkClick("Apply")}
            className="w-full max-w-xs bg-gradient-to-r from-[#BF9200] to-[#D4A800] text-white py-4 rounded-none font-bold text-[14px] leading-none tracking-[0.02em] text-center shadow-[0_4px_14px_rgba(191,146,0,0.3)] hover:shadow-[0_6px_20px_rgba(191,146,0,0.5)] transition-all duration-300"
          >
            Apply Now
          </a>
        </div>
      </div>
    </>
  );
}

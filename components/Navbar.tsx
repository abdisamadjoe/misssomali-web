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
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-[#071E4A] border-b border-[#BF9200]/30 py-4 shadow-lg"
            : "bg-transparent py-6 border-b border-transparent"
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
                className="relative py-2 text-[14px] font-medium tracking-[0.08em] uppercase text-white hover:text-[#BF9200] transition-colors duration-200"
              >
                {link.name}
                {activeLink === link.name && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#BF9200]" />
                )}
              </a>
            ))}
          </div>

          {/* CTA Button Far Right (Desktop) */}
          <div className="hidden lg:block">
            <a
              href="#apply"
              onClick={() => handleLinkClick("Apply")}
              className="bg-[#BF9200] text-white hover:bg-[#D4A800] px-6 py-2.5 rounded-sm font-bold text-[14px] uppercase tracking-[0.1em] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 inline-block"
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
        className={`fixed inset-0 bg-[#0B2D6B] z-40 lg:hidden flex flex-col justify-between pt-28 pb-12 px-6 transition-all duration-500 ease-in-out ${
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
              className={`text-lg md:text-xl font-medium tracking-[0.1em] uppercase text-white hover:text-[#BF9200] transition-all duration-300 transform ${
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
            className="w-full max-w-xs bg-[#BF9200] text-white hover:bg-[#D4A800] py-4 rounded-sm font-bold text-[14px] uppercase tracking-[0.1em] text-center shadow-lg transition-colors duration-300"
          >
            Apply Now
          </a>
        </div>
      </div>
    </>
  );
}

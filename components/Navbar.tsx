"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "The Journey", href: "#journey" },
  { name: "Contestants", href: "#contestants" },
  { name: "Events", href: "#events" },
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
        className="fixed top-0 left-0 w-full z-50 bg-[#1A0524]/85 border-b border-[#E8C97A]/25 py-2.5 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_30px_rgba(26,5,36,0.25)]"
      >
        <div className="w-full px-6 md:px-8 xl:px-12">
          <div className="grid-12 items-center">
            {/* Logo: Columns 1-3 on Desktop, 1-6 on Mobile */}
            <div className="col-span-6 lg:col-span-3 flex items-center">
              <Link href="#home" className="flex items-center" onClick={() => handleLinkClick("Home")}>
                <Image
                  src="/logo.png"
                  alt="Miss Somali Logo"
                  width={140}
                  height={40}
                  priority
                  className="w-auto h-8 md:h-9 object-contain transition-transform duration-300 hover:scale-102"
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
                  className={`relative px-3 py-1.5 text-[13px] font-semibold tracking-[0.02em] leading-none transition-all duration-300 rounded-full ${
                    activeLink === link.name
                      ? "text-[#E8C97A] bg-white/5"
                      : "text-[#F5F0E8]/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{link.name}</span>
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E8C97A] rounded-full shadow-[0_0_10px_#E8C97A] transition-all duration-300 ${
                    activeLink === link.name ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  }`} />
                </a>
              ))}
            </div>

            {/* CTA Button: Columns 10-12 (Desktop) */}
            <div className="hidden lg:flex lg:col-span-3 items-center justify-end">
              <a
                href="#apply"
                onClick={() => handleLinkClick("Apply")}
                className="relative bg-[linear-gradient(110deg,#E8C97A,45%,#F0D898,55%,#E8C97A)] bg-[length:200%_100%] animate-shimmer text-[#1A0524] px-5 py-2 rounded-full font-bold text-[13px] leading-none tracking-[0.02em] transition-all duration-300 shadow-[0_3px_15px_rgba(232,201,122,0.2)] hover:shadow-[0_6px_25px_rgba(232,201,122,0.35)] hover:-translate-y-0.5 active:translate-y-0 inline-block text-center border border-[#E8C97A]/20"
              >
                Apply Now
              </a>
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
        className={`fixed inset-0 bg-[#1A0524]/98 backdrop-blur-2xl z-40 lg:hidden flex flex-col justify-between pt-32 pb-12 px-6 transition-all duration-500 ease-in-out ${
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
              className={`text-[14px] font-medium tracking-[0.02em] leading-none transition-all duration-300 transform ${
                mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              } ${activeLink === link.name ? "text-[#E8C97A]" : "text-white/80 hover:text-white"}`}
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
            className="w-full max-w-xs bg-[linear-gradient(110deg,#E8C97A,45%,#F0D898,55%,#E8C97A)] bg-[length:200%_100%] animate-shimmer text-[#1A0524] py-4 rounded-full font-bold text-[14px] leading-none tracking-[0.02em] text-center shadow-[0_4px_14px_rgba(232,201,122,0.3)] hover:shadow-[0_6px_20px_rgba(232,201,122,0.5)] transition-all duration-300"
          >
            Apply Now
          </a>
        </div>
      </div>
    </>
  );
}

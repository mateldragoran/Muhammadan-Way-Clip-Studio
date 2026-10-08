"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "How It Works", href: "#workflow" },
    { name: "Features", href: "#features" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-ivory/90 backdrop-blur-md border-b border-sand/70 transition-all">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* 1. BRAND LOGO */}
        <Link 
          href="/" 
          className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink transition-opacity hover:opacity-85"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-soft-gold/20 border border-soft-gold/40 flex items-center justify-center text-soft-gold shadow-2xs shrink-0">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-heading text-[13px] xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold text-charcoal tracking-wide whitespace-nowrap">
              MuhammadanWay <span className="text-soft-gold font-normal">Clip Studio</span>
            </span>
          </div>
        </Link>

        {/* 2. DESKTOP CENTER NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-charcoal/60 hover:text-soft-gold transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* 3. RIGHT CALL-TO-ACTION & MOBILE BURGER */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Main CTA (Always visible, scales down on mobile) */}
          <Link href="/library">
            <Button
              variant="emerald"
              size="sm"
              className="shadow-level-1 text-[11px] sm:text-xs md:text-sm font-semibold px-2.5 sm:px-5 h-7 sm:h-10 whitespace-nowrap group flex items-center gap-1 sm:gap-1.5"
            >
              <span>Enter Studio</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Button>
          </Link>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-charcoal/70 hover:text-charcoal hover:bg-sand/30 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* ========================================= */}
      {/* MOBILE DROPDOWN MENU                      */}
      {/* ========================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-sand shadow-level-3 px-4 py-5 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-charcoal/80 hover:text-soft-gold transition-colors py-2.5 px-3 rounded-standard hover:bg-sand/20"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="pt-4 mt-2 border-t border-sand/60">
            <Link href="/library" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="emerald" size="lg" className="w-full justify-center shadow-level-1">
                <span>Enter Studio</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
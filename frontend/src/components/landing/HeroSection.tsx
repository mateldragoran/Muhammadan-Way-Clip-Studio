"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import HeroMockup from "@/components/landing/HeroMockup";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Stagger Entrance
    const ctx = gsap.context(() => {
      gsap.from(".hero-stagger", {
        y: 25,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: "power2.out",
      });

      gsap.from(".hero-mockup-anim", {
        scale: 0.92,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
        delay: 0.2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 lg:pt-16 pb-12 sm:pb-20 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HERO HEADLINE, MOBILE DEMO & CALL TO ACTION                  */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">

          {/* 1. Majestic Headline */}
          <h1 className="hero-stagger font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-semibold text-charcoal leading-[1.08] tracking-tight">
            Spread the Love of{" "}
            <span className="text-soft-gold font-normal italic">
              Sayyidina Muhammad ﷺ
            </span>{" "}
            Across the World.
          </h1>

          {/* 2. Heartfelt Subheadline */}
          <p className="hero-stagger text-charcoal/75 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl">
            Transform the profound teachings of{" "}
            <strong className="text-charcoal font-semibold">
              Mawlana Shaykh Nurjan Mirahmadi (Q)
            </strong>{" "}
            and heavenly spiritual nasheeds into viral vertical clips in seconds with the power of AI.
          </p>

          <p className="hero-stagger text-charcoal/60 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
            Or explore, download, and remix beautiful clips already created by our growing community to spread the light even faster.
          </p>

          {/* ======================================================================= */}
          {/* 3. MOBILE-ONLY VIDEO SHOWCASE (Positioned before CTA on phones)         */}
          {/* ======================================================================= */}
          <div className="hero-mockup-anim lg:hidden w-full py-8 my-4 pb-6 flex justify-center">
            <HeroMockup />
          </div>

          {/* 4. Primary Shimmering CTA & Secondary Action */}
          <div className="hero-stagger flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-1">
            
            {/* Main "Spread the Light" Button */}
            <Link href="/library" className="w-full sm:w-auto">
              <button
                type="button"
                className="relative overflow-hidden group w-full sm:w-auto bg-emerald-green text-ivory text-base sm:text-lg font-semibold px-8 py-4 rounded-large shadow-level-2 hover:bg-emerald-green/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-soft-gold/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                
                <Sparkles className="w-5 h-5 text-soft-gold animate-pulse" />
                <span>Spread the Light</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            {/* Secondary Action: Direct Link to Community Clips Tab */}
            <Link href="/library?tab=clips" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-base font-medium px-6 py-4 border-sand hover:bg-sand/30 text-charcoal"
              >
                Explore Community Clips
              </Button>
            </Link>
          </div>

          {/* 5. Trust Indicators (100% Free text removed) */}
          <div className="hero-stagger pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-charcoal/60">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-green" />
              <span>7 Languages Supported</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-green" />
              <span>Under 2 Minutes per Clip</span>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: DESKTOP-ONLY FLOATING 3D PHONE MOCKUP                       */}
        {/* ========================================================================= */}
        <div className="hero-mockup-anim hidden lg:flex lg:col-span-5 justify-center lg:justify-end">
          <HeroMockup />
        </div>

      </div>
    </section>
  );
}
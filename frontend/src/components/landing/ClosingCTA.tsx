"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export default function ClosingCTA() {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      // fromTo + once: true prevents freezing
      gsap.fromTo(
        ctaRef.current,
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            once: true,
          },
          clearProps: "opacity,transform",
        }
      );
    }, ctaRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div
        ref={ctaRef}
        className="relative overflow-hidden rounded-[32px] sm:rounded-[44px] bg-gradient-to-br from-[#0D7A5F] via-[#0A634D] to-[#063B2E] text-ivory p-8 sm:p-14 lg:p-20 shadow-2xl border border-emerald-green/40 text-center space-y-6 sm:space-y-8"
        style={{
          boxShadow: "0 25px 50px -12px rgba(13, 122, 95, 0.35), 0 0 50px rgba(199, 167, 90, 0.2)",
        }}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-soft-gold/25 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-green/40 blur-[100px] pointer-events-none" />
        
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="cta-lattice" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L60 30 L30 60 L0 30 Z M0 0 L60 60 M60 0 L0 60" fill="none" stroke="#FFFFFF" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-lattice)" />
        </svg>

        <div className="relative z-10 max-w-3xl mx-auto space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-ivory text-xs font-semibold uppercase tracking-widest backdrop-blur-md shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-soft-gold fill-soft-gold" />
            <span>Spiritual Service & Khidmah</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-[1.12] tracking-tight">
            Be a Beacon of Light. <br className="hidden sm:inline" />
            Create Your First Reminder Clip Today.
          </h2>

          <p className="text-ivory/85 text-sm sm:text-base lg:text-lg font-normal leading-relaxed max-w-2xl mx-auto">
            Join lovers and volunteers worldwide spreading the timeless teachings of Sayyidina Muhammad ﷺ and Mawlana Shaykh Nurjan Mirahmadi (Q).
          </p>

          <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/library" className="w-full sm:w-auto">
              <button
                type="button"
                className="relative group w-full sm:w-auto bg-ivory text-charcoal hover:bg-white text-base sm:text-lg font-semibold px-9 py-4 rounded-large shadow-level-3 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                <Sparkles className="w-5 h-5 text-soft-gold" />
                <span>Launch Studio Now</span>
                <ArrowRight className="w-5 h-5 text-emerald-green transform group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          
          {/* PRICING SUBTEXT REMOVED HERE */}

        </div>
      </div>
    </section>
  );
}
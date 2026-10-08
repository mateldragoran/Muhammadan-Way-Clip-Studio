"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Zap, Globe, Music, Scissors, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HeroMockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  
  const badge1Ref = useRef<HTMLDivElement>(null);
  const badge2Ref = useRef<HTMLDivElement>(null);
  const badge3Ref = useRef<HTMLDivElement>(null);
  const badge4Ref = useRef<HTMLDivElement>(null);

  // Simulated live Karaoke word cycle
  const [activeWordIndex, setActiveWordIndex] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % 3);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Organic Vertical Floating Bob for Phone
      gsap.to(phoneRef.current, {
        y: -14,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 2. Independent Floating Physics for Orbiting Badges
      gsap.to(badge1Ref.current, {
        y: -18,
        x: 6,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(badge2Ref.current, {
        y: 16,
        x: -8,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.4,
      });

      gsap.to(badge3Ref.current, {
        y: -12,
        x: -6,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.8,
      });

      gsap.to(badge4Ref.current, {
        y: 14,
        x: 8,
        duration: 6.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.2,
      });

      // 3. Desktop Interactive Mouse Parallax
      const handleMouseMove = (e: MouseEvent) => {
        if (window.innerWidth < 1024 || !phoneRef.current) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        gsap.to(phoneRef.current, {
          rotationY: -6 + x * 18,
          rotationX: 6 - y * 18,
          duration: 0.8,
          ease: "power2.out",
        });
      };

      const container = containerRef.current;
      container?.addEventListener("mousemove", handleMouseMove);

      return () => {
        container?.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px] mx-auto flex items-center justify-center py-6 sm:py-10"
      style={{ perspective: "1200px" }}
    >
      {/* ========================================================================= */}
      {/* 1. THE 3D SMARTPHONE CHASSIS                                              */}
      {/* ========================================================================= */}
      <div
        ref={phoneRef}
        className="relative w-[260px] sm:w-[290px] lg:w-[310px] aspect-[9/16] rounded-[42px] bg-charcoal p-3 shadow-2xl border-[4px] border-[#383838] transition-transform duration-100 will-change-transform lg:rotate-y-[-6deg] lg:rotate-x-[6deg]"
        style={{
          boxShadow: "0 25px 50px -12px rgba(35, 35, 35, 0.35), 0 0 40px rgba(13, 122, 95, 0.15)",
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 flex items-center justify-end px-2">
          <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
        </div>

        {/* Screen Frame */}
        <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-black flex flex-col justify-between p-3 select-none">
          
          {/* ===================================================================== */}
          {/* MAWLANA SHAYKH NURJAN (Q) IMAGE OVERLAY                               */}
          {/* Drops inside frontend/public/shaykh-nurjan.jpg (or replace src URL)   */}
          {/* ===================================================================== */}
          <img
            src="/shaykh-nurjan.jpg"
            onError={(e) => {
              // Fallback to official thumbnail if local file isn't dropped in yet
              (e.target as HTMLImageElement).src = "https://database.tauheedakbar.com/storage/v1/object/public/source-videos/thumbnail.png";
            }}
            alt="Mawlana Shaykh Nurjan Mirahmadi (Q)"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

          {/* Top In-App Status Bar */}
          <div className="relative z-20 flex items-center justify-between pt-4 px-1">
            <span className="text-[8px] font-heading tracking-widest uppercase text-ivory/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-ivory/15 shadow-xs">
              Muhammadan Way
            </span>
            
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 text-white/70 text-[9px]">
              <Volume2 className="w-3 h-3 text-soft-gold" />
            </div>
          </div>

          {/* Bottom In-App Dynamic Subtitle Karaoke Preview */}
          <div className="relative z-20 pb-5 px-1 space-y-2 text-center">
            {/* Live Subtitle Box */}
            <div className="bg-black/80 backdrop-blur-md border border-soft-gold/30 rounded-standard p-2.5 shadow-lg">
              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed tracking-wide">
                <span className={cn("transition-colors duration-300", activeWordIndex === 0 ? "text-soft-gold drop-shadow-[0_0_8px_rgba(199,167,90,0.8)]" : "text-white")}>
                  When you focus
                </span>{" "}
                <span className={cn("transition-colors duration-300", activeWordIndex === 1 ? "text-soft-gold drop-shadow-[0_0_8px_rgba(199,167,90,0.8)]" : "text-white")}>
                  on the HEART,
                </span>{" "}
                <span className={cn("transition-colors duration-300", activeWordIndex === 2 ? "text-soft-gold drop-shadow-[0_0_8px_rgba(199,167,90,0.8)]" : "text-white")}>
                  peace descends. ✨
                </span>
              </p>
            </div>

            {/* In-App Live Badge */}
            <div className="flex items-center justify-center gap-2 text-[9px] text-ivory/70 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-green animate-ping" />
              <span>9:16 HD Export Ready</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORBITING FROSTED-GLASS FEATURE BADGES (GSAP Animated)                  */}
      {/* ========================================================================= */}

      {/* Badge 1: Top Left - 1-Click AI Highlights */}
      <div
        ref={badge1Ref}
        className="absolute -top-3 -left-4 sm:-left-10 z-30 bg-white/90 backdrop-blur-md border border-sand/80 rounded-full px-3.5 py-2 shadow-level-2 flex items-center gap-2 select-none"
      >
        <div className="w-6 h-6 rounded-full bg-soft-gold/20 flex items-center justify-center text-soft-gold shrink-0">
          <Zap className="w-3.5 h-3.5 fill-soft-gold/30" />
        </div>
        <span className="text-xs font-semibold text-charcoal whitespace-nowrap">
          1-Click AI Highlights
        </span>
      </div>

      {/* Badge 2: Top Right - 7 Languages */}
      <div
        ref={badge2Ref}
        className="absolute top-12 -right-4 sm:-right-10 z-30 bg-white/90 backdrop-blur-md border border-sand/80 rounded-full px-3.5 py-2 shadow-level-2 flex items-center gap-2 select-none"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-green/15 flex items-center justify-center text-emerald-green shrink-0">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-charcoal whitespace-nowrap">
            7 Built-In Languages
          </span>
          <span className="text-[9px] text-charcoal/50 leading-none">
            Urdu • Arabic • Persian...
          </span>
        </div>
      </div>

      {/* Badge 3: Bottom Left - Ambient Audio */}
      <div
        ref={badge3Ref}
        className="absolute bottom-16 -left-6 sm:-left-12 z-30 bg-white/90 backdrop-blur-md border border-sand/80 rounded-full px-3.5 py-2 shadow-level-2 flex items-center gap-2 select-none"
      >
        <div className="w-6 h-6 rounded-full bg-info-blue/15 flex items-center justify-center text-info-blue shrink-0">
          <Music className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-charcoal whitespace-nowrap">
          Spiritual Ambient Tracks
        </span>
      </div>

      {/* Badge 4: Bottom Right - Zero Editing Skills */}
      <div
        ref={badge4Ref}
        className="absolute -bottom-4 -right-4 sm:-right-8 z-30 bg-charcoal text-ivory border border-sand/30 rounded-full px-3.5 py-2 shadow-level-3 flex items-center gap-2 select-none"
      >
        <div className="w-6 h-6 rounded-full bg-soft-gold/20 flex items-center justify-center text-soft-gold shrink-0">
          <Scissors className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-ivory whitespace-nowrap">
          Zero Editing Skills Needed
        </span>
      </div>

    </div>
  );
}
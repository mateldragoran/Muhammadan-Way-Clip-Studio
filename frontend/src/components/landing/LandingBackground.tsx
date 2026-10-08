"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function LandingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const emeraldOrbRef = useRef<HTMLDivElement>(null);
  const goldOrbRef = useRef<HTMLDivElement>(null);
  const ambientCenterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Animation Context for smooth cleanup
    const ctx = gsap.context(() => {
      // 1. Soft floating & breathing for Emerald Green Aura
      gsap.to(emeraldOrbRef.current, {
        x: "40px",
        y: "-30px",
        scale: 1.18,
        opacity: 0.85,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 2. Soft floating & breathing for Soft Gold Aura
      gsap.to(goldOrbRef.current, {
        x: "-50px",
        y: "40px",
        scale: 1.22,
        opacity: 0.75,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });

      // 3. Central ambient spiritual glow pulse
      gsap.to(ambientCenterRef.current, {
        scale: 1.12,
        opacity: 0.6,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-ivory select-none"
      aria-hidden="true"
    >
      {/* ========================================================================= */}
      {/* 1. SACRED ISLAMIC GEOMETRIC STAR-LATTICE (Tiling Vector Pattern)          */}
      {/* ========================================================================= */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="sacred-islamic-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* 8-Point Star Geometry & Octagonal Lattice Lines */}
            <path
              d="M40 0 L80 40 L40 80 L0 40 Z M0 0 L80 80 M80 0 L0 80 M20 20 L60 20 L60 60 L20 60 Z M40 10 L70 40 L40 70 L10 40 Z"
              fill="none"
              stroke="#232323"
              strokeWidth="1"
            />
            <circle cx="40" cy="40" r="8" fill="none" stroke="#232323" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sacred-islamic-pattern)" />
      </svg>

      {/* ========================================================================= */}
      {/* 2. GLOWING RADIAL AURAS (GSAP Animated Glow Orbs)                         */}
      {/* ========================================================================= */}
      
      {/* Emerald Green Light Aura (Top Left / Center) */}
      <div
        ref={emeraldOrbRef}
        className="absolute -top-[10%] left-[5%] w-[450px] sm:w-[600px] lg:w-[750px] h-[450px] sm:h-[600px] lg:h-[750px] rounded-full bg-emerald-green/12 blur-[100px] sm:blur-[140px] md:blur-[170px]"
      />

      {/* Soft Gold Light Aura (Top Right / Center) */}
      <div
        ref={goldOrbRef}
        className="absolute top-[10%] -right-[5%] w-[400px] sm:w-[550px] lg:w-[700px] h-[400px] sm:h-[550px] lg:h-[700px] rounded-full bg-soft-gold/15 blur-[90px] sm:blur-[130px] md:blur-[160px]"
      />

      {/* Central Ambient Hearth Glow */}
      <div
        ref={ambientCenterRef}
        className="absolute top-[40%] left-[25%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-forest-green/8 blur-[120px] sm:blur-[150px]"
      />

      {/* Soft Vignette Overlay to blend seamlessly into page edges */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-ivory/80" />
    </div>
  );
}
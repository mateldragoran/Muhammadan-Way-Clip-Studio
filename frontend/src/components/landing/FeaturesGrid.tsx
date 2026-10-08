"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Sparkles, 
  Globe, 
  Music, 
  Palette, 
  Zap, 
  Check, 
  Maximize, 
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

const languagePills = [
  { name: "English", native: "English" },
  { name: "Urdu", native: "اردو" },
  { name: "Arabic", native: "العربية" },
  { name: "Persian", native: "فارسی" },
  { name: "Turkish", native: "Türkçe" },
  { name: "Spanish", native: "Español" },
  { name: "Hindi", native: "हिन्दी" },
];

const filterSwatches = [
  { name: "Original", bg: "bg-sand" },
  { name: "Warm", bg: "bg-gradient-to-tr from-amber-500 to-orange-400" },
  { name: "Cinematic", bg: "bg-gradient-to-tr from-cyan-700 to-amber-600" },
  { name: "Moody", bg: "bg-gradient-to-tr from-slate-800 to-gray-600" },
  { name: "Vibrant", bg: "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500" },
];

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      // fromTo + once: true prevents cards from freezing at partial opacity
      gsap.fromTo(
        ".feature-card",
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.75,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true, // Guarantees 100% completion
          },
          clearProps: "opacity,transform", // Cleans up inline styles when done
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      {/* 1. CLEAN SECTION HEADER */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal tracking-tight">
          Engineered for Divine Wisdom & Viral Retention.
        </h2>

        <p className="text-charcoal/70 text-sm sm:text-base lg:text-lg leading-relaxed">
          Every tool is specifically designed to remove creative friction while ensuring your exported reminders look and feel like official broadcast-level productions.
        </p>
      </div>

      {/* 2. THE 4 FEATURE CARDS (2x2 Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* CARD 1: AI HIGHLIGHT FINDER */}
        <div className="feature-card group relative bg-white rounded-large border border-sand p-6 sm:p-8 flex flex-col justify-between shadow-level-1 hover:shadow-level-3 hover:border-soft-gold/60 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-standard bg-soft-gold/20 text-soft-gold border border-soft-gold/40 flex items-center justify-center shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-soft-gold/15 text-charcoal border border-soft-gold/30">
                10m ➔ 5s Selection
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-semibold text-charcoal">
                1-Click AI Highlight Detection
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Powered by high-speed AI to scan hours of lecture transcripts and spiritual lyrics. It pinpoints self-contained spiritual lessons and viral choruses, snapping the timeline handles in a single tap.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sand/60">
            <div className="p-3 bg-sand/25 rounded-standard border border-sand flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-charcoal truncate">"The Secret of Patience"</p>
                <p className="text-[10px] text-charcoal/50 font-mono">01:15 — 02:00 (45s Clip)</p>
              </div>
              <div className="px-2.5 py-1 bg-soft-gold text-charcoal text-[11px] font-semibold rounded shadow-xs flex items-center gap-1 shrink-0">
                <Zap className="w-3 h-3 fill-charcoal" /> Auto-Trimmed
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: 7 UNIVERSAL LANGUAGES */}
        <div className="feature-card group relative bg-white rounded-large border border-sand p-6 sm:p-8 flex flex-col justify-between shadow-level-1 hover:shadow-level-3 hover:border-emerald-green/60 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-standard bg-emerald-green/15 text-emerald-green border border-emerald-green/30 flex items-center justify-center shadow-xs">
                <Globe className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-green/10 text-emerald-green border border-emerald-green/25">
                RTL & UTF-8 Certified
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-semibold text-charcoal">
                7 Built-In Global Languages
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Break language barriers with built-in pre-timed subtitles. Features full native Right-to-Left (RTL) typography for Arabic, Urdu, and Persian, plus Turkish, Spanish, Hindi, and English.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sand/60">
            <div className="flex flex-wrap gap-1.5">
              {languagePills.map((lang, idx) => (
                <span
                  key={lang.name}
                  className={cn(
                    "text-[11px] font-medium px-2.5 py-1 rounded-full border shadow-2xs",
                    idx === 0 
                      ? "bg-charcoal text-ivory border-charcoal" 
                      : idx === 1 || idx === 2 || idx === 3
                      ? "bg-emerald-green/10 text-emerald-green border-emerald-green/30"
                      : "bg-sand/30 text-charcoal/70 border-sand"
                  )}
                >
                  {lang.native} ({lang.name})
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: CURATED SPIRITUAL AUDIO */}
        <div className="feature-card group relative bg-white rounded-large border border-sand p-6 sm:p-8 flex flex-col justify-between shadow-level-1 hover:shadow-level-3 hover:border-info-blue/60 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-standard bg-info-blue/15 text-info-blue border border-info-blue/30 flex items-center justify-center shadow-xs">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-info-blue/10 text-info-blue border border-info-blue/25">
                Auto-Looping & Mixing
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-semibold text-charcoal">
                Curated Spiritual Soundscapes
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Choose from our pre-approved library of peaceful ambient zikr, ney flutes, and spiritual melodies. Tracks auto-lock to your video trim boundaries and loop seamlessly in the background.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sand/60">
            <div className="p-3 bg-white border border-sand rounded-standard shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="flex items-center gap-1.5 text-charcoal">
                  <Headphones className="w-3.5 h-3.5 text-info-blue" /> Soft Flute & Ambient Zikr
                </span>
                <span className="text-info-blue font-mono">10% Vol</span>
              </div>
              <div className="w-full h-1.5 bg-sand/60 rounded-full overflow-hidden">
                <div className="w-[10%] h-full bg-info-blue rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: COLOR GRADING & CAMERA PAN */}
        <div className="feature-card group relative bg-white rounded-large border border-sand p-6 sm:p-8 flex flex-col justify-between shadow-level-1 hover:shadow-level-3 hover:border-soft-gold/60 transition-all duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-standard bg-soft-gold/20 text-soft-gold border border-soft-gold/40 flex items-center justify-center shadow-xs">
                <Palette className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-soft-gold/15 text-charcoal border border-soft-gold/30">
                Broadcast Grade FFmpeg
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-semibold text-charcoal">
                Cinematic Color Filters & Camera Pan
              </h3>
              <p className="text-sm text-charcoal/70 leading-relaxed">
                Elevate video aesthetics with Warm, Moody, Vibrant, and Cinematic color grades, paired with an intuitive Camera Pan slider to frame the speaker perfectly in 9:16 portrait mode.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-sand/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {filterSwatches.map((f, i) => (
                  <div
                    key={f.name}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 shadow-2xs flex items-center justify-center",
                      f.bg,
                      i === 2 ? "border-charcoal scale-110" : "border-white"
                    )}
                    title={f.name}
                  >
                    {i === 2 && <Check className="w-3 h-3 text-white drop-shadow-xs" />}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal/60">
                <Maximize className="w-3 h-3 text-soft-gold" /> Pan: Center (50%)
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
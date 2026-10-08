"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Clapperboard, 
  Sparkles, 
  Send, 
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const workflowSteps = [
  {
    stepNumber: "01",
    badge: "Discovery",
    title: "Choose the Wisdom",
    description:
      "Browse our library of the latest full-length lectures and heavenly spiritual nasheeds from Mawlana Shaykh Nurjan Mirahmadi (Q).",
    icon: Clapperboard,
    accentColor: "gold",
    highlights: ["Lecture archive updated weekly", "Latest spiritual nasheeds", "Seamless clip discovery"],
  },
  {
    stepNumber: "02",
    badge: "Creation",
    title: "Shape the Reminder",
    description:
      "Let 1-click AI highlights find the viral moments, adjust your camera framing, or translate lyrics into Urdu, Arabic, Persian & more.",
    icon: Sparkles,
    accentColor: "emerald",
    highlights: ["1-Click AI Highlight Snapping", "Horizontal Camera Pan", "7 Universal Languages"],
  },
  {
    stepNumber: "03",
    badge: "Publication",
    title: "Spread the Light",
    description:
      "Export HD 9:16 vertical videos with ready-to-copy AI viral captions and hashtags for TikTok & Reels.",
    icon: Send,
    accentColor: "emerald",
    highlights: ["High-Quality MP4 Downloads", "AI Social Media Copywriter", "Auto-Looping Ambient Audio"],
  },
];

export default function WorkflowSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      // fromTo + once: true prevents cards from freezing at partial opacity
      gsap.fromTo(
        ".workflow-card",
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
      id="workflow"
      ref={sectionRef}
      className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
    >
      {/* ========================================================================= */}
      {/* 1. CLEAN SECTION HEADER                                                   */}
      {/* ========================================================================= */}
      <div className="text-center space-y-3 max-w-3xl mx-auto mb-12 sm:mb-16">
        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal tracking-tight">
          From Sacred Teaching to Viral Reminder in Seconds.
        </h2>

        <p className="text-charcoal/70 text-sm sm:text-base lg:text-lg leading-relaxed">
          No timelines, no layers, and no video editing experience required. The studio does the heavy lifting so you can focus on sharing beneficial knowledge.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 3 WORKFLOW CARDS                                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
        {workflowSteps.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.stepNumber}
              className={cn(
                "workflow-card group relative bg-white/90 backdrop-blur-md rounded-large border border-sand p-6 sm:p-8 flex flex-col justify-between shadow-level-1 hover:shadow-level-3 hover:border-soft-gold/60 transition-all duration-300 hover:-translate-y-1.5",
                index === 1 && "md:translate-y-2" // Subtle staggering rhythm
              )}
            >
              {/* Giant Watermark Step Number in Background (Top Right) */}
              <span className="absolute top-4 right-6 font-heading text-6xl sm:text-7xl font-bold text-sand/30 select-none pointer-events-none group-hover:text-soft-gold/15 transition-colors">
                {item.stepNumber}
              </span>

              {/* Card Header & Content */}
              <div className="space-y-4 relative z-10">
                
                {/* OVERLAP FIX: Moved the badge to sit next to the icon so it doesn't overlap the watermark number! */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-standard flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110 shrink-0",
                      item.accentColor === "gold"
                        ? "bg-soft-gold/20 text-soft-gold border border-soft-gold/40"
                        : "bg-emerald-green/15 text-emerald-green border border-emerald-green/30"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sand/40 text-charcoal/70 border border-sand">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <h3 className="font-heading text-2xl font-semibold text-charcoal">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="pt-6 mt-6 border-t border-sand/60 space-y-2 relative z-10">
                {item.highlights.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs text-charcoal/80">
                    <Check className="w-3.5 h-3.5 text-emerald-green shrink-0 stroke-[2.5]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
"use client";

import LandingBackground from "@/components/landing/LandingBackground";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ClosingCTA from "@/components/landing/ClosingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-ivory text-charcoal flex flex-col selection:bg-soft-gold/30 selection:text-charcoal overflow-x-hidden">
      
      {/* 1. Ambient Sacred Glowing Auras & Islamic Lattice Background */}
      <LandingBackground />

      {/* 2. Glassmorphic Landing Navigation Bar */}
      <LandingNavbar />

      {/* 3. Main Landing Sections */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full">
        {/* Hero Section with 3D Phone Showcase */}
        <HeroSection />

        {/* 3-Step Sacred Workflow Cards */}
        <WorkflowSection />

        {/* Deep Feature Capabilities Grid */}
        <FeaturesGrid />

        {/* Grand Closing Call to Action Banner */}
        <ClosingCTA />
      </main>

      {/* 4. Respectful Spiritual Footer */}
      <LandingFooter />

    </div>
  );
}
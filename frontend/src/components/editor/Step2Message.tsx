"use client";

import LanguageSelector from "@/components/editor/LanguageSelector";
import CaptionReviewer from "@/components/editor/CaptionReviewer";
import { Globe } from "lucide-react";

export default function Step2Message() {
  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-200">
      
      {/* Header (Hidden on Mobile to save vertical space!) */}
      <div className="px-1 space-y-1 hidden md:block">
        <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Globe className="w-5 h-5 text-soft-gold" />
          2. Choose Language
        </h3>
        <p className="text-xs sm:text-sm text-charcoal/60 leading-relaxed">
          Pick the language you want for the subtitles and fix any spelling mistakes in the text below.
        </p>
      </div>

      {/* 1. Subtitle Language & Visibility Controls */}
      <div className="bg-white rounded-large p-3 md:p-5 border border-sand shadow-level-1">
        <LanguageSelector />
      </div>

      {/* 2. Review & Edit Transcript */}
      <div className="bg-white rounded-large p-3 md:p-5 border border-sand shadow-level-1">
        <CaptionReviewer />
      </div>

    </div>
  );
}
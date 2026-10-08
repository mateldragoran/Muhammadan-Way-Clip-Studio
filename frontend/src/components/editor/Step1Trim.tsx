"use client";

import { useEditorStore } from "@/store/useEditorStore";
import HighlightFinder from "@/components/editor/HighlightFinder";
import Timeline from "@/components/editor/Timeline";
import { Scissors } from "lucide-react";

export default function Step1Trim() {
  const { sourceVideo } = useEditorStore();

  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-200">
      
      {/* 1. Header (Hidden on Mobile to save space!) */}
      <div className="px-1 space-y-1 hidden md:block">
        <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Scissors className="w-5 h-5 text-soft-gold" />
          1. Select the Moment
        </h3>
        <p className="text-xs sm:text-sm text-charcoal/60 leading-relaxed">
          Choose the best part of the video and use the slider under the preview to center the speaker.
        </p>
      </div>

      {/* 2. AI Highlight Finder */}
      <div className="bg-white rounded-large p-4 md:p-5 border border-sand shadow-level-1">
        <HighlightFinder />
      </div>

      {/* 3. Timeline Editor (Tighter mobile padding) */}
      <div className="bg-white rounded-large p-3 md:p-5 border border-sand shadow-level-1">
        <Timeline />
      </div>

    </div>
  );
}
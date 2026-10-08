"use client";

import AudioTray from "@/components/editor/AudioTray";
import { Music } from "lucide-react";

export default function Step4Audio() {
  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-200">
      
      {/* Header (Hidden on Mobile to save vertical space!) */}
      <div className="px-1 space-y-1 hidden md:block">
        <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Music className="w-5 h-5 text-soft-gold" />
          4. Add Music
        </h3>
        <p className="text-xs sm:text-sm text-charcoal/60 leading-relaxed">
          Pick a track from our library or add your own music to play softly in the background.
        </p>
      </div>

      {/* Audio Selection & Controls */}
      <div className="bg-white rounded-large p-3 md:p-5 border border-sand shadow-level-1">
        <AudioTray />
      </div>

    </div>
  );
}
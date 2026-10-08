"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { Type, Play, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTimecode(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  // Add .toString() to s before calling padStart
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const languageNames: Record<string, string> = {
  en: "English", ur: "Urdu", es: "Spanish", tr: "Turkish",
  ar: "Arabic", hi: "Hindi", fa: "Persian",
};

export default function CaptionReviewer() {
  const { 
    captions, currentTime, updateCaption, setCurrentTime, showCaptions, selectedLanguage, trimStart, trimEnd
  } = useEditorStore();

  // Filter captions to only show those that overlap with the selected clip
  const filteredCaptions = captions.filter(c => c.endTime >= trimStart && c.startTime <= trimEnd);

  const isRtl = selectedLanguage === "ar" || selectedLanguage === "ur" || selectedLanguage === "fa";
  const activeLangLabel = languageNames[selectedLanguage] || "English";

  if (!filteredCaptions || filteredCaptions.length === 0) {
    return (
      <div className="p-4 text-center bg-sand/20 rounded-standard border border-sand space-y-1">
        <Type className="w-5 h-5 text-charcoal/30 mx-auto mb-1.5" />
        <h4 className="font-medium text-charcoal text-xs md:text-sm">No {activeLangLabel} Subtitles</h4>
        <p className="text-[10px] md:text-xs text-charcoal/50 max-w-xs mx-auto">
          No caption lines were uploaded for {activeLangLabel}. Switch language above to view available subtitles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      
      {/* OFF-STATE NOTIFICATION */}
      {!showCaptions && (
        <div className="p-2 bg-sand/30 border border-sand rounded-standard text-[10px] md:text-xs text-charcoal/70 flex items-start gap-1.5 leading-relaxed">
          <EyeOff className="w-3.5 h-3.5 text-charcoal/40 shrink-0 mt-0.5" />
          <p>Subtitles are toggled <strong>Off</strong>. You can still review and edit your {activeLangLabel} text below.</p>
        </div>
      )}

      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-soft-gold" />
          <h3 className="font-medium text-xs md:text-sm text-charcoal">
            Review {activeLangLabel} Captions
          </h3>
        </div>
        <span className="text-[9px] md:text-[10px] bg-sand/50 text-charcoal/70 px-2 py-0.5 rounded-full font-medium shrink-0">
          {filteredCaptions.length} lines
        </span>
      </div>

      {/* SCROLLING CAPTIONS LIST (Hyper-compact layout for mobile) */}
      <div className="space-y-1.5 max-h-[35vh] md:max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
        {filteredCaptions.map((item) => {
          const isActive = currentTime >= item.startTime && currentTime <= item.endTime;

          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-1.5 p-1.5 md:p-2 rounded-standard border transition-all duration-150",
                isActive
                  ? "bg-soft-gold/15 border-soft-gold shadow-sm"
                  : "bg-white border-sand hover:border-sand/80"
              )}
            >
              {/* Ultra-compact Jump Button */}
              <button
                type="button"
                onClick={() => setCurrentTime(item.startTime)}
                className={cn(
                  "shrink-0 text-[9px] md:text-[10px] font-mono px-1.5 py-1 rounded transition-colors flex items-center gap-0.5 active:scale-95",
                  isActive
                    ? "bg-soft-gold text-charcoal font-bold"
                    : "bg-sand/40 text-charcoal/60 hover:bg-sand"
                )}
                title="Jump video to this timestamp"
              >
                <Play className="w-2 h-2 fill-current" />
                {formatTimecode(item.startTime)}
              </button>

              {/* Tightly padded Editable Text Field */}
              <input
                type="text"
                dir={isRtl ? "rtl" : "ltr"}
                value={item.text}
                onChange={(e) => updateCaption(item.id, e.target.value)}
                className={cn(
                  "flex-1 bg-transparent text-xs md:text-sm text-charcoal font-medium border-b border-transparent focus:border-soft-gold focus:outline-none px-1 py-0.5 transition-colors",
                  isRtl && "text-right"
                )}
              />
            </div>
          );
        })}
      </div>

    </div>
  );
}
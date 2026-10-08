"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { 
  TemplateType, FontSize, CaptionBg, HighlightColor, VideoFilter 
} from "@/types";
import { 
  Palette, Sparkles, MessageSquareText, Film, Check, Settings2,
  Type, TypeOutline, AlignCenter, LayoutTemplate, MonitorPlay
} from "lucide-react";
import { cn } from "@/lib/utils";

const templates: { id: TemplateType; name: string; description: string; icon: React.ElementType }[] = [
  { id: "dynamic", name: "Dynamic Focus", description: "Bold text & dark box. High retention.", icon: MessageSquareText },
  { id: "classic", name: "Classic Lower-Third", description: "Elegant text on a dark gradient.", icon: MonitorPlay },
  { id: "minimal", name: "Minimalist", description: "Clean text with a soft shadow.", icon: Sparkles },
  { id: "cinematic", name: "Cinematic Clean", description: "Cinematic color with elegant text.", icon: Film },
];

const filters: { id: VideoFilter; name: string; bgClass: string }[] = [
  { id: "none", name: "Original", bgClass: "bg-sand" },
  { id: "warm", name: "Warm", bgClass: "bg-gradient-to-tr from-amber-500 to-orange-400" },
  { id: "cinematic", name: "Cinematic", bgClass: "bg-gradient-to-tr from-cyan-700 to-amber-600" },
  { id: "moody", name: "Moody", bgClass: "bg-gradient-to-tr from-slate-800 to-gray-600" },
  { id: "vibrant", name: "Vibrant", bgClass: "bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500" },
];

export default function TemplateSelector() {
  const { 
    template, setTemplate,
    uppercaseOnly, setUppercaseOnly,
    fontSize, setFontSize,
    captionBg, setCaptionBg,
    highlightColor, setHighlightColor,
    videoFilter, setVideoFilter,
    karaokeEnabled, setKaraokeEnabled,
    sourceVideo
  } = useEditorStore();

  const isMusicMode = sourceVideo?.category === "music";

  return (
    <div className="space-y-5 md:space-y-6">
      
      {/* ========================================= */}
      {/* 1. BASE TEMPLATES (Horizontal Carousel)   */}
      {/* ========================================= */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-medium text-xs md:text-sm text-charcoal flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 md:w-4 md:h-4 text-soft-gold" />
            Base Templates
          </h3>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 pb-3 pt-1 px-1">
          {templates.map((option) => {
            const isSelected = template === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => setTemplate(option.id)}
                className={cn(
                  "w-full flex flex-col p-3 rounded-large border transition-all duration-200 text-left active:scale-[0.98] select-none",
                  isSelected
                    ? "bg-soft-gold/10 border-soft-gold shadow-sm ring-1 ring-soft-gold/30"
                    : "bg-white border-sand hover:border-soft-gold/40 shadow-2xs"
                )}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? "bg-soft-gold text-charcoal" : "bg-sand/40 text-charcoal/60"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-soft-gold" />}
                </div>

                <div className="space-y-1">
                  <h4 className={cn("font-semibold text-xs md:text-sm leading-tight", isSelected ? "text-charcoal" : "text-charcoal/80")}>
                    {option.name}
                  </h4>
                  <p className="text-[9px] md:text-[10px] text-charcoal/60 leading-snug line-clamp-2">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================= */}
      {/* 2. CUSTOM ADJUSTMENTS (MICRO-TWEAKS)      */}
      {/* ========================================= */}
      <div className="pt-4 border-t border-sand/60 space-y-4">
        <div className="flex items-center gap-1.5 px-1">
          <Settings2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-charcoal/50" />
          <h3 className="font-medium text-xs md:text-sm text-charcoal/80">Custom Adjustments</h3>
        </div>

        {/* Video Filters */}
        <div className="space-y-1.5">
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-charcoal/50 px-1">Video Filter</span>
          <div className="flex flex-wrap items-center gap-4 md:gap-3 pb-2 px-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setVideoFilter(f.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 group active:scale-95 transition-transform"
              >
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all shadow-sm",
                  f.bgClass,
                  videoFilter === f.id ? "border-charcoal ring-2 ring-soft-gold/30 scale-110" : "border-white group-hover:border-sand"
                )}>
                  {videoFilter === f.id && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                </div>
                <span className={cn("text-[9px] md:text-[10px] font-medium transition-colors", videoFilter === f.id ? "text-charcoal" : "text-charcoal/50")}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle Styling (Only show if not in Cinematic Mode or if editing a lecture) */}
        {(template !== "cinematic" || !isMusicMode) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
            
            {/* Typography / Font Size & Uppercase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">Font Size</span>
                
                {/* Uppercase Toggle */}
                <button
                  onClick={() => setUppercaseOnly(!uppercaseOnly)}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <div className={cn("w-6 h-3.5 md:w-7 md:h-4 rounded-full transition-colors flex items-center px-0.5", uppercaseOnly ? "bg-soft-gold" : "bg-sand/60")}>
                    <div className={cn("w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white transition-transform", uppercaseOnly ? "translate-x-2.5 md:translate-x-3" : "translate-x-0")} />
                  </div>
                  <span className={cn("text-[9px] md:text-[10px] font-medium", uppercaseOnly ? "text-charcoal" : "text-charcoal/60")}>Uppercase Only</span>
                </button>
              </div>
              
              <div className="flex bg-sand/30 p-1 rounded-standard border border-sand/50">
                {(["sm", "md", "lg"] as FontSize[]).map((s) => (
                  <button key={s} onClick={() => setFontSize(s)} className={cn("flex-1 text-[10px] md:text-xs py-2 rounded font-medium uppercase transition-colors", fontSize === s ? "bg-white text-charcoal shadow-sm border border-sand/50" : "text-charcoal/60 hover:text-charcoal")}>
                    {s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Backdrop */}
            <div className="space-y-1.5">
              <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-charcoal/50 px-1">Background Style</span>
              <div className="flex gap-1.5 bg-sand/30 p-1 rounded-standard border border-sand/50">
                {(["none", "shadow", "box", "gradient"] as CaptionBg[]).map((bg) => (
                  <button key={bg} onClick={() => setCaptionBg(bg)} className={cn("flex-1 text-[10px] md:text-xs py-1.5 rounded font-medium capitalize transition-colors flex items-center justify-center gap-1.5", captionBg === bg ? "bg-white text-charcoal shadow-sm border border-sand/50" : "text-charcoal/60 hover:text-charcoal")}>
                    {bg === "none" && <TypeOutline className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                    {bg === "shadow" && <Type className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                    {bg === "box" && <LayoutTemplate className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                    {bg === "gradient" && <AlignCenter className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                    <span className="hidden xs:inline">{bg}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Karaoke Toggle & Highlight Color */}
            <div className="space-y-3 sm:col-span-2 pt-3 border-t border-sand/30">
              <div 
                onClick={() => setKaraokeEnabled(!karaokeEnabled)}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-standard border cursor-pointer transition-all active:scale-[0.98]",
                  karaokeEnabled ? "bg-soft-gold/5 border-soft-gold/30" : "bg-sand/20 border-sand"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                    Spoken Word Highlight <span className="text-[10px] bg-charcoal/5 px-1.5 py-0.5 rounded text-charcoal/60 font-mono">Karaoke</span>
                  </span>
                  <span className="text-[10px] text-charcoal/50 leading-tight mt-0.5">
                    Highlights the active word as it is spoken.
                  </span>
                </div>
                <div className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 shadow-inner",
                  karaokeEnabled ? "bg-soft-gold" : "bg-sand/80"
                )}>
                  <span className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm",
                  )} style={{ transform: karaokeEnabled ? 'translateX(18px)' : 'translateX(4px)' }} />
                </div>
              </div>

              {karaokeEnabled && (
                <div className="space-y-2 animate-in slide-in-from-top-1 fade-in duration-200 bg-sand/10 p-3 rounded-standard border border-sand/30">
                  <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-charcoal/50">Highlight Color</span>
                  <div className="flex gap-3">
                    {(["gold", "emerald", "blue"] as HighlightColor[]).map((color) => {
                      const colors = { gold: "bg-[#C7A75A]", emerald: "bg-[#0D7A5F]", blue: "bg-[#3B82F6]" };
                      return (
                        <button
                          key={color}
                          onClick={() => setHighlightColor(color)}
                          className={cn(
                            "w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all active:scale-95 shadow-sm flex items-center justify-center",
                            colors[color],
                            highlightColor === color ? "border-charcoal ring-2 ring-soft-gold/30 scale-110" : "border-sand/50 hover:border-sand"
                          )}
                        >
                          {highlightColor === color && <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
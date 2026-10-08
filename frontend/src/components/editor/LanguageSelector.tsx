"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { SupportedLanguage } from "@/types";
import { Globe, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { tapScale } from "@/lib/animations";

const languages: { id: SupportedLanguage; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "ur", label: "Urdu", native: "اردو" },
  { id: "ar", label: "Arabic", native: "العربية" },
  { id: "tr", label: "Turkish", native: "Türkçe" },
  { id: "es", label: "Spanish", native: "Español" },
  { id: "fa", label: "Persian", native: "فارسی" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
];

export default function LanguageSelector() {
  const {
    showCaptions,
    setShowCaptions,
    selectedLanguage,
    setLanguage,
    translatedCaptions,
    sourceVideo,
  } = useEditorStore();

  const isMusicMode = sourceVideo?.category === "music";

  const availableLanguagesCount = Object.keys(translatedCaptions).filter(
    (key) => (translatedCaptions[key]?.length || 0) > 0
  ).length;

  return (
    <div className="space-y-4">
      
      {/* 1. UNIVERSAL SUBTITLES ON / OFF TOGGLE */}
      <motion.div 
        whileTap={tapScale}
        onClick={() => setShowCaptions(!showCaptions)}
        className="flex items-center justify-between p-2.5 md:p-3 bg-white rounded-standard border border-sand shadow-2xs cursor-pointer select-none group transition-colors hover:bg-ivory/30"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              showCaptions ? "bg-emerald-green/15 text-emerald-green" : "bg-sand/40 text-charcoal/40"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showCaptions ? "on" : "off"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {showCaptions ? <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              </motion.div>
            </AnimatePresence>
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal leading-tight">
              Display Subtitles
            </p>
            <p className="text-[10px] md:text-[11px] text-charcoal/50">
              {showCaptions ? "Text overlays active" : "Text overlays hidden"}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "w-10 h-5 md:w-11 md:h-6 rounded-full relative transition-colors shrink-0",
            showCaptions ? "bg-emerald-green" : "bg-sand"
          )}
        >
          <motion.div
            layout
            className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
            animate={{
              left: showCaptions ? "calc(100% - 18px)" : "2px",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </motion.div>

      {/* 2. 7-LANGUAGE HORIZONTAL SELECTOR ROW */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-soft-gold" />
            <label className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-charcoal/80">
              Subtitle Language
            </label>
          </div>
          <span className="text-[9px] md:text-[10px] font-medium text-charcoal/50">
            {availableLanguagesCount} available
          </span>
        </div>

        {/* Grid Container (Replaces horizontal scroll) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pb-2 pt-1 px-1">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            const hasCaptions = Boolean(translatedCaptions[lang.id]?.length);

            return (
              <motion.button
                key={lang.id}
                type="button"
                whileTap={tapScale}
                onClick={() => setLanguage(lang.id)}
                className={cn(
                  "w-full flex flex-col items-start justify-center p-2.5 rounded-standard border select-none text-left relative overflow-hidden min-h-[60px]",
                  isSelected
                    ? "border-transparent"
                    : hasCaptions
                    ? "bg-white border-sand hover:border-soft-gold/40 shadow-sm"
                    : "bg-sand/15 border-sand/40 opacity-60 hover:opacity-100"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="language-active"
                    className="absolute inset-0 bg-soft-gold/15 border border-soft-gold shadow-2xs"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
                <div className="w-full relative z-10 text-left">
                  <p className={cn("font-medium text-sm md:text-base leading-tight transition-colors", isSelected ? "text-charcoal font-bold" : "text-charcoal/90")}>
                    {lang.native}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between relative z-10 mt-1">
                  <p className="text-[9px] md:text-[10px] text-charcoal/50 uppercase tracking-wider">
                    {lang.label}
                  </p>
                  <div className="shrink-0 flex items-center">
                    {isSelected ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Check className="w-3.5 h-3.5 text-soft-gold stroke-[3]" />
                      </motion.div>
                    ) : hasCaptions ? (
                      <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-green/60" />
                    ) : null}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-[10px] text-charcoal/50 px-1 leading-relaxed hidden sm:block">
          {isMusicMode
            ? "Subtitles default to Off for music videos. Turn them On or select a language to display translated lyrics."
            : "Click any language to switch on-screen subtitles instantly."}
        </p>
      </div>

    </div>
  );
}
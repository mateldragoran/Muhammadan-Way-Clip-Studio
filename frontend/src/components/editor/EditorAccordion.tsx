"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { SupportedLanguage } from "@/types";
import { 
  ChevronDown, 
  Sparkles, 
  Palette, 
  Globe, 
  Type, 
  Image as ImageIcon, 
  Music 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Child Tools
import HighlightFinder from "@/components/editor/HighlightFinder";
import TemplateSelector from "@/components/editor/TemplateSelector";
import LanguageSelector from "@/components/editor/LanguageSelector";
import CaptionReviewer from "@/components/editor/CaptionReviewer";
import BRollTray from "@/components/editor/BRollTray";
import AudioTray from "@/components/editor/AudioTray";

type SectionKey = "highlights" | "templates" | "language" | "captions" | "broll" | "audio";

interface AccordionItemProps {
  id: SectionKey;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: "gold" | "emerald" | "sand";
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({
  title,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = "sand",
  isOpen,
  onToggle,
  children,
}: AccordionItemProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-large border transition-all duration-200 overflow-hidden shadow-level-1",
        isOpen ? "border-soft-gold/60 shadow-level-2" : "border-sand hover:border-sand/80"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left select-none transition-colors hover:bg-ivory/40"
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div
            className={cn(
              "w-9 h-9 rounded-standard flex items-center justify-center shrink-0 transition-colors",
              isOpen ? "bg-soft-gold text-charcoal shadow-sm" : "bg-sand/40 text-charcoal/60"
            )}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <h4 className="font-heading text-base font-semibold text-charcoal leading-tight truncate">
              {title}
            </h4>
            <p className="text-xs text-charcoal/50 truncate mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge && (
            <span
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                badgeColor === "gold" && "bg-soft-gold/15 text-charcoal border-soft-gold/30",
                badgeColor === "emerald" && "bg-emerald-green/10 text-emerald-green border-emerald-green/20",
                badgeColor === "sand" && "bg-sand/40 text-charcoal/70 border-sand"
              )}
            >
              {badge}
            </span>
          )}

          <ChevronDown
            className={cn(
              "w-4 h-4 text-charcoal/40 transition-transform duration-200",
              isOpen && "transform rotate-180 text-charcoal"
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-sand/50 animate-in fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

const languageLabels: Record<SupportedLanguage, string> = {
  en: "English",
  ur: "اردو (Urdu)",
  es: "Español (Spanish)",
  tr: "Türkçe (Turkish)",
  ar: "العربية (Arabic)",
  hi: "हिन्दी (Hindi)",
  fa: "فارسی (Persian)",
};

export default function EditorAccordion() {
  const {
    sourceVideo,
    template,
    showCaptions,
    selectedLanguage,
    bRoll,
    bgMusic,
    captions,
    activeHighlights,
  } = useEditorStore();

  const [openSection, setOpenSection] = useState<SectionKey | null>("highlights");

  const toggleSection = (section: SectionKey) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const isMusicMode = sourceVideo?.category === "music";

  // Dynamic Live Status Badges (Updated for V3 Templates)
  const templateBadge =
    template === "dynamic" ? "Dynamic Focus" :
    template === "classic" ? "Classic" :
    template === "minimal" ? "Minimalist" :
    "Cinematic Clean";

  const languageBadge = !showCaptions 
    ? "Off" 
    : (languageLabels[selectedLanguage] || "English");

  const languageBadgeColor = !showCaptions ? "sand" : selectedLanguage === "en" ? "gold" : "emerald";
  const highlightsBadge = activeHighlights.length > 0 ? `${activeHighlights.length} Found` : "1-Click AI";
  const bRollBadge = bRoll.length > 0 ? `${bRoll.length} Added` : undefined;
  const audioBadge = bgMusic ? `${Math.round(bgMusic.volume * 100)}% Vol` : undefined;
  const captionsBadge = captions.length > 0 ? `${captions.length} Lines` : undefined;

  return (
    <div className="space-y-3 w-full">
      {/* 1. AI HIGHLIGHT FINDER (Universal) */}
      <AccordionItem
        id="highlights"
        title="AI Highlight Finder"
        subtitle="1-Click viral moment detection"
        icon={Sparkles}
        badge={highlightsBadge}
        badgeColor="gold"
        isOpen={openSection === "highlights"}
        onToggle={() => toggleSection("highlights")}
      >
        <HighlightFinder />
      </AccordionItem>

      {/* 2. STYLE & TEMPLATES (Now Universal for Nasheeds too!) */}
      <AccordionItem
        id="templates"
        title="Style & Templates"
        subtitle="Color grading, filters & caption style"
        icon={Palette}
        badge={templateBadge}
        badgeColor="gold"
        isOpen={openSection === "templates"}
        onToggle={() => toggleSection("templates")}
      >
        <TemplateSelector />
      </AccordionItem>

      {/* 3. SUBTITLE LANGUAGE & ON/OFF (Universal) */}
      <AccordionItem
        id="language"
        title="Subtitle Language"
        subtitle="Toggle subtitles & switch across 7 languages"
        icon={Globe}
        badge={languageBadge}
        badgeColor={languageBadgeColor}
        isOpen={openSection === "language"}
        onToggle={() => toggleSection("language")}
      >
        <LanguageSelector />
      </AccordionItem>

      {/* 4. REVIEW & EDIT CAPTIONS (Universal) */}
      <AccordionItem
        id="captions"
        title="Review & Edit Captions"
        subtitle="Fix text and jump playhead by line"
        icon={Type}
        badge={captionsBadge}
        isOpen={openSection === "captions"}
        onToggle={() => toggleSection("captions")}
      >
        <CaptionReviewer />
      </AccordionItem>

      {/* ========================================= */}
      {/* LECTURE-MODE EXCLUSIVE SECTIONS           */}
      {/* ========================================= */}
      {!isMusicMode && (
        <>
          {/* 5. SUPPORTING VISUALS */}
          <AccordionItem
            id="broll"
            title="Supporting Visuals"
            subtitle="Overlay images, videos & split-screen"
            icon={ImageIcon}
            badge={bRollBadge}
            badgeColor={bRoll.length > 0 ? "emerald" : "sand"}
            isOpen={openSection === "broll"}
            onToggle={() => toggleSection("broll")}
          >
            <BRollTray />
          </AccordionItem>

          {/* 6. BACKGROUND MUSIC */}
          <AccordionItem
            id="audio"
            title="Background Music"
            subtitle="Add and mix soft ambient tracks"
            icon={Music}
            badge={audioBadge}
            badgeColor={bgMusic ? "emerald" : "sand"}
            isOpen={openSection === "audio"}
            onToggle={() => toggleSection("audio")}
          >
            <AudioTray />
          </AccordionItem>
        </>
      )}

      {/* Music Mode Peaceful Helper Banner */}
      {isMusicMode && (
        <div className="p-4 bg-sand/20 border border-sand border-dashed rounded-large text-center space-y-1.5 mt-2">
          <p className="text-xs font-semibold text-charcoal flex items-center justify-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-emerald-green" /> 
            Nasheed Mode Active
          </p>
          <p className="text-[11px] text-charcoal/60 leading-relaxed max-w-xs mx-auto">
            B-Roll and additional audio are hidden to keep the music video pure. Enjoy cinematic filters and translated lyrics!
          </p>
        </div>
      )}
    </div>
  );
}
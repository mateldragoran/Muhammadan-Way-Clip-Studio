"use client";

import { useEditorStore, MobileTab } from "@/store/useEditorStore";
import { Scissors, Palette, Image as ImageIcon, Type, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  id: MobileTab;
  label: string;
  icon: React.ElementType;
}

const allTabs: TabItem[] = [
  { id: "timeline", label: "Trim", icon: Scissors },
  { id: "templates", label: "Style", icon: Palette },
  { id: "b-roll", label: "Visuals", icon: ImageIcon },
  { id: "captions", label: "Text", icon: Type },
  { id: "audio", label: "Audio", icon: Music },
];

export default function MobileTabNav() {
  const { activeMobileTab, setActiveMobileTab, sourceVideo } = useEditorStore();

  // CONTEXT-AWARE: If it's a music video, only show the Trim tab!
  const isMusicMode = sourceVideo?.category === "music";
  const visibleTabs = isMusicMode 
    ? allTabs.filter(tab => tab.id === "timeline") 
    : allTabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-sand pb-safe-bottom px-3 py-2">
      
      {/* Pill-shaped segmented control container */}
      <div className="flex items-center justify-between bg-sand/40 p-1 rounded-full max-w-md mx-auto shadow-inner border border-sand/50">
        {visibleTabs.map((tab) => {
          const isActive = activeMobileTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveMobileTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 h-10 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 select-none",
                isActive
                  ? "bg-white text-charcoal shadow-level-1 font-semibold"
                  : "text-charcoal/60 hover:text-charcoal"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", isActive ? "text-soft-gold" : "text-charcoal/50")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
    </div>
  );
}
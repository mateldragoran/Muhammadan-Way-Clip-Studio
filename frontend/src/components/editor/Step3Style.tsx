"use client";

import TemplateSelector from "@/components/editor/TemplateSelector";
import { Palette, PlaySquare } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Step3Style() {
  const { addIntro, setAddIntro } = useEditorStore();

  return (
    <div className="space-y-4 md:space-y-6 w-full animate-in fade-in duration-200">
      
      {/* Header (Hidden on Mobile) */}
      <div className="px-1 space-y-1 hidden md:block">
        <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal flex items-center gap-2">
          <Palette className="w-5 h-5 text-soft-gold" />
          3. Pick a Look
        </h3>
        <p className="text-xs sm:text-sm text-charcoal/60 leading-relaxed">
          Choose a beautiful design for your text and apply a color filter to give the video a professional feel.
        </p>
      </div>

      {/* Template & Styling Controls */}
      <div className="bg-white rounded-large p-3 md:p-6 border border-sand shadow-level-1 space-y-4">
        <TemplateSelector />
        
        <div className="flex items-center justify-between pt-4 border-t border-sand">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-charcoal">Add Intro</p>
              <p className="text-xs text-charcoal/60">Adds a nice 5-second intro.</p>
            </div>
          </div>
          <button
            onClick={() => setAddIntro(!addIntro)}
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors shrink-0",
              addIntro ? "bg-soft-gold" : "bg-sand"
            )}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm"
              style={{ left: addIntro ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        </div>
      </div>

    </div>
  );
}
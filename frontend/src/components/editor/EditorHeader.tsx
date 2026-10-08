"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Scissors } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EditorHeaderProps {
  onExport?: () => void;
}

export default function EditorHeader({ onExport }: EditorHeaderProps) {
  const router = useRouter();
  const { sourceVideo, currentStep } = useEditorStore();

  const isMusic = sourceVideo?.category === "music";
  const totalSteps = isMusic ? 3 : 5;

  const stepLabels: Record<number, string> = {
    1: "Select the Moment",
    2: "Choose Language",
    3: "Pick a Look",
    4: "Add Music",
    5: "Add Photos & Videos",
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleBack = () => {
    if (sourceVideo) {
      router.push(`/video/${sourceVideo.id}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header className="h-14 md:h-20 shrink-0 bg-white/95 backdrop-blur-md border-b border-sand flex flex-col relative z-50">
      
      {/* Top Section: Navigation & Info */}
      <div className="flex-1 flex items-center justify-between px-3 md:px-8">
        
        {/* Left: Back Navigation */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-charcoal/60 hover:text-charcoal transition-colors p-1.5 md:p-2 rounded-standard hover:bg-black/5 shrink-0 active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Exit</span>
        </button>

        {/* Center: Elegant Step Indicator */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden px-2 h-full">
          <div className={cn(
            "text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5",
            isMusic ? "text-emerald-green" : "text-soft-gold"
          )}>
            Step {currentStep} of {totalSteps}
          </div>
          <div className="relative h-6 md:h-8 w-full flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.h2
                key={currentStep}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="font-heading font-semibold text-charcoal text-[14px] sm:text-base md:text-lg truncate leading-tight absolute"
              >
                {stepLabels[currentStep]}
              </motion.h2>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Primary Export Action */}
        <div className="shrink-0">
          <Button
            size="sm"
            variant="emerald"
            onClick={onExport}
            className="px-3 sm:px-5 h-8 md:h-10 text-[11px] md:text-sm font-bold shadow-level-1 glow-ring"
          >
            <Scissors className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Bottom Edge: Integrated Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-sand/20">
        <motion.div 
          className="h-full bg-emerald-green shadow-[0_0_8px_rgba(13,122,95,0.4)] relative"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Pulsing leading edge */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 progress-glow" />
        </motion.div>
      </div>

    </header>
  );
}
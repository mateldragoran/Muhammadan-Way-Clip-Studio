"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StepperNavProps {
  onExport: () => void;
}

export default function StepperNav({ onExport }: StepperNavProps) {
  const { currentStep, nextStep, prevStep, sourceVideo } = useEditorStore();

  const isMusicMode = sourceVideo?.category === "music";
  const totalSteps = isMusicMode ? 3 : 5;
  const isFirstStep = currentStep === 1;
  const isFinalStep = currentStep === totalSteps;

  return (
    <div className="h-14 md:h-16 shrink-0 bg-white/95 backdrop-blur-xl border-t border-sand/80 flex items-center z-40 pb-safe-bottom relative">
      <div className="max-w-7xl mx-auto w-full px-3 md:px-8 flex items-center justify-between gap-4">
        
        {/* 1. Left Action: Back */}
        <div className="flex-1 flex justify-start">
          <AnimatePresence>
            {!isFirstStep && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  className="text-charcoal/60 hover:text-charcoal hover:bg-black/5 px-2.5 md:px-4 h-9 md:h-10 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 md:mr-1" />
                  <span className="hidden sm:inline font-semibold text-sm">Back</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Center: Step Dots Indicator */}
        <div className="flex-1 flex justify-center items-center gap-1.5 md:gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <motion.div
                key={stepNum}
                layout
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-300",
                  isActive ? (isMusicMode ? "bg-emerald-green" : "bg-soft-gold") : 
                  isCompleted ? (isMusicMode ? "bg-emerald-green/40" : "bg-soft-gold/40") : 
                  "bg-sand"
                )}
                animate={{
                  width: isActive ? 24 : 6,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            );
          })}
        </div>

        {/* 3. Right Action: Next or Export */}
        <div className="flex-1 flex justify-end">
          <AnimatePresence mode="wait">
            {isFinalStep ? (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Button
                  variant="emerald"
                  onClick={onExport}
                  className="px-4 md:px-8 h-9 md:h-10 shadow-level-2 group font-bold text-xs md:text-sm glow-ring active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 md:mr-2 text-soft-gold fill-soft-gold/20 float-animation" />
                  <span>Review & Export</span>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="next"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <Button
                  variant="primary"
                  onClick={nextStep}
                  className="px-5 md:px-10 h-9 md:h-10 shadow-level-1 group font-bold text-xs md:text-sm active:scale-95"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
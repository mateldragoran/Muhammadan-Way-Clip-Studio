"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { Sparkles, Zap, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeInUp, scaleIn, shimmer } from "@/lib/animations";

export default function HighlightFinder() {
  const { 
    sourceVideo, 
    captions, 
    translatedCaptions, 
    activeHighlights, 
    setActiveHighlights, 
    setTrim, 
    setCurrentTime 
  } = useEditorStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getAnalysisCaptions = () => {
    if (translatedCaptions["en"] && translatedCaptions["en"].length > 0) return translatedCaptions["en"];
    if (translatedCaptions["original"] && translatedCaptions["original"].length > 0) return translatedCaptions["original"];
    const firstAvailableKey = Object.keys(translatedCaptions).find(k => (translatedCaptions[k]?.length || 0) > 0);
    if (firstAvailableKey && translatedCaptions[firstAvailableKey]?.length) return translatedCaptions[firstAvailableKey];
    return captions;
  };

  const targetCaptions = getAnalysisCaptions();

  if (!targetCaptions || targetCaptions.length === 0) return null;

  const handleFindHighlights = async () => {
    setIsLoading(true);
    setError(null);
    setActiveHighlights([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      // 1. Chunk captions on the frontend (3-minute chunks)
      const CHUNK_DURATION = 180;
      const chunks: typeof targetCaptions[] = [];
      let currentChunk: typeof targetCaptions = [];
      let chunkStartTime = targetCaptions[0].startTime;

      for (const caption of targetCaptions) {
        if (caption.endTime - chunkStartTime > CHUNK_DURATION && currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [caption];
          chunkStartTime = caption.startTime;
        } else {
          currentChunk.push(caption);
        }
      }
      if (currentChunk.length > 0) chunks.push(currentChunk);

      // 2. Process in batches of 2 chunks to avoid 120b rate limits
      const BATCH_SIZE = 2;
      let accumulatedHighlights: any[] = [];
      
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        // Flatten the batch chunks back into a single array for the backend
        const batchCaptions = batchChunks.flat();

        const response = await fetch(`${apiUrl}/api/video/highlights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            captions: batchCaptions,
            category: sourceVideo?.category || "lecture"
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch highlights from AI.");

        const data = await response.json();
        if (data.highlights && data.highlights.length > 0) {
           accumulatedHighlights = [...accumulatedHighlights, ...data.highlights];
           setActiveHighlights(accumulatedHighlights);
        }

        // 3. Cooldown if there are more batches
        if (i + BATCH_SIZE < chunks.length) {
          setIsCoolingDown(true);
          setCooldownTime(20);
          
          for (let s = 20; s > 0; s--) {
            setCooldownTime(s);
            await new Promise(r => setTimeout(r, 1000));
          }
          
          setIsCoolingDown(false);
        }
      }
      
    } catch (err: any) {
      console.error("AI Highlight Error:", err);
      setError("Failed to generate AI highlights. Please try again.");
    } finally {
      setIsLoading(false);
      setIsCoolingDown(false);
    }
  };

  const handleApply = (start: number, end: number) => {
    const maxDuration = sourceVideo?.duration_seconds || 1;
    const safeStart = Math.max(0, start);
    const safeEnd = Math.min(maxDuration, end);

    setTrim(safeStart, safeEnd);
    setCurrentTime(safeStart);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-medium text-xs sm:text-sm text-charcoal flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-soft-gold" />
            AI Highlight Finder
          </h3>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isLoading && activeHighlights.length === 0 && (
          <motion.div
            key="empty"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="p-3 sm:p-4 bg-sand/20 rounded-standard border border-sand border-dashed text-center"
          >
            <Button onClick={handleFindHighlights} size="sm" className="w-full shadow-sm text-xs sm:text-sm glow-ring">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Find Viral Highlights
            </Button>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-[10px] sm:text-xs text-error-red mt-2 flex items-center justify-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {isLoading && activeHighlights.length === 0 && (
          <motion.div
            key="loading"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="p-4 sm:p-6 bg-sand/20 rounded-standard border border-sand border-dashed flex flex-col items-center justify-center text-center space-y-2 overflow-hidden relative"
          >
            {/* Shimmer background effect */}
            <motion.div
              variants={shimmer}
              initial="initial"
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full"
            />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative z-10"
            >
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-soft-gold" />
            </motion.div>
            <div className="relative z-10">
              <p className="text-xs sm:text-sm font-medium text-charcoal">Analyzing transcript...</p>
              <p className="text-[10px] sm:text-xs text-charcoal/60 mt-0.5">Finding the most engaging moments</p>
            </div>
          </motion.div>
        )}

        {/* Highly compact cards for mobile */}
        {activeHighlights.length > 0 && (
          <motion.div
            key="results"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2 sm:space-y-3 max-h-[300px] overflow-y-auto pr-1 pb-1"
          >
            {activeHighlights.map((highlight, idx) => {
              const duration = Math.round(highlight.endTime - highlight.startTime);
              
              return (
                <motion.div 
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="p-2.5 sm:p-3 bg-white border border-sand rounded-standard shadow-level-1 hover:shadow-level-2 hover:border-soft-gold/50 transition-all flex flex-col gap-1.5 sm:gap-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-[12px] sm:text-sm font-bold text-charcoal leading-tight">
                      {highlight.title}
                    </h4>
                    <span className="shrink-0 flex items-center gap-0.5 bg-sand/40 text-charcoal/70 text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-sm">
                      <Clock className="w-2.5 h-2.5" /> {duration}s
                    </span>
                  </div>
                  
                  <p className="text-[10px] sm:text-xs text-charcoal/70 italic bg-ivory p-1.5 sm:p-2 rounded-sm border border-sand/50 leading-snug">
                    "{highlight.hook}"
                  </p>

                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleApply(highlight.startTime, highlight.endTime)}
                    className="w-full h-7 sm:h-8 text-[11px] sm:text-xs mt-0.5 sm:mt-1 border-soft-gold/30 hover:bg-soft-gold/10 hover:border-soft-gold text-charcoal transition-colors active:scale-95"
                  >
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 text-soft-gold fill-soft-gold/20" />
                    Apply to Timeline
                  </Button>
                </motion.div>
              );
            })}

            {isCoolingDown && (
              <motion.div variants={fadeInUp} className="bg-sand/10 p-3 rounded-standard border border-sand border-dashed text-center flex flex-col items-center justify-center space-y-1.5">
                <Loader2 className="w-4 h-4 text-soft-gold animate-spin" />
                <p className="text-[10px] sm:text-xs text-charcoal/70 font-medium">
                  Finding more highlights for you... ({cooldownTime}s)
                </p>
              </motion.div>
            )}
            
            {isLoading && !isCoolingDown && (
              <motion.div variants={fadeInUp} className="bg-sand/10 p-3 rounded-standard border border-sand border-dashed flex justify-center">
                 <Loader2 className="w-4 h-4 text-soft-gold animate-spin" />
              </motion.div>
            )}
            
            {!isLoading && (
              <motion.button 
                variants={fadeInUp}
                onClick={handleFindHighlights}
                className="w-full text-[11px] sm:text-xs text-charcoal/40 hover:text-charcoal transition-colors py-1.5 sm:py-2 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Regenerate Highlights
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
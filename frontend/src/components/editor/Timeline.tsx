"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useEditorStore } from "@/store/useEditorStore";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { tapScale, fadeInUp } from "@/lib/animations";

function formatTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type DragTarget = "start" | "end" | "playhead" | null;

export default function Timeline() {
  const waveformRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const [activeDrag, setActiveDrag] = useState<DragTarget>(null);

  const {
    sourceVideo,
    trimStart,
    trimEnd,
    currentTime,
    isPlaying,
    setTrim,
    setIsPlaying,
    setCurrentTime,
  } = useEditorStore();

  const duration = sourceVideo?.duration_seconds || 1;
  const selectedDuration = Math.max(0, trimEnd - trimStart);

  // 1. Initialize Wavesurfer Audio Canvas
  useEffect(() => {
    if (!waveformRef.current || !sourceVideo?.video_url) return;

    // Dynamically size waveform height to save mobile space
    const isMobile = window.innerWidth < 768;

    try {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#D1C7B7", 
        progressColor: "#C7A75A", 
        cursorColor: "transparent",
        height: isMobile ? 40 : 72, // Shrinks significantly on phones
        url: sourceVideo.video_url,
        interact: false, 
      });

      wavesurfer.current = ws;

      return () => {
        ws.destroy();
      };
    } catch (err) {
      console.error("Wavesurfer error:", err);
    }
  }, [sourceVideo?.video_url]);

  // 2. Pointer Down
  const handlePointerDown = (target: DragTarget) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveDrag(target);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // 3. Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || !timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;
    const targetTime = Math.round(percentage * duration * 10) / 10;

    if (activeDrag === "start") {
      const newStart = Math.max(0, Math.min(targetTime, trimEnd - 1));
      setTrim(newStart, trimEnd);
    } else if (activeDrag === "end") {
      const newEnd = Math.min(duration, Math.max(targetTime, trimStart + 1));
      setTrim(trimStart, newEnd);
    } else if (activeDrag === "playhead") {
      const boundedTime = Math.max(0, Math.min(duration, targetTime));
      setCurrentTime(boundedTime);
    }
  };

  // 4. Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDrag) {
      setActiveDrag(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (activeDrag || !timelineRef.current || !duration) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;
    const clickTime = Math.max(0, Math.min(duration, percentage * duration));
    setCurrentTime(clickTime);
  };

  const startPercent = (trimStart / duration) * 100;
  const endPercent = (trimEnd / duration) * 100;
  const playheadPercent = (currentTime / duration) * 100;

  return (
    <motion.div variants={fadeInUp} className="space-y-3 select-none w-full">
      
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            whileTap={tapScale}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-soft-gold text-charcoal flex items-center justify-center shadow-level-1 hover:bg-soft-gold/90 transition-colors shrink-0 glow-ring"
            title={isPlaying ? "Pause preview" : "Play preview"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isPlaying ? "pause" : "play"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-charcoal" />
                ) : (
                  <Play className="w-4 h-4 fill-charcoal ml-0.5" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <div>
            <div className="text-sm font-semibold text-charcoal leading-tight">
              Selected clip: {formatTime(selectedDuration)}
            </div>
            <div className="text-xs text-charcoal/50 font-mono mt-0.5">
              {formatTime(trimStart)} — {formatTime(trimEnd)}
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={tapScale}
          onClick={() => setTrim(0, Math.min(120, duration))}
          className="inline-flex items-center gap-1.5 text-xs text-charcoal/50 hover:text-charcoal transition-colors px-2 py-1 rounded-standard hover:bg-sand/30"
          title="Reset to default selection"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </motion.button>
      </div>

      <p className="text-xs text-charcoal/60 px-1 font-medium hidden md:block">
        Drag the handles to choose your clip
      </p>

      {/* 
        THE REDESIGNED MAIN TIMELINE TRACK
        Mobile: h-14 (56px) | Desktop: h-20 (80px)
      */}
      <div
        ref={timelineRef}
        onClick={handleTimelineClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-14 md:h-20 bg-sand/30 rounded-large border border-sand shadow-level-1 overflow-hidden cursor-pointer touch-none flex items-center"
      >
        {/* Wavesurfer Audio Waveform */}
        <div ref={waveformRef} className="absolute inset-0 w-full h-full opacity-90 pointer-events-none flex items-center" />

        <div
          className="absolute top-0 bottom-0 left-0 bg-charcoal/55 backdrop-blur-[1px] z-10 pointer-events-none transition-all duration-75"
          style={{ width: `${startPercent}%` }}
        />

        <div
          className="absolute top-0 bottom-0 right-0 bg-charcoal/55 backdrop-blur-[1px] z-10 pointer-events-none transition-all duration-75"
          style={{ left: `${endPercent}%` }}
        />

        <div
          className="absolute top-0 bottom-0 border-y-2 border-soft-gold bg-soft-gold/15 pointer-events-none z-10 transition-all duration-75"
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* SUBTLE PLAYHEAD / PREVIEW SCRUBBER */}
        <div
          style={{ left: `${playheadPercent}%` }}
          className="absolute top-0 bottom-0 z-20 flex flex-col items-center pointer-events-auto transition-all duration-75"
        >
          <div
            onPointerDown={handlePointerDown("playhead")}
            className="-ml-3 w-6 h-full flex flex-col items-center justify-start cursor-col-resize touch-none group"
            title="Drag to preview"
          >
            <div className={cn(
              "w-2.5 h-2.5 bg-charcoal rounded-xs rotate-45 -mt-1 shadow-sm transition-transform",
              activeDrag === "playhead" ? "scale-150" : "group-hover:scale-125"
            )} />
            <div className={cn("w-0.5 flex-1 transition-colors", activeDrag === "playhead" ? "bg-charcoal" : "bg-charcoal/80")} />
          </div>
        </div>

        {/* PROMINENT DRAGGABLE START TRIM HANDLE */}
        <div
          style={{ left: `${startPercent}%` }}
          className="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-auto transition-all duration-75"
        >
          <motion.div
            animate={{ scale: activeDrag === "start" ? 1.05 : 1 }}
            onPointerDown={handlePointerDown("start")}
            className="-ml-[18px] w-9 h-full flex items-center justify-center cursor-ew-resize touch-none group"
            title="Drag to set clip start"
          >
            <div
              className={cn(
                "w-4 h-full bg-soft-gold rounded-l-standard border-y-2 border-l-2 border-soft-gold shadow-md flex items-center justify-center transition-all",
                activeDrag === "start"
                  ? "brightness-110 ring-2 ring-soft-gold/50"
                  : "group-hover:brightness-105"
              )}
            >
              <div className="w-0.5 h-6 bg-charcoal/40 rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* PROMINENT DRAGGABLE END TRIM HANDLE */}
        <div
          style={{ left: `${endPercent}%` }}
          className="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-auto transition-all duration-75"
        >
          <motion.div
            animate={{ scale: activeDrag === "end" ? 1.05 : 1 }}
            onPointerDown={handlePointerDown("end")}
            className="-ml-[18px] w-9 h-full flex items-center justify-center cursor-ew-resize touch-none group"
            title="Drag to set clip end"
          >
            <div
              className={cn(
                "w-4 h-full bg-soft-gold rounded-r-standard border-y-2 border-r-2 border-soft-gold shadow-md flex items-center justify-center transition-all",
                activeDrag === "end"
                  ? "brightness-110 ring-2 ring-soft-gold/50"
                  : "group-hover:brightness-105"
              )}
            >
              <div className="w-0.5 h-6 bg-charcoal/40 rounded-full" />
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
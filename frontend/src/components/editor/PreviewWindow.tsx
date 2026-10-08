"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { Play, Pause, Loader2, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoFilter } from "@/types";

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getVideoFilterStyle = (filter: VideoFilter) => {
  switch (filter) {
    case "warm": return "sepia(0.3) contrast(1.1) saturate(1.2)";
    case "cinematic": return "contrast(1.15) saturate(0.85)";
    case "moody": return "contrast(1.2) brightness(0.9) saturate(0.8)";
    case "vibrant": return "saturate(1.5) contrast(1.1)";
    default: return "none";
  }
};

export default function PreviewWindow() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const bRollVideoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const {
    sourceVideo, currentTime, trimStart, trimEnd, isPlaying,
    captions, bRoll, cropX, bgMusic, showCaptions, selectedLanguage,
    uppercaseOnly, fontSize, captionBg, highlightColor, videoFilter,
    karaokeEnabled, addIntro,
    setCropX, setCurrentTime, setIsPlaying,
  } = useEditorStore();

  const activeCaption = captions.find((c) => currentTime >= c.startTime && currentTime <= c.endTime);
  const activeBRoll = bRoll.find((b) => currentTime >= b.startTime && currentTime <= b.endTime);
  
  // Intro & Fade Logic
  const introDuration = 5.03;
  const introEndTime = trimStart + introDuration;
  const isIntroActive = addIntro && currentTime >= trimStart && currentTime <= introEndTime;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false));
      if (bgAudioRef.current && bgMusic) bgAudioRef.current.play().catch(() => {});
      if (bRollVideoRef.current) bRollVideoRef.current.play().catch(() => {});
      if (introVideoRef.current) introVideoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (bRollVideoRef.current) bRollVideoRef.current.pause();
      if (introVideoRef.current) introVideoRef.current.pause();
    }
  }, [isPlaying, setIsPlaying, bgMusic, activeBRoll, isIntroActive]);

  useEffect(() => {
    if (!videoRef.current) return;
    const delta = Math.abs(videoRef.current.currentTime - currentTime);
    if (delta > 0.25) {
      videoRef.current.currentTime = currentTime;
      if (bgAudioRef.current && bgMusic) {
        const duration = bgMusic.duration || 1;
        bgAudioRef.current.currentTime = Math.max(0, currentTime - trimStart) % duration;
      }
    }
  }, [currentTime, trimStart, bgMusic]);

  useEffect(() => {
    if (bgAudioRef.current && bgMusic) bgAudioRef.current.volume = bgMusic.volume;
  }, [bgMusic?.volume]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || isDragging) return;
    const now = videoRef.current.currentTime;
    setCurrentTime(now);
    
    if (isPlaying && (now >= trimEnd || now < trimStart)) {
      videoRef.current.currentTime = trimStart;
      setCurrentTime(trimStart);
      if (bgAudioRef.current && bgMusic) bgAudioRef.current.currentTime = 0;
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    if (bgAudioRef.current && bgMusic) {
      const duration = bgMusic.duration || 1;
      bgAudioRef.current.currentTime = Math.max(0, newTime - trimStart) % duration;
    }
  };

  const handleScrubStart = () => {
    setIsDragging(true);
    if (isPlaying) {
      videoRef.current?.pause();
      if (bgAudioRef.current) bgAudioRef.current.pause();
      if (bRollVideoRef.current) bRollVideoRef.current.pause();
      if (introVideoRef.current) introVideoRef.current.pause();
    }
  };

  const handleScrubEnd = () => {
    setIsDragging(false);
    if (isPlaying) {
      videoRef.current?.play().catch(() => {});
      if (bgAudioRef.current && bgMusic) bgAudioRef.current.play().catch(() => {});
      if (bRollVideoRef.current) bRollVideoRef.current.play().catch(() => {});
      if (introVideoRef.current) introVideoRef.current.play().catch(() => {});
    }
  };

  if (!sourceVideo) return null;

  const getCrossfadeOpacity = (startTime: number, endTime: number, isIntro: boolean = false) => {
    const fadeDuration = isIntro ? 1.0 : Math.min(0.5, (endTime - startTime) / 2);
    if (currentTime < startTime || currentTime > endTime) return 0;
    if (!isIntro && currentTime < startTime + fadeDuration) return (currentTime - startTime) / fadeDuration;
    if (currentTime > endTime - fadeDuration) return (endTime - currentTime) / fadeDuration;
    return 1;
  };
  
  const introOpacity = isIntroActive ? getCrossfadeOpacity(trimStart, introEndTime, true) : 0;
  const bRollOpacity = activeBRoll ? getCrossfadeOpacity(activeBRoll.startTime, activeBRoll.endTime, false) : 0;

  const isRtl = selectedLanguage === "ar" || selectedLanguage === "ur" || selectedLanguage === "fa";
  const cssFilter = getVideoFilterStyle(videoFilter);

  // Styling Helpers
  const getFontFamilyClass = () => {
    if (isRtl) return "font-sans font-bold";
    // Always use Oswald (the "bold" template font) to match FFmpeg exactly
    return cn("font-oswald tracking-tight", uppercaseOnly ? "uppercase" : "");
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm": return "text-[4.5cqw]";
      case "lg": return "text-[7cqw]";
      default: return "text-[5.5cqw]";
    }
  };

  const getCaptionBgClass = () => {
    switch (captionBg) {
      case "shadow": return "drop-shadow-[0_0.5cqw_1cqw_rgba(0,0,0,0.9)] text-white";
      case "box": return "bg-black/75 px-[3cqw] py-[1.5cqw] rounded-[1.5cqw] text-white border border-white/10";
      case "gradient": return "text-white drop-shadow-md";
      default: return "text-white";
    }
  };

  const getHighlightColorClass = () => {
    switch (highlightColor) {
      case "emerald": return "text-emerald-400";
      case "blue": return "text-blue-400";
      default: return "text-soft-gold";
    }
  };

  const renderSimulatedKaraoke = (caption: { text: string, startTime: number, endTime: number }) => {
    if (!caption || !caption.text) return null;
    const words = caption.text.split(" ");
    if (words.length === 0) return null;
    
    const duration = caption.endTime - caption.startTime;
    const elapsed = currentTime - caption.startTime;
    const progress = duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 0;
    
    const activeIndex = Math.min(
      words.length - 1,
      Math.floor(progress * words.length)
    );

    return (
      <>
        {words.map((word, idx) => (
          <span key={idx}>
            <span
              className={cn(
                "transition-colors duration-150 inline-block",
                (karaokeEnabled && idx === activeIndex) ? getHighlightColorClass() : ""
              )}
            >
              {word}
            </span>
            {idx < words.length - 1 ? " " : ""}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col w-full h-full items-center justify-center gap-2.5 md:gap-4 overflow-hidden pt-2 pb-1 md:py-0">
      
      {/* 1. THE 9:16 PREVIEW BOX */}
      <div
        onClick={() => setIsPlaying(!isPlaying)}
        className="relative @container aspect-[9/16] w-auto h-full min-h-0 bg-black md:rounded-standard shadow-level-3 overflow-hidden group cursor-pointer md:border border-charcoal/20 select-none flex items-center justify-center shrink"
      >
        <video
          ref={videoRef}
          src={sourceVideo.video_url}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsBuffering(true)}
          onSeeking={() => setIsBuffering(true)}
          onSeeked={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          className="w-full h-full pointer-events-none transition-all duration-300"
          style={{ objectFit: "cover", objectPosition: `${cropX}% 50%`, filter: cssFilter }}
          playsInline
        />

        {bgMusic && <audio ref={bgAudioRef} src={bgMusic.url} loop preload="auto" />}

        {isBuffering && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
            <Loader2 className="w-[8cqw] h-[8cqw] animate-spin text-soft-gold" />
          </div>
        )}

        {activeBRoll && (
          <div 
            className={cn(
              "absolute z-10 bg-black pointer-events-none flex items-center justify-center overflow-hidden",
              activeBRoll.layout === "split-top" ? "top-0 inset-x-0 h-1/2" :
              activeBRoll.layout === "split-bottom" ? "bottom-0 inset-x-0 h-1/2" : "inset-0"
            )}
            style={{ opacity: bRollOpacity }}
          >
            {activeBRoll.type === "video" ? (
              <video 
                ref={bRollVideoRef}
                src={activeBRoll.url} 
                loop muted playsInline
                onCanPlay={(e) => { if (!isPlaying) e.currentTarget.pause(); else e.currentTarget.play().catch(()=>{}); }}
                className="w-full h-full object-cover" 
                style={{ objectPosition: `${activeBRoll.panX ?? 50}% 50%`, filter: cssFilter }} 
              />
            ) : (
              <img src={activeBRoll.url} alt="B-Roll" className="w-full h-full object-cover" style={{ objectPosition: `${activeBRoll.panX ?? 50}% 50%`, filter: cssFilter }} />
            )}
          </div>
        )}

        {isIntroActive && (
          <div 
            className="absolute inset-0 z-15 bg-black pointer-events-none flex items-center justify-center overflow-hidden"
            style={{ opacity: introOpacity }}
          >
            <video 
              ref={introVideoRef}
              src="/intro.mp4" 
              loop muted playsInline
              onCanPlay={(e) => { if (!isPlaying) e.currentTarget.pause(); else e.currentTarget.play().catch(()=>{}); }}
              className="w-full h-full object-cover" 
            />
          </div>
        )}

        <div className="absolute bottom-[4cqw] left-[4cqw] z-20 opacity-80 pointer-events-none">
          <span className="text-[3cqw] font-heading tracking-widest uppercase text-ivory/90 bg-black/50 px-[2.5cqw] py-[0.8cqw] rounded-full backdrop-blur-sm border border-ivory/10 shadow-sm">
            Muhammadan Way
          </span>
        </div>

        {showCaptions && activeCaption && (
          <div className={cn(
            "absolute z-20 flex justify-center pointer-events-none transition-all duration-300",
            captionBg === "gradient" ? "bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-[16cqw] pb-[6cqw] px-[4cqw]" : "bottom-[12cqw] inset-x-[3cqw]"
          )}>
            <span dir={isRtl ? "rtl" : "ltr"} className={cn("text-center transition-all duration-200 max-w-[95%]", getFontFamilyClass(), getFontSizeClass(), getCaptionBgClass(), isRtl && "leading-relaxed")}>
              {renderSimulatedKaraoke(activeCaption)}
            </span>
          </div>
        )}

        {!isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity z-30 pointer-events-none">
            <div className="w-[12cqw] h-[12cqw] rounded-full bg-ivory/90 text-charcoal flex items-center justify-center shadow-level-2">
              {isPlaying ? <Pause className="w-[5cqw] h-[5cqw] fill-charcoal" /> : <Play className="w-[5cqw] h-[5cqw] fill-charcoal ml-[0.5cqw]" />}
            </div>
          </div>
        )}

        {/* Scrubber overlay */}
        <div 
          className="absolute bottom-0 inset-x-0 z-40 px-3 pb-3 pt-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1.5 pointer-events-none">
            <span className="text-white text-xs font-semibold drop-shadow-md tracking-wide">
              {formatTime(currentTime - trimStart)} <span className="text-white/60 mx-0.5">/</span> {formatTime(trimEnd - trimStart)}
            </span>
          </div>
          
          <div className="relative w-full h-5 flex items-center group/scrubber cursor-pointer">
            {/* Background Track */}
            <div className="absolute w-full h-1 bg-white/30 rounded-full transition-all duration-200 group-hover/scrubber:h-1.5" />
            
            {/* Progress Fill */}
            <div 
              className="absolute h-1 bg-soft-gold rounded-full transition-all duration-200 group-hover/scrubber:h-1.5 pointer-events-none"
              style={{ width: `${Math.max(0, Math.min(100, ((currentTime - trimStart) / (trimEnd - trimStart)) * 100))}%` }}
            />
            
            {/* Input Range */}
            <input
              type="range"
              min={trimStart}
              max={trimEnd}
              step={0.01}
              value={currentTime}
              onChange={handleScrubberChange}
              onMouseDown={handleScrubStart}
              onMouseUp={handleScrubEnd}
              onTouchStart={handleScrubStart}
              onTouchEnd={handleScrubEnd}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10 m-0 p-0"
            />
          </div>
        </div>
      </div>

      {/* 2. THE SLEEK CAMERA PAN SLIDER (Dark Mode adaptive) */}
      <div className="w-full max-w-[240px] md:max-w-[300px] flex flex-col gap-1.5 shrink-0 px-2 md:px-0">
        <div className="flex items-center justify-between text-[10px] md:text-xs font-medium text-white/70 md:text-charcoal/70">
          <span className="flex items-center gap-1.5">
            <Maximize className="w-3 h-3 text-soft-gold" /> Camera Pan
          </span>
          <span>{cropX === 50 ? 'Center' : cropX < 50 ? 'Left' : 'Right'}</span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={cropX}
          onChange={(e) => setCropX(Number(e.target.value))}
          className="w-full h-1 bg-white/20 md:bg-sand/60 rounded-lg appearance-none cursor-ew-resize accent-soft-gold outline-none"
        />
        <style dangerouslySetInnerHTML={{__html: `
          input[type=range]::-webkit-slider-thumb {
            appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #C7A75A; box-shadow: 0 1px 3px rgba(0,0,0,0.5);
          }
        `}} />
      </div>

    </div>
  );
}
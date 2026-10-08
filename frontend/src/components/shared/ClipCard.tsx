"use client";

import { useRef } from "react";
import Link from "next/link";
import { Download, Play, Repeat, Mic, Music, Lock } from "lucide-react";
import { Clip } from "@/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, tapScale } from "@/lib/animations";

interface ClipCardProps {
  clip: Clip;
  onDownload?: (clipId: string) => void;
}

export default function ClipCard({ clip, onDownload }: ClipCardProps) {
  const isMusic = clip.category === "music";
  const isPrivate = clip.is_public === false;
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger direct browser download
    const a = document.createElement("a");
    a.href = clip.clip_url;
    a.download = `reminder_clip_${clip.id.slice(0, 8)}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onDownload) {
      onDownload(clip.id);
    }

    // Fire off backend download tracking
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    fetch(`${apiUrl}/api/video/clips/${clip.id}/download`, {
      method: "POST",
    }).catch(err => console.error("Failed to track download", err));
  };

  // Auto-play preview on hover (desktop)
  const handleMouseEnter = () => {
    if (videoRef.current && window.innerWidth >= 768) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      whileTap={tapScale}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[9/16] w-full rounded-large bg-charcoal overflow-hidden shadow-level-1 hover:shadow-level-3 transition-shadow duration-300 border border-sand flex flex-col justify-between p-3 select-none"
    >
      
      {/* Background Video Frame */}
      <video
        ref={videoRef}
        src={clip.clip_url}
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
        muted
        playsInline
        loop
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

      {/* Top Bar: Category Badge, Private Indicator & Download Count */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md px-2 py-0.5 rounded-full border flex items-center gap-1 shadow-xs",
              isMusic
                ? "bg-black/70 text-emerald-green border-emerald-green/30"
                : "bg-black/70 text-soft-gold border-soft-gold/30"
            )}
          >
            {isMusic ? <Music className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
            {isMusic ? "Nasheed" : "Lecture"}
          </span>

          {isPrivate && (
            <span 
              className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-black/80 text-white/80 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/20 flex items-center gap-0.5 shadow-xs" 
              title="Private Clip - Visible only to you"
            >
              <Lock className="w-2.5 h-2.5 text-warning-amber" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
          <Download className="w-3 h-3 text-emerald-green" />
          <span>{clip.downloads || 0}</span>
        </div>
      </div>

      {/* Center Play Button Overlay */}
      <Link
        href={`/clip/${clip.id}`}
        className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-12 h-12 rounded-full bg-soft-gold/95 text-charcoal flex items-center justify-center shadow-level-2"
        >
          <Play className="w-5 h-5 fill-charcoal ml-0.5" />
        </motion.div>
      </Link>

      {/* Bottom Action Bar */}
      <div className="relative z-10 flex items-center gap-2 pt-2">
        {/* UPDATED: Points to the Editor with the specific project ID payload! */}
        <Link href={`/editor/${clip.video_id}?remix=${clip.project_id}`} className="flex-1 min-w-0">
          <Button
            size="sm"
            variant="secondary"
            className="w-full text-xs h-9 bg-white/95 backdrop-blur-md border-none hover:bg-white text-charcoal font-medium shadow-sm px-1.5"
          >
            <Repeat className="w-3.5 h-3.5 mr-1 text-soft-gold shrink-0" />
            <span className="truncate">Remix Clip</span>
          </Button>
        </Link>

        <Button
          size="sm"
          variant="emerald"
          onClick={handleDownloadClick}
          className="h-9 px-3 text-xs font-medium shadow-level-1 shrink-0"
          title="Download Clip (.mp4)"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </div>

    </motion.div>
  );
}
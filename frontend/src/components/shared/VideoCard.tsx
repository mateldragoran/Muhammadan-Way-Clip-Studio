"use client";

import Link from "next/link";
import { Clock, Scissors, Mic, Music } from "lucide-react";
import { Video } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, hoverLift, tapScale } from "@/lib/animations";

interface VideoCardProps {
  video: Video;
}

// Helper function to convert raw seconds into a clean MM:SS or HH:MM:SS format
function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoCard({ video }: VideoCardProps) {
  const isMusic = video.category === "music";

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={hoverLift}
      whileTap={tapScale}
    >
      <Link 
        href={`/video/${video.id}`}
        className="group flex flex-col bg-white rounded-large shadow-level-1 hover:shadow-level-2 transition-shadow duration-300 active:scale-[0.98] overflow-hidden border border-sand"
      >
        {/* Thumbnail Container (16:9 Aspect Ratio) */}
        <div className="relative aspect-video w-full overflow-hidden bg-sand/50">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* CATEGORY BADGE (Top Left) */}
          <div className={cn(
            "absolute top-2 left-2 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-standard backdrop-blur-md flex items-center gap-1.5 shadow-sm border uppercase tracking-wider",
            isMusic 
              ? "bg-black/70 text-emerald-green border-emerald-green/30" 
              : "bg-black/70 text-soft-gold border-soft-gold/30"
          )}>
            {isMusic ? (
              <>
                <Music className="w-3.5 h-3.5" /> 
                Nasheed / Music
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" /> 
                Lecture
              </>
            )}
          </div>
          
          {/* Duration Badge (Bottom Right) */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-standard backdrop-blur-md flex items-center gap-1 border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(video.duration_seconds)}
          </div>

          {/* Desktop Hover Overlay (Hidden on Mobile) */}
          <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center">
            <motion.span
              initial={{ y: 12, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              className="bg-soft-gold text-charcoal px-4 py-2 rounded-standard font-medium shadow-level-2 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Scissors className="w-4 h-4" /> 
              Create Clip
            </motion.span>
          </div>
        </div>

        {/* Text Content */}
        <div className="p-4 flex flex-col gap-1.5">
          <h3 className="font-medium text-[16px] text-charcoal line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <p className="text-sm text-charcoal/60">
            {video.clip_count} {video.clip_count === 1 ? "clip" : "clips"} created
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
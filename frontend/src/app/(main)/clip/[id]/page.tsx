"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Clip, Video, Profile, Project } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Download, Repeat, Share2, Play, Volume2, VolumeX, Check, Loader2, User, Film, Music, Mic, Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { pageTransition, fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

interface FullClipData extends Clip {
  videos?: Video;
  profiles?: Profile;
  projects?: Project;
}

// Animated counter component
function AnimatedCount({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <>{displayValue}</>;
}

export default function ClipDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [clipData, setClipData] = useState<FullClipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    async function fetchClip() {
      try {
        if (!params.id) return;

        const { data, error } = await supabase
          .from("clips")
          .select("*, videos(*), profiles(*), projects(*)")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setClipData(data);
      } catch (err: any) {
        console.error("Error fetching clip:", err);
        setError("Could not find this clip. It may have been removed.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchClip();
  }, [params.id, supabase]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleDownload = async () => {
    if (!clipData) return;
    setIsDownloading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const trackRes = await fetch(`${apiUrl}/api/video/clips/${clipData.id}/download`, {
        method: "POST",
      });
      const trackData = await trackRes.json();
      
      if (trackData.success) {
        setClipData((prev) => prev ? { ...prev, downloads: trackData.downloads } : null);
      }

      // True Background Download (Bypasses CORS navigation block)
      const response = await fetch(clipData.clip_url);
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = localUrl;
      a.download = `reminder_clip_${clipData.id.slice(0, 8)}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      console.error("Error during download:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReuseProject = () => {
    if (!clipData?.video_id || !clipData?.project_id) return;
    // UPDATED: Include the remix ID explicitly!
    router.push(`/editor/${clipData.video_id}?remix=${clipData.project_id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-soft-gold mb-3" />
        <p className="text-charcoal/60 text-sm font-medium">Loading reminder clip...</p>
      </div>
    );
  }

  if (error || !clipData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center h-[50vh]"
      >
        <h3 className="font-medium text-lg text-charcoal">Clip Not Found</h3>
        <p className="text-charcoal/60 text-sm mt-1 mb-6">{error}</p>
        <Link href="/library">
          <Button variant="secondary">Go to Library</Button>
        </Link>
      </motion.div>
    );
  }

  const isMusic = clipData.category === "music";
  const isPrivate = clipData.is_public === false;

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-0"
    >
      
      <motion.div variants={fadeInUp}>
        <Link href="/library?tab=clips" className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors active:scale-95">
          <ArrowLeft className="w-4 h-4" />
          Back to Community Clips
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Vertical 9:16 Video Player */}
        <motion.div variants={scaleIn} className="md:col-span-5 flex justify-center">
          <div onClick={togglePlay} className="relative aspect-[9/16] w-full max-w-[320px] bg-black rounded-large shadow-level-3 overflow-hidden group cursor-pointer border border-sand select-none">
            <video
              ref={videoRef}
              src={clipData.clip_url}
              className="w-full h-full object-cover"
              autoPlay
              loop
              playsInline
              muted={isMuted}
            />
            <button onClick={toggleMute} className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-full bg-soft-gold text-charcoal flex items-center justify-center shadow-level-2"
                >
                  <Play className="w-6 h-6 fill-charcoal ml-1" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Metadata & Actions */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="md:col-span-7 space-y-6 bg-white p-6 md:p-8 rounded-large border border-sand shadow-level-1"
        >
          
          <div className="space-y-3">
            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase",
                isMusic ? "bg-emerald-green/10 text-emerald-green border-emerald-green/30" : "bg-soft-gold/15 text-charcoal border-soft-gold/30"
              )}>
                {isMusic ? <Music className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isMusic ? "Nasheed" : "Lecture"}
              </span>

              {isPrivate && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/80 text-warning-amber text-xs font-semibold rounded-full border border-warning-amber/30 uppercase tracking-wide">
                  <Lock className="w-3 h-3" /> Private Test Clip
                </span>
              )}

              <span className="text-[10px] font-semibold uppercase tracking-wider bg-sand/50 text-charcoal/80 px-2.5 py-1 rounded-full border border-sand">
                {clipData.template_used} Template
              </span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="font-heading text-2xl md:text-3xl font-semibold text-charcoal leading-tight">
              {clipData.videos?.title || "Spiritual Reminder Clip"}
            </motion.h1>

            <motion.div variants={fadeInUp} className="flex items-center gap-3 pt-2 text-sm text-charcoal/70">
              <div className="w-8 h-8 rounded-full bg-sand/60 flex items-center justify-center text-charcoal font-bold text-xs border border-sand">
                {clipData.profiles?.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div>
                <span className="font-medium text-charcoal">
                  {clipData.profiles?.username || "Anonymous Clipper"}
                </span>
                <span className="text-xs text-charcoal/50 block">
                  Created {formatDistanceToNow(new Date(clipData.created_at), { addSuffix: true })}
                </span>
              </div>
            </motion.div>
          </div>

          <hr className="border-sand" />

          <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-sand/30 rounded-standard border border-sand text-center">
              <span className="text-xs text-charcoal/60 block">Total Downloads</span>
              <span className="font-heading text-2xl font-bold text-charcoal">
                <AnimatedCount value={clipData.downloads} />
              </span>
            </div>
            <div className="p-3 bg-sand/30 rounded-standard border border-sand text-center">
              <span className="text-xs text-charcoal/60 block">Format</span>
              <span className="font-heading text-2xl font-bold text-charcoal">HD 9:16</span>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="space-y-3 pt-2">
            <Button
              size="lg"
              variant="emerald"
              className="w-full shadow-level-2"
              onClick={handleDownload}
              isLoading={isDownloading}
            >
              <Download className="w-5 h-5 mr-2" />
              {isDownloading ? "Saving..." : "Save Clip (.mp4)"}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={handleReuseProject}>
                <Repeat className="w-4 h-4 mr-2 text-soft-gold" />
                Remix Clip
              </Button>

              <Button variant="secondary" onClick={handleCopyLink}>
                {copied ? (
                  <><Check className="w-4 h-4 mr-2 text-success-green" /> Copied!</>
                ) : (
                  <><Share2 className="w-4 h-4 mr-2" /> Share Link</>
                )}
              </Button>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Mobile Sticky Download Action Bar */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-sand z-40 flex items-center gap-3"
      >
        <Button size="lg" variant="emerald" className="flex-1 shadow-level-2" onClick={handleDownload} isLoading={isDownloading}>
          <Download className="w-5 h-5 mr-2" /> {isDownloading ? "Saving..." : "Save Clip"}
        </Button>
        <Button variant="secondary" size="lg" className="px-4" onClick={handleReuseProject} title="Remix Clip">
          <Repeat className="w-5 h-5 text-soft-gold" />
        </Button>
      </motion.div>

    </motion.div>
  );
}
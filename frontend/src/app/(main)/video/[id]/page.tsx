"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Scissors, PlayCircle, Video as VideoIcon, Mic, Music } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Video, Clip } from "@/types";
import { Button } from "@/components/ui/Button";
import ClipCard from "@/components/shared/ClipCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, pageTransition, scaleIn } from "@/lib/animations";
import GuestAuthModal from "@/components/shared/GuestAuthModal";

// Quick helper for duration formatting
function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [video, setVideo] = useState<Video | null>(null);
  const [recentClips, setRecentClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useEffect(() => {
    async function fetchVideoDetails() {
      try {
        if (!params.id) return;

        // 1. Fetch the video
        const { data: videoData, error: videoError } = await supabase
          .from("videos")
          .select("*")
          .eq("id", params.id)
          .single();

        if (videoError) throw videoError;
        setVideo(videoData);

        // 2. Fetch recent clips made from this video
        const { data: clipsData, error: clipsError } = await supabase
          .from("clips")
          .select("*")
          .eq("video_id", params.id)
          .order("created_at", { ascending: false })
          .limit(6);

        if (clipsError) throw clipsError;
        setRecentClips(clipsData || []);

      } catch (err: any) {
        console.error("Error fetching video details:", err);
        setError("We couldn't find this video. It may have been removed.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideoDetails();
  }, [params.id, supabase]);

  if (isLoading) return <VideoDetailsSkeleton />;

  if (error || !video) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center h-[50vh]"
      >
        <div className="w-12 h-12 bg-error-red/10 rounded-full flex items-center justify-center mb-4">
          <VideoIcon className="w-6 h-6 text-error-red" />
        </div>
        <h3 className="font-medium text-lg text-charcoal">Video Not Found</h3>
        <p className="text-charcoal/60 text-sm mt-1 mb-6">{error}</p>
        <Link href="/library">
          <Button variant="secondary">Go back to Library</Button>
        </Link>
      </motion.div>
    );
  }

  const isMusic = video.category === "music";

  const handleStartEditing = async () => {
    // If user already opted into guest mode this session, skip
    if (sessionStorage.getItem("spiritual-clip-guest") === "true") {
      router.push(`/editor/${video.id}`);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push(`/editor/${video.id}`);
    } else {
      setIsGuestModalOpen(true);
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-0"
    >
      
      {/* Back Navigation */}
      <motion.div variants={fadeInUp}>
        <Link 
          href="/library" 
          className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
      </motion.div>

      {/* Main Video Hero Section */}
      <motion.div
        variants={scaleIn}
        className="bg-white rounded-large shadow-level-1 overflow-hidden border border-sand"
      >
        {/* Large Cinematic Thumbnail with Ken Burns */}
        <div className="relative aspect-video w-full bg-charcoal overflow-hidden">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="object-cover w-full h-full opacity-90 ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
          
          {/* CATEGORY HERO BADGE (Top Left) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className={cn(
              "absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-standard backdrop-blur-md flex items-center gap-2 shadow-sm border uppercase tracking-wider",
              isMusic 
                ? "bg-black/70 text-emerald-green border-emerald-green/30" 
                : "bg-black/70 text-soft-gold border-soft-gold/30"
            )}
          >
            {isMusic ? (
              <>
                <Music className="w-4 h-4" /> 
                Official Nasheeds
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" /> 
                Official Lecture
              </>
            )}
          </motion.div>

          {/* Duration Badge (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute bottom-4 left-4 bg-black/70 text-white text-sm font-medium px-3 py-1.5 rounded-standard backdrop-blur-md flex items-center gap-2 border border-white/10"
          >
            <Clock className="w-4 h-4 text-soft-gold" />
            {formatDuration(video.duration_seconds)}
          </motion.div>
        </div>

        {/* Video Information & Desktop Action */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 space-y-2"
          >
            <motion.h1 variants={fadeInUp} className="font-heading text-2xl md:text-3xl font-semibold text-charcoal leading-tight">
              {video.title}
            </motion.h1>
            
            {/* TAILORED WORKFLOW DESCRIPTION */}
            <motion.p variants={fadeInUp} className="text-charcoal/70 text-sm md:text-base leading-relaxed">
              {isMusic
                ? "Extract viral moments, choruses, and spiritual nasheeds in clean 9:16 portrait mode with optional translated lyrics."
                : "Transform this lecture into vertical clips with AI highlights, multi-language subtitles, and supporting B-roll overlays."}
            </motion.p>
            
            <motion.p variants={fadeInUp} className="text-xs text-charcoal/50 pt-1">
              {video.clip_count} {video.clip_count === 1 ? "clip has" : "clips have"} been created from this {isMusic ? "music video" : "lecture"}.
            </motion.p>
          </motion.div>

          {/* Desktop Adaptive Button (Hidden on Mobile) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
            className="hidden md:block shrink-0"
          >
            <Button 
              size="lg" 
              variant={isMusic ? "emerald" : "primary"}
              onClick={handleStartEditing} 
              className="shadow-level-2 glow-ring"
            >
              <Scissors className="w-5 h-5 mr-2" />
              {isMusic ? "Clip Music Video" : "Clip Lecture"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Clips Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <motion.h3 variants={fadeInUp} className="font-medium text-lg text-charcoal px-1">
          Recently Created Clips
        </motion.h3>
        
        {recentClips.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {recentClips.map((clip) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} className="p-8 text-center bg-sand/20 rounded-large border border-sand border-dashed">
            <p className="text-charcoal/60 text-sm">No clips have been created from this video yet.</p>
            <p className="text-charcoal/80 font-medium mt-1">Be the first to share a reminder!</p>
          </motion.div>
        )}
      </motion.div>

      {/* MOBILE STICKY ACTION BAR */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 25 }}
        className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-ivory/90 backdrop-blur-lg border-t border-sand z-40"
      >
        <Button 
          size="lg" 
          variant={isMusic ? "emerald" : "primary"}
          className="w-full shadow-level-2" 
          onClick={handleStartEditing}
        >
          <Scissors className="w-5 h-5 mr-2" />
          {isMusic ? "Clip Music Video" : "Clip Lecture"}
        </Button>
      </motion.div>

      {/* GUEST AUTH MODAL */}
      <GuestAuthModal 
        isOpen={isGuestModalOpen} 
        onClose={() => setIsGuestModalOpen(false)} 
        videoId={video.id} 
      />
    </motion.div>
  );
}

// ---------------------------------------------
// SKELETON LOADER
// ---------------------------------------------
function VideoDetailsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-pulse pb-20 md:pb-8">
      <div className="w-24 h-4 bg-sand/50 rounded-full" />
      
      <div className="bg-white rounded-2xl border border-sand/50 overflow-hidden shadow-level-1">
        <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8 items-center">
          <div className="w-full md:w-[320px] aspect-video bg-sand/40 rounded-large shrink-0" />
          <div className="flex-1 space-y-4 w-full">
            <div className="w-3/4 h-8 bg-sand/40 rounded-lg" />
            <div className="w-full h-16 bg-sand/30 rounded-lg" />
            <div className="w-1/2 h-4 bg-sand/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
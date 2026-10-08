"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Video, Clip } from "@/types";
import VideoCard from "@/components/shared/VideoCard";
import ClipCard from "@/components/shared/ClipCard";
import { Mic, Music, Repeat, Clapperboard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeInUp, pageTransition } from "@/lib/animations";

type TabType = "lectures" | "music" | "clips";

function LibraryContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");

  // Initialize active tab from URL query param if present (?tab=clips or ?tab=music)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (tabQuery === "clips" || tabQuery === "music" || tabQuery === "lectures") {
      return tabQuery;
    }
    return "lectures";
  });

  const [videos, setVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Sync active tab if user navigates between query parameters
  useEffect(() => {
    if (tabQuery === "clips" || tabQuery === "music" || tabQuery === "lectures") {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch videos and ONLY public community clips in parallel
        const [videosRes, clipsRes] = await Promise.all([
          supabase.from("videos").select("*").order("created_at", { ascending: false }),
          supabase
            .from("clips")
            .select("*")
            .eq("is_public", true) // Privacy filter
            .order("created_at", { ascending: false })
        ]);

        if (videosRes.error) throw videosRes.error;
        if (clipsRes.error) throw clipsRes.error;

        setVideos(videosRes.data || []);
        setClips(clipsRes.data || []);

      } catch (err: any) {
        console.error("Error fetching content:", err);
        setError("Failed to load library content.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [supabase]);

  // Derived state for categories
  const lectures = videos.filter((v) => v.category !== "music");
  const musicVideos = videos.filter((v) => v.category === "music");

  const tabItems = [
    { id: "lectures" as TabType, label: "Lectures", icon: Mic, color: "text-soft-gold" },
    { id: "music" as TabType, label: "Music Videos", icon: Music, color: "text-soft-gold" },
    { id: "clips" as TabType, label: "Community Clips", icon: Repeat, color: "text-emerald-green" },
  ];

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      className="space-y-6 md:space-y-8 pb-8"
    >
      
      {/* 1. HERO HEADER */}
      <motion.div variants={fadeInUp} className="text-center md:text-left space-y-2">
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal">
          Spread the Muhammadan Light
        </h1>
        <p className="text-charcoal/70 text-sm md:text-base max-w-2xl mx-auto md:mx-0">
          Select an official lecture or music video to make a clip, or discover and remix the best clips created by the community.
        </p>
      </motion.div>

      {/* 2. THE 3-PILL DISCOVERY ENGINE with sliding indicator */}
      <motion.div variants={fadeInUp} className="flex justify-center md:justify-start">
        <div className="flex items-center bg-sand/40 p-1 rounded-full w-full max-w-[500px] border border-sand/50 shadow-inner overflow-x-auto no-scrollbar">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-3 rounded-full text-xs sm:text-sm font-medium transition-colors select-none whitespace-nowrap z-10",
                activeTab === tab.id
                  ? "text-charcoal font-semibold"
                  : "text-charcoal/60 hover:text-charcoal"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="library-tab-indicator"
                  className="absolute inset-0 bg-white rounded-full shadow-level-1"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <tab.icon className={cn("w-4 h-4 relative z-10", activeTab === tab.id && tab.color)} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 3. ERROR STATE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-error-red/10 text-error-red rounded-standard border border-error-red/20"
        >
          <p className="font-medium">Connection Error</p>
          <p className="text-sm opacity-80">{error}</p>
        </motion.div>
      )}

      {/* 4. DYNAMIC CONTENT GRID with AnimatePresence */}
      <AnimatePresence mode="wait">
        {/* A. LECTURES TAB */}
        {activeTab === "lectures" && (
          <motion.div
            key="lectures"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {isLoading && Array.from({ length: 6 }).map((_, i) => <VideoSkeleton key={i} />)}
            {!isLoading && lectures.map((video) => <VideoCard key={video.id} video={video} />)}
            {!isLoading && lectures.length === 0 && !error && <EmptyState type="lectures" />}
          </motion.div>
        )}

        {/* B. MUSIC VIDEOS TAB */}
        {activeTab === "music" && (
          <motion.div
            key="music"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {isLoading && Array.from({ length: 3 }).map((_, i) => <VideoSkeleton key={i} />)}
            {!isLoading && musicVideos.map((video) => <VideoCard key={video.id} video={video} />)}
            {!isLoading && musicVideos.length === 0 && !error && <EmptyState type="music" />}
          </motion.div>
        )}

        {/* C. COMMUNITY CLIPS TAB (Public Only) */}
        {activeTab === "clips" && (
          <motion.div
            key="clips"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
          >
            {isLoading && Array.from({ length: 5 }).map((_, i) => <ClipSkeleton key={i} />)}
            {!isLoading && clips.map((clip) => <ClipCard key={clip.id} clip={clip} />)}
            {!isLoading && clips.length === 0 && !error && <EmptyState type="clips" />}
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

function EmptyState({ type }: { type: TabType }) {
  const messages = {
    lectures: "No official lectures have been uploaded yet.",
    music: "No official music videos or nasheeds have been uploaded yet.",
    clips: "No community clips have been shared yet. Be the first to publish a reminder!",
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-large border border-sand border-dashed mt-4"
    >
      <div className="w-12 h-12 bg-sand/50 rounded-full flex items-center justify-center mb-4 float-animation">
        <Clapperboard className="w-6 h-6 text-charcoal/40" />
      </div>
      <h3 className="font-medium text-lg text-charcoal">Nothing here yet</h3>
      <p className="text-charcoal/60 text-sm mt-1 max-w-sm">
        {messages[type]}
      </p>
    </motion.div>
  );
}

function VideoSkeleton() {
  return (
    <motion.div variants={fadeInUp} className="flex flex-col bg-white rounded-large shadow-level-1 overflow-hidden border border-sand">
      <div className="aspect-video w-full skeleton-shimmer" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 skeleton-shimmer rounded w-3/4" />
        <div className="h-4 skeleton-shimmer rounded w-1/3" />
      </div>
    </motion.div>
  );
}

function ClipSkeleton() {
  return (
    <motion.div variants={fadeInUp} className="aspect-[9/16] w-full rounded-large border border-sand flex flex-col justify-between p-3 skeleton-shimmer">
      <div className="flex justify-between">
        <div className="w-16 h-4 bg-sand/50 rounded-full" />
        <div className="w-8 h-4 bg-sand/50 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 bg-sand/50 rounded-standard" />
        <div className="w-8 h-8 shrink-0 bg-sand/50 rounded-standard" />
      </div>
    </motion.div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-soft-gold" />
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
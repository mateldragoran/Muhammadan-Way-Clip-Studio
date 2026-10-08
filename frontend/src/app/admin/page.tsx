"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Video, Clip, PresetTrack } from "@/types";
import { Button } from "@/components/ui/Button";
import { 
  Trash2, 
  Plus, 
  Clock, 
  Film, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Mic, 
  Music,
  Scissors,
  User,
  Download,
  ExternalLink,
  Loader2,
  Lock,
  UploadCloud,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { tabTransition, staggerContainer, staggerItem } from "@/lib/animations";

// Extended Clip interface with joined relations
interface AdminClip extends Clip {
  videos?: { title: string };
  profiles?: { username: string; email: string };
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getFileNameFromUrl(url: string, bucketName: string) {
  if (!url) return null;
  const parts = url.split(`/${bucketName}/`);
  return parts.length > 1 ? parts[1] : null;
}

function getCaptionCount(captionsJson: Video["captions_json"]): number {
  if (!captionsJson) return 0;
  if (Array.isArray(captionsJson)) return captionsJson.length;
  if (typeof captionsJson === "object") {
    return Object.values(captionsJson).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  }
  return 0;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const hiddenAudioRef = useRef<HTMLAudioElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"videos" | "clips" | "music">("videos");
  
  // Data States
  const [videos, setVideos] = useState<Video[]>([]);
  const [clips, setClips] = useState<AdminClip[]>([]);
  const [presetMusic, setPresetMusic] = useState<PresetTrack[]>([]);
  
  // Action & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [deletingClipId, setDeletingClipId] = useState<string | null>(null);
  const [deletingMusicId, setDeletingMusicId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Preset Music Form State
  const [musicTitle, setMusicTitle] = useState("");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicDuration, setMusicDuration] = useState<number>(0);
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);

  // 1. Fetch videos, clips, and preset music in parallel
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [videosRes, clipsRes, musicRes] = await Promise.all([
        supabase.from("videos").select("*").order("created_at", { ascending: false }),
        supabase.from("clips").select("*, videos(title), profiles(username, email)").order("created_at", { ascending: false }),
        supabase.from("preset_music").select("*").order("created_at", { ascending: false })
      ]);

      if (videosRes.error) throw videosRes.error;
      if (clipsRes.error) throw clipsRes.error;
      if (musicRes.error) throw musicRes.error;

      setVideos(videosRes.data || []);
      setClips(clipsRes.data || []);
      setPresetMusic(musicRes.data || []);
    } catch (err: any) {
      console.error("Error fetching admin data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Category Switcher (Lecture ↔ Nasheed)
  const handleUpdateCategory = async (video: Video, newCategory: "lecture" | "music") => {
    if (video.category === newCategory) return;

    setUpdatingCategoryId(video.id);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from("videos")
        .update({ category: newCategory })
        .eq("id", video.id)
        .select();

      if (updateError) throw updateError;
      
      if (!data || data.length === 0) {
        throw new Error("Update blocked by database permissions. Please ensure the SQL UPDATE policy is applied in Supabase.");
      }

      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, category: newCategory } : v))
      );
    } catch (err: any) {
      console.error("Failed to update category:", err);
      setError(err.message || "Could not update video category.");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  // 3. Trigger Deepgram AI Captions Generation
  const handleProcessCaptions = async (video: Video) => {
    setProcessingId(video.id);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      const res = await fetch(`${apiUrl}/api/video/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate AI captions. Make sure backend is running.");
      }

      alert(`Success! Real Deepgram AI captions generated for "${video.title}"`);
      await fetchData();

    } catch (err: any) {
      console.error("Caption processing error:", err);
      setError(err.message || "Failed to process captions.");
    } finally {
      setProcessingId(null);
    }
  };

  // 4. Delete Source Video (Cascading)
  const handleDeleteVideo = async (video: Video) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${video.title}"?\n\nWarning: This will also delete all associated user projects, clips, and storage files!`
    );

    if (!confirmDelete) return;

    setDeletingVideoId(video.id);
    setError(null);

    try {
      // Deleting the video will now automatically cascade and delete associated clips & projects
      // thanks to the ON DELETE CASCADE constraints you added to the database!
      const { error: videoError } = await supabase.from("videos").delete().eq("id", video.id);
      if (videoError) throw videoError;

      const videoFileName = getFileNameFromUrl(video.video_url, "source-videos");
      const thumbFileName = getFileNameFromUrl(video.thumbnail_url, "source-videos");
      const filesToRemove = [videoFileName, thumbFileName].filter(Boolean) as string[];

      if (filesToRemove.length > 0) {
        await supabase.storage.from("source-videos").remove(filesToRemove);
      }

      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      setClips((prev) => prev.filter((c) => c.video_id !== video.id));

    } catch (err: any) {
      console.error("Deletion error:", err);
      setError(err.message || "Failed to delete video.");
    } finally {
      setDeletingVideoId(null);
    }
  };

  // 5. Delete User Clip (Single Clip Deletion)
  const handleDeleteClip = async (clip: AdminClip) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user clip?");
    if (!confirmDelete) return;

    setDeletingClipId(clip.id);
    setError(null);

    try {
      const { error: clipError } = await supabase
        .from("clips")
        .delete()
        .eq("id", clip.id);

      if (clipError) throw clipError;

      if (clip.project_id) {
        await supabase.from("projects").delete().eq("id", clip.project_id);
      }

      const clipFileName = getFileNameFromUrl(clip.clip_url, "rendered-clips");
      if (clipFileName) {
        await supabase.storage.from("rendered-clips").remove([clipFileName]);
      }

      setClips((prev) => prev.filter((c) => c.id !== clip.id));
      setVideos((prev) =>
        prev.map((v) =>
          v.id === clip.video_id ? { ...v, clip_count: Math.max(0, (v.clip_count || 1) - 1) } : v
        )
      );

    } catch (err: any) {
      console.error("Error deleting clip:", err);
      setError(err.message || "Failed to delete clip.");
    } finally {
      setDeletingClipId(null);
    }
  };

  // 6. Handle Preset Music Selection & Duration Extraction
  const handleMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMusicFile(file);
      const url = URL.createObjectURL(file);
      if (hiddenAudioRef.current) {
        hiddenAudioRef.current.src = url;
      }
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (hiddenAudioRef.current) {
      setMusicDuration(Math.round(hiddenAudioRef.current.duration));
    }
  };

  // Direct REST upload for audio files to avoid JWT "alg" issues
  const uploadAudioDirect = async (file: File, fileName: string): Promise<string> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase configuration.");
    }

    const endpoint = `${supabaseUrl}/storage/v1/object/bg-music/${fileName}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "x-upsert": "true",
        "cache-control": "3600",
        "content-type": file.type || "audio/mpeg",
      },
      body: file,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `Upload failed with status ${response.status}`);
    }

    return `${supabaseUrl}/storage/v1/object/public/bg-music/${fileName}`;
  };

  // 7. Add New Preset Music Track
  const handleAddPresetMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicTitle.trim() || !musicFile) {
      setError("Please provide a track title and select an audio file.");
      return;
    }
    if (musicDuration === 0) {
      setError("Still calculating audio duration. Please wait a moment.");
      return;
    }

    setIsUploadingMusic(true);
    setError(null);

    try {
      const fileExt = musicFile.name.split(".").pop() || "mp3";
      const fileName = `preset_${Date.now()}.${fileExt}`;

      // Upload to bg-music bucket
      const publicUrl = await uploadAudioDirect(musicFile, fileName);

      // Insert record into preset_music table
      const { data, error: insertError } = await supabase
        .from("preset_music")
        .insert({
          title: musicTitle.trim(),
          duration_seconds: musicDuration,
          audio_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setPresetMusic((prev) => [data, ...prev]);
      setMusicTitle("");
      setMusicFile(null);
      setMusicDuration(0);
      if (musicFileInputRef.current) musicFileInputRef.current.value = "";

    } catch (err: any) {
      console.error("Music upload error:", err);
      setError(err.message || "Failed to upload preset track.");
    } finally {
      setIsUploadingMusic(false);
    }
  };

  // 8. Delete Preset Music Track
  const handleDeletePresetMusic = async (track: PresetTrack) => {
    const confirmDelete = window.confirm(`Delete "${track.title}" from the Preset Music library?`);
    if (!confirmDelete) return;

    setDeletingMusicId(track.id);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("preset_music")
        .delete()
        .eq("id", track.id);

      if (dbError) throw dbError;

      const fileName = getFileNameFromUrl(track.audio_url, "bg-music");
      if (fileName) {
        await supabase.storage.from("bg-music").remove([fileName]);
      }

      setPresetMusic((prev) => prev.filter((t) => t.id !== track.id));

    } catch (err: any) {
      console.error("Error deleting track:", err);
      setError(err.message || "Failed to delete track.");
    } finally {
      setDeletingMusicId(null);
    }
  };

  const lectureCount = videos.filter((v) => v.category !== "music").length;
  const musicCount = videos.filter((v) => v.category === "music").length;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 md:space-y-8 pb-12">
      
      {/* Hidden audio element for duration calculation */}
      <audio ref={hiddenAudioRef} onLoadedMetadata={handleAudioLoadedMetadata} className="hidden" preload="metadata" />

      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">Admin Workspace</h1>
          <p className="text-charcoal/60 text-sm mt-1">
            Manage source videos, moderate community clips, and curate the spiritual music library.
          </p>
        </div>

        <Link href="/admin/upload">
          <Button size="md" variant="emerald" className="w-full sm:w-auto shadow-level-1 hover-lift glow-ring">
            <Plus className="w-4 h-4 mr-2" />
            Upload New Video
          </Button>
        </Link>
      </motion.div>

      {/* 4-Stat Summary Banner */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-large border border-sand shadow-level-1 flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-1 hover:shadow-level-2 duration-300">
          <div className="w-10 h-10 rounded-standard bg-soft-gold/15 text-soft-gold flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">Lectures</span>
            <span className="font-heading text-xl font-bold text-charcoal">{lectureCount}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-large border border-sand shadow-level-1 flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-1 hover:shadow-level-2 duration-300">
          <div className="w-10 h-10 rounded-standard bg-emerald-green/15 text-emerald-green flex items-center justify-center shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">Nasheeds</span>
            <span className="font-heading text-xl font-bold text-charcoal">{musicCount}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-large border border-sand shadow-level-1 flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-1 hover:shadow-level-2 duration-300">
          <div className="w-10 h-10 rounded-standard bg-charcoal/10 text-charcoal flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">User Clips</span>
            <span className="font-heading text-xl font-bold text-charcoal">{clips.length}</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-large border border-sand shadow-level-1 flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-1 hover:shadow-level-2 duration-300">
          <div className="w-10 h-10 rounded-standard bg-info-blue/15 text-info-blue flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-charcoal/60 block">Preset Tracks</span>
            <span className="font-heading text-xl font-bold text-charcoal">{presetMusic.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Admin 3-Way Tabs Toggle */}
      <motion.div variants={staggerItem} className="flex bg-sand/40 p-1 rounded-full w-full max-w-lg border border-sand/60 overflow-x-auto no-scrollbar relative">
        {["videos", "clips", "music"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 px-3 rounded-full text-xs sm:text-sm font-medium transition-colors select-none whitespace-nowrap relative z-10",
                isActive ? "text-charcoal font-semibold" : "text-charcoal/60 hover:text-charcoal"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="adminTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab === "videos" && <Film className="w-4 h-4 text-soft-gold" />}
                {tab === "clips" && <Scissors className="w-4 h-4 text-emerald-green" />}
                {tab === "music" && <Music className="w-4 h-4 text-info-blue" />}
                {tab === "videos" && `Source Videos (${videos.length})`}
                {tab === "clips" && `User Clips (${clips.length})`}
                {tab === "music" && `Preset Music (${presetMusic.length})`}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Error Feedback */}
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-error-red/10 text-error-red text-sm rounded-standard border border-error-red/20 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* ========================================= */}
        {/* TAB 1: SOURCE VIDEOS MANAGEMENT           */}
        {/* ========================================= */}
        {activeTab === "videos" && (
          <motion.div key="videos" variants={tabTransition} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-large shadow-level-1 border border-sand overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-24 h-14 bg-sand/40 rounded-standard shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-sand/60 rounded w-1/2" />
                      <div className="h-3 bg-sand/30 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Film className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-medium text-charcoal text-base">No source videos found</h3>
                <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
                  Add your first video to allow users to create vertical reminder clips.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-sand/50">
                <AnimatePresence initial={false}>
                  {videos.map((video) => {
                    const isDeleting = deletingVideoId === video.id;
                    const isProcessing = processingId === video.id;
                    const isUpdatingCategory = updatingCategoryId === video.id;
                    const captionCount = getCaptionCount(video.captions_json);
                    const hasCaptions = captionCount > 0;
                    const isMusic = video.category === "music";

                    return (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-ivory/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative w-24 h-14 rounded-standard overflow-hidden bg-charcoal shrink-0 border border-sand">
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                              {formatDuration(video.duration_seconds)}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="font-medium text-sm sm:text-base text-charcoal truncate">
                              {video.title}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/60">
                              <span>{video.clip_count || 0} clips created</span>
                              <span>•</span>
                              {hasCaptions ? (
                                <span className="inline-flex items-center gap-1 text-success-green font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Captions ({captionCount} lines)
                                </span>
                              ) : (
                                <span className="text-warning-amber font-medium">
                                  No Captions
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 shrink-0">
                          <div className="flex items-center bg-sand/40 p-1 rounded-standard border border-sand/60 shadow-2xs relative">
                            <button
                              type="button"
                              onClick={() => handleUpdateCategory(video, "lecture")}
                              disabled={isUpdatingCategory}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all select-none relative z-10",
                                !isMusic
                                  ? "text-charcoal font-semibold"
                                  : "text-charcoal/50 hover:text-charcoal"
                              )}
                            >
                              {!isMusic && (
                                <motion.div layoutId={`cat-${video.id}`} className="absolute inset-0 bg-white rounded shadow-2xs -z-10" />
                              )}
                              {isUpdatingCategory && !isMusic ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Mic className={cn("w-3 h-3", !isMusic ? "text-soft-gold" : "text-charcoal/40")} />
                              )}
                              Lecture
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateCategory(video, "music")}
                              disabled={isUpdatingCategory}
                              className={cn(
                                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all select-none relative z-10",
                                isMusic
                                  ? "text-charcoal font-semibold"
                                  : "text-charcoal/50 hover:text-charcoal"
                              )}
                            >
                              {isMusic && (
                                <motion.div layoutId={`cat-${video.id}`} className="absolute inset-0 bg-white rounded shadow-2xs -z-10" />
                              )}
                              {isUpdatingCategory && isMusic ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Music className={cn("w-3 h-3", isMusic ? "text-emerald-green" : "text-charcoal/40")} />
                              )}
                              Nasheed
                            </button>
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleProcessCaptions(video)}
                            isLoading={isProcessing}
                            disabled={isProcessing || deletingVideoId !== null}
                            title="Run Deepgram AI to transcribe captions"
                            className="text-xs hover-lift bg-white border-sand"
                          >
                            {!isProcessing && <Sparkles className="w-3.5 h-3.5 mr-1 text-soft-gold" />}
                            {hasCaptions ? "Re-transcribe" : "AI Captions"}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteVideo(video)}
                            isLoading={isDeleting}
                            disabled={isProcessing || deletingVideoId !== null}
                            className="text-xs hover-lift"
                          >
                            {!isDeleting && <Trash2 className="w-3.5 h-3.5 mr-1" />}
                            Delete
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================= */}
        {/* TAB 2: USER CLIPS MANAGEMENT              */}
        {/* ========================================= */}
        {activeTab === "clips" && (
          <motion.div key="clips" variants={tabTransition} initial="hidden" animate="visible" exit="exit" className="bg-white rounded-large shadow-level-1 border border-sand overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-16 h-24 bg-sand/40 rounded-standard shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-sand/60 rounded w-1/2" />
                      <div className="h-3 bg-sand/30 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : clips.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Scissors className="w-10 h-10 text-charcoal/30 mx-auto" />
                <h3 className="font-medium text-charcoal text-base">No user clips created yet</h3>
                <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
                  When community members clip reminders or nasheeds, they will appear here for moderation.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-sand/50">
                <AnimatePresence initial={false}>
                  {clips.map((clip) => {
                    const isDeleting = deletingClipId === clip.id;
                    const isMusic = clip.category === "music";
                    const isPrivate = clip.is_public === false;

                    return (
                      <motion.div
                        key={clip.id}
                        initial={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-ivory/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative w-14 h-24 rounded-standard overflow-hidden bg-charcoal shrink-0 border border-sand">
                            <video
                              src={clip.clip_url}
                              preload="metadata"
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1",
                                isMusic ? "bg-emerald-green/10 text-emerald-green border-emerald-green/20" : "bg-soft-gold/15 text-charcoal border-soft-gold/30"
                              )}>
                                {isMusic ? <Music className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                                {isMusic ? "Nasheed" : "Lecture"}
                              </span>

                              {isPrivate ? (
                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/80 text-warning-amber px-2 py-0.5 rounded-full border border-warning-amber/30 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Private
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-sand/40 text-charcoal/70 px-2 py-0.5 rounded-full border border-sand">
                                  Public
                                </span>
                              )}

                              <span className="text-xs text-charcoal/50">
                                Created {new Date(clip.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <h3 className="font-medium text-sm sm:text-base text-charcoal truncate">
                              {clip.videos?.title || "Untitled Source Video"}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-charcoal/60">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-charcoal/40" />
                                {clip.profiles?.username || "Anonymous Clipper"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Download className="w-3.5 h-3.5 text-emerald-green" />
                                {clip.downloads || 0} downloads
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          <Link href={`/clip/${clip.id}`} target="_blank">
                            <Button variant="secondary" size="sm" className="text-xs hover-lift bg-white border-sand">
                              <ExternalLink className="w-3.5 h-3.5 mr-1" />
                              View Page
                            </Button>
                          </Link>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClip(clip)}
                            isLoading={isDeleting}
                            disabled={deletingClipId !== null}
                            className="text-xs hover-lift"
                          >
                            {!isDeleting && <Trash2 className="w-3.5 h-3.5 mr-1" />}
                            Delete Clip
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================= */}
        {/* TAB 3: PRESET MUSIC LIBRARY MANAGEMENT    */}
        {/* ========================================= */}
        {activeTab === "music" && (
          <motion.div key="music" variants={tabTransition} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            
            {/* Upload Preset Music Form */}
            <div className="bg-white p-6 rounded-large border border-sand shadow-level-1 transition-transform hover:-translate-y-1 hover:shadow-level-2 duration-300">
              <h3 className="font-heading text-xl font-semibold text-charcoal mb-1">
                Add New Ambient Track
              </h3>
              <p className="text-xs text-charcoal/60 mb-4">
                Upload a background nasheed or ambient sound for users to choose from in the editor.
              </p>

              <form onSubmit={handleAddPresetMusic} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Track Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-charcoal/80 uppercase tracking-wider">
                      Track Title
                    </label>
                    <input
                      type="text"
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      required
                      placeholder="e.g., Soft Spiritual Flute & Ambient Zikr"
                      className="w-full h-11 px-4 rounded-standard border border-sand bg-ivory/30 text-sm text-charcoal focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-all"
                    />
                  </div>

                  {/* Audio File Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-charcoal/80 uppercase tracking-wider">
                      Audio File (.mp3, .wav)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleMusicSelect}
                        required
                        ref={musicFileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-11 px-4 rounded-standard border border-sand bg-ivory/30 flex items-center justify-between transition-colors hover:border-soft-gold">
                        <span className="text-sm text-charcoal truncate pr-2">
                          {musicFile ? musicFile.name : "Select audio file..."}
                        </span>
                        <UploadCloud className="w-4 h-4 text-charcoal/40" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={isUploadingMusic} disabled={isUploadingMusic || musicDuration === 0} className="glow-ring">
                    {!isUploadingMusic && <Plus className="w-4 h-4 mr-2" />}
                    Upload Track
                  </Button>
                </div>
              </form>
            </div>

            {/* Existing Preset Music List */}
            <div className="bg-white rounded-large shadow-level-1 border border-sand overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-sand bg-ivory/30">
                <h3 className="font-semibold text-charcoal flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-soft-gold" /> Available Tracks ({presetMusic.length})
                </h3>
              </div>
              
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="h-4 bg-sand/60 rounded w-1/3" />
                      <div className="h-8 w-8 bg-sand/40 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : presetMusic.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Music className="w-10 h-10 text-charcoal/30 mx-auto" />
                  <h3 className="font-medium text-charcoal text-base">No tracks available</h3>
                  <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
                    Upload your first ambient track above to populate the library.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-sand/50">
                  <AnimatePresence initial={false}>
                    {presetMusic.map((track) => {
                      const isDeleting = deletingMusicId === track.id;
                      
                      return (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 sm:p-5 flex items-center justify-between hover:bg-ivory/30 transition-colors group"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-soft-gold/10 flex items-center justify-center shrink-0">
                              <Music className="w-5 h-5 text-soft-gold" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-medium text-sm sm:text-base text-charcoal truncate">
                                {track.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-charcoal/50">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDuration(track.duration_seconds)}
                                </span>
                                <span>•</span>
                                <span>Added {new Date(track.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-4">
                            <audio src={track.audio_url} controls className="h-8 w-24 sm:w-48 text-xs outline-none opacity-50 hover:opacity-100 transition-opacity" />
                            
                            <button
                              onClick={() => handleDeletePresetMusic(track)}
                              disabled={isDeleting}
                              className="p-2 text-error-red/60 hover:text-error-red hover:bg-error-red/10 rounded-full transition-colors"
                              title="Delete track"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
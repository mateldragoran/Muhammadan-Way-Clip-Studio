"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/store/useEditorStore";
import { PresetTrack } from "@/types";
import { 
  Music, 
  UploadCloud, 
  Trash2, 
  Loader2, 
  Volume2, 
  Play, 
  Pause, 
  Plus, 
  Headphones,
  Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioTray() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const { bgMusic, setBgMusic, updateBgMusic, trimStart, trimEnd, currentTime } = useEditorStore();

  const [presetTracks, setPresetTracks] = useState<PresetTrack[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(true);
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPresets() {
      try {
        const { data, error } = await supabase
          .from("preset_music")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPresetTracks(data || []);
      } catch (err) {
        console.error("Error loading preset music:", err);
      } finally {
        setIsLoadingPresets(false);
      }
    }

    fetchPresets();

    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, [supabase]);

  const handleTogglePreview = (track: PresetTrack, e: React.MouseEvent) => {
    e.stopPropagation();

    if (previewingTrackId === track.id) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewingTrackId(null);
      return;
    }

    if (previewAudioRef.current) previewAudioRef.current.pause();

    const audio = new Audio(track.audio_url);
    audio.volume = 0.5;
    audio.onended = () => setPreviewingTrackId(null);
    audio.play().catch(() => {});
    
    previewAudioRef.current = audio;
    setPreviewingTrackId(track.id);
  };

  const handleSelectPreset = (track: PresetTrack) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingTrackId(null);
    }

    const start = Math.max(trimStart, currentTime);
    const end = Math.min(trimEnd, start + track.duration_seconds);

    setBgMusic({
      url: track.audio_url,
      volume: 0.1,
      startTime: start,
      endTime: end,
      duration: track.duration_seconds,
      isLooping: true,
    });
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => resolve(60);
    });
  };

  const uploadAudioDirect = async (file: File, fileName: string): Promise<string> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) throw new Error("Missing Supabase configuration.");

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

  const handleCustomUpload = async (file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.endsWith(".mp3") && !file.name.endsWith(".wav")) {
      setError("Please upload an audio file (.mp3, .wav).");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const duration = await getAudioDuration(file);
      const fileExt = file.name.split(".").pop();
      const fileName = `bgm_${Date.now()}.${fileExt}`;

      let audioUrl: string;

      try {
        audioUrl = await uploadAudioDirect(file, fileName);
      } catch (uploadErr) {
        console.warn("Storage upload failed for audio, using local Base64 fallback:", uploadErr);
        audioUrl = await fileToDataUrl(file);
      }

      const start = Math.max(trimStart, currentTime);
      const end = Math.min(trimEnd, start + duration);

      setBgMusic({ 
        url: audioUrl, 
        volume: 0.1, 
        startTime: start, 
        endTime: end, 
        duration: duration, 
        isLooping: true
      });

    } catch (err: any) {
      console.error("Audio processing error:", err);
      setError(err.message || "Failed to process audio file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3, audio/wav, audio/mpeg, audio/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleCustomUpload(e.target.files[0])}
      />

      {/* ========================================= */}
      {/* VIEW A: BROWSE MUSIC LIBRARY              */}
      {/* ========================================= */}
      {!bgMusic && (
        <div className="space-y-3">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-charcoal/60 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-soft-gold" /> Curated Ambient Library
              </span>
              <span className="text-[9px] md:text-[10px] text-charcoal/40 font-medium font-mono">
                {presetTracks.length} tracks
              </span>
            </div>

            <div className="bg-white rounded-standard border border-sand shadow-2xs divide-y divide-sand/50 max-h-[200px] md:max-h-[240px] overflow-y-auto no-scrollbar">
              {isLoadingPresets ? (
                <div className="p-6 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-soft-gold" />
                  <span className="text-xs text-charcoal/50">Loading tracks...</span>
                </div>
              ) : presetTracks.length === 0 ? (
                <div className="p-6 text-center space-y-1.5">
                  <Headphones className="w-6 h-6 text-charcoal/30 mx-auto" />
                  <p className="text-xs text-charcoal/60">No preset tracks available yet.</p>
                </div>
              ) : (
                presetTracks.map((track) => {
                  const isPreviewing = previewingTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      className="p-2 md:p-2.5 flex items-center justify-between gap-3 hover:bg-ivory/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 md:gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePreview(track, e)}
                          className={cn(
                            "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-2xs",
                            isPreviewing
                              ? "bg-soft-gold text-charcoal"
                              : "bg-sand/40 text-charcoal hover:bg-sand/70"
                          )}
                        >
                          {isPreviewing ? <Pause className="w-3.5 h-3.5 fill-charcoal" /> : <Play className="w-3.5 h-3.5 fill-charcoal ml-0.5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] md:text-xs font-semibold text-charcoal truncate leading-tight">
                            {track.title}
                          </p>
                          <span className="text-[9px] md:text-[10px] font-mono text-charcoal/50">
                            {formatDuration(track.duration_seconds)}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSelectPreset(track)}
                        className="h-6 md:h-7 px-2 md:px-2.5 text-[10px] md:text-[11px] font-bold shrink-0 border-soft-gold/30 hover:border-soft-gold text-charcoal bg-white shadow-sm"
                      >
                        <Plus className="w-3 h-3 mr-0.5 text-soft-gold" />
                        Use
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-sand" />
            <span className="text-[9px] font-semibold uppercase tracking-wider text-charcoal/40">
              Or Upload Custom
            </span>
            <div className="flex-1 h-px bg-sand" />
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "p-3 rounded-standard border-2 border-dashed border-sand hover:border-soft-gold/60 bg-sand/15 hover:bg-sand/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center active:scale-[0.99]",
              isUploading && "pointer-events-none opacity-60"
            )}
          >
            {isUploading ? (
              <div className="flex items-center gap-2 py-0.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-soft-gold" />
                <span className="text-[11px] text-charcoal/70 font-medium">Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-0.5">
                <UploadCloud className="w-4 h-4 text-charcoal/40" />
                <span className="text-[11px] font-semibold text-charcoal">Tap to upload audio (.mp3)</span>
              </div>
            )}
          </div>

          {error && <div className="p-2 bg-error-red/10 text-error-red text-[10px] rounded-standard">{error}</div>}
        </div>
      )}

      {/* ========================================= */}
      {/* VIEW B: ACTIVE SPOTIFY-STYLE PLAYER       */}
      {/* ========================================= */}
      {bgMusic && (
        <div className="p-3 md:p-4 bg-charcoal text-ivory border border-charcoal rounded-large shadow-level-2 flex flex-col gap-3.5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-soft-gold/20 rounded-md flex items-center justify-center shrink-0 border border-soft-gold/30">
                <Music className="text-soft-gold w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs md:text-sm text-white truncate">Background Track</p>
                <p className="text-[10px] text-emerald-400 font-medium tracking-wide">Looping seamlessly</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setBgMusic(null)}
              className="p-2 text-ivory/50 hover:text-error-red transition-colors rounded hover:bg-white/10 shrink-0"
              title="Remove track"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sleek Volume Slider */}
          <div className="flex items-center gap-2.5 px-1">
            <Volume2 className="w-4 h-4 text-ivory/70 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={bgMusic.volume ?? 0.1}
              onChange={(e) => updateBgMusic({ volume: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-ew-resize accent-soft-gold outline-none"
            />
            <span className="text-[10px] font-mono font-bold text-soft-gold w-8 text-right shrink-0">
              {Math.round((bgMusic.volume ?? 0.1) * 100)}%
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
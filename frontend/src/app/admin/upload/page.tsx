"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { SupportedLanguage, CaptionItem, MultilingualCaptions } from "@/types";
import { 
  UploadCloud, 
  Video, 
  ImageIcon, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Mic,
  Music,
  Code,
  Check,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as tus from "tus-js-client";
import { motion, AnimatePresence } from "framer-motion";
import { slideInRight, tabTransition, staggerContainer, staggerItem } from "@/lib/animations";

type UploadStatus = "idle" | "uploading_media" | "success" | "error";

const languageTabs: { id: SupportedLanguage; label: string; native: string }[] = [
  { id: "en", label: "English", native: "English" },
  { id: "ur", label: "Urdu", native: "اردو" },
  { id: "es", label: "Spanish", native: "Español" },
  { id: "tr", label: "Turkish", native: "Türkçe" },
  { id: "ar", label: "Arabic", native: "العربية" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "fa", label: "Persian", native: "فارسی" },
];

export default function AdminUploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"lecture" | "music">("lecture");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  
  // Multilingual Captions State (Holds raw JSON string for each of the 7 languages)
  const [activeLangTab, setActiveLangTab] = useState<SupportedLanguage>("en");
  const [captionsByLang, setCaptionsByLang] = useState<Record<SupportedLanguage, string>>({
    en: "",
    ur: "",
    es: "",
    tr: "",
    ar: "",
    hi: "",
    fa: "",
  });
  
  // Progress State
  const [duration, setDuration] = useState<number>(0);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 10MB Chunked TUS Upload function
  const uploadWithTus = (
    file: File,
    path: string,
    onProgress: (percent: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const endpoint = `${supabaseUrl}/storage/v1/upload/resumable`;

      const upload = new tus.Upload(file, {
        endpoint: endpoint,
        retryDelays: [0, 3000, 5000, 10000],
        headers: {
          authorization: `Bearer ${anonKey}`,
          apikey: anonKey || "",
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: "source-videos",
          objectName: path,
          contentType: file.type || "application/octet-stream",
          cacheControl: "3600",
        },
        // 10MB CHUNKS: Bypasses Cloudflare limits cleanly
        chunkSize: 10 * 1024 * 1024, 
        onError: (error) => {
          console.error("TUS Upload Error:", error);
          reject(new Error(error.message || "Resumable upload failed."));
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          onProgress(percentage);
        },
        onSuccess: () => {
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/source-videos/${path}`;
          resolve(publicUrl);
        },
      });

      upload.start();
    });
  };

  // Extract video duration automatically
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      if (hiddenVideoRef.current) {
        hiddenVideoRef.current.src = url;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (hiddenVideoRef.current) {
      setDuration(Math.round(hiddenVideoRef.current.duration));
    }
  };

  const handleCaptionChange = (text: string) => {
    setCaptionsByLang((prev) => ({
      ...prev,
      [activeLangTab]: text,
    }));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Basic Media Validation
    if (!title || !videoFile || !thumbFile) {
      setErrorMessage("Please fill in the title and select both video and thumbnail files.");
      return;
    }
    if (duration === 0) {
      setErrorMessage("Still calculating video duration. Please wait a moment and try again.");
      return;
    }

    // 2. Pre-Upload JSON Validation for All 7 Languages
    const multilingualPayload: MultilingualCaptions = {};

    for (const [langKey, rawJson] of Object.entries(captionsByLang)) {
      const trimmed = rawJson.trim();
      if (trimmed.length > 0) {
        try {
          const parsed = JSON.parse(trimmed);
          if (!Array.isArray(parsed)) {
            throw new Error("Must be an array of caption objects [ { id, text, startTime, endTime } ].");
          }
          multilingualPayload[langKey as SupportedLanguage] = parsed as CaptionItem[];
        } catch (jsonErr: any) {
          const langInfo = languageTabs.find((l) => l.id === langKey);
          setErrorMessage(`Invalid JSON syntax in ${langInfo?.label} (${langInfo?.native}): ${jsonErr.message}`);
          setActiveLangTab(langKey as SupportedLanguage); // Automatically switch user to the broken tab
          return;
        }
      }
    }

    setStatus("uploading_media");
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      
      // 3. Upload Video in 10MB Chunks with Live Progress
      const videoExt = videoFile.name.split(".").pop();
      const videoPath = `raw_${timestamp}.${videoExt}`;
      const videoUrl = await uploadWithTus(videoFile, videoPath, (percent) => {
        setUploadProgress(percent);
      });

      // 4. Upload Thumbnail
      const thumbExt = thumbFile.name.split(".").pop();
      const thumbPath = `thumb_${timestamp}.${thumbExt}`;
      const thumbUrl = await uploadWithTus(thumbFile, thumbPath, () => {});

      // 5. Direct Database Insert with Multilingual JSON Map
      const finalCaptionsData = Object.keys(multilingualPayload).length > 0 ? multilingualPayload : null;

      const { error: dbError } = await supabase
        .from("videos")
        .insert({
          title,
          category,
          duration_seconds: duration,
          video_url: videoUrl,
          thumbnail_url: thumbUrl,
          captions_json: finalCaptionsData, // Stores { en: [...], ur: [...], ar: [...] }
        });

      if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);

      // 6. Success & Redirect
      setStatus("success");
      setTimeout(() => {
        router.push("/admin");
      }, 2000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during upload.");
      setStatus("error");
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Hidden video element for duration extraction */}
      <audio
        ref={hiddenVideoRef as any}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
        preload="metadata"
      />

      <motion.div variants={staggerItem}>
        <h1 className="font-heading text-3xl font-semibold text-charcoal">Upload Source Video</h1>
        <p className="text-charcoal/60 text-sm mt-1">
          Upload media in 10MB chunks and attach pre-timed multi-language captions.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-large shadow-level-1 border border-sand p-6 md:p-8">
        
        <AnimatePresence mode="wait">
          {status === "idle" || status === "error" ? (
            <motion.form key="form" variants={tabTransition} initial="hidden" animate="visible" exit="exit" onSubmit={handleUpload} className="space-y-6">
              
              {/* 1. Category Selector */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal/80">Content Category</label>
                <div className="flex bg-sand/40 p-1 rounded-standard border border-sand/60 shadow-inner max-w-sm relative">
                  <button
                    type="button"
                    onClick={() => setCategory("lecture")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded text-sm font-medium transition-all select-none relative z-10",
                      category === "lecture"
                        ? "text-charcoal font-semibold"
                        : "text-charcoal/60 hover:text-charcoal"
                    )}
                  >
                    {category === "lecture" && (
                      <motion.div layoutId="catIndicator" className="absolute inset-0 bg-white rounded shadow-2xs -z-10" />
                    )}
                    <Mic className={cn("w-4 h-4", category === "lecture" && "text-soft-gold")} />
                    Lecture
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory("music")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded text-sm font-medium transition-all select-none relative z-10",
                      category === "music"
                        ? "text-charcoal font-semibold"
                        : "text-charcoal/60 hover:text-charcoal"
                    )}
                  >
                    {category === "music" && (
                      <motion.div layoutId="catIndicator" className="absolute inset-0 bg-white rounded shadow-2xs -z-10" />
                    )}
                    <Music className={cn("w-4 h-4", category === "music" && "text-emerald-green")} />
                    Nasheed
                  </button>
                </div>
              </div>

              {/* 2. Video Title */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-charcoal/80">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., The Reality of the Heart | Shaykh Nurjan"
                  className="w-full h-11 px-4 rounded-standard border border-sand bg-ivory/30 text-[16px] text-charcoal focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-all"
                />
              </div>

              {/* 3. Media Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal/80">Source Video (.mp4)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime"
                      onChange={handleVideoSelect}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-standard border-2 border-dashed transition-colors hover:scale-[1.02] active:scale-[0.98] duration-200",
                      videoFile ? "border-soft-gold bg-soft-gold/5" : "border-sand bg-sand/20 hover:border-soft-gold/50"
                    )}>
                      <Video className={cn("w-6 h-6 mb-2", videoFile ? "text-soft-gold" : "text-charcoal/40")} />
                      <span className="text-sm font-medium text-charcoal truncate w-full text-center px-2">
                        {videoFile ? videoFile.name : "Select Video File"}
                      </span>
                      {duration > 0 && <span className="text-xs text-charcoal/50 mt-1 font-mono">Duration: {duration}s</span>}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-charcoal/80">Thumbnail Image (.jpg, .png)</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-standard border-2 border-dashed transition-colors hover:scale-[1.02] active:scale-[0.98] duration-200",
                      thumbFile ? "border-soft-gold bg-soft-gold/5" : "border-sand bg-sand/20 hover:border-soft-gold/50"
                    )}>
                      <ImageIcon className={cn("w-6 h-6 mb-2", thumbFile ? "text-soft-gold" : "text-charcoal/40")} />
                      <span className="text-sm font-medium text-charcoal truncate w-full text-center px-2">
                        {thumbFile ? thumbFile.name : "Select Thumbnail"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. MULTILINGUAL CAPTIONS TABBED SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-soft-gold" />
                    <label className="text-sm font-medium text-charcoal/90">
                      Multilingual Captions (JSON Format)
                    </label>
                  </div>
                  <span className="text-xs text-charcoal/50">Optional</span>
                </div>

                {/* 7-Language Pill Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar relative">
                  {languageTabs.map((tab) => {
                    const isActive = activeLangTab === tab.id;
                    const hasContent = Boolean(captionsByLang[tab.id]?.trim());

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveLangTab(tab.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 select-none border relative z-10",
                          isActive
                            ? "text-ivory border-transparent"
                            : "bg-sand/30 text-charcoal/70 border-sand hover:bg-sand/60",
                          hasContent && !isActive && "border-emerald-green/40 text-emerald-green bg-emerald-green/5"
                        )}
                      >
                        {isActive && (
                          <motion.div layoutId="langIndicator" className="absolute inset-0 bg-charcoal rounded-full -z-10 shadow-sm" />
                        )}
                        <span>{tab.native}</span>
                        <span className="text-[10px] opacity-70">({tab.label})</span>
                        {hasContent && (
                          <Check className={cn("w-3 h-3 ml-0.5", isActive ? "text-soft-gold" : "text-emerald-green")} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* JSON Textarea for Active Language Tab */}
                <div className="relative">
                  <Code className="absolute top-3 left-3 w-4 h-4 text-charcoal/30 pointer-events-none" />
                  <textarea
                    value={captionsByLang[activeLangTab]}
                    onChange={(e) => handleCaptionChange(e.target.value)}
                    placeholder={`Paste JSON array for ${languageTabs.find((l) => l.id === activeLangTab)?.label} (${languageTabs.find((l) => l.id === activeLangTab)?.native}):\n[\n  {"id": "cap_1", "text": "...", "startTime": 0.0, "endTime": 2.5}\n]`}
                    className="w-full h-44 pl-9 pr-4 py-3 rounded-standard border border-sand bg-ivory/30 text-sm font-mono text-charcoal focus:outline-none focus:border-soft-gold focus:ring-1 focus:ring-soft-gold transition-all placeholder:text-charcoal/30 resize-y"
                    dir={["ur", "ar", "fa"].includes(activeLangTab) ? "rtl" : "ltr"}
                  />
                </div>

                <p className="text-[11px] text-charcoal/50 leading-relaxed">
                  Paste the raw JSON array for each language tab. Green checkmarks (✓) indicate which languages will be packaged and saved to the database.
                </p>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-3 bg-error-red/10 text-error-red text-sm rounded-standard flex items-start gap-2 border border-error-red/20">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button type="submit" size="lg" variant="emerald" className="w-full shadow-level-1 glow-ring">
                <UploadCloud className="w-5 h-5 mr-2" />
                Upload Media & Save Multilingual Captions
              </Button>

            </motion.form>
          ) : (
            /* ========================================= */
            /* PROGRESS & SUCCESS STATES                 */
            /* ========================================= */
            <motion.div key="progress" variants={tabTransition} initial="hidden" animate="visible" exit="exit" className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              
              {status === "uploading_media" && (
                <motion.div key="uploading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-10 h-10 text-soft-gold mb-2" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-charcoal mb-4">Uploading Media... {uploadProgress}%</h3>
                  
                  {/* Visual Progress Bar */}
                  <div className="w-full max-w-xs bg-sand/50 h-3 rounded-full overflow-hidden border border-sand">
                    <motion.div
                      className="bg-emerald-green h-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: "linear", duration: 0.2 }}
                    />
                  </div>

                  <p className="text-sm text-charcoal/60 max-w-sm mt-4">
                    Uploading video in 10MB chunks to safely bypass Cloudflare network limits. Please keep this tab open.
                  </p>
                </motion.div>
              )}

              {status === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }} className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-success-green mb-2" />
                  <h3 className="text-xl font-semibold text-charcoal">Video & Captions Published!</h3>
                  <p className="text-sm text-charcoal/60 max-w-sm mt-2">
                    Media and multilingual dictionary successfully saved. Redirecting to dashboard...
                  </p>
                </motion.div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}
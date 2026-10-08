"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/store/useEditorStore";
import { 
  Loader2, Check, Download, ExternalLink, AlertCircle, X, Scissors, Copy, Sparkles, Repeat, Globe, Lock 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { modalBackdrop, modalPanel, scaleIn, fadeInUp } from "@/lib/animations";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportStatus = "idle" | "rendering" | "success" | "error";

const socialLanguages = ["English", "Urdu", "Spanish", "Turkish", "Arabic", "Hindi", "Persian"];

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const supabase = createClient();

  const {
    sourceVideo,
    trimStart,
    trimEnd,
    template,
    bRoll,
    captions,
    crop,
    cropX,
    bgMusic,
    isPublic,
    setIsPublic,
    showCaptions,
    uppercaseOnly,
    fontSize,
    captionBg,
    highlightColor,
    videoFilter,
    karaokeEnabled,
    addIntro,
  } = useEditorStore();

  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Render Data
  const [renderedClipUrl, setRenderedClipUrl] = useState<string | null>(null);
  const [clipId, setClipId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // AI Generator Data
  const [aiLang, setAiLang] = useState<string>("English");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [socialCaption, setSocialCaption] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsGuest(false);
      } else {
        setIsGuest(sessionStorage.getItem("spiritual-clip-guest") === "true");
      }
    };
    checkAuth();
  }, [supabase.auth]);

  const clipDuration = (trimEnd - trimStart).toFixed(1);
  const isMusicMode = sourceVideo?.category === "music";

  // =========================================
  // 1. START RENDER (Lightning Fast - No AI)
  // =========================================
  const handleStartExport = async () => {
    setStatus("rendering");
    setErrorMessage(null);
    setSocialCaption(null); // Reset copy

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !isGuest) {
        throw new Error("You must be signed in or continue as a guest to export clips.");
      }

      if (!sourceVideo) throw new Error("No source video found in editor.");

      const payload = {
        userId: user ? user.id : "guest",
        videoId: sourceVideo.id,
        trimStart,
        trimEnd,
        template,
        bRoll,
        captions,
        crop,
        cropX,
        bgMusic,
        isPublic: isGuest ? false : isPublic,
        category: sourceVideo.category,
        showCaptions,
        uppercaseOnly,
        fontSize,
        captionBg,
        highlightColor,
        videoFilter,
        karaokeEnabled,
        addIntro,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const response = await fetch(`${apiUrl}/api/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to render clip on the backend server.");
      }

      const data = await response.json();
      setRenderedClipUrl(data.clipUrl);
      setClipId(data.clipId);
      setStatus("success");

    } catch (err: any) {
      console.error("Export error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during rendering.");
      setStatus("error");
    }
  };

  // =========================================
  // 2. ON-DEMAND AI COPYWRITER
  // =========================================
  const handleGenerateCaption = async () => {
    setIsGeneratingCopy(true);
    setSocialCaption(null);

    try {
      // Prefer English captions for AI context, fallback to currently selected captions
      let baseCaptions = captions;
      if (sourceVideo?.captions_json && !Array.isArray(sourceVideo.captions_json) && sourceVideo.captions_json.en) {
        baseCaptions = sourceVideo.captions_json.en;
      }

      // Extract only the transcript text that falls within the trimmed window
      const trimmedCaptions = baseCaptions.filter(c => c.startTime >= trimStart && c.endTime <= trimEnd);
      const transcriptText = (trimmedCaptions.length > 0 ? trimmedCaptions : baseCaptions)
        .map((c) => c.text)
        .join(' ');

      if (!transcriptText.trim()) {
        throw new Error("No text found in this clip to generate a caption from.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/video/social-copy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptText, language: aiLang }),
      });

      if (!response.ok) throw new Error("Failed to generate caption.");
      
      const data = await response.json();
      setSocialCaption(data.socialCaption);

    } catch (err: any) {
      console.error("AI Copy Error:", err);
      setSocialCaption("⚠️ Could not generate caption. Please try again.");
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // =========================================
  // 3. TRUE BACKGROUND DOWNLOAD (Hidden Iframe)
  // =========================================
  const handleDownload = async () => {
    if (!renderedClipUrl) return;
    
    setIsDownloading(true);
    const fileName = `reminder_clip_${Date.now()}.mp4`;
    
    try {
      // ATTEMPT 1: True Background Blob Download
      const response = await fetch(renderedClipUrl);
      if (!response.ok) throw new Error("Failed to fetch the video file.");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      try {
        // ATTEMPT 2: Hidden Iframe Fallback 
        const fallbackUrl = new URL(renderedClipUrl);
        fallbackUrl.searchParams.set("download", fileName);
        
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = fallbackUrl.toString();
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      } catch (fallbackErr) {
        window.location.href = renderedClipUrl;
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyCaption = () => {
    if (!socialCaption) return;
    navigator.clipboard.writeText(socialCaption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-[440px] bg-ivory rounded-t-modal sm:rounded-modal shadow-level-4 overflow-hidden relative max-h-[90vh] flex flex-col border border-sand"
          >
            
            {/* Close Button */}
            {status !== "rendering" && (
              <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 bg-white/50 backdrop-blur-md text-charcoal/60 hover:text-charcoal rounded-full transition-colors active:scale-95">
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="p-6 overflow-y-auto no-scrollbar relative min-h-[300px]">
              <AnimatePresence mode="wait">

                {/* ========================================= */}
                {/* STATE 1: IDLE / CONFIRMATION              */}
                {/* ========================================= */}
                {status === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-soft-gold/20 flex items-center justify-center text-soft-gold shrink-0">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-semibold text-charcoal">Export Reminder</h3>
                        <p className="text-xs text-charcoal/60">Review your settings before rendering</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-standard border border-sand space-y-2 text-xs text-charcoal/80 shadow-level-1">
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Duration:</span>
                        <span className="font-mono font-bold">{clipDuration} seconds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal/60">Template:</span>
                        <span className="font-medium capitalize">{template}</span>
                      </div>
                      {!isMusicMode && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-charcoal/60">B-Roll Overlays:</span>
                            <span className="font-medium">{bRoll.length} added</span>
                          </div>
                          {bgMusic && (
                            <div className="flex justify-between">
                              <span className="text-charcoal/60">Background Music:</span>
                              <span className="font-medium">Active ({Math.round(bgMusic.volume * 100)}%)</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Privacy Toggle */}
                    <div className={cn(
                      "flex items-center justify-between p-3.5 bg-white rounded-standard border border-sand shadow-level-1",
                      isGuest && "opacity-60 grayscale bg-sand/10"
                    )}>
                      <div className="flex items-start gap-3">
                        {isPublic && !isGuest ? (
                          <Globe className="w-4 h-4 text-emerald-green mt-0.5 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-charcoal/40 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-charcoal flex items-center gap-2">
                            Share to Community
                            {isGuest && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-charcoal/10 text-charcoal/50 uppercase tracking-widest">Disabled for Guests</span>}
                          </p>
                          <p className="text-[10px] text-charcoal/50 leading-snug pr-2">
                            {isGuest 
                              ? "Guests cannot save clips to the community feed. Video will only be rendered for download."
                              : isPublic 
                                ? "Your clip will be visible on the public homepage feed." 
                                : "Private clip. Only you can view or download this render."}
                          </p>
                        </div>
                      </div>
                      <button
                        disabled={isGuest}
                        onClick={() => setIsPublic(!isPublic)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors shrink-0",
                          (isPublic && !isGuest) ? "bg-emerald-green" : "bg-sand",
                          isGuest && "cursor-not-allowed"
                        )}
                      >
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm")}
                          style={{ left: (isPublic && !isGuest) ? "calc(100% - 18px)" : "2px" }}
                        />
                      </button>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button variant="secondary" className="flex-1 border-sand bg-white" onClick={onClose}>Cancel</Button>
                      <Button className="flex-1 glow-ring" onClick={handleStartExport}>Start Render</Button>
                    </div>
                  </motion.div>
                )}

                {/* ========================================= */}
                {/* STATE 2: RENDERING IN PROGRESS            */}
                {/* ========================================= */}
                {status === "rendering" && (
                  <motion.div
                    key="rendering"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 text-center space-y-6"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 bg-soft-gold/10 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Loader2 className="w-8 h-8 text-soft-gold" />
                    </motion.div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-charcoal">Creating your clip...</h3>
                      <p className="text-xs text-charcoal/60 mt-1 max-w-xs mx-auto">
                        Please wait a few minutes while we make your clip. Our backend server is trimming, adding effects, and mixing audio. Please do not close this window.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ========================================= */}
                {/* STATE 3: RENDERING SUCCESS                */}
                {/* ========================================= */}
                {status === "success" && (
                  <motion.div
                    key="success"
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    
                    {/* Header */}
                    <div className="text-center space-y-1">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-12 h-12 bg-success-green/15 text-success-green rounded-full flex items-center justify-center mx-auto shadow-level-1 mb-3"
                      >
                        <Check className="w-6 h-6 stroke-[3]" />
                      </motion.div>
                      <h3 className="font-heading text-2xl font-semibold text-charcoal">Your clip is ready!</h3>
                    </div>

                    {/* Main Actions */}
                    <motion.div variants={fadeInUp} className="space-y-4">
                      <Button 
                        size="lg" 
                        variant="emerald" 
                        className="w-full shadow-level-2" 
                        onClick={handleDownload}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" /> Download Video (.mp4)
                          </>
                        )}
                      </Button>
                      
                      {/* Social Post Row (Compact Icons) */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-center font-medium text-charcoal/50 uppercase tracking-widest">Share Directly To</p>
                        <div className="flex items-center justify-center gap-3">
                          <a href="https://www.tiktok.com/upload" target="_blank" rel="noreferrer" title="TikTok" className="flex items-center justify-center w-10 h-10 bg-white rounded-full border border-sand hover:bg-sand/50 hover:border-charcoal/30 transition-all shadow-sm">
                            <svg className="w-4 h-4 text-charcoal" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                          </a>
                          <a href="https://studio.youtube.com/" target="_blank" rel="noreferrer" title="YouTube Shorts" className="flex items-center justify-center w-10 h-10 bg-white rounded-full border border-sand hover:bg-sand/50 hover:border-charcoal/30 transition-all shadow-sm">
                            <svg className="w-4 h-4 text-error-red" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                          </a>
                          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" title="Instagram" className="flex items-center justify-center w-10 h-10 bg-white rounded-full border border-sand hover:bg-sand/50 hover:border-charcoal/30 transition-all shadow-sm">
                            <svg className="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                          </a>
                          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" title="Facebook" className="flex items-center justify-center w-10 h-10 bg-white rounded-full border border-sand hover:bg-sand/50 hover:border-charcoal/30 transition-all shadow-sm">
                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </a>
                          <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this beautiful reminder: ${isPublic ? renderedClipUrl : ''}`)}`} target="_blank" rel="noreferrer" title="WhatsApp" className="flex items-center justify-center w-10 h-10 bg-white rounded-full border border-sand hover:bg-sand/50 hover:border-charcoal/30 transition-all shadow-sm">
                            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01a1.05 1.05 0 0 0-.768.347c-.272.298-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                          </a>
                        </div>
                      </div>
                    </motion.div>

                    <hr className="border-sand" />

                    {/* AI Caption Generator */}
                    <motion.div variants={fadeInUp} className="bg-white p-4 rounded-large border border-sand shadow-level-1 space-y-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-4 h-4 text-soft-gold" />
                        <h4 className="text-sm font-semibold text-charcoal">AI Social Media Copy</h4>
                      </div>

                      {!socialCaption ? (
                        <div className="space-y-3">
                          <p className="text-[11px] text-charcoal/60 leading-relaxed">
                            Generate a viral, ready-to-paste caption with official hashtags in any language.
                          </p>
                          <div className="flex gap-2">
                            <select
                              value={aiLang}
                              onChange={(e) => setAiLang(e.target.value)}
                              className="flex-1 bg-sand/30 border border-sand text-xs font-medium text-charcoal rounded-standard px-3 outline-none focus:border-soft-gold transition-colors"
                            >
                              {socialLanguages.map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            <Button size="sm" onClick={handleGenerateCaption} isLoading={isGeneratingCopy} className="shrink-0 text-xs glow-ring">
                              Generate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 relative group">
                          <div className="bg-ivory/50 p-3 rounded-standard border border-sand text-xs text-charcoal whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto no-scrollbar">
                            {socialCaption}
                          </div>
                          <Button size="sm" variant="secondary" className="w-full bg-white shadow-sm text-xs" onClick={handleCopyCaption}>
                            {isCopied ? <><Check className="w-3.5 h-3.5 mr-1.5 text-success-green" /> Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Text</>}
                          </Button>
                          <button onClick={() => setSocialCaption(null)} className="w-full text-[10px] text-charcoal/40 hover:text-charcoal transition-colors">
                            Regenerate in another language
                          </button>
                        </div>
                      )}
                    </motion.div>

                    {/* Secondary Navigation */}
                    <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(window.location.href, "_blank")} 
                        className="text-xs border border-sand/50 bg-white shadow-sm hover:bg-sand/30"
                      >
                        <Repeat className="w-3.5 h-3.5 mr-1.5 text-soft-gold" /> Remix Clip
                      </Button>
                      {clipId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`/clip/${clipId}`, "_blank")} 
                          className="text-xs border border-sand/50 bg-white shadow-sm hover:bg-sand/30"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Public Page
                        </Button>
                      )}
                    </motion.div>

                  </motion.div>
                )}

                {/* ========================================= */}
                {/* STATE 4: RENDERING ERROR                  */}
                {/* ========================================= */}
                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="w-12 h-12 bg-error-red/10 text-error-red rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-charcoal">Export Failed</h3>
                      <p className="text-xs text-error-red mt-1 max-w-xs mx-auto">{errorMessage}</p>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="secondary" className="flex-1 bg-white border-sand" onClick={onClose}>Close</Button>
                      <Button className="flex-1" onClick={handleStartExport}>Try Again</Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
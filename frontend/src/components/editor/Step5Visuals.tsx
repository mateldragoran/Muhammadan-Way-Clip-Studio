"use client";

import { useState, useRef } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import BRollTray from "@/components/editor/BRollTray";
import { 
  Lightbulb, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles,
  UploadCloud,
  Film
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { processMediaUpload } from "@/lib/upload";
import { cn } from "@/lib/utils";

export default function Step5Visuals() {
  const { 
    captions, 
    trimStart, 
    trimEnd, 
    bRollPrompts, 
    setBRollPrompts,
    addBRoll 
  } = useEditorStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [promptType, setPromptType] = useState<"image" | "video">("image");
  const [isUploadingSlotId, setIsUploadingSlotId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadingSlotIdRef = useRef<string | null>(null);

  const displayedPrompts = bRollPrompts.filter(p => p.type === promptType);

  const handleGeneratePrompts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const trimmedCaptions = captions.filter(
        (c) => c.startTime >= trimStart && c.endTime <= trimEnd
      );

      if (trimmedCaptions.length === 0) {
        throw new Error("No captions found in the selected clip range to analyze.");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      
      const response = await fetch(`${apiUrl}/api/video/broll-prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captions: trimmedCaptions, promptType }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate B-Roll prompts from AI.");
      }

      const data = await response.json();
      const newPrompts = data.bRollPrompts || [];
      // Keep existing prompts of the OTHER type, and merge in the new ones
      setBRollPrompts([...bRollPrompts.filter(p => p.type !== promptType), ...newPrompts]);
      
    } catch (err: any) {
      console.error("AI B-Roll Prompt Error:", err);
      setError(err.message || "Failed to generate AI visual ideas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (prompt: string, index: number) => {
    navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSlotUpload = async (file: File) => {
    const slotId = uploadingSlotIdRef.current;
    if (!slotId) return;
    
    setIsUploadingSlotId(slotId);
    setError(null);
    try {
      const { url, type } = await processMediaUpload(file);
      
      const targetSlot = bRollPrompts.find(p => p.id === slotId);
      if (!targetSlot) return;

      addBRoll({
        id: `broll_${Date.now()}`,
        url,
        type,
        layout: "fullscreen",
        startTime: targetSlot.startTime ?? trimStart,
        endTime: targetSlot.endTime ?? trimStart + 3,
        panX: 50,
      });

      setBRollPrompts(
        bRollPrompts.map(p => p.id === slotId ? { ...p, isFulfilled: true } : p)
      );

    } catch (err: any) {
      setError(err.message || "Failed to upload media for slot.");
    } finally {
      uploadingSlotIdRef.current = null;
      setIsUploadingSlotId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200 pb-8">
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSlotUpload(e.target.files[0]);
          }
        }}
      />

      {/* Header (Hidden on Mobile to save space!) */}
      <div className="px-1 space-y-1 hidden md:block">
        <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-soft-gold" />
          5. Supporting Visuals
        </h3>
        <p className="text-xs sm:text-sm text-charcoal/60 leading-relaxed">
          Keep your audience engaged by adding related images or videos on top of the speaker.
        </p>
      </div>

      {/* ========================================= */}
      {/* 1. AI B-ROLL PROMPT GENERATOR             */}
      {/* ========================================= */}
      <div className="bg-white rounded-large p-4 sm:p-5 border border-sand shadow-level-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-soft-gold" />
            <h4 className="font-medium text-sm text-charcoal">AI Media Ideas</h4>
          </div>
          
          {/* Format Toggle */}
          <div className="flex bg-sand/30 p-1 rounded-standard border border-sand">
            <button
              onClick={() => setPromptType("image")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded transition-all",
                promptType === "image" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/50 hover:text-charcoal"
              )}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Images
            </button>
            <button
              onClick={() => setPromptType("video")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded transition-all",
                promptType === "video" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/50 hover:text-charcoal"
              )}
            >
              <Film className="w-3.5 h-3.5" /> Videos
            </button>
          </div>
        </div>

        {/* State A: Idle (Button to Generate) */}
        {!isLoading && displayedPrompts.length === 0 && (
          <div className="p-4 bg-sand/20 rounded-standard border border-sand border-dashed text-center">
            <Button onClick={handleGeneratePrompts} className="w-full shadow-sm bg-charcoal hover:bg-charcoal/90 text-ivory">
              <Sparkles className="w-4 h-4 mr-2 text-soft-gold" />
              Suggest AI {promptType === "video" ? "Video" : "Image"} Prompts
            </Button>
            <p className="text-[11px] text-charcoal/50 mt-3 leading-relaxed max-w-sm mx-auto">
              {promptType === "image" 
                ? "Generate prompts, paste them into ChatGPT or Midjourney, download the resulting image, and upload it here. We'll do the rest!" 
                : "Generate prompts, paste them into an AI video generator (like Runway or Sora), download the video, and upload it here. We'll handle the syncing!"}
            </p>
            {error && (
              <p className="text-xs text-error-red mt-3 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>
        )}

        {/* State B: Loading */}
        {isLoading && (
          <div className="p-6 bg-sand/20 rounded-standard border border-sand border-dashed flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-soft-gold" />
            <div>
              <p className="text-sm font-medium text-charcoal">Directing visual metaphors...</p>
              <p className="text-xs text-charcoal/50 mt-0.5">Crafting precise prompts for {promptType} generation.</p>
            </div>
          </div>
        )}

        {/* State C: Success (Display Prompts as Slots) */}
        {!isLoading && displayedPrompts.length > 0 && (
          <div className="space-y-4">
            {displayedPrompts.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className={cn(
                  "p-4 bg-sand/15 border rounded-large shadow-sm flex flex-col gap-3 relative transition-all",
                  item.isFulfilled ? "border-success-green/50 bg-success-green/5" : "border-sand border-dashed"
                )}
              >
                {/* Slot Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs",
                      item.isFulfilled ? "bg-success-green text-white" : "bg-charcoal text-ivory"
                    )}>
                      {item.startTime !== undefined && item.endTime !== undefined
                        ? `${item.startTime.toFixed(1)}s - ${item.endTime.toFixed(1)}s`
                        : item.timecode || "Suggested Slot"}
                    </span>
                    {item.isFulfilled && (
                      <span className="text-[10px] font-medium text-success-green flex items-center gap-1">
                        <Check className="w-3 h-3" /> Filled
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleCopy(item.prompt, idx)}
                      className="h-8 px-2 text-[11px] border border-sand/60 bg-white hover:bg-sand/30 flex-1 sm:flex-none"
                    >
                      {copiedIndex === idx ? (
                        <><Check className="w-3 h-3 mr-1 text-success-green" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3 mr-1" /> Copy Prompt</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        uploadingSlotIdRef.current = item.id || null;
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingSlotId === item.id}
                      className={cn(
                        "h-8 px-3 text-[11px] shadow-sm flex-1 sm:flex-none",
                        item.isFulfilled ? "bg-white text-charcoal border border-sand hover:bg-sand/30" : "bg-soft-gold text-charcoal hover:bg-soft-gold/90"
                      )}
                    >
                      {isUploadingSlotId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <><UploadCloud className="w-3.5 h-3.5 mr-1" /> {item.isFulfilled ? "Replace" : "Upload Here"}</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Prompt & Reason */}
                <div className="text-sm font-medium text-charcoal bg-white p-3 rounded border border-sand/50 shadow-2xs italic leading-relaxed">
                  "{item.prompt}"
                </div>
                {item.reason && (
                  <p className="text-[11px] text-charcoal/60 leading-snug">
                    <span className="font-semibold text-soft-gold">Why:</span> {item.reason}
                  </p>
                )}
              </div>
            ))}

            <button 
              onClick={handleGeneratePrompts}
              className="w-full text-xs text-charcoal/40 hover:text-charcoal transition-colors py-2 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Regenerate Prompts
            </button>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* 2. THE B-ROLL UPLOAD TRAY                 */}
      {/* ========================================= */}
      <div className="bg-white rounded-large p-4 sm:p-5 border border-sand shadow-level-1">
        <BRollTray />
      </div>

    </div>
  );
}
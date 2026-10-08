"use client";

import { useState, useRef } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { processMediaUpload } from "@/lib/upload";
import { 
  Image as ImageIcon, 
  UploadCloud, 
  Trash2, 
  Loader2, 
  Play, 
  Video, 
  Maximize, 
  PanelTop, 
  PanelBottom,
  MapPin
} from "lucide-react";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
};
import { cn } from "@/lib/utils";

export default function BRollTray() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    bRoll,
    addBRoll,
    removeBRoll,
    updateBRoll,
    currentTime,
    trimStart,
    trimEnd,
    setCurrentTime,
  } = useEditorStore();

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const { url, type } = await processMediaUpload(file);
      
      const start = Math.max(trimStart, currentTime);
      const end = Math.min(trimEnd, start + 3);

      addBRoll({
        id: `broll_${Date.now()}`,
        url,
        type,
        layout: "fullscreen",
        startTime: start,
        endTime: end,
        panX: 50, // Default to center pan
      });

    } catch (err: any) {
      setError(err.message || "Failed to process media.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-medium text-sm text-charcoal flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-soft-gold" />
            Uploaded Media
          </h3>
          <p className="text-xs text-charcoal/50">
            Overlay images or videos onto the clip.
          </p>
        </div>
        <span className="text-[10px] bg-sand/50 text-charcoal/70 px-2 py-0.5 rounded-full font-medium">
          {bRoll.length} added
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "p-4 rounded-standard border-2 border-dashed border-sand hover:border-soft-gold/60 bg-sand/20 hover:bg-sand/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group active:scale-[0.99]",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-6 h-6 animate-spin text-soft-gold" />
            <span className="text-xs text-charcoal/70 font-medium">
              Uploading media...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1">
            <UploadCloud className="w-6 h-6 text-charcoal/40 group-hover:text-soft-gold transition-colors" />
            <span className="text-xs font-medium text-charcoal">
              Tap or drag media to upload
            </span>
            <span className="text-[10px] text-charcoal/50">
              PNG, JPG, MP4 or MOV
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 bg-error-red/10 text-error-red text-xs rounded-standard">
          {error}
        </div>
      )}

      {/* B-Roll Item List */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {bRoll.map((item) => {
          const isActive = currentTime >= item.startTime && currentTime <= item.endTime;

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col p-3 rounded-large border transition-all duration-150 gap-3",
                isActive
                  ? "bg-soft-gold/15 border-soft-gold shadow-level-1"
                  : "bg-white border-sand"
              )}
            >
              <div className="flex items-start gap-3 flex-col sm:flex-row">
                
                {/* Media Preview & Layout Controls */}
                <div className="flex flex-row sm:flex-col gap-3 items-center w-full sm:w-auto">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-standard overflow-hidden bg-black/10 border border-sand flex items-center justify-center">
                    {item.type === "video" ? (
                      <>
                        <Video className="absolute w-5 h-5 text-white/50 z-10" />
                        <video src={item.url} className="w-full h-full object-cover opacity-60" style={{ objectPosition: `${item.panX ?? 50}% 50%` }} />
                      </>
                    ) : (
                      <img src={item.url} alt="B-Roll" className="w-full h-full object-cover" style={{ objectPosition: `${item.panX ?? 50}% 50%` }} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 bg-sand/30 p-1 rounded">
                    <button
                      onClick={() => updateBRoll(item.id, { layout: "fullscreen" })}
                      className={cn("p-1 rounded flex items-center justify-center transition-colors", item.layout === "fullscreen" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/60 hover:text-charcoal")}
                      title="Full Screen"
                    ><Maximize className="w-3.5 h-3.5" /></button>
                    <button
                      onClick={() => updateBRoll(item.id, { layout: "split-top" })}
                      className={cn("p-1 rounded flex items-center justify-center transition-colors", item.layout === "split-top" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/60 hover:text-charcoal")}
                      title="Split Top"
                    ><PanelTop className="w-3.5 h-3.5" /></button>
                    <button
                      onClick={() => updateBRoll(item.id, { layout: "split-bottom" })}
                      className={cn("p-1 rounded flex items-center justify-center transition-colors", item.layout === "split-bottom" ? "bg-white text-charcoal shadow-sm" : "text-charcoal/60 hover:text-charcoal")}
                      title="Split Bottom"
                    ><PanelBottom className="w-3.5 h-3.5" /></button>
                  </div>
                </div>

                {/* Timing & Placement Controls */}
                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-charcoal">Timeline Placement</h4>
                    <button
                      onClick={() => removeBRoll(item.id)}
                      className="p-1.5 text-charcoal/40 hover:text-error-red transition-colors rounded hover:bg-error-red/10 bg-sand/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-4 pt-1">
                    
                    {/* Start Time / Set to Current */}
                    <div className="flex items-center justify-between bg-sand/20 border border-sand rounded px-2.5 py-1.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-charcoal/50 uppercase tracking-wider">Start</span>
                        <span className="text-xs font-mono font-bold text-charcoal">{formatTime(item.startTime)}</span>
                      </div>
                      <button
                        onClick={() => {
                          const duration = item.endTime - item.startTime;
                          updateBRoll(item.id, { 
                            startTime: currentTime, 
                            endTime: Math.min(trimEnd, currentTime + duration) 
                          });
                        }}
                        className="flex items-center gap-1.5 bg-white border border-sand shadow-sm text-[10px] font-medium text-charcoal px-2.5 py-1.5 rounded hover:bg-sand/30 active:scale-95 transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5 text-soft-gold" />
                        Sync to Current Scene
                      </button>
                    </div>

                    {/* Duration Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-charcoal/50 uppercase tracking-wider">Duration</span>
                        <span className="text-[10px] font-bold text-charcoal">{(item.endTime - item.startTime).toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={(item.endTime - item.startTime).toFixed(1)}
                        onChange={(e) => {
                          const newDuration = Number(e.target.value);
                          updateBRoll(item.id, { endTime: Math.min(trimEnd, item.startTime + newDuration) });
                        }}
                        className="w-full h-1.5 bg-sand/50 rounded-lg appearance-none cursor-ew-resize accent-soft-gold outline-none"
                      />
                      <style dangerouslySetInnerHTML={{__html: `
                        input[type=range]::-webkit-slider-thumb {
                          appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #C7A75A; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        }
                      `}} />
                    </div>

                  </div>

                  {/* Pan Slider */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-medium text-charcoal/60 uppercase tracking-wider w-8">Pan</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.panX ?? 50}
                      onChange={(e) => updateBRoll(item.id, { panX: Number(e.target.value) })}
                      className="flex-1 h-1 bg-sand rounded-lg appearance-none cursor-ew-resize accent-soft-gold outline-none"
                    />
                  </div>

                  {/* Jump to Time Button */}
                  <button
                    onClick={() => setCurrentTime(item.startTime)}
                    className="w-full py-1.5 text-[11px] bg-charcoal text-ivory rounded font-medium inline-flex items-center justify-center gap-1.5 hover:bg-charcoal/90 transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" /> Preview Position
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
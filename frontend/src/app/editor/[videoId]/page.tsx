"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEditorStore } from "@/store/useEditorStore";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Core Components
import EditorHeader from "@/components/editor/EditorHeader";
import PreviewWindow from "@/components/editor/PreviewWindow";
import StepperNav from "@/components/editor/StepperNav";
import ExportModal from "@/components/editor/ExportModal";

// Step Components
import Step1Trim from "@/components/editor/Step1Trim";
import Step2Message from "@/components/editor/Step2Message";
import Step3Style from "@/components/editor/Step3Style";
import Step4Audio from "@/components/editor/Step4Audio";
import Step5Visuals from "@/components/editor/Step5Visuals";

// Animations
import { slideInRight, slideInLeft, pageTransition, fadeInUp } from "@/lib/animations";

function EditorContent() {
  const params = useParams<{ videoId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const remixId = searchParams.get("remix");
  const supabase = createClient();
  
  const { 
    initializeEditor, 
    loadRemixState, 
    sourceVideo, 
    currentStep 
  } = useEditorStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // Track direction for step transitions
  const prevStepRef = useRef(currentStep);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  useEffect(() => {
    if (currentStep > prevStepRef.current) {
      setDirection(1);
    } else if (currentStep < prevStepRef.current) {
      setDirection(-1);
    }
    prevStepRef.current = currentStep;
  }, [currentStep]);

  // 1. Fetch Video & Initialize Store
  useEffect(() => {
    async function loadWorkspace() {
      try {
        if (!params.videoId) return;

        if (remixId) {
          const [videoRes, projectRes] = await Promise.all([
            supabase.from("videos").select("*").eq("id", params.videoId).single(),
            supabase.from("projects").select("state_json").eq("id", remixId).single()
          ]);

          if (videoRes.error) throw videoRes.error;

          if (projectRes.data && !projectRes.error) {
            loadRemixState(videoRes.data, projectRes.data.state_json);
          } else {
            initializeEditor(videoRes.data);
          }
        } else {
          const { data: video, error: videoError } = await supabase
            .from("videos")
            .select("*")
            .eq("id", params.videoId)
            .single();

          if (videoError) throw videoError;
          
          initializeEditor(video);
        }
      } catch (err: any) {
        console.error("Error loading editor:", err);
        setError("Could not load the video for editing.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspace();
  }, [params.videoId, remixId, supabase, initializeEditor, loadRemixState]);

  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-ivory relative gradient-bg-animated overflow-hidden">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center z-10"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-soft-gold/20 border-2 border-soft-gold/40 flex items-center justify-center text-soft-gold shadow-level-2 mb-6"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
          <h2 className="font-heading text-2xl font-semibold text-charcoal mb-2">Preparing Studio</h2>
          <div className="flex items-center text-charcoal/60 font-medium">
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-soft-gold" />
            Loading workspace...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !sourceVideo) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-ivory p-4 text-center">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="p-6 bg-white shadow-level-1 rounded-large border border-error-red/20 max-w-md w-full"
        >
          <div className="w-12 h-12 bg-error-red/10 text-error-red rounded-full flex items-center justify-center mx-auto mb-4">
            !
          </div>
          <p className="font-medium text-xl text-charcoal">Editor Error</p>
          <p className="text-sm text-charcoal/70 mt-2">{error}</p>
          <button onClick={() => router.push("/")} className="mt-6 w-full py-3 bg-sand/30 hover:bg-sand/50 rounded-standard font-medium transition-colors">
            Return to Library
          </button>
        </motion.div>
      </div>
    );
  }

  // 3. Dynamic Step Resolver
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Trim key="step1" />;
      case 2: return <Step2Message key="step2" />;
      case 3: return <Step3Style key="step3" />;
      case 4: return <Step4Audio key="step4" />;
      case 5: return <Step5Visuals key="step5" />;
      default: return <Step1Trim key="step-default" />;
    }
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-[100dvh] w-full grid grid-rows-[auto_1fr_auto] bg-ivory overflow-hidden fixed inset-0"
    >
      
      {/* LANE 1: TOP HEADER & PROGRESS (h-14 on mobile) */}
      <EditorHeader onExport={() => setIsExportOpen(true)} />

      {/* LANE 2: MIDDLE CONTENT */}
      <div className="flex flex-col md:flex-row overflow-hidden min-h-0 bg-white md:bg-ivory relative">
        
        {/* THE DARK CANVAS (Mobile: 38vh, Dark / Desktop: Full height, Light) */}
        <section className="h-[38vh] md:h-full w-full md:w-[380px] lg:w-[480px] shrink-0 bg-[#111111] md:bg-ivory flex flex-col items-center justify-center p-0 md:p-6 lg:p-8 z-20 relative border-b border-black/80 md:border-b-0 md:border-r md:border-sand/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <PreviewWindow />
        </section>

        {/* THE LIGHT WORKBENCH (Scrollable Step Area) */}
        <section className="flex-1 overflow-y-auto overflow-x-hidden bg-ivory/50 md:bg-white relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={direction > 0 ? slideInRight : slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-3xl mx-auto p-0 md:p-6 lg:p-10 pb-6 md:pb-24 min-h-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </section>

      </div>

      {/* LANE 3: BOTTOM NAVIGATION */}
      <StepperNav onExport={() => setIsExportOpen(true)} />

      {/* MODALS */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

    </motion.div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-[100dvh] w-full flex items-center justify-center bg-ivory">
        <Loader2 className="w-8 h-8 animate-spin text-soft-gold" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
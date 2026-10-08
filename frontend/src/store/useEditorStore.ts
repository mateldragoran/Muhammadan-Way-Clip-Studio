"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  Video, 
  TemplateType, 
  BRollItem, 
  CaptionItem, 
  CropData, 
  BgMusic, 
  SupportedLanguage, 
  HighlightSuggestion,
  FontSize,
  CaptionBg,
  HighlightColor,
  VideoFilter,
  ProjectJson,
  BRollPromptIdea
} from "@/types";

export type MobileTab = "timeline" | "templates" | "b-roll" | "captions" | "audio";

type TemplateStyleConfig = { uppercaseOnly: boolean; fontSize: FontSize; captionBg: CaptionBg; highlightColor: HighlightColor; videoFilter: VideoFilter };

const TEMPLATE_STYLES: Record<TemplateType, TemplateStyleConfig> = {
  dynamic: { uppercaseOnly: true, fontSize: "lg", captionBg: "box", highlightColor: "gold", videoFilter: "none" },
  classic: { uppercaseOnly: false, fontSize: "md", captionBg: "gradient", highlightColor: "gold", videoFilter: "none" },
  minimal: { uppercaseOnly: false, fontSize: "sm", captionBg: "shadow", highlightColor: "gold", videoFilter: "none" },
  cinematic: { uppercaseOnly: false, fontSize: "md", captionBg: "shadow", highlightColor: "gold", videoFilter: "cinematic" },
};

interface EditorState {
  // CORE PROJECT DATA
  sourceVideo: Video | null;
  trimStart: number;
  trimEnd: number;
  template: TemplateType;
  bRoll: BRollItem[];
  captions: CaptionItem[]; 
  crop: CropData;
  cropX: number;
  bgMusic: BgMusic | null;
  isPublic: boolean; 

  // Custom Styling
  uppercaseOnly: boolean;
  fontSize: FontSize;
  captionBg: CaptionBg;
  highlightColor: HighlightColor;
  videoFilter: VideoFilter;

  // AI & Multilingual
  showCaptions: boolean;
  karaokeEnabled: boolean;
  selectedLanguage: SupportedLanguage; 
  translatedCaptions: Record<string, CaptionItem[]>; 
  activeHighlights: HighlightSuggestion[];
  bRollPrompts: BRollPromptIdea[]; // NEW: Cached B-Roll AI Suggestions
  addIntro: boolean;

  // UI & WIZARD NAVIGATION STATE (Ignored on refresh)
  currentStep: number; // NEW: Controls the Guided Wizard Flow
  activeMobileTab: MobileTab;
  isPlaying: boolean;
  currentTime: number; 

  // ACTIONS
  initializeEditor: (video: Video) => void;
  loadRemixState: (video: Video, projectJson: ProjectJson) => void;
  
  // Navigation Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;

  setTrim: (start: number, end: number) => void;
  setTemplate: (template: TemplateType) => void;
  setIsPublic: (isPublic: boolean) => void;
  
  setUppercaseOnly: (uppercaseOnly: boolean) => void;
  setFontSize: (size: FontSize) => void;
  setCaptionBg: (bg: CaptionBg) => void;
  setHighlightColor: (color: HighlightColor) => void;
  setVideoFilter: (filter: VideoFilter) => void;

  setShowCaptions: (show: boolean) => void;
  setKaraokeEnabled: (enabled: boolean) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setTranslatedCaptions: (lang: SupportedLanguage, newCaptions: CaptionItem[]) => void;
  setActiveHighlights: (highlights: HighlightSuggestion[]) => void;
  setBRollPrompts: (prompts: BRollPromptIdea[]) => void; // NEW
  setAddIntro: (addIntro: boolean) => void;
  
  addBRoll: (item: BRollItem) => void;
  updateBRoll: (id: string, updates: Partial<BRollItem>) => void;
  removeBRoll: (id: string) => void;
  updateCaption: (id: string, text: string) => void;
  
  setCrop: (crop: CropData) => void;
  setCropX: (percentage: number) => void;
  
  setBgMusic: (music: BgMusic | null) => void;
  updateBgMusic: (updates: Partial<BgMusic>) => void;

  setActiveMobileTab: (tab: MobileTab) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  reset: () => void;
}

const initialState = {
  sourceVideo: null,
  trimStart: 0,
  trimEnd: 120,
  template: "classic" as TemplateType, 
  bRoll: [],
  captions: [],
  crop: { x: 0, y: 0, scale: 1 },
  cropX: 50,
  bgMusic: null,
  isPublic: true,
  ...TEMPLATE_STYLES.classic,
  showCaptions: true,
  karaokeEnabled: true,
  selectedLanguage: "en" as SupportedLanguage,
  translatedCaptions: {},
  activeHighlights: [],
  bRollPrompts: [], // Default empty
  addIntro: false,

  currentStep: 1, // Default to Step 1: Trim & Frame
  activeMobileTab: "timeline" as MobileTab,
  isPlaying: false,
  currentTime: 0,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...initialState,

      initializeEditor: (video) =>
        set((state) => {
          if (state.sourceVideo?.id === video.id) {
            return {
              sourceVideo: { ...state.sourceVideo, category: video.category },
              isPlaying: false,
              currentTime: state.trimStart,
              currentStep: 1, // Always reset to Step 1 on component mount
            };
          }

          let normalizedDict: Record<string, CaptionItem[]> = {};
          const rawCaptions = video.captions_json;

          if (Array.isArray(rawCaptions)) {
            normalizedDict["en"] = rawCaptions;
          } else if (rawCaptions && typeof rawCaptions === "object") {
            normalizedDict = { ...rawCaptions } as Record<string, CaptionItem[]>;
          }

          const availableLanguages = Object.keys(normalizedDict) as SupportedLanguage[];
          let initialLang: SupportedLanguage = "en";
          if (!normalizedDict["en"] && availableLanguages.length > 0) {
            initialLang = availableLanguages[0];
          }

          const isMusic = video.category === "music";
          const initialShowCaptions = !isMusic; 
          const initialTemplate: TemplateType = isMusic ? "cinematic" : "classic";
          const initialActiveCaptions = normalizedDict[initialLang] || [];

          return {
            ...initialState,
            sourceVideo: video,
            template: initialTemplate,
            ...TEMPLATE_STYLES[initialTemplate],
            showCaptions: initialShowCaptions,
            selectedLanguage: initialLang,
            captions: initialActiveCaptions,
            translatedCaptions: normalizedDict,
            trimStart: 0,
            trimEnd: Math.min(120, video.duration_seconds),
            currentTime: 0,
            addIntro: false,
          };
        }),

      loadRemixState: (video, projectJson) =>
        set(() => {
          let normalizedDict: Record<string, CaptionItem[]> = {};
          const rawCaptions = video.captions_json;

          if (Array.isArray(rawCaptions)) {
            normalizedDict["en"] = rawCaptions;
          } else if (rawCaptions && typeof rawCaptions === "object") {
            normalizedDict = { ...rawCaptions } as Record<string, CaptionItem[]>;
          }

          const remixLang = projectJson.selectedLanguage || "en";
          normalizedDict[remixLang] = projectJson.captions || [];
          const baseTemplate = projectJson.template || "classic";

          return {
            ...initialState,
            sourceVideo: video,
            trimStart: projectJson.trimStart,
            trimEnd: projectJson.trimEnd,
            bRoll: projectJson.bRoll || [],
            captions: projectJson.captions || [],
            crop: projectJson.crop || { x: 0, y: 0, scale: 1 },
            cropX: projectJson.cropX ?? 50,
            bgMusic: projectJson.bgMusic || null,
            template: baseTemplate,
            uppercaseOnly: projectJson.uppercaseOnly !== undefined ? projectJson.uppercaseOnly : TEMPLATE_STYLES[baseTemplate].uppercaseOnly,
            fontSize: projectJson.fontSize || TEMPLATE_STYLES[baseTemplate].fontSize,
            captionBg: projectJson.captionBg || TEMPLATE_STYLES[baseTemplate].captionBg,
            highlightColor: projectJson.highlightColor || TEMPLATE_STYLES[baseTemplate].highlightColor,
            videoFilter: projectJson.videoFilter || TEMPLATE_STYLES[baseTemplate].videoFilter,
            isPublic: projectJson.isPublic ?? true,
            showCaptions: projectJson.showCaptions ?? true,
            selectedLanguage: remixLang,
            translatedCaptions: normalizedDict,
            addIntro: projectJson.addIntro || false,
            currentTime: projectJson.trimStart, 
            isPlaying: false,
            currentStep: 1, // Always start Remixes at Step 1
          };
        }),

      // Wizard Navigation Actions
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) })),
      setStep: (step) => set({ currentStep: step }),

      setTrim: (start, end) =>
        set((state) => ({
          trimStart: start,
          trimEnd: end,
          currentTime: start,
          bgMusic: state.bgMusic ? { ...state.bgMusic, startTime: start, endTime: end } : null,
        })),

      setIsPublic: (isPublic) => set({ isPublic }),
      setTemplate: (template) => set({ template, ...TEMPLATE_STYLES[template] }),
      setUppercaseOnly: (uppercaseOnly) => set({ uppercaseOnly }),
      setFontSize: (fontSize) => set({ fontSize }),
      setCaptionBg: (captionBg) => set({ captionBg }),
      setHighlightColor: (highlightColor) => set({ highlightColor }),
      setVideoFilter: (videoFilter) => set({ videoFilter }),
      setShowCaptions: (show) => set({ showCaptions: show }),
      setKaraokeEnabled: (enabled) => set({ karaokeEnabled: enabled }),

      setLanguage: (lang) =>
        set((state) => {
          let nextShowCaptions = state.showCaptions;
          if (!state.showCaptions) nextShowCaptions = true;
          return {
            selectedLanguage: lang,
            showCaptions: nextShowCaptions,
            captions: state.translatedCaptions[lang] || [],
          };
        }),

      setTranslatedCaptions: (lang, newCaptions) =>
        set((state) => {
          const updatedCache = { ...state.translatedCaptions, [lang]: newCaptions };
          if (state.selectedLanguage === lang) return { translatedCaptions: updatedCache, captions: newCaptions };
          return { translatedCaptions: updatedCache };
        }),

      setActiveHighlights: (highlights) => set({ activeHighlights: highlights }),
      setBRollPrompts: (prompts) => set({ bRollPrompts: prompts }),
      setAddIntro: (addIntro) => set({ addIntro }),

      addBRoll: (item) => set((state) => ({ bRoll: [...state.bRoll, item] })),
      updateBRoll: (id, updates) => set((state) => ({ bRoll: state.bRoll.map((i) => i.id === id ? { ...i, ...updates } : i) })),
      removeBRoll: (id) => set((state) => ({ bRoll: state.bRoll.filter((i) => i.id !== id) })),
      
      updateCaption: (id, text) =>
        set((state) => {
          const updatedCaptions = state.captions.map((cap) => cap.id === id ? { ...cap, text } : cap);
          return {
            captions: updatedCaptions,
            translatedCaptions: { ...state.translatedCaptions, [state.selectedLanguage]: updatedCaptions }
          };
        }),

      setCrop: (crop) => set({ crop }),
      setCropX: (percentage) => set({ cropX: percentage }),

      setBgMusic: (music) =>
        set((state) => ({
          bgMusic: music ? { ...music, startTime: state.trimStart, endTime: state.trimEnd } : null,
        })),

      updateBgMusic: (updates) =>
        set((state) => ({
          bgMusic: state.bgMusic ? { ...state.bgMusic, ...updates } : null,
        })),

      setActiveMobileTab: (tab) => set({ activeMobileTab: tab }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (time) => set({ currentTime: time }),
      reset: () => set(initialState),
    }),
    {
      name: "spiritual-clip-studio-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sourceVideo: state.sourceVideo,
        trimStart: state.trimStart,
        trimEnd: state.trimEnd,
        template: state.template,
        bRoll: state.bRoll,
        captions: state.captions,
        crop: state.crop,
        cropX: state.cropX,
        bgMusic: state.bgMusic,
        isPublic: state.isPublic,
        showCaptions: state.showCaptions,
        selectedLanguage: state.selectedLanguage,
        translatedCaptions: state.translatedCaptions,
        activeHighlights: state.activeHighlights,
        uppercaseOnly: state.uppercaseOnly,
        fontSize: state.fontSize,
        captionBg: state.captionBg,
        highlightColor: state.highlightColor,
        videoFilter: state.videoFilter,
        bRollPrompts: state.bRollPrompts, // Saved!
        // Notice `currentStep` is omitted, so on refresh, user always starts at Step 1.
        // addIntro is omitted so it defaults to false on refresh.
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        addIntro: false,
      }),
    }
  )
);
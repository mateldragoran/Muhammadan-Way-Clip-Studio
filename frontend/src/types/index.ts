// =========================================
// 1. DATABASE MODELS
// =========================================
export interface Profile {
  id: string; 
  email: string;
  username: string;
  avatar_url?: string;
  total_downloads: number;
  created_at: string;
}

export interface Video {
  id: string; 
  title: string;
  duration_seconds: number;
  video_url: string;
  thumbnail_url: string;
  clip_count: number;
  category: "lecture" | "music"; 
  captions_json?: MultilingualCaptions | CaptionItem[]; 
  created_at: string;
}

export interface Clip {
  id: string; 
  user_id: string;
  video_id: string;
  project_id: string;
  clip_url: string;
  template_used: string;
  downloads: number;
  is_public: boolean; 
  category: string;   
  created_at: string;
}

// RESTORED: Preset Music Track Interface
export interface PresetTrack {
  id: string;
  title: string;
  duration_seconds: number;
  audio_url: string;
  created_at: string;
}

export interface Project {
  id: string; 
  user_id: string;
  video_id: string;
  state_json: ProjectJson;
  created_at: string;
  updated_at: string;
}

// =========================================
// 2. PROJECT & EDITOR STATE MODELS
// =========================================
export interface ProjectJson {
  trimStart: number;
  trimEnd: number;
  template: TemplateType;
  bRoll: BRollItem[];
  captions: CaptionItem[];
  crop: CropData;
  cropX: number;
  bgMusic: BgMusic | null;
  showCaptions: boolean;
  selectedLanguage: SupportedLanguage;
  isPublic: boolean;
  category?: string;
  
  uppercaseOnly: boolean;
  fontSize: FontSize;
  captionBg: CaptionBg;
  highlightColor: HighlightColor;
  videoFilter: VideoFilter;
  
  addIntro?: boolean;
}

export type TemplateType = "dynamic" | "classic" | "minimal" | "cinematic";

export type FontSize = "sm" | "md" | "lg";
export type CaptionBg = "none" | "shadow" | "box" | "gradient";
export type HighlightColor = "gold" | "emerald" | "blue";
export type VideoFilter = "none" | "warm" | "cinematic" | "moody" | "vibrant";

export type BRollType = "image" | "video";
export type BRollLayout = "fullscreen" | "split-top" | "split-bottom";

export interface BRollItem {
  id: string;
  url: string;         
  type: BRollType;     
  layout: BRollLayout; 
  startTime: number;   
  endTime: number;     
  panX: number;        
  scale?: number;      
  x?: number;          
  y?: number;          
}

export interface CaptionItem {
  id: string;
  text: string;        
  startTime: number;   
  endTime: number;     
}

export interface CropData {
  x: number;
  y: number;
  scale: number;
}

export interface BgMusic {
  url: string;
  volume: number;      
  startTime: number;   
  endTime: number;     
  duration: number;    
  isLooping: boolean;  
}

export type DeviceType = "desktop" | "mobile";

// =========================================
// 3. MULTILINGUAL & AI TYPES
// =========================================
export type SupportedLanguage = "en" | "ur" | "es" | "tr" | "ar" | "hi" | "fa";

export type MultilingualCaptions = Partial<Record<SupportedLanguage, CaptionItem[]>>;

export interface HighlightSuggestion {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  hook: string;
  reason?: string;
  category?: "lecture" | "music";
}

// RESTORED: AI B-Roll Prompts Generator
export interface BRollPromptIdea {
  id: string;
  timecode?: string; 
  startTime: number;
  endTime: number;
  type: "image" | "video";
  prompt: string;   
  reason?: string;  
  isFulfilled?: boolean;
}
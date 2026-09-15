export interface VoiceInfo {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  character: string;
  tone: string;
  style: string;
  accent: string;
  description: string;
  personality: string[];
}

export interface LanguageInfo {
  code: string;
  name: string;
  region: string;
}

export interface TonePreset {
  id: string;
  label: string;
  instruction: string;
  rate: number;
  pitch: number;
  iconName: string;
  tagline: string;
}

export interface AudioTag {
  tag: string;
  label: string;
  category: 'emotion' | 'pause' | 'pacing' | 'vocal';
  tooltip: string;
}

export interface SpeakerConfig {
  id: string;
  name: string;
  voice: string;
  role: string;
}

export interface CustomVoice {
  id: string;
  name: string;
  baseVoice: string;
  gender: 'Male' | 'Female';
  pitch: number; // -12 to +12
  speakingRate: number; // 0.25 to 2.0
  styleInstruction: string;
  sceneDirection?: string;
  description: string;
  sourceFileName?: string;
  createdAt: number;
  previewAudioBase64?: string;
  previewDurationSeconds?: number;
  acousticProfile?: {
    timbre?: string;
    cadence?: string;
    energy?: string;
    resonance?: string;
  };
}

export interface GenerationSettings {
  voice: string;
  language: string;
  speakingRate: number; // 0.25x to 2.0x
  pitch: number; // -12 to +12 semitones
  styleInstruction: string;
  sceneDirection: string;
  isMultiSpeaker: boolean;
  speakers: SpeakerConfig[];
  customVoiceId?: string;
  customVoiceName?: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  settings: GenerationSettings;
  durationSeconds: number;
  audioBase64: string;
  mimeType: string;
  sizeBytes: number;
  audioUrl?: string;
  status: 'ready' | 'generating' | 'error';
  error?: string;
}

export interface BatchItem {
  id: string;
  title: string;
  text: string;
  voice: string;
  speakingRate: number;
  styleInstruction: string;
  status: 'idle' | 'generating' | 'done' | 'error';
  audioBase64?: string;
  durationSeconds?: number;
  error?: string;
}

export interface ExportOptions {
  format: 'mp3' | 'wav' | 'pcm' | 'ogg';
  bitrate: 128 | 192 | 320;
  sampleRate: 24000 | 44100 | 48000;
}

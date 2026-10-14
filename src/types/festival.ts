export type FilmCategory = 'short_film';

export interface ScoreRubric {
  visualCinematography: number;
  storytelling: number;
  directionPerformance: number;
  editing: number;
  soundDesign: number;
  recommendation: 'grand_prize' | 'best_director' | 'best_screenplay' | 'best_cinematography' | 'best_editing' | 'official_selection' | 'unscored';
  writtenCritique: string;
  verdictDate?: string;
  isCompleted: boolean;
}

export interface TimecodedNote {
  id: string;
  filmId: string;
  judgeId: string;
  timecodeSeconds: number;
  timecodeFormatted: string; // e.g. "02:14"
  noteText: string;
  timestamp: string;
  tag?: 'visual_artifact' | 'story_beat' | 'audio_sync' | 'praise' | 'critique';
}

export interface BunnyStreamConfig {
  libraryId: string;        // e.g. "342119"
  videoId: string;          // Bunny Video GUID e.g. "9a8b7c6d-..."
  directIframeUrl?: string; // Optional full iframe URL
  directHlsUrl?: string;    // Optional direct .m3u8 stream URL
  fallbackVideoUrl?: string;
  cdnHostname?: string;     // e.g. "video.bunnycdn.com" or "vz-xyz.b-cdn.net"
}

export interface FilmSubmission {
  id: string;
  title: string;
  titleAr: string;
  director: string;
  country: string;
  countryCode: string;
  category: FilmCategory;
  runtimeMinutes: number;
  runtimeFormatted: string; // "08:42"
  synopsis: string;
  synopsisAr: string;
  posterBgGradient: string;
  accentColor: string;
  bunnyStream: BunnyStreamConfig;
  aspectRatio: '16:9' | '2.39:1' | '4:3';
  featured?: boolean;
}

export interface JudgeProfile {
  id: string;
  name: string;
  nameAr: string;
  title: string;
  titleAr: string;
  institution: string;
  avatarSeed: string;
  role: 'president' | 'jury_member';
}

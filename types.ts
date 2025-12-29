export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export enum AppMode {
  CREATIVE = 'CREATIVE', // Sáng tác
  EDITOR = 'EDITOR',     // Biên tập
  STRUCTURE = 'STRUCTURE', // Tổ chức/Dàn ý
  READER = 'READER',     // Hỗ trợ đọc
  UTILITY = 'UTILITY'    // Công cụ
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  wordCount?: number;
  modeUsed?: AppMode;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
  preview?: string;
}

export interface AnalyticsData {
  name: string; // Message index/id
  words: number; // Word count
  cumulative: number; // Total words so far
}

// Settings Interfaces
export type WritingTone = 'Neutral' | 'Humorous' | 'Dark' | 'Romantic' | 'Formal' | 'Whimsical';
export type POV = 'Default' | 'First Person (I)' | 'Third Person Limited' | 'Third Person Omniscient';
export type ResponseLength = 'Short' | 'Medium' | 'Long';
export type AuthorLevel = 'Beginner' | 'Professional' | 'Legendary' | 'Custom';

export interface WritingSettings {
  tone: WritingTone;
  pov: POV;
  responseLength: ResponseLength;
  creativityLevel: number; // 0.0 to 1.0
  authorLevel: AuthorLevel;
  customInstructions: string; // Only used if authorLevel is 'Custom'
}

export interface AppSettings {
  writing: WritingSettings;
  theme: 'light' | 'dark'; // Placeholder for future theme support
}
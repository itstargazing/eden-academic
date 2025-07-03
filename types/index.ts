// Citation Types
export interface Citation {
  id: string;
  text: string;
  format: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
  source: string;
  date: Date;
}

export interface CitationMatch {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  type: 'article' | 'book' | 'journal';
  excerpt: string;
  url?: string;
  doi?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  isbn?: string;
  matchPercentage: number;
}

// MindMap Types
export interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: { label: string };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

// Cognitive Compass Types
export interface CognitiveProfile {
  type: string;
  focusStyle: string;
  answers: Record<string, string>;
}

export interface PulseData {
  focus: number;
  energy: 'Low' | 'Medium' | 'High';
  distraction: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  timeline: CourseTimeline[];
}

export interface CourseTimeline {
  id: string;
  title: string;
  date: string;
  description: string;
  isCompleted: boolean;
  isDue: boolean;
}

export interface CourseSchedule {
  week: number;
  topic: string;
  description: string;
  assignments: string[];
}

export interface CourseResource {
  title: string;
  type: 'reading' | 'video' | 'assignment';
  url: string;
  description: string;
} 
/**
 * Eden Career Studio — shared types.
 * Structured resume JSON aligns with `resumePrompts` / AI contract.
 */

export type PersonaMode = 'corporate' | 'startup' | 'creative' | 'technical' | 'student';

export type InterviewMode = 'hr' | 'technical' | 'founder' | 'university' | 'behavioral';

export type ResumeTone = 'professional' | 'concise' | 'warm' | 'technical-neutral';

export type BulletImproveAction =
  | 'stronger'
  | 'concise'
  | 'metrics'
  | 'professional'
  | 'startup'
  | 'corporate';

export type StudioStep = 1 | 2 | 3 | 4 | 5 | 6;

/** Raw intake before AI structuring */
export interface ProfileInput {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  personalWebsiteUrl: string;
  education: string;
  workExperience: string;
  projects: string;
  skills: string;
  certifications: string;
  awards: string;
  volunteering: string;
  targetRole: string;
  targetIndustry: string;
  resumeTone: ResumeTone;
  /** User-selected file name only — no persisted upload until Supabase is wired with auth */
  resumeFileName: string;
  pastedProfileFallback: string;
}

export interface ResumeBullet {
  id: string;
  text: string;
}

export interface ResumeEducationEntry {
  id: string;
  institution: string;
  degree: string;
  dates: string;
  details: string;
  proofId?: string;
}

export interface ResumeExperienceEntry {
  id: string;
  company: string;
  title: string;
  dates: string;
  bullets: ResumeBullet[];
  proofId?: string;
}

export interface ResumeProjectEntry {
  id: string;
  name: string;
  description: string;
  bullets: ResumeBullet[];
  proofId?: string;
}

export interface StructuredResume {
  summary: string;
  education: ResumeEducationEntry[];
  experience: ResumeExperienceEntry[];
  projects: ResumeProjectEntry[];
  skills: string[];
  certifications: string[];
  leadership: string[];
  awards: string[];
  additionalLinks: { label: string; url: string }[];
}

export interface ProofCardData {
  id: string;
  /** Optional anchor to experience/project/education id */
  linkedItemId?: string;
  projectLink: string;
  githubLink: string;
  websiteLink: string;
  screenshotPlaceholder: string;
  resultImpact: string;
  whatYouDid: string;
  skillsUsed: string;
  evidenceStrength: number;
}

export interface PersonaRewriteResult {
  resume: StructuredResume;
  explanation: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  expectedDirection: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewEvaluation {
  clarityScore: number;
  confidenceScore: number;
  specificityScore: number;
  evidenceScore: number;
  relevanceScore: number;
  overallScore: number;
  feedback: string;
  improvedAnswer: string;
  followUpQuestion: string;
}

export interface OpportunityMatchResult {
  bestFitRoles: { title: string; match: 'strong' | 'medium' | 'stretch' }[];
  realisticLevel: string;
  strongSkills: string[];
  skillGaps: string[];
  suggestedProjects: string[];
  keywordsToAdd: string[];
  readinessScore: number;
  summary: string;
}

export const EMPTY_PROFILE: ProfileInput = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedInUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  personalWebsiteUrl: '',
  education: '',
  workExperience: '',
  projects: '',
  skills: '',
  certifications: '',
  awards: '',
  volunteering: '',
  targetRole: '',
  targetIndustry: '',
  resumeTone: 'professional',
  resumeFileName: '',
  pastedProfileFallback: '',
};

export type GhostCitation = {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  sources_likely: string[];
};

export type ThesisSection = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
};

export type ThesisOutline = {
  title: string;
  abstract_draft: string;
  sections: ThesisSection[];
};

export type SyllabusWeek = {
  week: number;
  topic: string;
  readings: string;
  assignments: string;
  deadline: string;
};

export type MajorAssessment = {
  name: string;
  weight: string;
  due_date: string;
};

export type SyllabusResult = {
  course_name: string;
  instructor: string;
  total_weeks: number;
  weeks: SyllabusWeek[];
  major_assessments: MajorAssessment[];
};

export type CognitiveAnswers = {
  productivity_time: string;
  learning_style: string;
  distraction_level: string;
  has_adhd: string;
  session_length: string;
};

export type CognitiveProfileResult = {
  profile_name: string;
  peak_hours: string;
  cognitive_style: string;
  recommended_session_length: number;
  break_duration: number;
  focus_technique: string;
  environment_tips: string[];
  tools_to_use: string[];
  adhd_accommodations: string[];
};

export type BrainMergeResearcher = {
  id: string;
  name: string;
  university: string;
  country: string;
  field: string;
  research_focus: string;
  match_score: number;
  recent_paper: string;
  looking_for: string;
};

export type DashboardProfileRecord = {
  id: string;
  user_id: string;
  profile_data: CognitiveProfileResult;
  created_at: string;
};

export type DashboardSyllabusRecord = {
  id: string;
  user_id: string;
  course_name: string;
  weeks: SyllabusWeek[];
  major_assessments: MajorAssessment[];
  created_at: string;
};

export type DashboardThesisRecord = {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  outline: ThesisOutline;
  updated_at: string;
};

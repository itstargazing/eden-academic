/**
 * Eden Career Studio — AI integration layer.
 *
 * TODO: Replace mock implementations with real API calls (e.g. POST /api/career-studio/...)
 * Keep the same function signatures so UI components stay unchanged.
 */

import type {
  BulletImproveAction,
  InterviewEvaluation,
  InterviewMode,
  InterviewQuestion,
  OpportunityMatchResult,
  PersonaMode,
  PersonaRewriteResult,
  ProfileInput,
  ProofCardData,
  StructuredResume,
  ResumeBullet,
  ResumeEducationEntry,
  ResumeExperienceEntry,
  ResumeProjectEntry,
} from './careerTypes';
import {
  buildGenerateResumePrompt,
  buildImproveBulletPrompt,
  buildInterviewEvaluatePrompt,
  buildInterviewQuestionsPrompt,
  buildOpportunityMatchPrompt,
  buildPersonaRewritePrompt,
} from './resumePrompts';

/** Set false when your API route is ready and returns parsed JSON */
export const CAREER_AI_USE_MOCK = true;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function linesToBullets(text: string): ResumeBullet[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•]\s*/, ''))
    .filter(Boolean)
    .map((text) => ({ id: id('b'), text }));
}

function mockResumeFromProfile(profile: ProfileInput): StructuredResume {
  const name = profile.fullName.trim() || 'Candidate';
  const expBullets = linesToBullets(profile.workExperience || '— Add your roles and outcomes here.');
  const projBullets = linesToBullets(profile.projects || '— Add projects with measurable outcomes when possible.');

  const experience: ResumeExperienceEntry[] = [];
  if (profile.workExperience.trim()) {
    experience.push({
      id: id('exp'),
      company: profile.location ? `${profile.targetIndustry || 'Organization'} (see details)` : 'Experience',
      title: profile.targetRole || 'Professional',
      dates: 'Dates to be confirmed',
      bullets: expBullets.length ? expBullets : [{ id: id('b'), text: profile.workExperience.slice(0, 200) }],
    });
  } else {
    experience.push({
      id: id('exp'),
      company: '[Add employer]',
      title: profile.targetRole || '[Add title]',
      dates: '[Add dates]',
      bullets: [{ id: id('b'), text: 'Add achievement bullets grounded in your real work.' }],
    });
  }

  const projects: ResumeProjectEntry[] = [];
  if (profile.projects.trim()) {
    projects.push({
      id: id('proj'),
      name: 'Highlighted project',
      description: profile.projects.split('\n')[0]?.slice(0, 160) || '',
      bullets: projBullets.length ? projBullets : [{ id: id('b'), text: profile.projects.slice(0, 220) }],
    });
  }

  const eduLines = profile.education
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const education: ResumeEducationEntry[] =
    eduLines.length > 0
      ? eduLines.map((block) => {
          const [head, ...rest] = block.split('\n');
          return {
            id: id('edu'),
            institution: head.split('|')[0]?.trim() || head,
            degree: head.split('|')[1]?.trim() || 'Program',
            dates: head.split('|')[2]?.trim() || '',
            details: rest.join('\n').trim() || '',
          };
        })
      : [
          {
            id: id('edu'),
            institution: '[Institution]',
            degree: '[Degree / program]',
            dates: '[Dates or expected graduation]',
            details: 'Coursework, honors, and relevant labs go here.',
          },
        ];

  const skillsRaw = profile.skills.split(/[,|\n]/).map((s) => s.trim()).filter(Boolean);
  const skills = skillsRaw.length ? skillsRaw : ['Communication', 'Problem solving', 'Add domain tools'];

  const links: { label: string; url: string }[] = [];
  if (profile.linkedInUrl) links.push({ label: 'LinkedIn', url: profile.linkedInUrl });
  if (profile.githubUrl) links.push({ label: 'GitHub', url: profile.githubUrl });
  if (profile.portfolioUrl) links.push({ label: 'Portfolio', url: profile.portfolioUrl });
  if (profile.personalWebsiteUrl) links.push({ label: 'Website', url: profile.personalWebsiteUrl });

  const summaryParts = [
    `${name} is pursuing ${profile.targetRole || 'their next role'}${profile.targetIndustry ? ` in ${profile.targetIndustry}` : ''}.`,
    profile.pastedProfileFallback.trim()
      ? 'Profile details were provided via pasted content to avoid relying on inaccessible pages.'
      : 'Resume content should be expanded with verified outcomes from your experience.',
  ];

  return {
    summary: summaryParts.join(' '),
    education,
    experience,
    projects,
    skills,
    certifications: profile.certifications
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    leadership: profile.volunteering
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    awards: profile.awards
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    additionalLinks: links,
  };
}

function shallowPersonaTweak(resume: StructuredResume, mode: PersonaMode): PersonaRewriteResult {
  const copy: StructuredResume = JSON.parse(JSON.stringify(resume));
  const prefixes: Record<PersonaMode, string> = {
    corporate: 'Executive summary — ',
    startup: 'Builder profile — ',
    creative: 'Narrative arc — ',
    technical: 'Systems lens — ',
    student: 'Emerging talent — ',
  };
  copy.summary = `${prefixes[mode]}${copy.summary}`;
  return {
    resume: copy,
    explanation: `Reframed for ${mode} readers: emphasis and ordering cues adjusted; facts unchanged (mock).`,
  };
}

function mockQuestions(resume: StructuredResume, targetRole: string, mode: InterviewMode): InterviewQuestion[] {
  const role = targetRole || 'this role';
  const projectName = resume.projects[0]?.name || 'a project you listed';
  return [
    {
      id: id('q'),
      question: 'Tell me about yourself in the context of this role.',
      expectedDirection: `Connect ${resume.summary.slice(0, 80)}… to outcomes relevant to ${role}.`,
      difficulty: 'easy',
    },
    {
      id: id('q'),
      question: `Walk me through ${projectName} — what did you personally build or decide?`,
      expectedDirection: 'Ownership, constraints, metrics or user impact (honest ranges).',
      difficulty: 'medium',
    },
    {
      id: id('q'),
      question: mode === 'technical'
        ? 'What tradeoffs did you consider in implementation?'
        : 'Describe a challenge where you did not have enough data — how did you proceed?',
      expectedDirection: 'Judgment, collaboration, and learning — avoid blame.',
      difficulty: 'hard',
    },
    {
      id: id('q'),
      question: `Why ${role}, and what makes your background different from other applicants?`,
      expectedDirection: 'Specific proof from resume; avoid generic superlatives.',
      difficulty: 'medium',
    },
  ];
}

function mockEvaluate(
  question: string,
  answer: string,
  resume: StructuredResume,
  targetRole: string
): InterviewEvaluation {
  const base = Math.min(92, 55 + Math.floor(answer.length / 12));
  return {
    clarityScore: base,
    confidenceScore: Math.min(90, base + (answer.includes('I ') ? 4 : -2)),
    specificityScore: answer.length > 120 ? base + 6 : base - 8,
    evidenceScore: resume.experience.some((e) => e.bullets.some((b) => answer.includes(b.text.slice(0, 20))))
      ? base + 8
      : base - 10,
    relevanceScore: answer.toLowerCase().includes((targetRole || '').toLowerCase().slice(0, 4)) ? base + 5 : base,
    overallScore: base,
    feedback:
      'Tighten the arc: lead with role-relevant outcome, cite one concrete artifact or metric you own, then close with what you want next.',
    improvedAnswer: `For "${question.slice(0, 48)}…", try: lead with your responsibility, add one measurable signal from your resume, then tie motivation to ${targetRole || 'the role'}.`,
    followUpQuestion: 'What would you do in the first 30 days if you joined the team?',
  };
}

function mockOpportunity(resume: StructuredResume, targetRole: string, industry: string): OpportunityMatchResult {
  const tr = targetRole || 'General applicant';
  return {
    bestFitRoles: [
      { title: tr, match: 'strong' },
      { title: `${tr.split(' ')[0] || 'Adjacent'} — related IC track`, match: 'medium' },
      { title: 'Cross-functional coordinator (stretch)', match: 'stretch' },
    ],
    realisticLevel: resume.experience.length >= 2 ? 'Early professional' : 'Student / early-career',
    strongSkills: resume.skills.slice(0, 5),
    skillGaps: ['Stakeholder research depth', 'Public write-ups of shipped work', 'Quantified outcomes per bullet'],
    suggestedProjects: [
      'Publish a short case study for one shipped project with problem → approach → result.',
      'Add a README with architecture diagram for a technical repo you own.',
    ],
    keywordsToAdd: industry ? [`${industry} tooling`, 'cross-functional delivery'] : ['delivery', 'ownership'],
    readinessScore: Math.min(88, 52 + resume.experience.reduce((n, e) => n + e.bullets.length, 0) * 3),
    summary:
      'Mock analysis: strengthen proof density and align bullets to target role keywords without inventing experience.',
  };
}

function mockImproveBullet(text: string, action: BulletImproveAction): string {
  const t = text.trim();
  switch (action) {
    case 'stronger':
      return `Led and delivered ${t.replace(/^[A-Za-z]+\s+/i, '')} with clear ownership across stakeholders.`;
    case 'concise':
      return t.length > 80 ? `${t.slice(0, 77)}…` : t;
    case 'metrics':
      return `${t} (Quantify: baseline → result, e.g. time saved or error rate reduction — use real numbers only.)`;
    case 'professional':
      return `Responsible for ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
    case 'startup':
      return `Shipped quickly in ambiguous scope: ${t}`;
    case 'corporate':
      return `Accountable for outcomes aligned to business priorities: ${t}`;
    default:
      return t;
  }
}

/** Expose prompts for logging or sending to your model */
export function getPromptBundle(profile: ProfileInput) {
  return {
    generate: buildGenerateResumePrompt(profile),
  };
}

export async function generateResume(profile: ProfileInput): Promise<StructuredResume> {
  if (!CAREER_AI_USE_MOCK) {
    // TODO: const res = await fetch('/api/career-studio/generate', { method: 'POST', body: JSON.stringify({ prompt: buildGenerateResumePrompt(profile) }) });
    // return parse JSON to StructuredResume
    await delay(400);
  } else {
    await delay(650);
  }
  return mockResumeFromProfile(profile);
}

export async function rewriteForPersona(
  resume: StructuredResume,
  mode: PersonaMode
): Promise<PersonaRewriteResult> {
  if (!CAREER_AI_USE_MOCK) {
    void buildPersonaRewritePrompt(resume, mode);
    await delay(400);
  } else {
    await delay(500);
  }
  return shallowPersonaTweak(resume, mode);
}

export async function generateInterviewQuestions(params: {
  resume: StructuredResume;
  targetRole: string;
  mode: InterviewMode;
}): Promise<InterviewQuestion[]> {
  if (!CAREER_AI_USE_MOCK) {
    void buildInterviewQuestionsPrompt(params);
    await delay(400);
  } else {
    await delay(450);
  }
  return mockQuestions(params.resume, params.targetRole, params.mode);
}

export async function evaluateInterviewAnswer(params: {
  question: string;
  userAnswer: string;
  resume: StructuredResume;
  targetRole: string;
}): Promise<InterviewEvaluation> {
  if (!CAREER_AI_USE_MOCK) {
    void buildInterviewEvaluatePrompt(params);
    await delay(500);
  } else {
    await delay(550);
  }
  return mockEvaluate(params.question, params.userAnswer, params.resume, params.targetRole);
}

export async function matchOpportunities(params: {
  resume: StructuredResume;
  targetRole: string;
  targetIndustry: string;
}): Promise<OpportunityMatchResult> {
  if (!CAREER_AI_USE_MOCK) {
    void buildOpportunityMatchPrompt(params);
    await delay(500);
  } else {
    await delay(500);
  }
  return mockOpportunity(params.resume, params.targetRole, params.targetIndustry);
}

export async function improveBullet(params: {
  bulletText: string;
  action: BulletImproveAction;
  context: string;
}): Promise<string> {
  if (!CAREER_AI_USE_MOCK) {
    void buildImproveBulletPrompt(params);
    await delay(300);
  } else {
    await delay(320);
  }
  return mockImproveBullet(params.bulletText, params.action);
}

/** Optional: attach default empty proof for an item */
export function emptyProof(linked?: string): ProofCardData {
  return {
    id: id('proof'),
    linkedItemId: linked,
    projectLink: '',
    githubLink: '',
    websiteLink: '',
    screenshotPlaceholder: 'Screenshot upload — connect Supabase Storage with auth before persisting files.',
    resultImpact: '',
    whatYouDid: '',
    skillsUsed: '',
    evidenceStrength: 3,
  };
}

/**
 * Structured prompts for Eden Career Studio.
 * Wire these to your AI API in `careerAiService.ts` — keep request/response shapes stable.
 */

import type {
  BulletImproveAction,
  InterviewMode,
  PersonaMode,
  ProfileInput,
  StructuredResume,
} from './careerTypes';

export function buildGenerateResumePrompt(profile: ProfileInput): string {
  return `You are Eden Career Studio, an expert resume writer for students, interns, early-career professionals, and founders.

Rules:
- Output ONLY valid JSON matching this TypeScript shape (no markdown fences):
{
  "summary": string,
  "education": Array<{ id: string, institution: string, degree: string, dates: string, details: string }>,
  "experience": Array<{ id: string, company: string, title: string, dates: string, bullets: Array<{ id: string, text: string }> }>,
  "projects": Array<{ id: string, name: string, description: string, bullets: Array<{ id: string, text: string }> }>,
  "skills": string[],
  "certifications": string[],
  "leadership": string[],
  "awards": string[],
  "additionalLinks": Array<{ label: string, url: string }>
}
- ATS-friendly: clear headings implied by structure; bullets start with strong verbs; no tables.
- Achievement-oriented but never invent employers, degrees, dates, or metrics not supported by the user text.
- If information is missing, omit sections or use brief honest placeholders like "Add dates when known" only inside details, not fake employers.
- Tone: ${profile.resumeTone}.
- Target context: ${profile.targetRole || 'general'} in ${profile.targetIndustry || 'general industry'}.

User-provided profile (may include pasted fallback — prefer it when links are empty):
${JSON.stringify(profile, null, 2)}
`;
}

export function buildPersonaRewritePrompt(
  resume: StructuredResume,
  mode: PersonaMode
): string {
  return `Rewrite the following resume JSON for persona mode: "${mode}".

Modes:
- corporate: leadership, ownership of outcomes, process, measurable impact (only if supported by source).
- startup: speed, ownership, experimentation, adaptability, building.
- creative: narrative, design thinking, craft, collaboration with design/product.
- technical: systems, tools, tradeoffs, implementation detail (accurate to source only).
- student: learning agility, coursework/projects, leadership, curiosity, potential.

Return JSON only:
{ "resume": <full StructuredResume>, "explanation": string }

Do not invent facts. Only reframe existing content.

Original resume:
${JSON.stringify(resume, null, 2)}
`;
}

export function buildInterviewQuestionsPrompt(params: {
  resume: StructuredResume;
  targetRole: string;
  mode: InterviewMode;
}): string {
  return `Generate interview questions from this resume for mode "${params.mode}" and target role "${params.targetRole}".

Return JSON only:
{
  "questions": Array<{ "id": string, "question": string, "expectedDirection": string, "difficulty": "easy"|"medium"|"hard" }>
}

Include mixes of: tell me about yourself, walk through a project, role clarity, challenges, motivation, differentiation.
Ground every question in resume content; do not invent experiences.

Resume:
${JSON.stringify(params.resume, null, 2)}
`;
}

export function buildInterviewEvaluatePrompt(params: {
  question: string;
  userAnswer: string;
  resume: StructuredResume;
  targetRole: string;
}): string {
  return `Evaluate this interview answer.

Return JSON only:
{
  "clarityScore": number,
  "confidenceScore": number,
  "specificityScore": number,
  "evidenceScore": number,
  "relevanceScore": number,
  "overallScore": number,
  "feedback": string,
  "improvedAnswer": string,
  "followUpQuestion": string
}

Scores are 0-100 integers. Feedback should cite resume-aligned evidence gaps constructively.

Question: ${params.question}
Answer: ${params.userAnswer}
Target role: ${params.targetRole}
Resume: ${JSON.stringify(params.resume, null, 2)}
`;
}

export function buildOpportunityMatchPrompt(params: {
  resume: StructuredResume;
  targetRole: string;
  targetIndustry: string;
}): string {
  return `Analyze fit between resume and stated goals.

Return JSON only:
{
  "bestFitRoles": Array<{ "title": string, "match": "strong"|"medium"|"stretch" }>,
  "realisticLevel": string,
  "strongSkills": string[],
  "skillGaps": string[],
  "suggestedProjects": string[],
  "keywordsToAdd": string[],
  "readinessScore": number,
  "summary": string
}

readinessScore is 0-100. Be realistic; no fake credentials.

Target role: ${params.targetRole}
Industry: ${params.targetIndustry}
Resume: ${JSON.stringify(params.resume, null, 2)}
`;
}

export function buildImproveBulletPrompt(params: {
  bulletText: string;
  action: BulletImproveAction;
  context: string;
}): string {
  return `Improve this resume bullet with action: "${params.action}".

Rules: same facts, stronger wording; if metrics are not in context, suggest metric placeholders like "(quantify: X%)" not invented numbers.

Return JSON only: { "text": string }

Context (section/item): ${params.context}
Bullet: ${params.bulletText}
`;
}

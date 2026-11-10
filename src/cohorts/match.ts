// Project finder: ranks the six cohort projects from a student's answers. Pure functions only,
// so the page, the sign-up message and the tests all share one source of truth.
import {
  cohortSignup, difficultyLabels, isFieldKey, isPlatformKey, isProjectKey, platformOf, platforms, projectByKey, projects, researchFields,
  type Difficulty, type FieldKey, type PlatformKey, type Project, type ProjectKey,
} from './projects';

export type DataChoice = PlatformKey | 'any';
export type Challenge = 'easier' | 'middle' | 'harder';
export type Computer = 'install' | 'locked' | 'mobile' | 'unsure';
export type Partner = 'partner' | 'solo' | 'either';
export type Answers = {
  hooks: ProjectKey[];
  fields: FieldKey[];
  data: DataChoice | null;
  challenge: Challenge | null;
  computer: Computer | null;
};
export const emptyAnswers: Answers = { hooks: [], fields: [], data: null, challenge: null, computer: null };

type Option<K> = { key: K; label: string; description: string };
type ComputerOption = Option<Computer> & { short: string };
export const dataOptions: Option<DataChoice>[] = [
  ...platforms.map(platform => ({ key: platform.key, label: platform.dataLabel, description: platform.dataDescription })),
  { key: 'any', label: 'Surprise me', description: 'No preference. Match me on everything else.' },
];
export const challengeOptions: Option<Challenge>[] = [
  { key: 'easier', label: 'Ease me in', description: 'I’m new to this. Start me somewhere gentle.' },
  { key: 'middle', label: 'Somewhere in the middle', description: 'A real challenge, but nothing extreme.' },
  { key: 'harder', label: 'Give me the hardest one', description: 'More data and more statistics to explain.' },
];
export const computerOptions: ComputerOption[] = [
  { key: 'install', label: 'A Windows or Mac computer I can install programs on', short: 'Windows or Mac that allows installs', description: 'Every project works.' },
  { key: 'locked', label: 'A Chromebook, or a school laptop that blocks installs', short: 'Chromebook or locked school laptop', description: 'Galaxy and iDEP work in a browser. Biblioshiny needs installs.' },
  { key: 'mobile', label: 'Only a phone or tablet', short: 'Phone or tablet only', description: 'Every project needs a full-size screen, such as a school or library computer.' },
  { key: 'unsure', label: 'Not sure yet', short: 'Not sure yet', description: 'Check before you choose a Biblioshiny project.' },
];
export const partnerOptions: { key: Partner; label: string; summary: string }[] = [
  { key: 'partner', label: 'With a partner (recommended)', summary: 'With a partner' },
  { key: 'solo', label: 'Solo', summary: 'Solo' },
  { key: 'either', label: 'Either is fine', summary: 'Either is fine' },
];

// Weights. A picked question is the strongest single signal (it beats any one field, which
// scores at most 7.5); fields are averaged so ticking many cannot drown out everything else.
const HOOK = 8;
const FIELD = 2.5;
const DATA = 5;
const challengeFit: Record<Challenge, Record<Difficulty, number>> = {
  easier: { easier: 3, medium: 1, harder: -3 },
  middle: { easier: 1, medium: 2, harder: 0 },
  harder: { easier: -1, medium: 1, harder: 3 },
};
const difficultyOrder: Record<Difficulty, number> = { easier: 0, medium: 1, harder: 2 };

export const blockedReason = 'Needs a Windows or Mac computer where you can install R.';

export type Ranked = {
  project: Project;
  score: number;
  /** Plain-language reasons this project fits the answers, strongest first. */
  reasons: string[];
  /** Why the student's computer rules this project out, if it does. */
  blocked: string | null;
  /** Something to check before choosing this project. */
  caution: string | null;
};

export function hasAnswers(answers: Answers): boolean {
  return answers.hooks.length > 0 || answers.fields.length > 0 || answers.data !== null || answers.challenge !== null || answers.computer !== null;
}
/** True when the answers say something about interests, not only about the student's computer. */
export function hasInterests(answers: Answers): boolean {
  return answers.hooks.length > 0 || answers.fields.length > 0 || (answers.data !== null && answers.data !== 'any') || answers.challenge !== null;
}

export function rankProjects(answers: Answers): Ranked[] {
  const chosen = researchFields.filter(field => answers.fields.includes(field.key));
  return projects.map((project, order) => {
    const platform = platformOf(project);
    const reasons: string[] = [];
    let score = 0;
    if (answers.hooks.includes(project.key)) {
      score += HOOK;
      reasons.push(`You want to answer “${project.hook}”`);
    }
    if (chosen.length) {
      score += FIELD * chosen.reduce((sum, field) => sum + (project.fields[field.key] ?? 0), 0) / chosen.length;
      const strong = chosen.filter(field => (project.fields[field.key] ?? 0) >= 2)
        .sort((a, b) => (project.fields[b.key] ?? 0) - (project.fields[a.key] ?? 0)).slice(0, 3);
      if (strong.length) reasons.push(`Matches fields you picked: ${strong.map(field => field.label).join(', ')}`);
    }
    if (answers.data === project.platform) {
      score += DATA;
      reasons.push(`You picked “${platform.dataLabel}”, which is what the ${platform.name} cohort works with`);
    }
    if (answers.challenge) {
      const fit = challengeFit[answers.challenge][project.difficulty];
      score += fit;
      if (fit >= 3) reasons.push(project.difficultyNote);
      else if (fit >= 2) reasons.push(`${difficultyLabels[project.difficulty]} difficulty, the level of challenge you asked for`);
    }
    let blocked: string | null = null;
    let caution: string | null = null;
    if (platform.needsInstall) {
      if (answers.computer === 'locked' || answers.computer === 'mobile') blocked = blockedReason;
      else if (answers.computer === 'install') reasons.push('You can install programs, which Biblioshiny needs');
      else caution = 'Check that you can install programs on your computer before you choose this one.';
    } else if (answers.computer === 'locked') {
      reasons.push(`${platform.name} runs in a web browser, so a Chromebook works`);
    } else if (answers.computer === 'mobile') {
      caution = 'You will need a laptop or desktop with a full-size screen. A school or library computer works.';
    }
    return { project, score: Math.round(score * 100) / 100, reasons, blocked, caution, order };
  }).sort((a, b) =>
    Number(a.blocked !== null) - Number(b.blocked !== null)
    || b.score - a.score
    || difficultyOrder[a.project.difficulty] - difficultyOrder[b.project.difficulty]
    || a.order - b.order,
  ).map(({ order: _order, ...ranked }) => ranked);
}

export type Recommendation = {
  ranked: Ranked[];
  /** The best match the student's computer allows, once anything has been answered. */
  first: Ranked | null;
  second: Ranked | null;
  /** Projects that would have made the top two if the student's computer allowed them. */
  ruledOut: Ranked[];
  notes: string[];
};
export function recommend(answers: Answers): Recommendation {
  const ranked = rankProjects(answers);
  if (!hasAnswers(answers)) return { ranked, first: null, second: null, ruledOut: [], notes: [] };
  const open = ranked.filter(entry => entry.blocked === null);
  const [first = null, second = null] = open;
  const bar = second?.score ?? first?.score ?? 0;
  const ruledOut = hasInterests(answers) ? ranked.filter(entry => entry.blocked !== null && entry.score > 0 && entry.score >= bar) : [];
  const notes: string[] = [];
  if (answers.fields.includes('ecology')) {
    notes.push('None of this round’s projects is an ecology project. Virus Under Pressure comes closest: its family trees and mutation clocks are the same methods ecologists use to track how species and populations change.');
  }
  if (answers.computer === 'mobile') {
    notes.push('Every project needs a laptop or desktop with a full-size screen. A school or library computer works for Galaxy and iDEP.');
  }
  if (!hasInterests(answers)) {
    notes.push('Tell us what interests you, and your match will get much sharper.');
  }
  return { ranked, first, second, ruledOut, notes };
}

// ---------------------------------------------------------------- Sign-up

export type SignupChoices = { first: ProjectKey | null; second: ProjectKey | null; computer: Computer | null; partner: Partner | null };

export function projectLabel(key: ProjectKey | null): string {
  if (!key) return 'Not chosen yet';
  const project = projectByKey(key);
  return `${project.name} (${platformOf(project).name})`;
}
function computerLabel(computer: Computer | null) {
  return computerOptions.find(option => option.key === computer)?.short ?? 'Not chosen yet';
}
function partnerLabel(partner: Partner | null) {
  return partnerOptions.find(option => option.key === partner)?.summary ?? 'Not chosen yet';
}

/** The plain-text summary a student sends, matching the questions on the cohort form. */
export function signupSummary(choices: SignupChoices): string {
  return [
    'EBS research cohort sign-up',
    'Name: ',
    `First choice: ${projectLabel(choices.first)}`,
    `Second choice: ${projectLabel(choices.second)}`,
    `Computer: ${computerLabel(choices.computer)}`,
    `Working: ${partnerLabel(choices.partner)}`,
    ...(choices.partner === 'partner' ? ['Partner’s name, if you have one: '] : []),
  ].join('\n');
}

export function signupMailto(choices: SignupChoices): string {
  const subject = `Research cohort sign-up${choices.first ? `: ${projectByKey(choices.first).name}` : ''}`;
  return `mailto:${cohortSignup.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(signupSummary(choices) + '\n')}`;
}

/** The sign-up form link, pre-filled when entry IDs are configured; null while there is no form. */
export function signupFormLink(choices: SignupChoices, config: typeof cohortSignup = cohortSignup): string | null {
  let url: URL;
  try { url = new URL(config.formUrl); } catch { return null; }
  if (url.protocol !== 'https:') return null;
  const values: [string, string][] = [
    [config.prefill.firstChoice, choices.first ? projectLabel(choices.first) : ''],
    [config.prefill.secondChoice, choices.second ? projectLabel(choices.second) : ''],
    [config.prefill.computer, choices.computer ? computerLabel(choices.computer) : ''],
    [config.prefill.partner, choices.partner ? partnerLabel(choices.partner) : ''],
  ];
  const filled = values.filter(([entry, value]) => /^entry\.\d+$/.test(entry) && value);
  if (filled.length) {
    url.searchParams.set('usp', 'pp_url');
    for (const [entry, value] of filled) url.searchParams.set(entry, value);
  }
  return url.href;
}

// ---------------------------------------------------------------- Saved answers

export const STORAGE_KEY = 'ebs-project-finder';
export type SavedFinder = { answers: Answers; first: ProjectKey | null; second: ProjectKey | null; partner: Partner | null };

const one = <T extends string>(value: unknown, allowed: readonly T[]): T | null => (allowed as readonly unknown[]).includes(value) ? value as T : null;
const many = <T extends string>(value: unknown, valid: (item: unknown) => item is T): T[] => Array.isArray(value) ? [...new Set(value.filter(valid))] : [];

/** Reads saved finder state defensively: anything unknown or malformed is dropped. */
export function parseSaved(raw: string | null): SavedFinder | null {
  if (!raw) return null;
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const answers = record.answers && typeof record.answers === 'object' ? record.answers as Record<string, unknown> : {};
  const data = answers.data === 'any' || isPlatformKey(answers.data) ? answers.data as DataChoice : null;
  return {
    answers: {
      hooks: many(answers.hooks, isProjectKey),
      fields: many(answers.fields, isFieldKey),
      data,
      challenge: one(answers.challenge, challengeOptions.map(option => option.key)),
      computer: one(answers.computer, computerOptions.map(option => option.key)),
    },
    first: isProjectKey(record.first) ? record.first : null,
    second: isProjectKey(record.second) ? record.second : null,
    partner: one(record.partner, partnerOptions.map(option => option.key)),
  };
}

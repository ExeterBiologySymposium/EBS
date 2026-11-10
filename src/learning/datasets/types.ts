// Types for the Dataset library (datasets.html), an Accepted-member page.
// Everything under src/learning/ is member content: the build keeps it in
// /protected-assets/ (see vite.config.ts), so never import it from a public page.

/** The four supported tools, plus datasets that need some R or Python. */
export type ToolKey = 'esquisse' | 'galaxy' | 'idep' | 'biblioshiny' | 'code';
export type GuideToolKey = Exclude<ToolKey, 'code'>;
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type FieldKey =
  | 'systems' | 'evolution' | 'microbiome' | 'cancer' | 'epidemiology' | 'biostatistics' | 'mathbio'
  | 'ecology' | 'neuroscience' | 'pharmacology' | 'health-informatics' | 'machine-learning'
  | 'bibliometrics' | 'meta-research';

/** A site page (such as rstudio.html) or a full https:// address. */
export type Link = { label: string; url: string };
export type CodeSample = { language: 'R' | 'Python'; text: string };

export type Field = {
  key: FieldKey;
  name: string;
  /** One sentence: what researchers in this field study. */
  summary: string;
};

export type GuideStep = { title: string; detail: string; code?: CodeSample };
export type ToolGuide = {
  key: GuideToolKey;
  name: string;
  tagline: string;
  summary: string;
  bestFor: string;
  accepts: string;
  runsIn: string;
  account: string;
  steps: GuideStep[];
  tips: string[];
  /** The first link opens the tool itself. */
  links: Link[];
};

export type Dataset = {
  /** Stable anchor for links: datasets.html#dataset-<id>. */
  id: string;
  name: string;
  provider: string;
  field: FieldKey;
  level: Level;
  /** Suggested tools, best fit first. */
  tools: ToolKey[];
  format: string;
  /** Cost, account and license notes. */
  access: string;
  summary: string;
  /** A starter question a student could investigate. */
  question: string;
  /** How to get the data and open it in a suggested tool. */
  steps: string[];
  code?: CodeSample;
  /** What to keep in mind before drawing conclusions. */
  caution?: string;
  url: string;
  links?: Link[];
};

// The no-code research cohorts shown on projects.html: three platforms, two projects each.
// The full step-by-step guides live in the EBS Team's Google Drive folder
// "EBS Non-Coding Research Cohorts". This file only describes them, so keep it in sync
// with the guides after each mentor dry run. See docs/research-cohorts.md.

export type PlatformKey = 'galaxy' | 'idep' | 'biblioshiny';
export type ProjectKey = 'virus-under-pressure' | 'itch-germ' | 'old-age-or-alzheimers' | 'tumor-on-the-move' | 'serotonin-storm' | 'machines-vs-memory-loss';
export type FieldKey =
  | 'systems-biology' | 'evolution' | 'microbiome' | 'cancer' | 'epidemiology' | 'biostatistics' | 'math-biology'
  | 'ecology' | 'neuroscience' | 'pharmacology' | 'health-informatics' | 'machine-learning' | 'bibliometrics' | 'meta-research';
export type Difficulty = 'easier' | 'medium' | 'harder';
/** How strongly a project uses a field: 1 touches on it, 2 uses it, 3 is built around it. */
export type Affinity = 1 | 2 | 3;

export type ResearchField = { key: FieldKey; label: string; description: string };
export type Platform = {
  key: PlatformKey;
  name: string;
  url: string;
  /** The kind of data the cohort works with, as offered in the finder. */
  dataLabel: string;
  dataDescription: string;
  /** Biblioshiny runs through R on the student's own computer; the others run in a browser. */
  needsInstall: boolean;
  /** Everything a student needs, in full. */
  needs: string;
  /** Short versions for the computer check table. */
  worksOn: string;
  wontWorkOn: string;
  extra?: string;
};
export type Week = { title: string; goal: string };
export type Project = {
  key: ProjectKey;
  name: string;
  platform: PlatformKey;
  /** A poster-title question, used to spark curiosity in the finder. */
  hook: string;
  /** The research question, in full. */
  question: string;
  /** The research question in one line. */
  summary: string;
  pitch: string;
  data: string;
  tools: string[];
  finishWith: string[];
  difficulty: Difficulty;
  difficultyNote: string;
  weeks: Week[];
  fields: Partial<Record<FieldKey, Affinity>>;
  /**
   * Link to the student copy of the guide. Leave empty until the guide has been dry-run, its
   * mentor notes removed, and it is shared as "Anyone with the link can view".
   */
  guideUrl: string;
};

export const researchFields: ResearchField[] = [
  { key: 'systems-biology', label: 'Systems biology', description: 'How genes, proteins and cells work together as networks and loops' },
  { key: 'evolution', label: 'Evolutionary biology and phylogenetics', description: 'How living things change over time, and family trees built from DNA' },
  { key: 'microbiome', label: 'Microbiome science', description: 'The bacteria and other microbes that live on and in us' },
  { key: 'cancer', label: 'Cancer genomics and precision medicine', description: 'Reading the genes of a tumor or a germ to choose the right treatment' },
  { key: 'epidemiology', label: 'Epidemiology and public health', description: 'How diseases spread through populations, and how we track them' },
  { key: 'biostatistics', label: 'Biostatistics', description: 'Statistics that tell a real difference from luck' },
  { key: 'math-biology', label: 'Mathematical biology', description: 'Rates, equations and models that describe living systems' },
  { key: 'ecology', label: 'Ecology and conservation data science', description: 'Data about species, habitats and how organisms interact' },
  { key: 'neuroscience', label: 'Computational neuroscience', description: 'Studying the brain and nervous system with data' },
  { key: 'pharmacology', label: 'Pharmacology and cheminformatics', description: 'How drugs work in the body, and what makes them safe or risky' },
  { key: 'health-informatics', label: 'Health informatics', description: 'Using medical data to improve diagnosis and care' },
  { key: 'machine-learning', label: 'Machine learning in biology', description: 'Computers that learn patterns from biological and medical data' },
  { key: 'bibliometrics', label: 'Bibliometrics (scientometrics)', description: 'Measuring science itself: papers, authors, countries and topics' },
  { key: 'meta-research', label: 'Meta-research and meta-analysis', description: 'Research about research: how study design and data choices shape results' },
];

export const platforms: Platform[] = [
  {
    key: 'galaxy',
    name: 'Galaxy',
    url: 'https://usegalaxy.org',
    dataLabel: 'DNA from germs and viruses',
    dataDescription: 'Read real genomes with the same tools public health labs use.',
    needsInstall: false,
    needs: 'A laptop or desktop with a web browser, a free Galaxy account at usegalaxy.org, and a Google account for Google Sheets.',
    worksOn: 'Any laptop or desktop with a web browser, including Chromebooks',
    wontWorkOn: 'Phones (you need a full-size screen)',
  },
  {
    key: 'idep',
    name: 'iDEP',
    url: 'https://bioinformatics.sdstate.edu/idep/',
    dataLabel: 'Gene activity in human tissue',
    dataDescription: 'Find which genes switch on or off in disease, using real patient samples.',
    needsInstall: false,
    needs: 'A laptop or desktop with a web browser and a Google account for Google Sheets. iDEP itself needs no account.',
    worksOn: 'Any laptop or desktop with a web browser, including Chromebooks',
    wontWorkOn: 'Phones (you need a full-size screen)',
  },
  {
    key: 'biblioshiny',
    name: 'Biblioshiny',
    url: 'https://www.bibliometrix.org/biblioshiny/',
    dataLabel: 'Thousands of research papers',
    dataDescription: 'Study science itself: how a field grows, who leads it, and which topics rise and fall.',
    needsInstall: true,
    needs: 'A Windows or Mac computer you are allowed to install programs on. Biblioshiny starts from R, a free program: you install it once, then paste two short lines to open Biblioshiny.',
    worksOn: 'A Windows or Mac computer you are allowed to install programs on',
    wontWorkOn: 'Chromebooks, iPads, phones, or school laptops that block installs',
    extra: 'Bonus: with R installed, you can also use esquisse, a free drag-and-drop chart builder, for custom poster charts.',
  },
];

const posterWeeks: Week[] = [
  { title: 'Make your poster figures', goal: 'Four figures, each with a one-sentence takeaway that contains a number.' },
  { title: 'Poster and pitch', goal: 'Build your poster and practice your 60-second pitch.' },
];

export const projects: Project[] = [
  {
    key: 'virus-under-pressure',
    name: 'Virus Under Pressure',
    platform: 'galaxy',
    hook: 'Why did COVID vaccines need updating?',
    question: 'How did the COVID-19 virus change between 2019 and 2023, how fast did it pick up mutations, and did the spike protein, the part that vaccines target, change faster than the rest of the virus?',
    summary: 'How fast did the COVID virus mutate, and did its spike, the vaccine target, change fastest?',
    pitch: 'Read the genes of 165 coronaviruses spanning the whole pandemic, let Nextclade name each variant, and measure the virus’s molecular clock. Then test whether spike, the exact part vaccines target, changed faster than everything else.',
    data: '165 complete SARS-CoV-2 genomes chosen by the Nextstrain team to cover the whole pandemic, from the earliest 2019 viruses to 2023 Omicron descendants.',
    tools: ['Galaxy', 'Nextclade', 'Google Sheets', 'Auspice'],
    finishWith: ['a mutation timeline', 'a mutation-rate estimate with uncertainty', 'a spike-versus-genome chart', 'a family tree of the virus'],
    difficulty: 'medium',
    difficultyNote: 'Includes a little math: a trend line and its standard error in Google Sheets.',
    weeks: [
      { title: 'Set up Galaxy and get the data', goal: 'A free Galaxy account and 165 virus genomes loaded into your history.' },
      { title: 'Name the variants with Nextclade', goal: 'A table that gives every genome its clade, a quality score and a list of its mutations.' },
      { title: 'Measure how fast the virus changed', goal: 'A mutation rate per year, with a measure of how uncertain it is.' },
      { title: 'Was the spike under pressure?', goal: 'Compare how fast each gene changed, then explore the virus’s family tree.' },
      ...posterWeeks,
    ],
    fields: { evolution: 3, epidemiology: 3, 'math-biology': 3, biostatistics: 2, ecology: 2, 'health-informatics': 1 },
    guideUrl: '',
  },
  {
    key: 'itch-germ',
    name: 'The Itch Germ',
    platform: 'galaxy',
    hook: 'Can a germ’s genes tell a doctor which antibiotic to use?',
    question: 'Staphylococcus aureus is a skin bacterium that feeds the itch-scratch cycle of eczema and causes serious infections, including the drug-resistant superbug MRSA. Which of its strains carry genes for antibiotic resistance and for itch-triggering toxins, and how would a strain’s genes change which antibiotic a doctor should choose?',
    summary: 'Which staph strains carry antibiotic-resistance and itch-triggering genes, and how would that change a doctor’s antibiotic choice?',
    pitch: 'Scan the complete genomes of 9 famous staph strains, from hospital superbugs to a lab strain to one from a dairy cow, for resistance genes and toxin genes. Your analysis has a built-in test: the MRSA gene mecA should appear in exactly the six MRSA strains.',
    data: 'Complete genomes of 9 well-known Staphylococcus aureus strains from hospitals, the community, a laboratory and a dairy cow, downloaded from the U.S. National Center for Biotechnology Information (NCBI).',
    tools: ['Galaxy', 'ABRicate', 'Google Sheets', 'Google Slides or Drawings'],
    finishWith: ['a resistance heat map', 'a virulence chart', 'an itch-loop diagram', 'a precision-medicine antibiotic table'],
    difficulty: 'easier',
    difficultyNote: 'The gentlest of the six: small files, fast tools and a built-in check that tells you your analysis worked.',
    weeks: [
      { title: 'Set up Galaxy and get the genomes', goal: 'A free Galaxy account and 9 staph genomes, each named after its strain.' },
      { title: 'Find the resistance genes', goal: 'Scan all 9 genomes at once and combine the results into one comparison table.' },
      { title: 'Build the heat map and antibiotic table', goal: 'A color-coded gene table, and the antibiotics each strain’s genes predict will fail.' },
      { title: 'The itch-loop and virulence genes', goal: 'Find the toxin genes, compare strain types with numbers, and draw the itch-scratch loop.' },
      ...posterWeeks,
    ],
    fields: { microbiome: 3, pharmacology: 2, cancer: 2, epidemiology: 2, 'systems-biology': 2, biostatistics: 1, 'health-informatics': 1, ecology: 1, evolution: 1 },
    guideUrl: '',
  },
  {
    key: 'old-age-or-alzheimers',
    name: 'Old Age or Alzheimer’s?',
    platform: 'idep',
    hook: 'Is it Alzheimer’s, or just getting older?',
    question: 'Which gene changes in the brains of people with Alzheimer’s disease are caused by the disease itself, and which are just part of normal aging?',
    summary: 'Which brain gene changes in Alzheimer’s are the disease, and which are just aging?',
    pitch: 'Compare gene activity in donated brain tissue from younger adults, older adults without dementia, and people with Alzheimer’s. Measure how many “Alzheimer’s genes” turn out to be ordinary aging, then hunt for biomarker candidates that are not.',
    data: 'GSE104704: brain tissue from the lateral temporal lobe, donated by younger adults, older adults without dementia, and people with Alzheimer’s disease. About 30 samples.',
    tools: ['iDEP', 'iDEP-READS', 'Google Sheets'],
    finishWith: ['a PCA plot', 'a volcano plot', 'a heat map', 'a pathway chart', 'an aging-versus-disease chart'],
    difficulty: 'medium',
    difficultyNote: 'Includes some careful spreadsheet work to label every sample before the analysis.',
    weeks: [
      { title: 'Get the data and clean it up', goal: 'Download the gene counts and label every sample in Google Sheets.' },
      { title: 'Load the data and check it', goal: 'Quality-check the data in iDEP and see how the three groups relate on a PCA plot.' },
      { title: 'Find the genes that changed', goal: 'Run three comparisons and measure how much of the Alzheimer’s signature is really aging.' },
      { title: 'Explore the genes and pathways', goal: 'Volcano plots, heat maps, pathway analysis and a biomarker mini-challenge.' },
      ...posterWeeks,
    ],
    fields: { neuroscience: 3, 'systems-biology': 3, biostatistics: 2, 'health-informatics': 1, 'machine-learning': 1, 'meta-research': 1 },
    guideUrl: '',
  },
  {
    key: 'tumor-on-the-move',
    name: 'Tumor on the Move',
    platform: 'idep',
    hook: 'What does colon cancer take with it when it spreads?',
    question: 'Which genes change when normal colon tissue becomes cancer, which of those changes are still there after the cancer spreads to the liver, and how many apparent “metastasis genes” are really just liver tissue mixed into the sample?',
    summary: 'Which gene changes does colon cancer keep when it spreads to the liver?',
    pitch: 'Analyze 54 samples from 18 patients: each person’s normal colon, colon tumor and liver tumor. Compare every tumor with that same person’s normal tissue, then catch the trap: how many “metastasis genes” are just liver cells mixed into the sample.',
    data: 'GSE50760: tissue from 18 people whose colorectal cancer had spread to the liver. From each person: normal colon, the primary colon tumor and the liver metastasis. 54 samples.',
    tools: ['iDEP', 'iDEP-READS', 'Google Sheets'],
    finishWith: ['a PCA plot', 'a volcano plot', 'a heat map', 'a pathway chart', 'a tissue-contamination chart'],
    difficulty: 'harder',
    difficultyNote: 'The most demanding of the six: 54 samples to label and a paired statistical design.',
    weeks: [
      { title: 'Get the data and clean it up', goal: 'Download the gene counts and label all 54 samples by tissue and patient.' },
      { title: 'Load the data and check it', goal: 'Quality-check the data in iDEP and see how normal colon, tumors and metastases separate.' },
      { title: 'Find the genes that changed', goal: 'Run the statistics twice, the naive way and the paired way, and see why pairing matters.' },
      { title: 'Explore the genes and pathways', goal: 'Pathway analysis, then separate the cancer’s own changes from liver tissue.' },
      ...posterWeeks,
    ],
    fields: { cancer: 3, biostatistics: 3, 'systems-biology': 3, 'machine-learning': 1, 'health-informatics': 1, 'meta-research': 1 },
    guideUrl: '',
  },
  {
    key: 'serotonin-storm',
    name: 'The Serotonin Storm',
    platform: 'biblioshiny',
    hook: 'Which drugs trigger serotonin syndrome?',
    question: 'Which drugs show up most often in medical research on serotonin syndrome, how has that list changed as doctors moved from older antidepressants to newer ones, and where in the world is this research done?',
    summary: 'Which drugs dominate research on serotonin syndrome, a dangerous drug reaction, and how has that changed?',
    pitch: 'Collect every PubMed paper on serotonin syndrome, a dangerous reaction to drug combinations, and rank the drug classes the research keeps returning to. Test a prediction from pharmacology, then track how the culprits changed over the decades.',
    data: 'Every PubMed paper that mentions serotonin syndrome or serotonin toxicity, up to the end of 2025.',
    tools: ['Biblioshiny', 'R (only to start Biblioshiny)', 'PubMed', 'Google Sheets'],
    finishWith: ['a growth chart', 'a drug-class ranking', 'a drug-trend timeline', 'a topic map', 'a world collaboration map'],
    difficulty: 'medium',
    difficultyNote: 'The trickiest part is the one-time install of R in Week 1.',
    weeks: [
      { title: 'Install Biblioshiny and get the data', goal: 'Install R and Biblioshiny once, then save every serotonin syndrome paper from PubMed.' },
      { title: 'Import and get the big picture', goal: 'Load your papers into Biblioshiny and measure how fast the field has grown.' },
      { title: 'Rank the drug classes', goal: 'Count the papers for each drug class and compare their shares decade by decade.' },
      { title: 'Map the topics and the countries', goal: 'Trend topics, a thematic map and a world map of who does the research.' },
      ...posterWeeks,
    ],
    fields: { pharmacology: 3, bibliometrics: 3, 'meta-research': 2, neuroscience: 2, 'health-informatics': 2, epidemiology: 1 },
    guideUrl: '',
  },
  {
    key: 'machines-vs-memory-loss',
    name: 'Machines vs. Memory Loss',
    platform: 'biblioshiny',
    hook: 'Is AI chasing the right Alzheimer’s tests?',
    question: 'How fast has research using artificial intelligence to detect Alzheimer’s disease grown, which biomarkers (brain scans, spinal fluid, blood tests, speech) does it rely on, is it shifting toward cheaper tests, and how much does the whole field depend on one dataset, ADNI?',
    summary: 'Is AI research on Alzheimer’s chasing expensive scans or cheap tests, and how much does it rely on one dataset?',
    pitch: 'Map the research that uses artificial intelligence to detect Alzheimer’s. Find out which tests it relies on, from brain scans to cheap blood tests, and how much of the whole field depends on a single shared dataset.',
    data: 'Every PubMed paper from 2010 to 2025 that mentions Alzheimer’s together with machine learning, deep learning, artificial intelligence or neural networks.',
    tools: ['Biblioshiny', 'R (only to start Biblioshiny)', 'PubMed', 'Google Sheets'],
    finishWith: ['a growth chart', 'a biomarker-trend chart', 'a cost-versus-attention chart', 'a dataset-dependence figure', 'a topic map'],
    difficulty: 'medium',
    difficultyNote: 'The trickiest part is the one-time install of R in Week 1.',
    weeks: [
      { title: 'Install Biblioshiny and get the data', goal: 'Install R and Biblioshiny once, then save the AI-for-Alzheimer’s papers from PubMed.' },
      { title: 'Import and get the big picture', goal: 'Load your papers into Biblioshiny and measure how fast the field has grown.' },
      { title: 'Which biomarkers, and how much ADNI?', goal: 'Count the papers for each test, follow their trends, and measure the field’s reliance on one dataset.' },
      { title: 'Map the topics and the countries', goal: 'See which AI methods rose and fell, map the themes, and find who does the research.' },
      ...posterWeeks,
    ],
    fields: { 'machine-learning': 3, bibliometrics: 3, 'meta-research': 3, 'health-informatics': 3, neuroscience: 2, biostatistics: 1 },
    guideUrl: '',
  },
];

/** Sign-up details. See docs/research-cohorts.md before changing these. */
export const cohortSignup = {
  /**
   * The cohort sign-up form (full https:// link). While empty, students email their choices instead.
   * For automatic pre-filling, use the long docs.google.com/forms/... link, not a forms.gle short link.
   */
  formUrl: '',
  /** Optional Google Forms pre-fill entry IDs (such as "entry.1234567") from "Get pre-filled link". */
  prefill: { firstChoice: '', secondChoice: '', computer: '', partner: '' },
  email: 'exeterbiologysymposium@gmail.com',
};

export const cohortFacts = {
  weeks: 6,
  hoursPerWeek: 'About 1.5 hours a week',
  groupSize: 'Cohorts work best with 2 to 8 people per project, working in pairs.',
};

export const difficultyLabels: Record<Difficulty, string> = { easier: 'Easier', medium: 'Medium', harder: 'Harder' };

export function platformOf(project: Project): Platform {
  return platforms.find(platform => platform.key === project.platform)!;
}
export function projectByKey(key: ProjectKey): Project {
  return projects.find(project => project.key === key)!;
}
export function isProjectKey(value: unknown): value is ProjectKey {
  return typeof value === 'string' && projects.some(project => project.key === value);
}
export function isFieldKey(value: unknown): value is FieldKey {
  return typeof value === 'string' && researchFields.some(field => field.key === value);
}
export function isPlatformKey(value: unknown): value is PlatformKey {
  return typeof value === 'string' && platforms.some(platform => platform.key === value);
}

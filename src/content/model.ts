// Typed website content shared by reader pages, the Team editor and the content API.
// Shared with server code, so imports use explicit .js extensions.
import { memberPages } from '../access-policy.js';

export const CONTENT_SCHEMA_VERSION = 1;
/** Largest accepted page, measured as UTF-8 JSON. */
export const MAX_CONTENT_BYTES = 200_000;
/** Character limits shared by validation and editor inputs. */
export const contentLimits = { line: 200, paragraph: 2000, text: 20000, url: 2000, language: 40, alt: 500, caption: 300 } as const;
const LIMITS = contentLimits;

export const contentPages = {
  researchers: { label: 'Student research', route: 'researchers.html', audience: 'public', template: 'research' },
  resources: { label: 'Resources', route: 'resources.html', audience: 'accepted', template: 'lesson' },
  datascience: { label: 'Coding', route: 'datascience.html', audience: 'accepted', template: 'lesson' },
  python: { label: 'Python', route: 'python.html', audience: 'accepted', template: 'lesson' },
  rstudio: { label: 'R / RStudio', route: 'rstudio.html', audience: 'accepted', template: 'lesson' },
} as const;
export type PageKey = keyof typeof contentPages;
export const pageKeys = Object.keys(contentPages) as PageKey[];
export function isPageKey(value: unknown): value is PageKey {
  return typeof value === 'string' && Object.hasOwn(contentPages, value);
}

export type MemberDestination = (typeof memberPages)[number];
export const memberDestinations: Record<MemberDestination, string> = {
  'resources.html': 'Resources', 'datascience.html': 'Coding', 'python.html': 'Python',
  'rstudio.html': 'R / RStudio', 'opensource.html': 'Open source', 'datasets.html': 'Dataset library', 'events.html': 'Events',
};

/** Text with optional links: each link turns the first matching phrase in the text into a link. */
export type InlineLink = { phrase: string; url: string };
export type RichText = { text: string; links: InlineLink[] };

export type TimelineEntry = { date: string; title: string; description: RichText };
export type FormatEntry = { title: string; description: string; badge: string };
export type ResearchContent = {
  title: string;
  lead: string;
  /** Student registration form used by every registration button on the page. */
  registrationUrl: string;
  overview: {
    imageSrc: string; imageAlt: string;
    heading: string; body: RichText;
    calloutTitle: string; calloutText: string;
    areasHeading: string; areas: string[]; areasNote: RichText;
  };
  timeline: { heading: string; intro: string; entries: TimelineEntry[] };
  formats: { heading: string; intro: string; entries: FormatEntry[] };
  support: { heading: string; body: RichText; buttonLabel: string; listHeading: string; items: string[] };
  registration: { heading: string; text: string; buttonLabel: string; secondaryLabel: string; secondaryPage: MemberDestination };
};

export type LessonLink = { label: string; url: string; description: string };
export type LessonImage = { src: string; alt: string; caption: string };
export type TextSection = { type: 'text'; heading: string; body: RichText; highlight: boolean };
export type ListSection = { type: 'list'; heading: string; intro: string; numbered: boolean; items: string[] };
export type LinksSection = { type: 'links'; heading: string; intro: string; links: LessonLink[] };
export type ImagesSection = { type: 'images'; heading: string; intro: string; images: LessonImage[] };
export type CodeSection = { type: 'code'; heading: string; intro: string; language: string; code: string };
export type LessonSection = TextSection | ListSection | LinksSection | ImagesSection | CodeSection;
export type SectionType = LessonSection['type'];
export type LessonContent = { eyebrow: string; title: string; lead: string; sections: LessonSection[] };

export type PageContentMap = {
  researchers: ResearchContent; resources: LessonContent; datascience: LessonContent; python: LessonContent; rstudio: LessonContent;
};
export type PageContent = PageContentMap[PageKey];

export const sectionTypes: Record<SectionType, { label: string; description: string }> = {
  text: { label: 'Text', description: 'Paragraphs, with optional links' },
  list: { label: 'List', description: 'Bulleted or numbered items' },
  links: { label: 'Links', description: 'Links with short descriptions' },
  images: { label: 'Images', description: 'Images with descriptions and captions' },
  code: { label: 'Code', description: 'A code example readers can copy' },
};
export function newSection(type: SectionType): LessonSection {
  switch (type) {
    case 'text': return { type, heading: '', body: { text: '', links: [] }, highlight: false };
    case 'list': return { type, heading: '', intro: '', numbered: false, items: [''] };
    case 'links': return { type, heading: '', intro: '', links: [{ label: '', url: '', description: '' }] };
    case 'images': return { type, heading: '', intro: '', images: [{ src: '', alt: '', caption: '' }] };
    case 'code': return { type, heading: '', intro: '', language: '', code: '' };
  }
}

// ---------------------------------------------------------------- Rich text

/** Paragraphs are separated by a blank line; single line breaks stay inside a paragraph. */
export function paragraphs(text: string): string[] {
  return text.split(/\n[ \t]*\n/).map(part => part.trim()).filter(Boolean);
}
export type LinkPlacement = { paragraph: number; start: number; end: number; url: string };
/** Places each link on the first occurrence of its phrase that does not overlap an earlier link. */
export function placeLinks(parts: string[], links: InlineLink[]): (LinkPlacement | null)[] {
  const placed: LinkPlacement[] = [];
  return links.map(({ phrase, url }) => {
    if (!phrase) return null;
    for (let paragraph = 0; paragraph < parts.length; paragraph++) {
      for (let start = parts[paragraph].indexOf(phrase); start >= 0; start = parts[paragraph].indexOf(phrase, start + 1)) {
        const end = start + phrase.length;
        if (placed.some(range => range.paragraph === paragraph && start < range.end && range.start < end)) continue;
        const range = { paragraph, start, end, url };
        placed.push(range);
        return range;
      }
    }
    return null;
  });
}

// ---------------------------------------------------------------- Links

export type UrlPurpose = 'link' | 'image' | 'form';
const sitePage = /^[a-z0-9][a-z0-9-]*\.html(?:[?#]\S*)?$/i;
function urlGuidance(purpose: UrlPurpose) {
  return purpose === 'image' ? 'Use a site image (such as /images/…) or a link that starts with https://.'
    : purpose === 'form' ? 'Use the full form link, starting with https://.'
      : 'Use a site page (such as faq.html), a link that starts with https://, or an email link (mailto:…).';
}
/** Returns a plain-language problem, or null when the link is safe for its purpose. */
export function urlProblem(value: string, purpose: UrlPurpose): string | null {
  if (!value) return purpose === 'image' ? 'Enter an image link.' : 'Enter a link.';
  if (value !== value.trim()) return 'Remove spaces from the start and end of the link.';
  if (value.length > LIMITS.url) return 'This link is too long.';
  if (/[\u0000-\u001f\u007f\\<>"`]/.test(value)) return 'This link contains characters that are not allowed.';
  if (value.startsWith('/')) {
    if (purpose === 'form') return urlGuidance(purpose);
    if (value.startsWith('//')) return 'Start site links with a single /, or use a full https:// link.';
    if (value.split(/[?#]/, 1)[0].split('/').some(part => /^(?:\.|%2e){1,2}$/i.test(part))) return 'Use a direct site path without . or .. folders.';
    return null;
  }
  if (purpose === 'link' && (sitePage.test(value) || /^#[A-Za-z][\w-]*$/.test(value))) return null;
  let url: URL;
  try { url = new URL(value); } catch { return urlGuidance(purpose); }
  if (url.username || url.password) return 'Links cannot include a username or password.';
  if (url.protocol === 'https:') return !/^https:\/\//i.test(value) ? 'Start full links with https://.' : /\s/.test(value) ? 'Remove spaces from the link.' : url.hostname ? null : urlGuidance(purpose);
  if (url.protocol === 'mailto:' && purpose === 'link') return /^mailto:[^\s@?#/]+@[^\s@?#/]+\.[^\s@?#/]+(?:\?\S*)?$/i.test(value) ? null : 'Enter a complete email link, such as mailto:name@example.com.';
  if (url.protocol === 'http:') return 'Use a secure link that starts with https://.';
  return urlGuidance(purpose);
}
// Endings that are web addresses rather than file names (.py, .sh, .md, .zip and .png are both).
const webEndings = new Set(['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'us', 'uk', 'ca']);
/** Friendly completion for common shorthand; never changes a link's scheme or guesses at file names. */
export function suggestUrl(value: string, purpose: UrlPurpose): string {
  const link = value.trim();
  if (purpose === 'link' && /^[^\s@/:]+@[^\s@/:]+\.[^\s@/:]+$/.test(link)) return 'mailto:' + link;
  if (purpose === 'image' && /^images\//i.test(link)) return '/' + link;
  const address = /^(?:[a-z0-9-]+\.)+([a-z]{2,})(?:[/?#]\S*)?$/i.exec(link);
  if (address && (/^www\./i.test(link) || webEndings.has(address[1].toLowerCase()))) return 'https://' + link;
  return link;
}
export function isExternalUrl(value: string) { return /^https:\/\//i.test(value); }

// ---------------------------------------------------------------- Validation

export type ContentIssue = { path: string; message: string };
export class ContentValidationError extends Error {
  constructor(public readonly issues: ContentIssue[]) { super(issues[0]?.message || 'This content is not valid.'); }
}
const FORMAT = 'This content is not in the expected format.';
type Context = { issues: ContentIssue[] };
type Check<T> = (value: unknown, path: string, context: Context) => T;
const join = (path: string, key: string | number) => path ? `${path}.${key}` : String(key);
const plain = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
function text(rule: { max: number; multiline?: boolean; required?: string }): Check<string> {
  return (value, path, context) => {
    if (typeof value !== 'string') { context.issues.push({ path, message: FORMAT }); return ''; }
    if (loneSurrogate.test(value)) context.issues.push({ path, message: 'This contains a character that cannot be saved. Retype the text and try again.' });
    else if (rule.multiline ? /[\u0000-\u0008\u000b-\u001f\u007f]/.test(value) : /[\u0000-\u001f\u007f]/.test(value)) context.issues.push({ path, message: rule.multiline ? 'Remove unsupported control characters.' : 'Keep this on a single line.' });
    else if (value.length > rule.max) context.issues.push({ path, message: `Shorten this to ${rule.max.toLocaleString('en-US')} characters or fewer.` });
    else if (rule.required && !value.trim()) context.issues.push({ path, message: rule.required });
    return value;
  };
}
const line = (required?: string) => text({ max: LIMITS.line, required });
const paragraph = (required?: string) => text({ max: LIMITS.paragraph, multiline: true, required });
const flag: Check<boolean> = (value, path, context) => {
  if (typeof value !== 'boolean') context.issues.push({ path, message: FORMAT });
  return value === true;
};
function link(purpose: UrlPurpose, optional = false): Check<string> {
  return (value, path, context) => {
    const count = context.issues.length;
    const result = text({ max: LIMITS.url })(value, path, context);
    if (context.issues.length === count && !(optional && !result)) {
      const problem = urlProblem(result, purpose);
      if (problem) context.issues.push({ path, message: problem });
    }
    return result;
  };
}
function choice<T extends string>(options: readonly T[], message: string): Check<T> {
  return (value, path, context) => {
    if (!options.includes(value as T)) context.issues.push({ path, message });
    return value as T;
  };
}
function literal<T extends string>(expected: T): Check<T> {
  return (value, path, context) => { if (value !== expected) context.issues.push({ path, message: FORMAT }); return expected; };
}
function list<T>(item: Check<T>, max: number, noun: string, min?: { count: number; message: string }): Check<T[]> {
  return (value, path, context) => {
    if (!Array.isArray(value)) { context.issues.push({ path, message: FORMAT }); return []; }
    if (value.length > max) { context.issues.push({ path, message: `Use ${max} ${noun} or fewer.` }); return []; }
    if (min && value.length < min.count) context.issues.push({ path, message: min.message });
    return value.map((entry, index) => item(entry, join(path, index), context));
  };
}
function shape<T extends object>(fields: { [K in keyof T]-?: Check<T[K]> }, refine?: (value: T, path: string, context: Context) => void): Check<T> {
  const keys = Object.keys(fields) as (keyof T & string)[];
  return (value, path, context) => {
    if (!plain(value) || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))) {
      context.issues.push({ path, message: FORMAT });
      return {} as T;
    }
    const result = {} as T;
    for (const key of keys) result[key] = fields[key](value[key], join(path, key), context);
    refine?.(result, path, context);
    return result;
  };
}
function rich(required?: string): Check<RichText> {
  return shape<RichText>({
    text: text({ max: LIMITS.text, multiline: true, required }),
    links: list(shape<InlineLink>({ phrase: line('Enter the words to turn into a link.'), url: link('link') }), 30, 'links in this text'),
  }, (value, path, context) => {
    const placements = placeLinks(paragraphs(value.text), value.links);
    value.links.forEach((entry, index) => {
      const at = join(path, `links.${index}.phrase`);
      if (!entry.phrase || context.issues.some(issue => issue.path === at)) return;
      if (entry.phrase !== entry.phrase.trim()) context.issues.push({ path: at, message: 'Remove spaces from the start and end of the linked words.' });
      else if (!placements[index]) context.issues.push({ path: at, message: 'These words must appear exactly in the text above, without overlapping another link.' });
    });
  });
}

const researchCheck = shape<ResearchContent>({
  title: line('Enter a page title.'),
  lead: paragraph(),
  registrationUrl: link('form'),
  overview: shape<ResearchContent['overview']>({
    imageSrc: link('image', true), imageAlt: text({ max: LIMITS.alt }),
    heading: line(), body: rich(),
    calloutTitle: line(), calloutText: paragraph(),
    areasHeading: line(),
    areas: list(line('Enter a research area or remove it.'), 40, 'research areas'),
    areasNote: rich(),
  }, (value, path, context) => {
    if (value.imageSrc && !value.imageAlt.trim()) context.issues.push({ path: join(path, 'imageAlt'), message: 'Describe the image for people who cannot see it.' });
  }),
  timeline: shape<ResearchContent['timeline']>({
    heading: line(), intro: paragraph(),
    entries: list(shape<TimelineEntry>({ date: line(), title: line('Enter a title for this timeline entry.'), description: rich() }), 40, 'timeline entries'),
  }),
  formats: shape<ResearchContent['formats']>({
    heading: line(), intro: paragraph(),
    entries: list(shape<FormatEntry>({ title: line('Enter a title for this format.'), description: paragraph(), badge: line() }), 12, 'presentation formats'),
  }),
  support: shape<ResearchContent['support']>({
    heading: line(), body: rich(), buttonLabel: line(), listHeading: line(),
    items: list(line('Enter text for this item or remove it.'), 40, 'support items'),
  }),
  registration: shape<ResearchContent['registration']>({
    heading: line(), text: paragraph(), buttonLabel: line(), secondaryLabel: line(),
    secondaryPage: choice(Object.keys(memberDestinations) as MemberDestination[], 'Choose a member page for this button.'),
  }),
});

const heading = line();
const intro = paragraph();
const sectionChecks: { [K in SectionType]: Check<Extract<LessonSection, { type: K }>> } = {
  text: shape<TextSection>({ type: literal('text'), heading, body: rich(), highlight: flag }, (value, path, context) => {
    // A malformed body is already reported; only check emptiness for well-formed text.
    if (typeof value.body?.text === 'string' && !value.heading.trim() && !value.body.text.trim()) context.issues.push({ path: join(path, 'body.text'), message: 'Add a heading or some text, or remove this section.' });
  }),
  list: shape<ListSection>({ type: literal('list'), heading, intro, numbered: flag, items: list(paragraph('Enter text for this item or remove it.'), 100, 'items', { count: 1, message: 'Add at least one item, or remove this section.' }) }),
  links: shape<LinksSection>({ type: literal('links'), heading, intro, links: list(shape<LessonLink>({ label: line('Enter the link text readers will see.'), url: link('link'), description: paragraph() }), 60, 'links', { count: 1, message: 'Add at least one link, or remove this section.' }) }),
  images: shape<ImagesSection>({ type: literal('images'), heading, intro, images: list(shape<LessonImage>({ src: link('image'), alt: text({ max: LIMITS.alt, required: 'Describe the image for people who cannot see it.' }), caption: text({ max: LIMITS.caption }) }), 30, 'images', { count: 1, message: 'Add at least one image, or remove this section.' }) }),
  code: shape<CodeSection>({ type: literal('code'), heading, intro, language: text({ max: LIMITS.language }), code: text({ max: LIMITS.text, multiline: true, required: 'Enter the code example.' }) }),
};
const sectionCheck: Check<LessonSection> = (value, path, context) => {
  const type = plain(value) ? value.type : undefined;
  if (typeof type !== 'string' || !Object.hasOwn(sectionChecks, type)) { context.issues.push({ path, message: 'This section type is not supported.' }); return newSection('text'); }
  return sectionChecks[type as SectionType](value, path, context);
};
const lessonCheck = shape<LessonContent>({
  eyebrow: line(), title: line('Enter a page title.'), lead: paragraph(),
  sections: list(sectionCheck, 80, 'sections'),
});

function check<K extends PageKey>(page: K, value: unknown): { result: PageContentMap[K]; issues: ContentIssue[] } {
  const context: Context = { issues: [] };
  const result = (contentPages[page].template === 'research' ? researchCheck : lessonCheck)(value, '', context) as PageContentMap[K];
  if (!context.issues.length && new TextEncoder().encode(JSON.stringify(result)).length > MAX_CONTENT_BYTES) {
    context.issues.push({ path: '', message: 'This page is too large. Shorten it or remove some sections.' });
  }
  return { result, issues: context.issues };
}
/** Every problem, with field paths such as "timeline.entries.2.title", for inline editor messages. */
export function contentIssues(page: PageKey, value: unknown): ContentIssue[] { return check(page, value).issues; }
/** Returns a clean copy containing only known fields, or throws ContentValidationError. */
export function validatePageContent<K extends PageKey>(page: K, value: unknown): PageContentMap[K] {
  const { result, issues } = check(page, value);
  if (issues.length) throw new ContentValidationError(issues);
  return result;
}

/** Order-insensitive comparison (database JSON may reorder object keys). */
export function canonicalContent(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) => plain(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
}
export function sameContent(a: unknown, b: unknown) { return canonicalContent(a) === canonicalContent(b); }

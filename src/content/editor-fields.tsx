import { createContext, forwardRef, useContext, useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import {
  contentLimits, memberDestinations, newSection, sectionTypes, suggestUrl, urlProblem,
  type ContentIssue, type FormatEntry, type LessonImage, type LessonLink, type LessonSection,
  type RichText, type SectionType, type TimelineEntry, type UrlPurpose,
} from './model';

// ---------------------------------------------------------------- Draft paths

export type Path = readonly (string | number)[];
type Container = Record<string | number, unknown>;
export function getIn(value: unknown, path: Path): unknown {
  let current = value;
  for (const key of path) current = current && typeof current === 'object' ? (current as Container)[key] : undefined;
  return current;
}
export function setIn<T>(value: T, path: Path, next: unknown): T {
  if (!path.length) return next as T;
  const [key, ...rest] = path;
  if (Array.isArray(value)) {
    const copy = value.slice();
    copy[key as number] = setIn(copy[key as number], rest, next);
    return copy as T;
  }
  const record = value as Container;
  return { ...record, [key]: setIn(record[key], rest, next) } as T;
}
export const fieldId = (path: Path) => 'content-' + (path.length ? path.join('-') : 'form');

export type EditorState = {
  value: unknown;
  change(path: Path, next: unknown, options?: { removed?: string }): void;
  issues: ReadonlyMap<string, string>;
  /** Show every problem (after a save attempt); otherwise only for fields the editor has left. */
  showAll: boolean;
  announce(message: string): void;
};
export const EditorContext = createContext<EditorState | null>(null);
function useEditor(): EditorState {
  const editor = useContext(EditorContext);
  if (!editor) throw new Error('Content fields must be rendered inside the editor.');
  return editor;
}
function useField<T>(path: Path) {
  const editor = useEditor();
  const [touched, setTouched] = useState(false);
  const message = editor.issues.get(path.join('.'));
  return {
    id: fieldId(path),
    value: getIn(editor.value, path) as T,
    error: message && (touched || editor.showAll) ? message : '',
    set: (next: T) => editor.change(path, next),
    touch: () => setTouched(true),
  };
}
const later = (action: () => void) => requestAnimationFrame(() => requestAnimationFrame(action));
const shorten = (text: string, length = 60) => { const value = text.replace(/\s+/g, ' ').trim(); return value.length > length ? value.slice(0, length - 1) + '…' : value; };

/** Moves focus to a field (opening collapsed groups), falling back to its nearest container. */
export function focusPath(path: string) {
  const parts = path ? path.split('.') : [];
  for (let length = parts.length; length >= 0; length--) {
    const id = fieldId(parts.slice(0, length));
    const target = document.getElementById(id) ?? document.getElementById(id + '-add');
    if (!target) continue;
    for (let group = target.closest('details'); group; group = group.parentElement?.closest('details') ?? null) group.open = true;
    target.scrollIntoView({ block: 'center' });
    target.focus({ preventScroll: true });
    return;
  }
}

// ---------------------------------------------------------------- Fields

type TextFieldProps = { path: Path; label: string; hint?: string; required?: boolean; multiline?: boolean; rows?: number; code?: boolean; maxLength?: number; list?: string };
export function TextField({ path, label, hint, required, multiline, rows = 3, code, maxLength, list }: TextFieldProps) {
  const field = useField<string>(path);
  const describedBy = [hint && `${field.id}-hint`, field.error && `${field.id}-error`].filter(Boolean).join(' ') || undefined;
  const common = {
    id: field.id, value: field.value ?? '', 'aria-describedby': describedBy, 'aria-invalid': field.error ? true : undefined,
    'aria-required': required || undefined, maxLength: maxLength ?? (multiline ? contentLimits.paragraph : contentLimits.line),
    onBlur: field.touch, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => field.set(event.target.value),
  };
  return <div className="content-field">
    <label htmlFor={field.id}>{label}{required && <span className="content-required"> (required)</span>}</label>
    {hint && <p className="content-hint" id={`${field.id}-hint`}>{hint}</p>}
    {multiline
      ? <textarea {...common} rows={rows} className={code ? 'content-code' : undefined} spellCheck={code ? false : undefined} wrap={code ? 'off' : undefined} />
      : <input {...common} type="text" list={list} />}
    {field.error && <p className="content-error" id={`${field.id}-error`}>{field.error}</p>}
  </div>;
}
export function UrlField({ path, label, hint, purpose }: { path: Path; label: string; hint?: string; purpose: UrlPurpose }) {
  const field = useField<string>(path);
  const describedBy = [hint && `${field.id}-hint`, field.error && `${field.id}-error`].filter(Boolean).join(' ') || undefined;
  return <div className="content-field">
    <label htmlFor={field.id}>{label}</label>
    {hint && <p className="content-hint" id={`${field.id}-hint`}>{hint}</p>}
    <input id={field.id} type="text" inputMode="url" autoComplete="off" spellCheck={false} maxLength={contentLimits.url} value={field.value ?? ''}
      aria-describedby={describedBy} aria-invalid={field.error ? true : undefined}
      onChange={event => field.set(event.target.value)}
      onBlur={() => { const next = suggestUrl(field.value ?? '', purpose); if (next !== field.value) field.set(next); field.touch(); }} />
    {field.error && <p className="content-error" id={`${field.id}-error`}>{field.error}</p>}
  </div>;
}
export function CheckField({ path, label, hint }: { path: Path; label: string; hint?: string }) {
  const field = useField<boolean>(path);
  return <div className="content-check">
    <input id={field.id} type="checkbox" checked={!!field.value} onChange={event => field.set(event.target.checked)} aria-describedby={hint ? `${field.id}-hint` : undefined} />
    <label htmlFor={field.id}>{label}</label>
    {hint && <p className="content-hint" id={`${field.id}-hint`}>{hint}</p>}
  </div>;
}
export function SelectField({ path, label, hint, options }: { path: Path; label: string; hint?: string; options: Record<string, string> }) {
  const field = useField<string>(path);
  return <div className="content-field">
    <label htmlFor={field.id}>{label}</label>
    {hint && <p className="content-hint" id={`${field.id}-hint`}>{hint}</p>}
    <select id={field.id} value={field.value} onChange={event => field.set(event.target.value)} aria-describedby={[hint && `${field.id}-hint`, field.error && `${field.id}-error`].filter(Boolean).join(' ') || undefined} aria-invalid={field.error ? true : undefined}>
      {Object.entries(options).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
    </select>
    {field.error && <p className="content-error" id={`${field.id}-error`}>{field.error}</p>}
  </div>;
}

/** A collapsible group matching one visible part of the page. Opens itself when it has problems to fix. */
export function Group({ title, detail, prefixes, open, children }: { title: string; detail?: string; prefixes: string[]; open?: boolean; children: ReactNode }) {
  const editor = useEditor();
  const problems = editor.showAll && [...editor.issues.keys()].some(path => prefixes.some(prefix => path === prefix || path.startsWith(prefix + '.')));
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (problems) setRevealed(true); }, [problems]);
  return <details className="content-group" open={open || revealed || problems || undefined}>
    <summary><span className="content-group-title">{title}{detail && <span className="content-group-detail">{detail}</span>}</span></summary>
    <div className="content-group-body">{children}</div>
  </details>;
}

type RepeaterProps<T> = {
  path: Path; legend: string; hint?: string; noun: string; max: number; compact?: boolean;
  itemLabel(item: T, index: number): string;
  create(): T;
  addControls?(add: (item: T) => void, disabled: boolean): ReactNode;
  children(itemPath: Path, item: T, index: number): ReactNode;
};
/** Repeated entries with keyboard-friendly reordering, removal with Undo, and focus that follows the entry. */
export function Repeater<T>({ path, legend, hint, noun, max, compact, itemLabel, create, addControls, children }: RepeaterProps<T>) {
  const editor = useEditor();
  const items = (getIn(editor.value, path) as T[] | undefined) ?? [];
  const id = fieldId(path);
  const listError = editor.showAll ? editor.issues.get(path.join('.')) : undefined;
  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    editor.change(path, next);
    editor.announce(`Moved “${itemLabel(items[index], index)}” to position ${target + 1} of ${items.length}.`);
    const direction = offset < 0 ? (target === 0 ? 'down' : 'up') : (target === items.length - 1 ? 'up' : 'down');
    later(() => document.querySelector<HTMLElement>(`#${id}-item-${target} [data-move="${direction}"]`)?.focus());
  }
  function remove(index: number) {
    editor.change(path, items.filter((_, item) => item !== index), { removed: `“${itemLabel(items[index], index)}”` });
    later(() => {
      const next = items.length > 1 ? document.getElementById(`${id}-item-${Math.min(index, items.length - 2)}`) : null;
      (next?.querySelector<HTMLElement>(compact ? 'input, textarea' : '.content-item-title') ?? document.getElementById(`${id}-add`))?.focus();
    });
  }
  function add(item: T) {
    editor.change(path, [...items, item]);
    editor.announce(`Added ${noun} ${items.length + 1}.`);
    later(() => document.querySelector<HTMLElement>(`#${id}-item-${items.length} :is(input, textarea, select)`)?.focus());
  }
  const full = items.length >= max;
  return <fieldset className="content-repeater" id={id} tabIndex={-1} aria-describedby={listError ? `${id}-error` : undefined}>
    <legend>{legend}</legend>
    {hint && <p className="content-hint">{hint}</p>}
    {listError && <p className="content-error" id={`${id}-error`}>{listError}</p>}
    {items.length > 0 && <ol className={`content-items${compact ? ' content-items--compact' : ''}`}>{items.map((item, index) => {
      const label = itemLabel(item, index);
      const tools = <div className="content-item-tools">
        <button type="button" className="content-tool" data-move="up" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move “${label}” up`}><ArrowUp size={16} aria-hidden="true" />Up</button>
        <button type="button" className="content-tool" data-move="down" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Move “${label}” down`}><ArrowDown size={16} aria-hidden="true" />Down</button>
        <button type="button" className="content-tool" onClick={() => remove(index)} aria-label={`Remove “${label}”`}><Trash2 size={16} aria-hidden="true" />Remove</button>
      </div>;
      return <li className="content-item" id={`${id}-item-${index}`} key={index}>
        {compact ? <div className="content-compact">{children([...path, index], item, index)}{tools}</div> : <>
          <div className="content-item-head"><span className="content-item-title" tabIndex={-1}>{label}</span>{tools}</div>
          {children([...path, index], item, index)}
        </>}
      </li>;
    })}</ol>}
    {addControls ? addControls(add, full) : <button type="button" className="content-add" id={`${id}-add`} disabled={full} onClick={() => add(create())}><Plus size={16} aria-hidden="true" />Add {noun}</button>}
    {full && <p className="content-hint">This list has reached its limit of {max}.</p>}
  </fieldset>;
}
export function StringList({ path, legend, hint, noun, max }: { path: Path; legend: string; hint?: string; noun: string; max: number }) {
  const name = noun[0].toUpperCase() + noun.slice(1);
  return <Repeater<string> path={path} legend={legend} hint={hint} noun={noun} max={max} compact create={() => ''}
    itemLabel={(item, index) => item.trim() ? shorten(item) : `${name} ${index + 1}`}>
    {(itemPath, _item, index) => <TextField path={itemPath} label={`${name} ${index + 1}`} />}
  </Repeater>;
}

/** Paragraph text plus links attached to exact phrases, so editors never write markup. */
export function RichTextField({ path, label, hint, rows = 5, required }: { path: Path; label: string; hint?: string; rows?: number; required?: boolean }) {
  const editor = useEditor();
  const value = (getIn(editor.value, path) as RichText | undefined) ?? { text: '', links: [] };
  const textId = fieldId([...path, 'text']);
  function addLink() {
    const area = document.getElementById(textId) as HTMLTextAreaElement | null;
    const selected = area ? area.value.slice(area.selectionStart, area.selectionEnd).replace(/\s+/g, ' ').trim().slice(0, contentLimits.line) : '';
    editor.change([...path, 'links'], [...value.links, { phrase: selected, url: '' }]);
    editor.announce(selected ? `Added a link for “${selected}”. Enter where it should go.` : 'Added a link. Enter the words to link and where the link should go.');
    later(() => document.getElementById(fieldId([...path, 'links', value.links.length, selected ? 'url' : 'phrase']))?.focus());
  }
  function removeLink(index: number) {
    editor.change([...path, 'links'], value.links.filter((_, item) => item !== index), { removed: `the link on “${shorten(value.links[index].phrase || 'untitled', 40)}”` });
    later(() => document.getElementById(`${textId}`)?.focus());
  }
  return <div className="content-rich">
    <TextField path={[...path, 'text']} label={label} required={required} multiline rows={rows} maxLength={contentLimits.text}
      hint={hint ?? 'Leave a blank line between paragraphs. To add a link, select words in the text, then choose Add a link.'} />
    {value.links.length > 0 && <div className="content-links" role="group" aria-label={`Links in ${label.toLowerCase()}`}>
      {value.links.map((_link, index) => <div className="content-link" key={index}>
        <TextField path={[...path, 'links', index, 'phrase']} label={`Link ${index + 1}: words to link`} hint="Copy the exact words from the text above." />
        <UrlField path={[...path, 'links', index, 'url']} label={`Link ${index + 1}: destination`} purpose="link" hint="A site page such as faq.html, a full https:// link, or an email address." />
        <button type="button" className="content-tool" onClick={() => removeLink(index)}><Trash2 size={16} aria-hidden="true" />Remove link {index + 1}</button>
      </div>)}
    </div>}
    <button type="button" className="content-add content-add--small" onClick={addLink} disabled={value.links.length >= 30}><Plus size={16} aria-hidden="true" />Add a link</button>
  </div>;
}

export const siteImages: { group: string; images: { src: string; name: string; alt: string }[] }[] = [
  { group: 'Example posters', images: [
    { src: '/images/Poster/Luke Poster.jpeg', name: 'Poster: Luke Wang, fungal enzyme inhibitors', alt: 'Student research poster about fungal enzyme inhibitors' },
    { src: '/images/Poster/Reya Poster.png', name: 'Poster: Reya Satam, circadian clock genes and brain injury', alt: 'Student research poster about circadian clock genes and traumatic brain injury' },
  ] },
  { group: 'Students doing research', images: [
    { src: '/images/Studying/Screenshot 2026-09-10 at 6.02.51 PM.png', name: 'Student working at a laptop', alt: 'Student working on research at a laptop' },
    { src: '/images/Studying/Screenshot 2026-09-10 at 6.03.04 PM.png', name: 'Student working at a laptop (second view)', alt: 'Student working on research at a laptop' },
    { src: '/images/Studying/Andrew Chen Studying - 1.jpeg', name: 'Student studying at a desk', alt: 'Student studying at a desk' },
    { src: '/images/Planning/Screenshot 2026-09-10 at 6.03.22 PM.png', name: 'Student reading a paper in a lab', alt: 'Student reading a research paper in a laboratory' },
  ] },
  { group: 'Data analysis examples', images: [
    { src: '/images/Data Analysis/R Studio.png', name: 'RStudio data table', alt: 'Table of gene correlation results in RStudio' },
    { src: '/images/Data Analysis/fig_km_ccl5_median_5yr.png', name: 'Survival curve figure', alt: 'Kaplan–Meier survival curves comparing low and high CCL5 expression' },
    { src: '/images/Data Analysis/fig_ucec_rrvgo_treemap_pos.png', name: 'Gene ontology treemap (positive)', alt: 'Treemap of enriched gene ontology terms' },
    { src: '/images/Data Analysis/fig_ucec_rrvgo_treemap_neg.png', name: 'Gene ontology treemap (negative)', alt: 'Treemap of gene ontology terms for negatively associated genes' },
    { src: '/images/Data Analysis/Screenshot 2026-09-10 at 6.12.44 PM.png', name: 'Mutation frequency chart', alt: 'Bar chart of mutation frequency across genes' },
    { src: '/images/Data Analysis/Screenshot 2026-09-10 at 6.13.34 PM.png', name: 'Protein structure', alt: 'Three-dimensional protein structure with drug-target details' },
  ] },
  { group: 'Genetics and Biotechnology Club', images: [
    { src: '/images/Genetics Club Photos/EGBC 2.jpg', name: 'Club members at the Broad Institute', alt: 'Students from the Genetics and Biotechnology Club at the Broad Institute' },
    { src: '/images/Genetics Club Photos/GeneticsClubBoston_3.jpg', name: 'Students at a science exhibit', alt: 'Students exploring science exhibits' },
  ] },
];
const allSiteImages = siteImages.flatMap(group => group.images);
export function ImageFields({ srcPath, altPath, captionPath, optional }: { srcPath: Path; altPath: Path; captionPath?: Path; optional?: boolean }) {
  const editor = useEditor();
  const src = (getIn(editor.value, srcPath) as string | undefined) ?? '';
  const alt = (getIn(editor.value, altPath) as string | undefined) ?? '';
  const known = allSiteImages.find(image => image.src === src);
  const pickerId = fieldId([...srcPath, 'picker']);
  function choose(value: string) {
    if (value === 'other') { if (known) editor.change(srcPath, ''); later(() => document.getElementById(fieldId(srcPath))?.focus()); return; }
    if (!value) { editor.change(srcPath, ''); return; }
    const image = allSiteImages.find(entry => entry.src === value);
    if (!image) return;
    editor.change(srcPath, image.src);
    if (!alt.trim() || allSiteImages.some(entry => entry.alt === alt)) editor.change(altPath, image.alt);
  }
  return <div className="content-image">
    <div className="content-field">
      <label htmlFor={pickerId}>Image</label>
      <select id={pickerId} value={known ? src : src ? 'other' : ''} onChange={event => choose(event.target.value)}>
        <option value="">{optional ? 'No image' : 'Choose an image…'}</option>
        {siteImages.map(group => <optgroup key={group.group} label={group.group}>{group.images.map(image => <option key={image.src} value={image.src}>{image.name}</option>)}</optgroup>)}
        <option value="other">Another image (paste a link)</option>
      </select>
    </div>
    <UrlField path={srcPath} label="Image link" purpose="image" hint="Filled in when you choose a site image above, or paste a full https:// image link." />
    {src && !urlProblem(src, 'image') && <img className="content-thumb" src={src} alt="" loading="lazy" />}
    <TextField path={altPath} label="Image description (alt text)" required={!optional || !!src} maxLength={contentLimits.alt} hint="Describe what the image shows for people who use screen readers." />
    {captionPath && <TextField path={captionPath} label="Caption (optional)" maxLength={contentLimits.caption} />}
  </div>;
}

// ---------------------------------------------------------------- Page forms

const emptyRich = (): RichText => ({ text: '', links: [] });
export function ResearchForm() {
  const editor = useEditor();
  const count = (path: Path, one: string, many = one + 's') => { const length = ((getIn(editor.value, path) as unknown[] | undefined) ?? []).length; return `${length} ${length === 1 ? one : many}`; };
  return <>
    <Group title="Page heading" prefixes={['title', 'lead', 'registrationUrl']} open>
      <TextField path={['title']} label="Page title" required />
      <TextField path={['lead']} label="Introduction" multiline />
      <UrlField path={['registrationUrl']} label="Student registration form link" purpose="form" hint="Every registration button on this page opens this form. Visitors are asked to sign in first." />
    </Group>
    <Group title="Research overview" detail={count(['overview', 'areas'], 'research area')} prefixes={['overview']}>
      <ImageFields srcPath={['overview', 'imageSrc']} altPath={['overview', 'imageAlt']} optional />
      <TextField path={['overview', 'heading']} label="Heading" />
      <RichTextField path={['overview', 'body']} label="Text" />
      <TextField path={['overview', 'calloutTitle']} label="Highlighted note: bold opening words" hint="Optional. Leave both note fields empty to hide the note." />
      <TextField path={['overview', 'calloutText']} label="Highlighted note: text" multiline />
      <TextField path={['overview', 'areasHeading']} label="Research areas heading" />
      <StringList path={['overview', 'areas']} legend="Research areas" noun="research area" max={40} />
      <RichTextField path={['overview', 'areasNote']} label="Note below the research areas" rows={3} />
    </Group>
    <Group title="Timeline" detail={count(['timeline', 'entries'], 'entry', 'entries')} prefixes={['timeline']}>
      <TextField path={['timeline', 'heading']} label="Heading" />
      <TextField path={['timeline', 'intro']} label="Introduction" multiline rows={2} />
      <Repeater<TimelineEntry> path={['timeline', 'entries']} legend="Timeline entries" noun="timeline entry" max={40}
        hint="Entries fill the left column first, then the right column, in this order."
        create={() => ({ date: '', title: '', description: emptyRich() })}
        itemLabel={(entry, index) => entry.title.trim() || `Timeline entry ${index + 1}`}>
        {itemPath => <>
          <TextField path={[...itemPath, 'date']} label="Date" hint="Written the way readers should see it, for example Friday, December 18, 2026." />
          <TextField path={[...itemPath, 'title']} label="Title" required />
          <RichTextField path={[...itemPath, 'description']} label="Description" rows={3} />
        </>}
      </Repeater>
    </Group>
    <Group title="Presentation formats" detail={count(['formats', 'entries'], 'format')} prefixes={['formats']}>
      <TextField path={['formats', 'heading']} label="Heading" />
      <TextField path={['formats', 'intro']} label="Introduction" multiline rows={2} />
      <Repeater<FormatEntry> path={['formats', 'entries']} legend="Formats" noun="format" max={12}
        create={() => ({ title: '', description: '', badge: '' })}
        itemLabel={(entry, index) => entry.title.trim() || `Format ${index + 1}`}>
        {itemPath => <>
          <TextField path={[...itemPath, 'title']} label="Title" required />
          <TextField path={[...itemPath, 'description']} label="Description" multiline />
          <TextField path={[...itemPath, 'badge']} label="Label" hint="A short tag shown under the description, such as In-person. Optional." />
        </>}
      </Repeater>
    </Group>
    <Group title="Research support" detail={count(['support', 'items'], 'checklist item')} prefixes={['support']}>
      <TextField path={['support', 'heading']} label="Heading" />
      <RichTextField path={['support', 'body']} label="Text" rows={7} />
      <TextField path={['support', 'buttonLabel']} label="Registration button text" hint="Opens the registration form after sign-in. Leave empty to hide the button." />
      <TextField path={['support', 'listHeading']} label="Checklist heading" />
      <StringList path={['support', 'items']} legend="Checklist items" noun="checklist item" max={40} />
    </Group>
    <Group title="Register as a student" prefixes={['registration']}>
      <TextField path={['registration', 'heading']} label="Heading" />
      <TextField path={['registration', 'text']} label="Text" multiline />
      <TextField path={['registration', 'buttonLabel']} label="Registration button text" hint="Opens the registration form after sign-in. Leave empty to hide the button." />
      <TextField path={['registration', 'secondaryLabel']} label="Second button text" hint="Leave empty to hide the button." />
      <SelectField path={['registration', 'secondaryPage']} label="Second button opens" options={memberDestinations}
        hint="A member page. Accepted members go straight there; everyone else is asked to sign in or wait for approval." />
    </Group>
  </>;
}

function sectionLabel(section: LessonSection, index: number) {
  const name = sectionTypes[section.type].label;
  const first = section.heading.trim() || (section.type === 'text' ? shorten(section.body.text, 48) : '');
  return first ? `${name}: ${first}` : `${name} section ${index + 1}`;
}
function SectionFields({ path, section }: { path: Path; section: LessonSection }) {
  const heading = <TextField path={[...path, 'heading']} label="Heading" hint="Optional. A heading starts a new part of the page; sections without one continue the part above." />;
  const intro = <TextField path={[...path, 'intro']} label="Introduction" multiline rows={2} />;
  switch (section.type) {
    case 'text': return <>{heading}<RichTextField path={[...path, 'body']} label="Text" rows={6} /><CheckField path={[...path, 'highlight']} label="Show as a highlighted note" /></>;
    case 'list': return <>{heading}{intro}<CheckField path={[...path, 'numbered']} label="Number the items" hint="Use numbers for steps that happen in order." /><StringList path={[...path, 'items']} legend="Items" noun="item" max={100} /></>;
    case 'links': return <>{heading}{intro}
      <Repeater<LessonLink> path={[...path, 'links']} legend="Links" noun="link" max={60} create={() => ({ label: '', url: '', description: '' })} itemLabel={(entry, index) => entry.label.trim() || `Link ${index + 1}`}>
        {itemPath => <>
          <TextField path={[...itemPath, 'label']} label="Link text" required />
          <UrlField path={[...itemPath, 'url']} label="Link destination" purpose="link" hint="A site page such as faq.html, a full https:// link, or an email address." />
          <TextField path={[...itemPath, 'description']} label="Short description (optional)" multiline rows={2} />
        </>}
      </Repeater>
    </>;
    case 'images': return <>{heading}{intro}
      <Repeater<LessonImage> path={[...path, 'images']} legend="Images" noun="image" max={30} create={() => ({ src: '', alt: '', caption: '' })} itemLabel={(entry, index) => entry.caption.trim() || allSiteImages.find(image => image.src === entry.src)?.name || `Image ${index + 1}`}>
        {itemPath => <ImageFields srcPath={[...itemPath, 'src']} altPath={[...itemPath, 'alt']} captionPath={[...itemPath, 'caption']} />}
      </Repeater>
    </>;
    case 'code': return <>{heading}{intro}
      <TextField path={[...path, 'language']} label="Language label (optional)" list="content-code-languages" maxLength={contentLimits.language} hint="Shown above the code, for example Python or R." />
      <TextField path={[...path, 'code']} label="Code" required multiline code rows={10} maxLength={contentLimits.text} hint="Shown exactly as typed. Readers can copy it; it never runs on the website." />
    </>;
  }
}
export function LessonForm() {
  const editor = useEditor();
  const sections = (getIn(editor.value, ['sections']) as LessonSection[] | undefined) ?? [];
  return <>
    <Group title="Page heading" prefixes={['eyebrow', 'title', 'lead']} open>
      <TextField path={['eyebrow']} label="Small label above the title" hint="Optional, for example Coming soon or For EBS participants." />
      <TextField path={['title']} label="Page title" required />
      <TextField path={['lead']} label="Introduction" multiline />
    </Group>
    <Group title="Page sections" detail={`${sections.length} section${sections.length === 1 ? '' : 's'}`} prefixes={['sections']} open>
      <Repeater<LessonSection> path={['sections']} legend="Sections, in page order" noun="section" max={80}
        hint={sections.length ? undefined : 'This page has no sections yet. Add text, lists, links, images or code below.'}
        create={() => newSection('text')} itemLabel={sectionLabel}
        addControls={(add, disabled) => <div className="content-section-types" role="group" aria-label="Add a section" id={`${fieldId(['sections'])}-add`} tabIndex={-1}>
          {(Object.keys(sectionTypes) as SectionType[]).map(type => <button type="button" key={type} disabled={disabled} onClick={() => add(newSection(type))}>
            <span className="content-section-type"><Plus size={16} aria-hidden="true" />Add {sectionTypes[type].label.toLowerCase()}</span>
            <span className="content-hint">{sectionTypes[type].description}</span>
          </button>)}
        </div>}>
        {(itemPath, section) => <SectionFields path={itemPath} section={section} />}
      </Repeater>
      <datalist id="content-code-languages">{['Python', 'R', 'Shell', 'SQL', 'JavaScript'].map(language => <option key={language} value={language} />)}</datalist>
    </Group>
  </>;
}

// ---------------------------------------------------------------- Error summary

function locate(template: 'research' | 'lesson', path: string) {
  const [first, second, third] = path.split('.');
  if (template === 'lesson') return first === 'sections' && second !== undefined ? `Section ${Number(second) + 1}` : 'Page heading';
  const group = ({ overview: 'Research overview', timeline: 'Timeline', formats: 'Presentation formats', support: 'Research support', registration: 'Register as a student' } as Record<string, string>)[first] ?? 'Page heading';
  return second === 'entries' && third !== undefined ? `${group}, entry ${Number(third) + 1}` : group;
}
export const ErrorSummary = forwardRef<HTMLDivElement, { template: 'research' | 'lesson'; issues: ContentIssue[] }>(function ErrorSummary({ template, issues }, ref) {
  return <div className="content-summary" ref={ref} tabIndex={-1} role="alert" aria-labelledby="content-summary-title">
    <h3 id="content-summary-title">{issues.length === 1 ? 'Fix this problem before saving' : `Fix these ${issues.length} problems before saving`}</h3>
    <ul>{issues.slice(0, 20).map((issue, index) => <li key={`${issue.path}-${index}`}>
      <button type="button" onClick={() => focusPath(issue.path)}><strong>{locate(template, issue.path)}:</strong> {issue.message}</button>
    </li>)}</ul>
  </div>;
});

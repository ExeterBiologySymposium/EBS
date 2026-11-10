import { useContext, useEffect, useState, type ReactNode } from 'react';
import { PenLine } from 'lucide-react';
import { AuthContext, LearningLink, RegistrationLink } from '../auth';
import { CodeBlock } from '../page-controls';
import { readPublishedContent } from './api';
import {
  contentPages, isExternalUrl, paragraphs, placeLinks, urlProblem,
  type LessonContent, type LessonSection, type LinkPlacement, type PageContentMap, type PageKey, type ResearchContent, type RichText,
} from './model';

// Reader components. Layouts and heading levels are fixed here; editors only supply text and links.
export function SiteLink({ href, children }: { href: string; children: ReactNode }) {
  // The server only stores safe links; unsaved previews may not be valid yet, so render those as text.
  if (urlProblem(href, 'link')) return <>{children}</>;
  return isExternalUrl(href)
    ? <a href={href} target="_blank" rel="noopener noreferrer">{children}<span className="sr-only"> (opens in a new tab)</span></a>
    : <a href={href}>{children}</a>;
}
function Lines({ text }: { text: string }) {
  return <>{text.split('\n').flatMap((part, index) => index ? [<br key={index} />, part] : [part])}</>;
}
export function RichTextView({ value }: { value: RichText }) {
  const parts = paragraphs(value.text);
  const placements = placeLinks(parts, value.links).filter((range): range is LinkPlacement => !!range);
  return <>{parts.map((part, index) => {
    const nodes: ReactNode[] = [];
    let at = 0;
    for (const range of placements.filter(range => range.paragraph === index).sort((a, b) => a.start - b.start)) {
      if (range.start > at) nodes.push(<Lines key={`t${at}`} text={part.slice(at, range.start)} />);
      nodes.push(<SiteLink key={`l${range.start}`} href={range.url}>{part.slice(range.start, range.end)}</SiteLink>);
      at = range.end;
    }
    if (at < part.length) nodes.push(<Lines key={`t${at}`} text={part.slice(at)} />);
    return <p key={index}>{nodes}</p>;
  })}</>;
}
function SectionHeader({ heading, intro }: { heading: string; intro: string }) {
  if (!heading) return intro ? <p className="lesson-intro"><Lines text={intro} /></p> : null;
  return <div className="section-header"><h2>{heading}</h2>{intro && <p><Lines text={intro} /></p>}</div>;
}
function Checklist({ items }: { items: string[] }) {
  return <div className="checklist">{items.map((item, index) => <div className="checklist__item" key={index}><span>{item}</span></div>)}</div>;
}

export function ResearchView({ content }: { content: ResearchContent }) {
  const { overview, timeline, formats, support, registration } = content;
  const half = Math.ceil(timeline.entries.length / 2);
  const columns = [timeline.entries.slice(0, half), timeline.entries.slice(half)].filter(column => column.length);
  return <>
    <section className="page-heading"><div className="shell"><h1>{content.title}</h1>{content.lead && <p className="lead"><Lines text={content.lead} /></p>}</div></section>
    <section className="section"><div className="shell">
      {overview.imageSrc && !urlProblem(overview.imageSrc, 'image') && <figure className="context-media context-media--research"><img src={overview.imageSrc} alt={overview.imageAlt} loading="lazy" /></figure>}
      <div className="grid columns-2">
        <div>
          {overview.heading && <h2>{overview.heading}</h2>}
          <RichTextView value={overview.body} />
          {(overview.calloutTitle || overview.calloutText) && <div className="callout"><p>
            {overview.calloutTitle && <strong>{overview.calloutTitle}</strong>}
            {overview.calloutTitle && overview.calloutText ? ' ' + overview.calloutText : overview.calloutText}
          </p></div>}
        </div>
        <div>
          {overview.areasHeading && <h3>{overview.areasHeading}</h3>}
          {overview.areas.length > 0 && <Checklist items={overview.areas} />}
          {overview.areasNote.text.trim() && <div className="callout"><RichTextView value={overview.areasNote} /></div>}
        </div>
      </div>
    </div></section>
    {(timeline.heading || timeline.intro || columns.length > 0) && <section className="section"><div className="shell">
      {(timeline.heading || timeline.intro) && <div className="section-header">{timeline.heading && <h2>{timeline.heading}</h2>}{timeline.intro && <p><Lines text={timeline.intro} /></p>}</div>}
      {columns.length > 0 && <div className="grid columns-2">{columns.map((column, index) => <div className="timeline" key={index}>
        {column.map((entry, item) => <div className="timeline__item" key={item}>
          <div className="timeline__date">{entry.date}</div>
          <div className="timeline__title">{entry.title}</div>
          {/* One paragraph stays a direct grid child, matching the original layout. */}
          {paragraphs(entry.description.text).length > 1 ? <div className="timeline__description"><RichTextView value={entry.description} /></div> : <RichTextView value={entry.description} />}
        </div>)}
      </div>)}</div>}
    </div></section>}
    {(formats.heading || formats.intro || formats.entries.length > 0) && <section className="section"><div className="shell">
      {(formats.heading || formats.intro) && <div className="section-header">{formats.heading && <h2>{formats.heading}</h2>}{formats.intro && <p><Lines text={formats.intro} /></p>}</div>}
      {formats.entries.length > 0 && <div className="grid columns-2">{formats.entries.map((entry, index) => <div className="text-block" key={index}>
        <h3>{entry.title}</h3>
        {entry.description && <p><Lines text={entry.description} /></p>}
        {entry.badge && <span className="badge badge--primary">{entry.badge}</span>}
      </div>)}</div>}
    </div></section>}
    <section className="section"><div className="shell"><div className="grid columns-2">
      <div>
        {support.heading && <h2>{support.heading}</h2>}
        <RichTextView value={support.body} />
        {support.buttonLabel && !urlProblem(content.registrationUrl, 'form') && <RegistrationLink className="button primary" href={content.registrationUrl}>{support.buttonLabel}</RegistrationLink>}
      </div>
      <div>
        {(support.listHeading || support.items.length > 0) && <div className="text-block">
          {support.listHeading && <h3>{support.listHeading}</h3>}
          {support.items.length > 0 && <Checklist items={support.items} />}
        </div>}
      </div>
    </div></div></section>
    {(registration.heading || registration.text || registration.buttonLabel || registration.secondaryLabel) && <section className="section"><div className="shell"><div className="next-step">
      {registration.heading && <h2>{registration.heading}</h2>}
      {registration.text && <p><Lines text={registration.text} /></p>}
      {(registration.buttonLabel || registration.secondaryLabel) && <div className="actions">
        {registration.buttonLabel && !urlProblem(content.registrationUrl, 'form') && <RegistrationLink className="button primary" href={content.registrationUrl}>{registration.buttonLabel}</RegistrationLink>}
        {registration.secondaryLabel && <LearningLink className="button secondary" href={registration.secondaryPage}>{registration.secondaryLabel}</LearningLink>}
      </div>}
    </div></div></section>}
  </>;
}

function LessonBlock({ section }: { section: LessonSection }) {
  switch (section.type) {
    case 'text': return <div className="lesson-block lesson-text">
      {section.heading && <h2>{section.heading}</h2>}
      {section.body.text.trim() && (section.highlight ? <div className="callout"><RichTextView value={section.body} /></div> : <RichTextView value={section.body} />)}
    </div>;
    case 'list': {
      const List = section.numbered ? 'ol' : 'ul';
      return <div className="lesson-block"><SectionHeader heading={section.heading} intro={section.intro} />
        <List className="lesson-list">{section.items.map((item, index) => <li key={index}><Lines text={item} /></li>)}</List>
      </div>;
    }
    case 'links': return <div className="lesson-block"><SectionHeader heading={section.heading} intro={section.intro} />
      <ul className="lesson-links">{section.links.map((entry, index) => <li key={index}>
        <SiteLink href={entry.url}>{entry.label}</SiteLink>
        {entry.description && <p><Lines text={entry.description} /></p>}
      </li>)}</ul>
    </div>;
    case 'images': return <div className="lesson-block"><SectionHeader heading={section.heading} intro={section.intro} />
      <div className={`poster-pair${section.images.length === 1 ? ' poster-pair--single' : ''}`}>{section.images.map((image, index) => <figure className="context-media context-media--poster" key={index}>
        {!urlProblem(image.src, 'image') && <img src={image.src} alt={image.alt} loading="lazy" />}
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>)}</div>
    </div>;
    case 'code': return <div className="lesson-block"><SectionHeader heading={section.heading} intro={section.intro} />
      <CodeBlock text={section.code} label={section.language.trim() || undefined} />
    </div>;
  }
}
export function LessonView({ content }: { content: LessonContent }) {
  // A section with a heading starts a new page section; untitled sections continue the previous one.
  const groups: LessonSection[][] = [];
  for (const section of content.sections) {
    if (!groups.length || section.heading.trim()) groups.push([section]);
    else groups[groups.length - 1].push(section);
  }
  return <>
    <section className="page-heading"><div className="shell">
      {content.eyebrow && <p className="eyebrow">{content.eyebrow}</p>}
      <h1>{content.title}</h1>
      {content.lead && <p className="lead"><Lines text={content.lead} /></p>}
    </div></section>
    {groups.map((group, index) => <section className="section" key={index}><div className="shell">
      {group.map((section, item) => <LessonBlock key={item} section={section} />)}
    </div></section>)}
  </>;
}
export function PageView<K extends PageKey>({ page, content }: { page: K; content: PageContentMap[K] }) {
  return contentPages[page].template === 'research' ? <ResearchView content={content as ResearchContent} /> : <LessonView content={content as LessonContent} />;
}

// Published content survives remounts (for example, an access re-check on focus) within this tab.
const latest = new Map<PageKey, { content: PageContentMap[PageKey]; at: number }>();
const REFRESH_AFTER = 15000;

export function PublishedPage<K extends PageKey>({ page, initial }: { page: K; initial?: PageContentMap[K] }) {
  const { access, teamAccess } = useContext(AuthContext);
  const allowed = contentPages[page].audience === 'public' || access === 'accepted';
  const [content, setContent] = useState<PageContentMap[K] | null>(() => (latest.get(page)?.content as PageContentMap[K] | undefined) ?? initial ?? null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    readPublishedContent(page, controller.signal).then(value => {
      latest.set(page, { content: value, at: Date.now() });
      setContent(value); setFailed(false);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [page, allowed, attempt]);
  useEffect(() => {
    // Pick up a new publication when the reader returns to an open tab.
    const refresh = () => { if (document.visibilityState === 'visible' && Date.now() - (latest.get(page)?.at ?? 0) > REFRESH_AFTER) setAttempt(value => value + 1); };
    window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
    return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [page]);
  return <div className={`page-layout layout-${page}`}>
    {teamAccess === 'allowed' && <p className="shell content-edit-link"><a href={`admin.html?view=content&page=${page}`}><PenLine size={16} aria-hidden="true" />Edit this page</a></p>}
    {failed && <div className="shell content-notice" role={content ? 'status' : 'alert'}>
      <p>{content ? 'The latest version of this page could not be loaded, so you may be seeing older content.' : 'This page could not be loaded right now.'}</p>
      <button className="button secondary" type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>Try again</button>
    </div>}
    {content ? <PageView page={page} content={content} /> : !failed && <section className="page-heading"><div className="shell"><p role="status">Loading page content…</p></div></section>}
  </div>;
}

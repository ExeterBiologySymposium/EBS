import type { ReactNode } from 'react';

export type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalPage({ title, lead, sections }: {
  title: string;
  lead: string;
  sections: LegalSection[];
}) {
  return <div className="page-layout layout-legal">
    <section className="page-heading"><div className="shell">
      <p className="eyebrow">Exeter Biology Symposium</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      <p className="small">Last updated: <time dateTime="2026-10-31">October 31, 2026</time></p>
    </div></section>
    <div className="shell article-layout">
      <nav className="contents legal-contents" aria-label={`${title} contents`}>
        <p className="eyebrow">On this page</p>
        <div className="contents-nav">{sections.map((section, index) =>
          <a key={section.id} href={`#${section.id}`}>{index + 1}. {section.title}</a>
        )}</div>
      </nav>
      <article className="article-body legal-copy" aria-label={title}>
        {sections.map((section, index) => <section className="legal-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`}>{index + 1}. {section.title}</h2>
          {section.content}
        </section>)}
      </article>
    </div>
  </div>;
}

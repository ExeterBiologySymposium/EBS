import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { CodeBlock } from '../page-controls';
import { datasets, fields } from '../learning/datasets/catalog';
import { toolChoices, toolGuides, toolLabels } from '../learning/datasets/tools';
import type { Dataset, FieldKey, GuideToolKey, Level, Link, ToolGuide, ToolKey } from '../learning/datasets/types';

// Accepted-member page (see access-policy.ts). It and src/learning/ ship only in /protected-assets/.

const levels: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const toolOrder: ToolKey[] = ['esquisse', 'galaxy', 'idep', 'biblioshiny', 'code'];
const fieldNames = Object.fromEntries(fields.map(field => [field.key, field.name])) as Record<FieldKey, string>;
const searchText = new Map(datasets.map(dataset => [dataset.id, [
  dataset.name, dataset.provider, dataset.summary, dataset.question, dataset.format, dataset.access,
  fieldNames[dataset.field], dataset.level, ...dataset.tools.map(tool => toolLabels[tool]),
].join(' ').toLowerCase()]));

const toolCounts = Object.fromEntries(toolGuides.map(guide => [guide.key, datasets.filter(dataset => dataset.tools.includes(guide.key)).length])) as Record<GuideToolKey, number>;

type Filters = { query: string; field: FieldKey | 'all'; tool: ToolKey | 'all'; level: Level | 'all' };
const noFilters: Filters = { query: '', field: 'all', tool: 'all', level: 'all' };

function matches(dataset: Dataset, filters: Filters, terms: string[], anyField = false) {
  return (anyField || filters.field === 'all' || dataset.field === filters.field)
    && (filters.tool === 'all' || dataset.tools.includes(filters.tool))
    && (filters.level === 'all' || dataset.level === filters.level)
    && terms.every(term => (searchText.get(dataset.id) ?? '').includes(term));
}
function plural(count: number, noun: string) { return `${count} ${noun}${count === 1 ? '' : 's'}`; }
function describe(count: number, groups: number, filters: Filters) {
  const where = filters.field !== 'all' ? ` in ${fieldNames[filters.field]}` : count ? ` across ${plural(groups, 'field')}` : '';
  const tool = filters.tool === 'all' ? '' : ` for ${toolLabels[filters.tool]}`;
  const level = filters.level === 'all' ? '' : `, ${filters.level.toLowerCase()} level`;
  const query = filters.query.trim() ? `, matching “${filters.query.trim()}”` : '';
  return `Showing ${plural(count, 'dataset')}${where}${tool}${level}${query}.`;
}

/** Site pages stay in the tab; full https:// links open a new tab and say so. */
function OutLink({ link, className, children }: { link: Link; className?: string; children?: ReactNode }) {
  const external = link.url.startsWith('https://');
  return <a className={className} href={link.url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
    {children ?? link.label}{external && <span className="sr-only"> (opens in a new tab)</span>}
  </a>;
}

function Steps({ items }: { items: { title: string; body: ReactNode }[] }) {
  return <ol className="steps library-steps">{items.map((item, index) => <li className="step" key={item.title}>
    <span className="step__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
    <div className="step__body"><p className="step__title">{item.title}</p>{item.body}</div>
  </li>)}</ol>;
}

function ToolGuideSection({ guide, count, onShow }: { guide: ToolGuide; count: number; onShow(): void }) {
  const [open, ...more] = guide.links;
  return <section className="section tool-guide" id={guide.key} aria-labelledby={`${guide.key}-title`}><div className="shell">
    <div className="tool-guide__intro">
      <p className="eyebrow">Tool guide</p>
      <h2 id={`${guide.key}-title`}>{guide.name}</h2>
      <p className="tool-guide__tagline">{guide.tagline}</p>
      <p>{guide.summary}</p>
      <div className="actions">
        <OutLink className="button" link={open}><span>{open.label}</span><ArrowDownRight size={18} aria-hidden="true" /></OutLink>
        <button className="button secondary" type="button" onClick={onShow}><span>Show {plural(count, 'dataset')} for {guide.name}</span><ArrowDownRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
    <dl className="tool-facts">
      <div><dt>Best for</dt><dd>{guide.bestFor}</dd></div>
      <div><dt>Data it accepts</dt><dd>{guide.accepts}</dd></div>
      <div><dt>Runs in</dt><dd>{guide.runsIn}</dd></div>
      <div><dt>Account</dt><dd>{guide.account}</dd></div>
    </dl>
    <div className="tool-guide__body">
      <div>
        <h3>Step by step</h3>
        <Steps items={guide.steps.map(step => ({ title: step.title, body: <>
          <p>{step.detail}</p>
          {step.code && <CodeBlock text={step.code.text} label={step.code.language} />}
        </> }))} />
      </div>
      <div>
        <h3>Tips</h3>
        <ul className="lesson-list">{guide.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
        <h3>Learn more</h3>
        <ul className="lesson-links">{more.map(link => <li key={link.url}><OutLink link={link} /></li>)}</ul>
      </div>
    </div>
  </div></section>;
}

function ToolTag({ tool }: { tool: ToolKey }) {
  // Tool tags jump to the matching guide; R or Python points to the Coding lessons.
  return <li><a className="dataset-tag dataset-tag--tool" href={tool === 'code' ? 'datascience.html' : `#${tool}`}>{toolLabels[tool]}</a></li>;
}

function DatasetCard({ dataset }: { dataset: Dataset }) {
  const title = `dataset-${dataset.id}-title`;
  return <article className="dataset-card" id={`dataset-${dataset.id}`} aria-labelledby={title}>
    <p className="dataset-card__provider">{dataset.provider}</p>
    <h4 id={title}>{dataset.name}</h4>
    <ul className="dataset-tags" aria-label="Level and suggested tools">
      <li><span className={`dataset-tag dataset-tag--${dataset.level.toLowerCase()}`}>{dataset.level}</span></li>
      {dataset.tools.map(tool => <ToolTag key={tool} tool={tool} />)}
    </ul>
    <p>{dataset.summary}</p>
    <p className="dataset-question"><strong>Try asking:</strong> {dataset.question}</p>
    <dl className="dataset-facts">
      <div><dt>Format</dt><dd>{dataset.format}</dd></div>
      <div><dt>Access</dt><dd>{dataset.access}</dd></div>
    </dl>
    {dataset.caution && <p className="dataset-caution"><strong>Keep in mind:</strong> {dataset.caution}</p>}
    {/* The footer sits at the bottom, so actions line up across cards in a row. */}
    <div className="dataset-card__footer">
      <details className="dataset-howto">
        <summary>How to get and use it</summary>
        <ol className="lesson-list">{dataset.steps.map(step => <li key={step}>{step}</li>)}</ol>
        {dataset.code && <CodeBlock text={dataset.code.text} label={dataset.code.language} />}
      </details>
      <div className="dataset-actions">
        <OutLink className="button" link={{ label: 'Open dataset', url: dataset.url }}>
          <span>Open dataset<span className="sr-only">: {dataset.name}</span></span><ArrowDownRight size={18} aria-hidden="true" />
        </OutLink>
        {dataset.links?.map(link => <OutLink key={link.url} className="dataset-link" link={link} />)}
      </div>
    </div>
  </article>;
}

export default function DatasetLibraryPage() {
  const [filters, setFilters] = useState<Filters>(noFilters);
  const libraryHeading = useRef<HTMLHeadingElement>(null);
  const update = (change: Partial<Filters>) => setFilters(current => ({ ...current, ...change }));
  const terms = useMemo(() => filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean), [filters.query]);
  const visible = useMemo(() => datasets.filter(dataset => matches(dataset, filters, terms)), [filters, terms]);
  const groups = fields.map(field => ({ field, items: visible.filter(dataset => dataset.field === field.key) })).filter(group => group.items.length);
  // Field counts follow the other filters, so each button shows what selecting it would display.
  const fieldCounts = useMemo(() => {
    const counts = Object.fromEntries(fields.map(field => [field.key, 0])) as Record<FieldKey, number>;
    for (const dataset of datasets) if (matches(dataset, filters, terms, true)) counts[dataset.field]++;
    return counts;
  }, [filters, terms]);
  const anyFieldCount = Object.values(fieldCounts).reduce((sum, count) => sum + count, 0);
  const filtered = filters.query.trim() !== '' || filters.field !== 'all' || filters.tool !== 'all' || filters.level !== 'all';

  function showTool(tool: GuideToolKey) {
    setFilters({ ...noFilters, tool });
    libraryHeading.current?.scrollIntoView({ block: 'start' });
    libraryHeading.current?.focus({ preventScroll: true });
  }

  return <div className="page-layout layout-datasets">
    <section className="page-heading"><div className="shell">
      <p className="eyebrow">Research guide · For accepted EBS members</p>
      <h1>Dataset library</h1>
      <p className="lead">Find a free, public dataset for your research question, then analyze it with esquisse, Galaxy, iDEP or biblioshiny. Every tool has a step-by-step guide, and every dataset shows how to get it and use it.</p>
      <div className="actions">
        <a className="button" href="#library"><span>Find a dataset</span><ArrowDownRight size={18} aria-hidden="true" /></a>
        <a className="button secondary" href="#choose-a-tool"><span>Choose a tool</span><ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
      <p className="small">{datasets.length} datasets across {fields.length} research fields, from systems biology to meta-research.</p>
    </div></section>

    <div className="shell"><nav className="faq-nav library-jump" aria-label="On this page">
      <a href="#how-it-works">How it works</a>
      <a href="#choose-a-tool">Choose a tool</a>
      {toolGuides.map(guide => <a key={guide.key} href={`#${guide.key}`}>{guide.name}</a>)}
      <a href="#library">Dataset library</a>
      <a href="#responsible-use">Use data responsibly</a>
    </nav></div>

    <section className="section" id="how-it-works" aria-labelledby="how-it-works-title"><div className="shell">
      <div className="section-header"><h2 id="how-it-works-title">How to use this library</h2><p>Start with your question, not with the data. Then find a dataset that can answer it and a tool that fits the data.</p></div>
      <Steps items={[
        { title: 'Start with a question', body: <p>Write down what you want to find out, such as “Are ticks more common at warmer sites?” A specific question tells you what data you need.</p> },
        { title: 'Find data that can answer it', body: <p>Browse the <a href="#library">library</a> by field, or filter by the tool you want to learn. Read each dataset’s format and access terms before you download.</p> },
        { title: 'Analyze it with the right tool', body: <p>Follow the matching guide: <a href="#esquisse">esquisse</a> for tables, <a href="#galaxy">Galaxy</a> for sequences, <a href="#idep">iDEP</a> for gene expression and <a href="#biblioshiny">biblioshiny</a> for publications.</p> },
        { title: 'Record and cite everything', body: <p>Note where the data came from, its version or download date, and every step you took, so the EBS team and judges can check your work.</p> },
      ]} />
    </div></section>

    <section className="section" id="choose-a-tool" aria-labelledby="choose-a-tool-title"><div className="shell">
      <div className="section-header"><h2 id="choose-a-tool-title">Which tool fits your data?</h2><p>Match the shape of your data to a tool. All four are free, and none requires programming experience.</p></div>
      <div className="table-wrap"><table className="tool-table">
        <caption className="sr-only">Choosing a tool by type of data</caption>
        <thead><tr><th scope="col">Tool</th><th scope="col">Use it when your data is…</th><th scope="col">Runs in</th><th scope="col">For example</th></tr></thead>
        <tbody>{toolChoices.map(choice => <tr key={choice.tool}>
          <th scope="row"><a href={`#${choice.tool}`}>{toolLabels[choice.tool]}</a></th>
          <td>{choice.data}</td>
          <td>{choice.place}</td>
          <td>{choice.example}</td>
        </tr>)}</tbody>
      </table></div>
      <p className="small">Some datasets also need a little code; they are tagged “R or Python.” Learn the basics in the <a href="datascience.html">Coding</a>, <a href="python.html">Python</a> and <a href="rstudio.html">R / RStudio</a> lessons.</p>
    </div></section>

    {toolGuides.map(guide => <ToolGuideSection key={guide.key} guide={guide} count={toolCounts[guide.key]} onShow={() => showTool(guide.key)} />)}

    <section className="section" id="library" aria-labelledby="library-title"><div className="shell">
      <div className="section-header"><h2 id="library-title" ref={libraryHeading} tabIndex={-1}>Dataset library</h2><p>Every dataset here is free to use for student research. Choose a field, filter by tool or level, or search for a topic.</p></div>
      <div className="library-filters" role="search" aria-label="Filter datasets">
        <div className="field-picker" role="group" aria-labelledby="field-picker-label">
          <p id="field-picker-label" className="library-label">Research field</p>
          <div className="field-picker__options">
            <button type="button" aria-pressed={filters.field === 'all'} onClick={() => update({ field: 'all' })}>All fields <span className="field-count">{anyFieldCount}</span></button>
            {fields.map(field => <button type="button" key={field.key} className={fieldCounts[field.key] ? undefined : 'is-empty'} aria-pressed={filters.field === field.key} onClick={() => update({ field: filters.field === field.key ? 'all' : field.key })}>
              {field.name} <span className="field-count">{fieldCounts[field.key]}<span className="sr-only"> {fieldCounts[field.key] === 1 ? 'dataset' : 'datasets'}</span></span>
            </button>)}
          </div>
        </div>
        <div className="library-controls">
          {/* Phones get a compact field menu in place of the buttons above (CSS shows one or the other). */}
          <div className="library-control library-control--field">
            <label className="library-label" htmlFor="library-field">Research field</label>
            <select id="library-field" value={filters.field} onChange={event => update({ field: event.target.value as FieldKey | 'all' })}>
              <option value="all">All fields ({anyFieldCount})</option>
              {fields.map(field => <option key={field.key} value={field.key}>{field.name} ({fieldCounts[field.key]})</option>)}
            </select>
          </div>
          <div className="library-control library-control--search">
            <label className="library-label" htmlFor="library-search">Search</label>
            <input id="library-search" type="search" value={filters.query} onChange={event => update({ query: event.target.value })} placeholder="gut bacteria, measles, gene expression…" />
          </div>
          <div className="library-control">
            <label className="library-label" htmlFor="library-tool">Tool</label>
            <select id="library-tool" value={filters.tool} onChange={event => update({ tool: event.target.value as ToolKey | 'all' })}>
              <option value="all">Any tool</option>
              {toolOrder.map(tool => <option key={tool} value={tool}>{toolLabels[tool]}</option>)}
            </select>
          </div>
          <div className="library-control">
            <label className="library-label" htmlFor="library-level">Level</label>
            <select id="library-level" value={filters.level} onChange={event => update({ level: event.target.value as Level | 'all' })}>
              <option value="all">Any level</option>
              {levels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          <button className="library-clear" type="button" onClick={() => setFilters(noFilters)} disabled={!filtered}>Clear filters</button>
        </div>
      </div>
      <p className="library-status" role="status" aria-live="polite">{describe(visible.length, groups.length, filters)}</p>
      {groups.length ? groups.map(({ field, items }) => <section className="dataset-field" id={`field-${field.key}`} key={field.key} aria-labelledby={`field-${field.key}-title`}>
        <div className="dataset-field__head">
          <h3 id={`field-${field.key}-title`}>{field.name}</h3>
          <p>{field.summary}</p>
        </div>
        <div className="dataset-grid">{items.map(dataset => <DatasetCard key={dataset.id} dataset={dataset} />)}</div>
      </section>) : <div className="callout library-empty">
        <p>No datasets match these filters. Try fewer words, another level, or a different tool.</p>
        <button className="button secondary" type="button" onClick={() => setFilters(noFilters)}><span>Clear filters</span><ArrowDownRight size={18} aria-hidden="true" /></button>
      </div>}
    </div></section>

    <section className="section" id="responsible-use" aria-labelledby="responsible-use-title"><div className="shell">
      <div className="section-header"><h2 id="responsible-use-title">Use data responsibly</h2><p>Good research is honest about where its data came from and careful with people’s information.</p></div>
      <div className="grid columns-3 responsible-grid">
        <div className="text-block"><h3>Cite the data and tools</h3><p>Cite each dataset as its provider asks, with the version or download date and any DOI (GBIF, Zenodo and OSF give you one). Cite the tools as well; in R, citation("esquisse") or citation("bibliometrix") gives the reference.</p></div>
        <div className="text-block"><h3>Follow the terms</h3><p>Read each license. CC0 and CC BY data can be reused with credit, and non-commercial terms (such as IHME’s and IUCN’s) still allow student research. Don’t share data a provider asks you not to redistribute.</p></div>
        <div className="text-block"><h3>Protect privacy</h3><p>Use only de-identified, aggregate or synthetic health data. Never try to identify a person, and never upload private or personal information to online tools.</p></div>
        <div className="text-block"><h3>Ask before you sign up</h3><p>Some sites need an account and set age rules; iNaturalist, for example, needs a parent’s or guardian’s permission for anyone under 13. Ask a parent, guardian or teacher before creating accounts.</p></div>
        <div className="text-block"><h3>Keep a research log</h3><p>Record search terms, filters, download dates, file names and every analysis step. Save your esquisse code, Galaxy history link and iDEP settings so you can repeat the work and share it at checkpoints.</p></div>
        <div className="text-block"><h3>Be careful with conclusions</h3><p>Public data usually show associations, not causes. Check sample sizes, missing values and how the data were collected, and see whether a pattern holds in more than one dataset.</p></div>
      </div>
    </div></section>

    <section className="section" aria-labelledby="library-help-title"><div className="shell"><div className="next-step">
      <h2 id="library-help-title">Need help choosing?</h2>
      <p>Not sure which dataset fits your question, or found one you think belongs here? Email the EBS team or bring it to office hours. We would rather help you scope a project than see you stuck.</p>
      <div className="actions">
        <a className="button" href="contact.html"><span>Contact the EBS team</span><ArrowDownRight size={18} aria-hidden="true" /></a>
        <a className="button secondary" href="mailto:exeterbiologysymposium@gmail.com?subject=Dataset%20library%20suggestion"><span>Suggest a dataset</span><ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
    </div></div></section>
  </div>;
}

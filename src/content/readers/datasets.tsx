import { useEditorialContent, safeCopyUrl } from '../page-copy';
import type { definition } from '../copy/datasets';
import type { Value } from '../fields';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { CodeBlock } from '../../page-controls';
import { toolLabels } from '../../learning/datasets/tools';
import type { Dataset, FieldKey, GuideToolKey, Level, Link, ToolGuide, ToolKey } from '../../learning/datasets/types';

// Accepted-member page (see access-policy.ts). It and src/learning/ ship only in /protected-assets/.

const levels: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const toolOrder: ToolKey[] = ['esquisse', 'galaxy', 'idep', 'biblioshiny', 'code'];
type Filters = { query: string; field: FieldKey | 'all'; tool: ToolKey | 'all'; level: Level | 'all' };
const noFilters: Filters = { query: '', field: 'all', tool: 'all', level: 'all' };

function matches(dataset: Dataset, filters: Filters, terms: string[], searchText: ReadonlyMap<string, string>, anyField = false) {
  return (anyField || filters.field === 'all' || dataset.field === filters.field)
    && (filters.tool === 'all' || dataset.tools.includes(filters.tool))
    && (filters.level === 'all' || dataset.level === filters.level)
    && terms.every(term => (searchText.get(dataset.id) ?? '').includes(term));
}
function plural(count: number, noun: string) { return `${count} ${noun}${count === 1 ? '' : 's'}`; }
function describe(count: number, groups: number, filters: Filters, fieldNames: Record<FieldKey, string>) {
  const where = filters.field !== 'all' ? ` in ${fieldNames[filters.field]}` : count ? ` across ${plural(groups, 'field')}` : '';
  const tool = filters.tool === 'all' ? '' : ` for ${toolLabels[filters.tool]}`;
  const level = filters.level === 'all' ? '' : `, ${filters.level.toLowerCase()} level`;
  const query = filters.query.trim() ? `, matching “${filters.query.trim()}”` : '';
  return `Showing ${plural(count, 'dataset')}${where}${tool}${level}${query}.`;
}

/** Site pages stay in the tab; full https:// links open a new tab and say so. */
function OutLink({ link, className, children }: { link: Link; className?: string; children?: ReactNode }) {
  const external = link.url.startsWith('https://');
  return <a className={className} href={safeCopyUrl(link.url)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
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
  const editorial = useEditorialContent<Value<typeof definition>>('datasets');

  const [open, ...more] = guide.links;
  return <section className="section tool-guide" id={guide.key} aria-labelledby={`${guide.key}-title`}><div className="shell">
    <div className="tool-guide__intro">
      <p className="eyebrow">{editorial.stepByStep.toolGuide}</p>
      <h2 id={`${guide.key}-title`}>{guide.name}</h2>
      <p className="tool-guide__tagline">{guide.tagline}</p>
      <p>{guide.summary}</p>
      <div className="actions">
        {open && <OutLink className="button" link={open}><span>{open.label}</span><ArrowDownRight size={18} aria-hidden="true" /></OutLink>}
        <button className="button secondary" type="button" onClick={onShow}><span>{editorial.stepByStep.show + " "}{plural(count, 'dataset')}{" " + editorial.stepByStep.entry + " "}{guide.name}</span><ArrowDownRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
    <dl className="tool-facts">
      <div><dt>{editorial.stepByStep.best}</dt><dd>{guide.bestFor}</dd></div>
      <div><dt>{editorial.stepByStep.dataItAccepts}</dt><dd>{guide.accepts}</dd></div>
      <div><dt>{editorial.stepByStep.runs}</dt><dd>{guide.runsIn}</dd></div>
      <div><dt>{editorial.stepByStep.account}</dt><dd>{guide.account}</dd></div>
    </dl>
    <div className="tool-guide__body">
      <div>
        <h3>{editorial.stepByStep.stepByStep}</h3>
        <Steps items={guide.steps.map(step => ({ title: step.title, body: <>
          <p>{step.detail}</p>
          {step.code && <CodeBlock text={step.code.text} label={step.code.language} />}
        </> }))} />
      </div>
      <div>
        <h3>{editorial.stepByStep.tips}</h3>
        <ul className="lesson-list">{guide.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
        <h3>{editorial.stepByStep.learnMore}</h3>
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
  const editorial = useEditorialContent<Value<typeof definition>>('datasets');

  const title = `dataset-${dataset.id}-title`;
  return <article className="dataset-card" id={`dataset-${dataset.id}`} aria-labelledby={title}>
    <p className="dataset-card__provider">{dataset.provider}</p>
    <h4 id={title}>{dataset.name}</h4>
    <ul className="dataset-tags" aria-label="Level and suggested tools">
      <li><span className={`dataset-tag dataset-tag--${dataset.level.toLowerCase()}`}>{dataset.level}</span></li>
      {dataset.tools.map(tool => <ToolTag key={tool} tool={tool} />)}
    </ul>
    <p>{dataset.summary}</p>
    <p className="dataset-question"><strong>{editorial.howGetUseIt.tryAsking}</strong> {dataset.question}</p>
    <dl className="dataset-facts">
      <div><dt>{editorial.howGetUseIt.format}</dt><dd>{dataset.format}</dd></div>
      <div><dt>{editorial.howGetUseIt.access}</dt><dd>{dataset.access}</dd></div>
    </dl>
    {dataset.caution && <p className="dataset-caution"><strong>{editorial.howGetUseIt.keepMind}</strong> {dataset.caution}</p>}
    {/* The footer sits at the bottom, so actions line up across cards in a row. */}
    <div className="dataset-card__footer">
      <details className="dataset-howto">
        <summary>{editorial.howGetUseIt.howGetUseIt}</summary>
        <ol className="lesson-list">{dataset.steps.map(step => <li key={step}>{step}</li>)}</ol>
        {dataset.code && <CodeBlock text={dataset.code.text} label={dataset.code.language} />}
      </details>
      <div className="dataset-actions">
        <OutLink className="button" link={{ label: 'Open dataset', url: dataset.url }}>
          <span>{editorial.howGetUseIt.openDataset}<span className="sr-only">: {dataset.name}</span></span><ArrowDownRight size={18} aria-hidden="true" />
        </OutLink>
        {dataset.links?.map(link => <OutLink key={link.url} className="dataset-link" link={link} />)}
      </div>
    </div>
  </article>;
}

export default function DatasetLibraryPage() {
  const editorial = useEditorialContent<Value<typeof definition>>('datasets');

  const { datasets, fields, toolGuides, toolChoices, fieldNames, searchText, toolCounts } = useMemo(() => {
    const fields = editorial.datasetFields as { key: FieldKey; name: string; summary: string }[];
    const fieldNames = Object.fromEntries(fields.map(field => [field.key, field.name])) as Record<FieldKey, string>;
    const datasets = editorial.catalog.map((dataset): Dataset => ({
      ...dataset, id: dataset.id as string, field: dataset.field as FieldKey, level: dataset.level as Level, tools: dataset.tools as ToolKey[],
      code: dataset.code.language && dataset.code.text ? { language: dataset.code.language as 'R' | 'Python', text: dataset.code.text } : undefined,
    }));
    const toolGuides = editorial.guides.map((guide): ToolGuide => ({
      ...guide, key: guide.key as GuideToolKey, steps: guide.steps.map(step => ({
        ...step, code: step.code.language && step.code.text ? { language: step.code.language as 'R' | 'Python', text: step.code.text } : undefined,
      })),
    }));
    const toolChoices = editorial.toolChoices as { tool: GuideToolKey; name: string; data: string; place: string; example: string }[];
    const searchText = new Map(datasets.map(dataset => [dataset.id, [
      dataset.name, dataset.provider, dataset.summary, dataset.question, dataset.format, dataset.access,
      fieldNames[dataset.field], dataset.level, ...dataset.tools.map(tool => toolLabels[tool]),
    ].join(' ').toLowerCase()]));
    const toolCounts = Object.fromEntries(toolGuides.map(guide => [guide.key, datasets.filter(dataset => dataset.tools.includes(guide.key)).length])) as Record<GuideToolKey, number>;
    return { datasets, fields, toolGuides, toolChoices, fieldNames, searchText, toolCounts };
  }, [editorial.catalog, editorial.datasetFields, editorial.guides, editorial.toolChoices]);
  const [filters, setFilters] = useState<Filters>(noFilters);
  const libraryHeading = useRef<HTMLHeadingElement>(null);
  const update = (change: Partial<Filters>) => setFilters(current => ({ ...current, ...change }));
  const terms = useMemo(() => filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean), [filters.query]);
  const visible = useMemo(() => datasets.filter(dataset => matches(dataset, filters, terms, searchText)), [datasets, filters, terms, searchText]);
  const groups = fields.map(field => ({ field, items: visible.filter(dataset => dataset.field === field.key) })).filter(group => group.items.length);
  // Field counts follow the other filters, so each button shows what selecting it would display.
  const fieldCounts = useMemo(() => {
    const counts = Object.fromEntries(fields.map(field => [field.key, 0])) as Record<FieldKey, number>;
    for (const dataset of datasets) if (matches(dataset, filters, terms, searchText, true)) counts[dataset.field]++;
    return counts;
  }, [datasets, fields, filters, terms, searchText]);
  const anyFieldCount = Object.values(fieldCounts).reduce((sum, count) => sum + count, 0);
  const filtered = filters.query.trim() !== '' || filters.field !== 'all' || filters.tool !== 'all' || filters.level !== 'all';

  function showTool(tool: GuideToolKey) {
    setFilters({ ...noFilters, tool });
    libraryHeading.current?.scrollIntoView({ block: 'start' });
    libraryHeading.current?.focus({ preventScroll: true });
  }

  return <div className="page-layout layout-datasets">
    <section className="page-heading"><div className="shell">
      <p className="eyebrow">{editorial.pageHeading.researchGuideAcceptedEbsMembers}</p>
      <h1>{editorial.pageHeading.title}</h1>
      <p className="lead">{editorial.pageHeading.findFreePublicDatasetResearchQuestion}</p>
      <div className="actions">
        <a className="button" href="#library"><span>{editorial.pageHeading.findDataset}</span><ArrowDownRight size={18} aria-hidden="true" /></a>
        <a className="button secondary" href="#choose-a-tool"><span>{editorial.pageHeading.chooseTool}</span><ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
      <p className="small">{datasets.length}{" " + editorial.pageHeading.datasetsAcross + " "}{fields.length}{" " + editorial.pageHeading.researchFieldsFromSystemsBiologyMeta}</p>
    </div></section>

    <div className="shell"><nav className="faq-nav library-jump" aria-label="On this page">
      <a href="#how-it-works">{editorial.page.howItWorks}</a>
      <a href="#choose-a-tool">{editorial.page.chooseTool}</a>
      {toolGuides.map(guide => <a key={guide.key} href={`#${guide.key}`}>{guide.name}</a>)}
      <a href="#library">{editorial.page.datasetLibrary}</a>
      <a href="#responsible-use">{editorial.page.useDataResponsibly}</a>
    </nav></div>

    <section className="section" id="how-it-works" aria-labelledby="how-it-works-title"><div className="shell">
      <div className="section-header"><h2 id="how-it-works-title">{editorial.howUseThisLibrary.howUseThisLibrary}</h2><p>{editorial.howUseThisLibrary.startWithQuestionNotWithData}</p></div>
      <Steps items={[
        { title: 'Start with a question', body: <p>Write down what you want to find out, such as “Are ticks more common at warmer sites?” A specific question tells you what data you need.</p> },
        { title: 'Find data that can answer it', body: <p>Browse the <a href="#library">library</a> by field, or filter by the tool you want to learn. Read each dataset’s format and access terms before you download.</p> },
        { title: 'Analyze it with the right tool', body: <p>Follow the matching guide: <a href="#esquisse">esquisse</a> for tables, <a href="#galaxy">Galaxy</a> for sequences, <a href="#idep">iDEP</a> for gene expression and <a href="#biblioshiny">biblioshiny</a> for publications.</p> },
        { title: 'Record and cite everything', body: <p>Note where the data came from, its version or download date, and every step you took, so the EBS team and judges can check your work.</p> },
      ]} />
    </div></section>

    <section className="section" id="choose-a-tool" aria-labelledby="choose-a-tool-title"><div className="shell">
      <div className="section-header"><h2 id="choose-a-tool-title">{editorial.whichToolFitsData.whichToolFitsData}</h2><p>{editorial.whichToolFitsData.matchShapeDataToolAllFour}</p></div>
      <div className="table-wrap"><table className="tool-table">
        <caption className="sr-only">Choosing a tool by type of data</caption>
        <thead><tr><th scope="col">{editorial.whichToolFitsData.tool}</th><th scope="col">{editorial.whichToolFitsData.useItWhenData}</th><th scope="col">{editorial.whichToolFitsData.runs}</th><th scope="col">{editorial.whichToolFitsData.example}</th></tr></thead>
        <tbody>{toolChoices.map(choice => <tr key={choice.tool}>
          <th scope="row"><a href={`#${choice.tool}`}>{choice.name}</a></th>
          <td>{choice.data}</td>
          <td>{choice.place}</td>
          <td>{choice.example}</td>
        </tr>)}</tbody>
      </table></div>
      <p className="small">{editorial.whichToolFitsData.someDatasetsAlsoNeedLittleCode + " "}<a href={safeCopyUrl(editorial.whichToolFitsData.hrefCoding)}>{editorial.whichToolFitsData.coding}</a>, <a href={safeCopyUrl(editorial.whichToolFitsData.hrefPython)}>{editorial.whichToolFitsData.python}</a>{" " + editorial.whichToolFitsData.entry + " "}<a href={safeCopyUrl(editorial.whichToolFitsData.hrefRRstudio)}>{editorial.whichToolFitsData.rRstudio}</a>{" " + editorial.whichToolFitsData.lessons}</p>
    </div></section>

    {toolGuides.map(guide => <ToolGuideSection key={guide.key} guide={guide} count={toolCounts[guide.key]} onShow={() => showTool(guide.key)} />)}

    <section className="section" id="library" aria-labelledby="library-title"><div className="shell">
      <div className="section-header"><h2 id="library-title" ref={libraryHeading} tabIndex={-1}>{editorial.datasetLibrary.datasetLibrary}</h2><p>{editorial.datasetLibrary.everyDatasetHereFreeUseStudent}</p></div>
      <div className="library-layout">
      <div className="library-filters" role="search" aria-label="Filter datasets">
        <div className="field-picker" role="group" aria-labelledby="field-picker-label">
          <p id="field-picker-label" className="library-label">{editorial.datasetLibrary.researchField}</p>
          <div className="field-picker__options">
            <button type="button" aria-pressed={filters.field === 'all'} onClick={() => update({ field: 'all' })}>{editorial.datasetLibrary.allFields + " "}<span className="field-count">{anyFieldCount}</span></button>
            {fields.map(field => <button type="button" key={field.key} className={fieldCounts[field.key] ? undefined : 'is-empty'} aria-pressed={filters.field === field.key} onClick={() => update({ field: filters.field === field.key ? 'all' : field.key })}>
              {field.name} <span className="field-count">{fieldCounts[field.key]}<span className="sr-only"> {fieldCounts[field.key] === 1 ? 'dataset' : 'datasets'}</span></span>
            </button>)}
          </div>
        </div>
        <div className="library-controls">
          {/* Phones get a compact field menu in place of the buttons above (CSS shows one or the other). */}
          <div className="library-control library-control--field">
            <label className="library-label" htmlFor="library-field">{editorial.datasetLibrary.researchField2}</label>
            <select id="library-field" value={filters.field} onChange={event => update({ field: event.target.value as FieldKey | 'all' })}>
              <option value="all">{editorial.datasetLibrary.allFields2}{anyFieldCount})</option>
              {fields.map(field => <option key={field.key} value={field.key}>{field.name} ({fieldCounts[field.key]})</option>)}
            </select>
          </div>
          <div className="library-control library-control--search">
            <label className="library-label" htmlFor="library-search">{editorial.datasetLibrary.search}</label>
            <input id="library-search" type="search" value={filters.query} onChange={event => update({ query: event.target.value })} placeholder={editorial.datasetLibrary.placeholderGutBacteriaMeaslesGeneExpression} />
          </div>
          <div className="library-control">
            <label className="library-label" htmlFor="library-tool">{editorial.datasetLibrary.tool}</label>
            <select id="library-tool" value={filters.tool} onChange={event => update({ tool: event.target.value as ToolKey | 'all' })}>
              <option value="all">{editorial.datasetLibrary.anyTool}</option>
              {toolOrder.map(tool => <option key={tool} value={tool}>{toolLabels[tool]}</option>)}
            </select>
          </div>
          <div className="library-control">
            <label className="library-label" htmlFor="library-level">{editorial.datasetLibrary.level}</label>
            <select id="library-level" value={filters.level} onChange={event => update({ level: event.target.value as Level | 'all' })}>
              <option value="all">{editorial.datasetLibrary.anyLevel}</option>
              {levels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
          <button className="library-clear" type="button" onClick={() => setFilters(noFilters)} disabled={!filtered}>{editorial.datasetLibrary.clearFilters}</button>
        </div>
      </div>
      <div className="library-results">
      <p className="library-status" role="status" aria-live="polite">{describe(visible.length, groups.length, filters, fieldNames)}</p>
      {groups.length ? groups.map(({ field, items }) => <section className="dataset-field" id={`field-${field.key}`} key={field.key} aria-labelledby={`field-${field.key}-title`}>
        <div className="dataset-field__head">
          <h3 id={`field-${field.key}-title`}>{field.name}</h3>
          <p>{field.summary}</p>
        </div>
        <div className="dataset-grid">{items.map(dataset => <DatasetCard key={dataset.id} dataset={dataset} />)}</div>
      </section>) : <div className="callout library-empty">
        <p>{editorial.datasetLibrary.noDatasetsMatchTheseFiltersTry}</p>
        <button className="button secondary" type="button" onClick={() => setFilters(noFilters)}><span>{editorial.datasetLibrary.clearFilters2}</span><ArrowDownRight size={18} aria-hidden="true" /></button>
      </div>}
      </div>
      </div>
    </div></section>

    <section className="section" id="responsible-use" aria-labelledby="responsible-use-title"><div className="shell">
      <div className="section-header"><h2 id="responsible-use-title">{editorial.useDataResponsibly.useDataResponsibly}</h2><p>{editorial.useDataResponsibly.goodResearchHonestAboutWhereIts}</p></div>
      <div className="grid columns-3 responsible-grid">
        <div className="text-block"><h3>{editorial.useDataResponsibly.citeDataTools}</h3><p>{editorial.useDataResponsibly.citeEachDatasetAsItsProvider}</p></div>
        <div className="text-block"><h3>{editorial.useDataResponsibly.followTerms}</h3><p>{editorial.useDataResponsibly.readEachLicenseCc0CcBy}</p></div>
        <div className="text-block"><h3>{editorial.useDataResponsibly.protectPrivacy}</h3><p>{editorial.useDataResponsibly.useOnlyDeIdentifiedAggregateOr}</p></div>
        <div className="text-block"><h3>{editorial.useDataResponsibly.askBeforeSignUp}</h3><p>{editorial.useDataResponsibly.someSitesNeedAnAccountSet}</p></div>
        <div className="text-block"><h3>{editorial.useDataResponsibly.keepResearchLog}</h3><p>{editorial.useDataResponsibly.recordSearchTermsFiltersDownloadDates}</p></div>
        <div className="text-block"><h3>{editorial.useDataResponsibly.beCarefulWithConclusions}</h3><p>{editorial.useDataResponsibly.publicDataUsuallyShowAssociationsNot}</p></div>
      </div>
    </div></section>

    <section className="section" aria-labelledby="library-help-title"><div className="shell"><div className="next-step">
      <h2 id="library-help-title">{editorial.needHelpChoosing.needHelpChoosing}</h2>
      <p>{editorial.needHelpChoosing.notSureWhichDatasetFitsQuestion}</p>
      <div className="actions">
        <a className="button" href={safeCopyUrl(editorial.needHelpChoosing.hrefContactEbsTeam)}><span>{editorial.needHelpChoosing.contactEbsTeam}</span><ArrowDownRight size={18} aria-hidden="true" /></a>
        <a className="button secondary" href={safeCopyUrl(editorial.needHelpChoosing.hrefSuggestDataset)}><span>{editorial.needHelpChoosing.suggestDataset}</span><ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
    </div></div></section>
  </div>;
}

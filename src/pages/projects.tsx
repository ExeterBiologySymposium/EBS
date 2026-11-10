import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDownRight, Check, Copy, RotateCcw } from 'lucide-react';
import {
  cohortFacts, cohortSignup, difficultyLabels, platformOf, platforms, projectByKey, projects, researchFields,
  type FieldKey, type Project, type ProjectKey,
} from '../cohorts/projects';
import {
  challengeOptions, computerOptions, dataOptions, emptyAnswers, hasAnswers, parseSaved, partnerOptions, projectLabel, recommend,
  signupFormLink, signupMailto, signupSummary, STORAGE_KEY,
  type Answers, type Challenge, type Computer, type DataChoice, type Partner, type Ranked,
} from '../cohorts/match';

// Interleave platforms so the curiosity question is about topics, not tools.
const hookOrder: ProjectKey[] = ['virus-under-pressure', 'old-age-or-alzheimers', 'serotonin-storm', 'itch-germ', 'tumor-on-the-move', 'machines-vs-memory-loss'];
const arc = [
  ['Set up the platform and get the data', 'Your data loaded and checked'],
  ['First analysis and quality checks', 'A first result you understand'],
  ['The main analysis', 'The numbers that answer your question'],
  ['Go deeper: pathways, genes or topic maps', 'The story behind the numbers'],
  ['Make four poster figures with numeric takeaways', 'Finished figures'],
  ['Build the poster and practice the pitch', 'A poster and a 60-second pitch'],
];

function sentenceList(items: string[]) {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
function finishList(project: Project) {
  return sentenceList([...project.finishWith, 'a poster', 'a 60-second pitch']);
}
/** The fields a project is built around (affinity 3), in the finder's order. */
function coreFields(project: Project) {
  return researchFields.filter(field => project.fields[field.key] === 3);
}

type ChoiceProps = { type: 'checkbox' | 'radio'; name: string; checked: boolean; onChange: () => void; title: ReactNode; description?: string; tag?: string };
function Choice({ type, name, checked, onChange, title, description, tag }: ChoiceProps) {
  return <label className="finder-choice">
    <input type={type} name={name} checked={checked} onChange={onChange} />
    <span className="finder-choice__body">
      <span className="finder-choice__title">{title}</span>
      {description && <span className="finder-choice__description">{description}</span>}
      {tag && <span className="finder-choice__tag">{tag}</span>}
    </span>
  </label>;
}

function Question({ number, title, hint, children }: { number: string; title: string; hint: string; children: ReactNode }) {
  return <fieldset className="finder-question">
    <legend><span className="finder-question__number" aria-hidden="true">{number}</span>{title}</legend>
    <p className="finder-question__hint">{hint}</p>
    <div className="finder-choices">{children}</div>
  </fieldset>;
}

function MatchResult({ first, second, ruledOut, notes, onSignup }: { first: Ranked; second: Ranked | null; ruledOut: Ranked[]; notes: string[]; onSignup: () => void }) {
  const project = first.project;
  const platform = platformOf(project);
  return <>
    <p className="eyebrow finder-result__label" id="match-label">Your best match</p>
    <h3 className="finder-result__name">{project.name}</h3>
    <p className="project-tags"><span>{platform.name} cohort</span><span>{difficultyLabels[project.difficulty]}</span></p>
    <p className="finder-result__summary">{project.summary}</p>
    {first.reasons.length > 0 && <>
      <p className="finder-result__subhead">Why it fits you</p>
      <ul className="finder-reasons">{first.reasons.map(reason => <li key={reason}><Check size={16} aria-hidden="true" /><span>{reason}</span></li>)}</ul>
    </>}
    {first.caution && <p className="finder-note">{first.caution}</p>}
    <div className="actions">
      <button className="button" type="button" onClick={onSignup}><span>Sign up for this project</span><ArrowDownRight size={18} aria-hidden="true" /></button>
      <a className="button secondary" href={`#${project.key}-plan`}><span>See the 6-week plan</span><ArrowDownRight size={18} aria-hidden="true" /></a>
    </div>
    {second && <div className="finder-second">
      <p className="finder-result__subhead">Your second choice</p>
      <p><a href={`#project-${second.project.key}`}>{second.project.name}</a> <span className="finder-second__meta">{platformOf(second.project).name} · {difficultyLabels[second.project.difficulty]}</span></p>
      {second.reasons[0] && <p className="finder-second__reason">{second.reasons[0]}</p>}
    </div>}
    {ruledOut.map(entry => <p className="finder-note" key={entry.project.key}><strong>{entry.project.name}</strong> would also fit you, but it needs a Windows or Mac computer where you can install R. If you really want it, team up with a partner who has one.</p>)}
    {notes.map(note => <p className="finder-note" key={note}>{note}</p>)}
  </>;
}

function ProjectCard({ project, isMatch, isFirst, onChoose }: { project: Project; isMatch: boolean; isFirst: boolean; onChoose: (key: ProjectKey) => void }) {
  const titleId = `project-${project.key}-title`;
  return <article className={`project-card${isMatch ? ' is-match' : ''}`} id={`project-${project.key}`} aria-labelledby={titleId}>
    <p className="project-tags">
      <span>{difficultyLabels[project.difficulty]}</span>
      {isMatch && <span className="is-highlight">Your best match</span>}
      {isFirst && !isMatch && <span className="is-highlight">Your first choice</span>}
    </p>
    <h4 id={titleId}>{project.name}</h4>
    <p className="project-card__question">{project.summary}</p>
    <p>{project.pitch}</p>
    <p className="project-card__fields"><span>Built around</span> {coreFields(project).map(field => field.label).join(' · ')}</p>
    <dl className="project-facts">
      <div><dt>Data</dt><dd>{project.data}</dd></div>
      <div><dt>You’ll finish with</dt><dd>{finishList(project)}</dd></div>
      <div><dt>Difficulty</dt><dd>{difficultyLabels[project.difficulty]}. {project.difficultyNote}</dd></div>
    </dl>
    <details className="project-plan" id={`${project.key}-plan`}>
      <summary>Full question, tools and 6-week plan</summary>
      <p className="project-plan__label">Research question</p>
      <p className="project-plan__question">{project.question}</p>
      <p className="project-plan__label">Tools</p>
      <p>{project.tools.join(', ')}</p>
      <p className="project-plan__label">Week by week</p>
      <ol className="week-list">{project.weeks.map((week, index) => <li key={week.title}>
        <span className="week-list__number">Week {index + 1}</span>
        <span className="week-list__title">{week.title}</span>
        <span className="week-list__goal">{week.goal}</span>
      </li>)}</ol>
    </details>
    <p className="project-card__guide">{project.guideUrl
      ? <a href={project.guideUrl} target="_blank" rel="noopener noreferrer">Open the step-by-step guide<span className="sr-only"> (opens in a new tab)</span></a>
      : 'Your cohort lead shares the full click-by-click guide when the cohort starts.'}</p>
    <div className="actions">
      <button className="button secondary" type="button" onClick={() => onChoose(project.key)}>
        <span>{isFirst ? 'Your first choice: go to sign-up' : 'Sign up for this project'}<span className="sr-only">: {project.name}</span></span><ArrowDownRight size={18} aria-hidden="true" />
      </button>
    </div>
  </article>;
}

export default function ProjectsPage() {
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [picked, setPicked] = useState<{ first: ProjectKey | null; second: ProjectKey | null }>({ first: null, second: null });
  const [partner, setPartner] = useState<Partner | null>(null);
  const [restored, setRestored] = useState(false);
  const [copy, setCopy] = useState<'idle' | 'copied' | 'manual'>('idle');
  const signupHeading = useRef<HTMLHeadingElement>(null);
  const preview = useRef<HTMLPreElement>(null);

  // Answers are kept on this device only, so a student can come back to their match.
  useEffect(() => {
    try {
      const saved = parseSaved(window.localStorage.getItem(STORAGE_KEY));
      if (saved) { setAnswers(saved.answers); setPicked({ first: saved.first, second: saved.second }); setPartner(saved.partner); }
    } catch { /* Storage can be unavailable; the finder still works for this visit. */ }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, first: picked.first, second: picked.second, partner })); }
    catch { /* Saving is optional. */ }
  }, [restored, answers, picked, partner]);

  const result = useMemo(() => recommend(answers), [answers]);
  const firstKey = picked.first ?? result.first?.project.key ?? null;
  const autoSecond = firstKey && hasAnswers(answers) ? result.ranked.find(entry => entry.blocked === null && entry.project.key !== firstKey)?.project.key ?? null : null;
  const secondKey = picked.second && picked.second !== firstKey ? picked.second : autoSecond;
  const choices = { first: firstKey, second: secondKey, computer: answers.computer, partner };
  const summary = signupSummary(choices);
  const formLink = signupFormLink(choices);
  useEffect(() => setCopy('idle'), [summary]);

  const flip = <T,>(values: T[], value: T) => values.includes(value) ? values.filter(item => item !== value) : [...values, value];
  const toggleHook = (key: ProjectKey) => setAnswers(current => ({ ...current, hooks: flip(current.hooks, key) }));
  const toggleField = (key: FieldKey) => setAnswers(current => ({ ...current, fields: flip(current.fields, key) }));
  const setData = (data: DataChoice) => setAnswers(current => ({ ...current, data }));
  const setChallenge = (challenge: Challenge) => setAnswers(current => ({ ...current, challenge }));
  const setComputer = (computer: Computer | null) => setAnswers(current => ({ ...current, computer }));
  function goToSignup() {
    requestAnimationFrame(() => {
      signupHeading.current?.scrollIntoView({ block: 'start' });
      signupHeading.current?.focus({ preventScroll: true });
    });
  }
  function signupForMatch() { setPicked({ first: null, second: null }); goToSignup(); }
  function chooseFirst(key: ProjectKey) {
    setPicked(current => ({ first: key, second: current.second === key || (current.second === null && secondKey === key) ? firstKey : current.second }));
    goToSignup();
  }
  function startOver() {
    setAnswers(emptyAnswers); setPicked({ first: null, second: null }); setPartner(null);
    document.getElementById('finder-title')?.focus();
  }
  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setCopy('copied'); }
    catch {
      if (preview.current) {
        const range = document.createRange(); range.selectNodeContents(preview.current);
        const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
        preview.current.focus();
      }
      setCopy('manual');
    }
  }

  const needsInstallWarning = [firstKey, secondKey].filter((key): key is ProjectKey => key !== null)
    .map(projectByKey).filter(project => platformOf(project).needsInstall && (answers.computer === 'locked' || answers.computer === 'mobile'));
  const announcement = result.first ? `Best match: ${result.first.project.name}.${result.second ? ` Second choice: ${result.second.project.name}.` : ''}` : '';

  return <div className="page-layout layout-projects">
    <section className="page-heading"><div className="shell">
      <p className="eyebrow">Research cohorts · No coding needed</p>
      <h1>Find your research project.</h1>
      <p className="lead">Six ready-made projects on three free platforms. Answer a few quick questions and we’ll point you to the one that fits you best. Then follow its step-by-step guide for six weeks.</p>
      <ul className="project-facts-row" aria-label="Every project at a glance">
        <li>{cohortFacts.weeks} weeks</li><li>{cohortFacts.hoursPerWeek}</li><li>No coding</li><li>Ends with a poster and a 60-second pitch</li>
      </ul>
      <div className="actions">
        <a className="button" href="#finder"><span>Find my project</span><ArrowDownRight size={18} aria-hidden="true" /></a>
        <a className="button secondary" href="#all-projects"><span>Browse all six</span><ArrowDownRight size={18} aria-hidden="true" /></a>
      </div>
    </div></section>

    <section className="section" id="finder" aria-labelledby="finder-title"><div className="shell">
      <div className="section-header">
        <h2 id="finder-title" tabIndex={-1}>Five quick questions</h2>
        <p>Skip anything you’re unsure about. Your match updates as you answer, and stays on this device so you can come back to it.</p>
      </div>
      <div className="finder">
        <div className="finder-questions">
          <Question number="01" title="Which question would you most want to answer?" hint="Pick any that make you curious.">
            {hookOrder.map(projectByKey).map(project => <Choice key={project.key} type="checkbox" name="hooks"
              checked={answers.hooks.includes(project.key)} onChange={() => toggleHook(project.key)}
              title={project.hook} tag={platformOf(project).name} />)}
          </Question>
          <Question number="02" title="Which research fields interest you?" hint="Pick as many as you like. Each one has a short description.">
            {researchFields.map(field => <Choice key={field.key} type="checkbox" name="fields"
              checked={answers.fields.includes(field.key)} onChange={() => toggleField(field.key)}
              title={field.label} description={field.description} />)}
          </Question>
          <Question number="03" title="What kind of data sounds most fun?" hint="Each cohort works with one kind of data.">
            {dataOptions.map(option => <Choice key={option.key} type="radio" name="data" checked={answers.data === option.key}
              onChange={() => setData(option.key)} title={option.label} description={option.description} />)}
          </Question>
          <Question number="04" title="How much challenge do you want?" hint="Every project is built for beginners. Some ask more of you than others.">
            {challengeOptions.map(option => <Choice key={option.key} type="radio" name="challenge" checked={answers.challenge === option.key}
              onChange={() => setChallenge(option.key)} title={option.label} description={option.description} />)}
          </Question>
          <Question number="05" title="Which computer will you use?" hint="This is the most common reason a project stalls in week 1, so we check it now.">
            {computerOptions.map(option => <Choice key={option.key} type="radio" name="computer" checked={answers.computer === option.key}
              onChange={() => setComputer(option.key)} title={option.label} description={option.description} />)}
          </Question>
          {hasAnswers(answers) && <button className="finder-reset" type="button" onClick={startOver}><RotateCcw size={16} aria-hidden="true" />Start over</button>}
          {/* On narrow screens the result sits below every question, so keep the current match in reach. */}
          {result.first && <a className="finder-jump" href="#finder-result"><span>Your match: <strong>{result.first.project.name}</strong></span><ArrowDownRight size={18} aria-hidden="true" /></a>}
        </div>
        <section className="finder-result" id="finder-result" aria-labelledby="match-label">
          <div className="finder-result__panel">
            {result.first
              ? <MatchResult first={result.first} second={result.second} ruledOut={result.ruledOut} notes={result.notes} onSignup={signupForMatch} />
              : <>
                <p className="eyebrow finder-result__label" id="match-label">Your best match</p>
                <h3 className="finder-result__name">Your match appears here.</h3>
                <p>Answer any question and it updates as you go. You’ll also get a second choice, because the sign-up asks for two.</p>
                <p className="finder-note">Not sure where to begin? <a href="#project-itch-germ">The Itch Germ</a> is the gentlest of the six projects.</p>
              </>}
          </div>
          <p className="sr-only" aria-live="polite">{announcement}</p>
        </section>
      </div>
    </div></section>

    <section className="section" id="sign-up" aria-labelledby="sign-up-title"><div className="shell">
      <div className="signup-panel">
        <div className="signup-intro">
          <h2 id="sign-up-title" ref={signupHeading} tabIndex={-1}>Sign up for a cohort</h2>
          <p>The cohort sign-up asks for your first and second choices, your computer, and whether you want a partner. We filled in what we could from your answers. Change anything you like.</p>
          <p className="small">{cohortFacts.groupSize} If your first choice fills up, your second choice counts.</p>
        </div>
        <div className="signup-form">
          <div className="signup-fields">
            <label>First choice
              <select value={firstKey ?? ''} onChange={event => {
                const value = projects.find(project => project.key === event.target.value)?.key ?? null;
                setPicked(current => ({ first: value, second: value !== null && value === secondKey ? firstKey : current.second }));
              }}>
                <option value="">Choose a project</option>
                {platforms.map(platform => <optgroup key={platform.key} label={`${platform.name} cohort`}>
                  {projects.filter(project => project.platform === platform.key).map(project => <option key={project.key} value={project.key}>{project.name}</option>)}
                </optgroup>)}
              </select>
            </label>
            <label>Second choice
              <select value={secondKey ?? ''} onChange={event => {
                const value = projects.find(project => project.key === event.target.value)?.key ?? null;
                setPicked(current => ({ ...current, second: value }));
              }}>
                <option value="">Choose a project</option>
                {platforms.map(platform => <optgroup key={platform.key} label={`${platform.name} cohort`}>
                  {projects.filter(project => project.platform === platform.key).map(project => <option key={project.key} value={project.key} disabled={project.key === firstKey}>{project.name}</option>)}
                </optgroup>)}
              </select>
            </label>
            <label>Your computer
              <select value={answers.computer ?? ''} onChange={event => setComputer(computerOptions.find(option => option.key === event.target.value)?.key ?? null)}>
                <option value="">Choose one</option>
                {computerOptions.map(option => <option key={option.key} value={option.key}>{option.short}</option>)}
              </select>
            </label>
            <fieldset className="signup-partner">
              <legend>Work with a partner?</legend>
              {partnerOptions.map(option => <label key={option.key}><input type="radio" name="partner" checked={partner === option.key} onChange={() => setPartner(option.key)} />{option.label}</label>)}
            </fieldset>
          </div>
          {needsInstallWarning.map(project => <p className="finder-note" key={project.key} role="status"><strong>{project.name}</strong> needs a Windows or Mac computer where you can install R. Choose another project, or team up with a partner who has one.</p>)}
          <p className="signup-preview-label" id="signup-preview-label">What you’ll send</p>
          <pre className="signup-preview" ref={preview} tabIndex={0} aria-labelledby="signup-preview-label">{summary}</pre>
          <div className="actions">
            {formLink
              ? <a className="button" href={formLink} target="_blank" rel="noopener noreferrer"><span>Open the sign-up form<span className="sr-only"> (opens in a new tab)</span></span><ArrowDownRight size={18} aria-hidden="true" /></a>
              : <a className="button" href={signupMailto(choices)}><span>Email my sign-up</span><ArrowDownRight size={18} aria-hidden="true" /></a>}
            <button className="button secondary" type="button" onClick={copySummary}><span>Copy my choices</span>{copy === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}</button>
          </div>
          <p className="small" role="status">{copy === 'copied' ? 'Copied. Paste your choices wherever you need them.' : copy === 'manual' ? 'Your choices are selected. Press ⌘C or Ctrl+C to copy them.' : ''}</p>
          <p className="small">{formLink
            ? 'The form opens in a new tab. If your choices are not filled in, paste them from above.'
            : <>This opens your email app with your choices filled in, addressed to <a href={`mailto:${cohortSignup.email}`}>{cohortSignup.email}</a>. Add your name and send it. No email app? Copy your choices and email them from any account.</>}</p>
        </div>
      </div>
    </div></section>

    <section className="section" id="all-projects" aria-labelledby="all-projects-title"><div className="shell">
      <div className="section-header">
        <h2 id="all-projects-title">All six projects</h2>
        <p>Three cohorts, one for each no-code platform, with two projects each. Every project uses free, public data and runs about 1.5 hours a week.</p>
      </div>
      {platforms.map(platform => <section className="cohort-group" key={platform.key} aria-labelledby={`cohort-${platform.key}-title`}>
        <div className="cohort-group__intro">
          <p className="eyebrow">{platform.name} cohort</p>
          <h3 id={`cohort-${platform.key}-title`}>{platform.dataLabel}</h3>
          <p>{platform.dataDescription}</p>
          <dl className="cohort-needs">
            <div><dt>You need</dt><dd>{platform.needs}</dd></div>
            <div><dt>Won’t work on</dt><dd>{platform.wontWorkOn}</dd></div>
          </dl>
          {platform.extra && <p className="small">{platform.extra}</p>}
          <p><a href={platform.url} target="_blank" rel="noopener noreferrer">Visit {platform.name}<span className="sr-only"> (opens in a new tab)</span></a></p>
        </div>
        <div className="cohort-group__projects">
          {projects.filter(project => project.platform === platform.key).map(project => <ProjectCard key={project.key} project={project}
            isMatch={result.first?.project.key === project.key} isFirst={firstKey === project.key} onChoose={chooseFirst} />)}
        </div>
      </section>)}
    </div></section>

    <section className="section" id="how-it-works" aria-labelledby="how-it-works-title"><div className="shell">
      <div className="section-header">
        <h2 id="how-it-works-title">How the six weeks work</h2>
        <p>Every project follows the same rhythm, so all six cohorts reach the poster stage together.</p>
      </div>
      <div className="table-wrap" role="region" aria-label="The six-week plan shared by every project" tabIndex={0}>
        <table className="arc-table">
          <thead><tr><th scope="col">Week</th><th scope="col">What you do</th><th scope="col">What you have at the end</th></tr></thead>
          <tbody>{arc.map(([work, outcome], index) => <tr key={work}><td>{index + 1}</td><td>{work}</td><td>{outcome}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="grid columns-2 cohort-support">
        <div className="text-block">
          <h3>Built so you don’t get lost</h3>
          <ul className="lesson-list">
            <li><strong>Every click is spelled out.</strong> Each step says exactly what to click and what you should see.</li>
            <li><strong>Every step has a Check line.</strong> If your screen doesn’t match, stop and use the Fix-it guide before moving on.</li>
            <li><strong>The 20-minute rule.</strong> Stuck for more than 20 minutes? Post in the cohort Discord with the step number, what you clicked, and a screenshot.</li>
            <li><strong>A lab notebook.</strong> Each week ends with three questions. Answering them is how your poster text gets written.</li>
          </ul>
        </div>
        <div className="text-block">
          <h3>Check your computer first</h3>
          <p>It is the most common reason a project stalls in week 1.</p>
          <div className="table-wrap" role="region" aria-label="Which computers each platform works on" tabIndex={0}>
            <table className="computer-table">
              <thead><tr><th scope="col">Platform</th><th scope="col">Works on</th><th scope="col">Won’t work on</th></tr></thead>
              <tbody>{platforms.map(platform => <tr key={platform.key}><th scope="row">{platform.name}</th><td>{platform.worksOn}</td><td>{platform.wontWorkOn}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="reading cohort-questions">
        <h3>Questions</h3>
        <details className="disclosure" id="cohort-coding"><summary>Do I need to know how to code?</summary>
          <p>No. Every step is point-and-click, and the guide spells out every click. The only typing is in the Biblioshiny cohort, where you paste two short lines into R to open the app.</p>
        </details>
        <details className="disclosure" id="cohort-time"><summary>How much time does it take?</summary>
          <p>About 1.5 hours a week for 6 weeks. Each week ends with a short checkpoint so your cohort lead knows you are on track.</p>
        </details>
        <details className="disclosure" id="cohort-partner"><summary>Can I work with a partner?</summary>
          <p>Yes, and partners are encouraged: every guide works for two people. {cohortFacts.groupSize}</p>
        </details>
        <details className="disclosure" id="cohort-full"><summary>What if my first choice fills up?</summary>
          <p>Your second choice counts. That is why the sign-up asks for two.</p>
        </details>
        <details className="disclosure" id="cohort-present"><summary>Can I present my project at EBS?</summary>
          <p>Every project ends with a poster and a 60-second pitch. To present your poster at the symposium on April 25, 2027, also complete <a href="student-signup.html">Student registration</a>.</p>
        </details>
        <details className="disclosure" id="cohort-esquisse"><summary>Why is there no esquisse cohort?</summary>
          <p>Esquisse is a drag-and-drop chart builder that runs inside R. It is excellent for making figures, but it has no data or analysis of its own, so it cannot carry a six-week research question. Biblioshiny students already install R, so they can use esquisse for custom poster charts as an optional extra.</p>
        </details>
      </div>
    </div></section>
  </div>;
}

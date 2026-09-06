/* EBS: native controls, progressive enhancement, and verified contact delivery. */
const SEARCH_INDEX = [
  {
    title: 'Exeter Biology Symposium',
    url: 'index.html',
    description: 'Overview of EBS 2027, the dry-lab research symposium at Phillips Exeter Academy.',
    keywords: 'home overview symposium spring 2027 biology research dry lab judges students online in-person'
  },
  {
    title: 'About EBS',
    url: 'about.html',
    description: 'Mission, format, key dates, values, and how the symposium works.',
    keywords: 'mission vision dry lab format dates timeline purpose beginner research'
  },
  {
    title: 'Team',
    url: 'team.html',
    description: 'Student organizers, organizing committee, school partners, and faculty advisors.',
    keywords: 'organizers committee advisors faculty genetics biotech club contact'
  },
  {
    title: 'Resources',
    url: 'resources.html',
    description: 'Beginner-friendly research guides, public databases, tools, templates, and presentation help.',
    keywords: 'resources guides databases tools templates bioinformatics citation papers poster presentation'
  },
  {
    title: 'Data Science Curriculum',
    url: 'datascience.html',
    description: 'Self-contained course map for biology data analysis with separate Python and RStudio tracks.',
    keywords: 'data science curriculum rstudio python pandas numpy scipy statistics analysis dataset lessons exercises'
  },
  {
    title: 'Python Track',
    url: 'python.html',
    description: 'On-site Python lessons for pandas, NumPy, SciPy, biology datasets, exercises, and answer checks.',
    keywords: 'python pandas numpy scipy notebook data frame dataframe t-test enzyme activity answer key'
  },
  {
    title: 'RStudio Track',
    url: 'rstudio.html',
    description: 'On-site RStudio lessons for R data frames, grouped summaries, t-tests, plots, and answer checks.',
    keywords: 'rstudio r statistics data frames t.test aggregate boxplot enzyme activity answer key'
  },
  {
    title: 'For Schools',
    url: 'schools.html',
    description: 'Information for schools and educators interested in sending students to EBS.',
    keywords: 'schools educators teachers faculty advisor partner school students participate'
  },
  {
    title: 'For Researchers',
    url: 'researchers.html',
    description: 'How students can participate, conduct dry-lab research, and present, in-person or online.',
    keywords: 'students researchers present timeline poster presentation'
  },
  {
    title: 'For Judges',
    url: 'judges.html',
    description: 'Judge responsibilities, rubric, symposium day overview, awards, and volunteer information.',
    keywords: 'judges judging rubric feedback awards volunteer evaluation symposium day'
  },
  {
    title: 'FAQ',
    url: 'faq.html',
    description: 'Answers about eligibility, cost, dry-lab research, schools, judges, online attendance, and symposium day.',
    keywords: 'questions faq eligibility cost dry lab schools judges online contact registration'
  },
  {
    title: 'Register Interest',
    url: 'register.html',
    description: 'Register your interest as a student, school, volunteer, or judge.',
    keywords: 'register registration interest apply application student school judge volunteer'
  }
,
  { title: 'Schedule', url: 'schedule.html', description: 'Provisional symposium timetable and session information.', keywords: 'schedule timetable time sessions spring 2027' },
  { title: 'Open Source', url: 'opensource.html', description: 'Open-source project tools and resources.', keywords: 'open source code projects tools' },
  { title: 'Student and School Registration', url: 'student-signup.html', description: 'Register interest as a student or school.', keywords: 'student school signup application registration' },
  { title: 'Volunteer and Judge Registration', url: 'volunteer-signup.html', description: 'Register interest as a volunteer or judge.', keywords: 'volunteer judge signup application registration' }
];

function getSearchResults(query, limit = 6) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return SEARCH_INDEX.slice(0, limit);
  return SEARCH_INDEX.map(item => {
    const title = item.title.toLowerCase();
    const haystack = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
    const score = terms.reduce((total, term) => total + (title === term ? 12 : title.includes(term) ? 7 : haystack.includes(term) ? 3 : 0), 0);
    return { item, score };
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit).map(result => result.item);
}

function createThemeController(root, storage, media, buttons = () => []) {
  let preference;
  try { preference = storage?.getItem('ebs-theme'); } catch (_) { /* Storage is optional. */ }
  if (!['light', 'dark'].includes(preference)) preference = null;
  let current;
  const apply = dark => {
    current = preference || (dark ? 'dark' : 'light');
    root.setAttribute('data-theme', current);
    buttons().forEach(button => {
      const label = `Switch to ${current === 'dark' ? 'light' : 'dark'} theme`;
      button.setAttribute('aria-label', label);
      button.textContent = current === 'dark' ? 'Light theme' : 'Dark theme';
    });
  };
  apply(media.matches);
  media.addEventListener('change', event => apply(event.matches));
  const toggle = () => {
    preference = current === 'dark' ? 'light' : 'dark';
    try { storage?.setItem('ebs-theme', preference); } catch (_) { /* Keep choice for this page. */ }
    apply(media.matches);
  };
  toggle.refresh = () => apply(media.matches);
  return toggle;
}

function openHashDetails(hash, doc = document) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
  const target = doc.getElementById(id);
  if (!target) return;
  let disclosure = target.closest('details');
  while (disclosure) {
    disclosure.open = true;
    disclosure = disclosure.parentElement?.closest('details');
  }
  target.scrollIntoView();
}

function createContactSubmit(form, { status, success, fetchImpl = fetch, FormDataImpl = FormData, timeoutMs = 15000 }) {
  let sending = false;
  return async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    const button = form.querySelector('[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(form.action, {
        method: 'POST', body: new FormDataImpl(form),
        headers: { Accept: 'application/json' }, signal: controller.signal
      });
      if (!response.ok || (await response.json()).success !== true) throw new Error('Submission rejected');
      status.textContent = 'Message sent. Thank you for contacting EBS.';
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      status.textContent = controller.signal.aborted
        ? 'Request timed out. Your message is still here; retry or email us.'
        : 'We could not send your message. Your message is still here; retry or email us.';
    } finally {
      clearTimeout(timer);
      sending = false;
      button.disabled = false;
      button.textContent = label;
      form.removeAttribute('aria-busy');
    }
  };
}

function initMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');
  const close = (restoreFocus = false) => {
    const wasOpen = nav?.classList.contains('open');
    nav?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    if (restoreFocus && wasOpen) button?.focus();
  };
  button?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', event => { if (event.matches) close(); });
  return close;
}

function initSearch(closeMenu) {
  const dialog = document.createElement('dialog');
  dialog.id = 'site-search';
  dialog.setAttribute('aria-labelledby', 'site-search-title');
  const heading = document.createElement('h2');
  heading.id = 'site-search-title';
  heading.textContent = 'Search EBS';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'search-close';
  close.textContent = 'Close search';
  const label = document.createElement('label');
  label.htmlFor = 'site-search-input';
  label.textContent = 'Page or topic';
  const input = document.createElement('input');
  input.id = 'site-search-input';
  input.type = 'search';
  input.autocomplete = 'off';
  const results = document.createElement('ul');
  results.id = 'site-search-results';
  const status = document.createElement('p');
  status.className = 'search-status';
  status.setAttribute('role', 'status');
  dialog.append(heading, close, label, input, status, results);
  document.body.append(dialog);
  let lastFocus;
  const render = () => {
    const matches = getSearchResults(input.value);
    results.replaceChildren(...matches.map(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.className = 'search-result';
      const title = document.createElement('strong');
      title.textContent = item.title;
      const description = document.createElement('span');
      description.textContent = item.description;
      link.append(title, description);
      li.append(link);
      return li;
    }));
    status.textContent = matches.length ? `${matches.length} pages` : 'No pages found. Try registration, research guides, or FAQ.';
  };
  const open = () => {
    if (dialog.open) return;
    lastFocus = document.activeElement;
    closeMenu();
    if (typeof dialog.showModal !== 'function') { window.location.href = 'resources.html'; return; }
    input.value = '';
    render();
    dialog.showModal();
    input.focus();
  };
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => lastFocus?.focus());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  input.addEventListener('input', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      results.querySelector('a')?.click();
    }
  });
  document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', open));
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey &&
        !event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) {
      event.preventDefault();
      open();
    }
  });
}

if (typeof document !== 'undefined') {
  document.documentElement.classList.add('js');
  let storage;
  try { storage = window.localStorage; } catch (_) { /* Browser can deny storage access. */ }
  const theme = createThemeController(document.documentElement, storage,
    window.matchMedia('(prefers-color-scheme: dark)'), () => document.querySelectorAll('[data-theme-toggle]'));
  const init = () => {
    theme.refresh();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', theme));
    initSearch(initMenu());
    openHashDetails(window.location.hash);
    window.addEventListener('hashchange', () => openHashDetails(window.location.hash));
    const form = document.getElementById('contact-form');
    if (form) form.addEventListener('submit', createContactSubmit(form, {
      status: document.getElementById('contact-status'), success: document.getElementById('form-success-msg')
    }));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
if (typeof module !== 'undefined') module.exports = { SEARCH_INDEX, getSearchResults, createThemeController, openHashDetails, createContactSubmit };

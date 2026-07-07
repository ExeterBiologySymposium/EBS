/* ==========================================================================
   Exeter Biology Symposium — main.js
   ========================================================================== */

// ── SVG Icon Sprite ──────────────────────────────────────────────────────────
// Injected once; reference with <svg><use href="#icon-NAME"/></svg>
function insertIconSprite() {
  const sprite = document.createElement('div');
  sprite.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
  sprite.setAttribute('aria-hidden', 'true');
  sprite.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">
    <symbol id="icon-flask" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 2h4M10 2v7L4 20h16L14 9V2"/>
      <path d="M8.5 16h7"/>
    </symbol>
    <symbol id="icon-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </symbol>
    <symbol id="icon-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 6.25v13.5M12 6.25C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13.5C4.17 19.02 5.75 18.5 7.5 18.5s3.33.52 4.5 1.25M12 6.25C13.17 5.48 14.75 5 16.5 5s3.33.52 4.5 1.25v13.5C19.83 19.02 18.25 18.5 16.5 18.5s-3.33.52-4.5 1.25"/>
    </symbol>
    <symbol id="icon-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </symbol>
    <symbol id="icon-building" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 21h18M5 21V7l7-4 7 4v14"/>
      <path d="M9 21v-6h6v6"/>
    </symbol>
    <symbol id="icon-microscope" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 18h12M3 21h18"/>
      <path d="M9 10V4a1 1 0 011-1h4a1 1 0 011 1v6"/>
      <path d="M12 10a6 6 0 100 8"/>
    </symbol>
    <symbol id="icon-trophy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 21h8M12 17v4"/>
      <path d="M5 3H3v4a4 4 0 004 4h10a4 4 0 004-4V3h-2"/>
      <path d="M5 3h14"/>
    </symbol>
    <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </symbol>
    <symbol id="icon-check-circle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </symbol>
    <symbol id="icon-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </symbol>
    <symbol id="icon-dna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2c0 4 4 6.5 4 10S6 18 6 22M18 2c0 4-4 6.5-4 10s4 6 4 10"/>
      <path d="M6.5 7h11M6.5 17h11"/>
    </symbol>
    <symbol id="icon-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </symbol>
    <symbol id="icon-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14"/>
    </symbol>
    <symbol id="icon-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </symbol>
    <symbol id="icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </symbol>
    <symbol id="icon-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </symbol>
    <symbol id="icon-location" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </symbol>
    <symbol id="icon-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </symbol>
    <symbol id="icon-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </symbol>
    <symbol id="icon-laptop" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </symbol>
    <symbol id="icon-lightbulb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A6 6 0 106.91 11.5c.76.76 1.23 1.52 1.41 2.5"/>
    </symbol>
    <symbol id="icon-presentation" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h20M4 3v14a2 2 0 002 2h12a2 2 0 002-2V3M12 17v4M9 21h6"/>
    </symbol>
    <symbol id="icon-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </symbol>
    <symbol id="icon-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </symbol>
    <symbol id="icon-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
    </symbol>
    <symbol id="icon-person" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </symbol>
    <symbol id="icon-sparkle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M5 18l.75 2.25L8 21l-2.25.75L5 24l-.75-2.25L2 21l2.25-.75L5 18z"/>
      <path d="M19 4l.5 1.5L21 6l-1.5.5L19 8l-.5-1.5L17 6l1.5-.5L19 4z"/>
    </symbol>
    <symbol id="icon-graduate" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </symbol>
    <symbol id="icon-chart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </symbol>
    <symbol id="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </symbol>
    <symbol id="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </symbol>
  </svg>`;
  document.body.insertBefore(sprite, document.body.firstChild);
}

// ── Navigation ───────────────────────────────────────────────────────────────
function initNav() {
  const nav    = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const mobile = document.querySelector('.nav__mobile');
  const dds    = document.querySelectorAll('.nav__dd');

  // Scroll shadow
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hamburger toggle
  burger?.addEventListener('click', () => {
    const open = mobile?.classList.contains('open');
    mobile?.classList.toggle('open');
    burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(!open));
    burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    document.body.style.overflow = open ? '' : 'hidden';
  });

  // Close mobile on link click
  mobile?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobile.classList.remove('open');
      burger?.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Dropdowns
  dds.forEach(dd => {
    const toggle = dd.querySelector('.nav__dd-toggle');
    toggle?.addEventListener('click', e => {
      e.stopPropagation();
      const open = dd.classList.contains('open');
      dds.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav__dd-toggle')?.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', () => {
    dds.forEach(d => {
      d.classList.remove('open');
      d.querySelector('.nav__dd-toggle')?.setAttribute('aria-expanded', 'false');
    });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dds.forEach(d => {
        d.classList.remove('open');
        d.querySelector('.nav__dd-toggle')?.setAttribute('aria-expanded', 'false');
      });
      if (mobile?.classList.contains('open')) {
        mobile.classList.remove('open');
        burger?.classList.remove('open');
        burger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
  });

  // Active link highlighting
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__m-link, .nav__dd-item, .nav__register').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0];
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      // If inside dropdown, also mark parent
      const parentDd = link.closest('.nav__dd');
      if (parentDd) {
        parentDd.querySelector('.nav__dd-toggle')?.classList.add('active');
      }
    }
  });
}

// ── Countdown Timer ──────────────────────────────────────────────────────────
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  // Target: Spring 2027 — April 10, 2027, 9:00 AM
  const TARGET = new Date('2027-04-10T09:00:00').getTime();

  function tick() {
    const delta = TARGET - Date.now();
    if (delta <= 0) {
      el.innerHTML = '<div class="countdown__unit"><span class="countdown__num">0</span><span class="countdown__lbl">Days</span></div>';
      return;
    }

    const d = Math.floor(delta / 86400000);
    const h = Math.floor((delta % 86400000) / 3600000);
    const m = Math.floor((delta % 3600000)  / 60000);
    const s = Math.floor((delta % 60000)    / 1000);

    el.innerHTML = [
      { v: d, l: 'Days' }, { v: h, l: 'Hours' },
      { v: m, l: 'Min'  }, { v: s, l: 'Sec'   }
    ].map(({ v, l }) => `
      <div class="countdown__unit">
        <span class="countdown__num">${String(v).padStart(2, '0')}</span>
        <span class="countdown__lbl">${l}</span>
      </div>`).join('');
  }

  tick();
  setInterval(tick, 1000);
}

// ── Accordion ────────────────────────────────────────────────────────────────
function initAccordion() {
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const body     = document.getElementById(trigger.getAttribute('aria-controls'));
      const accordion = trigger.closest('.accordion');

      // Close siblings
      accordion?.querySelectorAll('.accordion__trigger').forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        const b = document.getElementById(t.getAttribute('aria-controls'));
        b?.classList.remove('open');
      });

      if (!expanded) {
        trigger.setAttribute('aria-expanded', 'true');
        body?.classList.add('open');
      }
    });
  });
}

// ── Scroll Reveal ────────────────────────────────────────────────────────────
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Contact Form ─────────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    setTimeout(() => {
      btn.textContent = '✓ Message received!';
      form.reset();
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }, 1200);
  });
}

// ── Site Search ─────────────────────────────────────────────────────────────
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
];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

window.EBS = { escapeHTML };

function getSearchResults(query, limit = 6) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return SEARCH_INDEX.slice(0, limit);

  return SEARCH_INDEX
    .map(item => {
      const title = item.title.toLowerCase();
      const haystack = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
      const score = terms.reduce((total, term) => {
        if (title === term) return total + 12;
        if (title.includes(term)) return total + 7;
        if (haystack.includes(term)) return total + 3;
        return total;
      }, 0);
      return { item, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map(result => result.item);
}

function renderSearchResults(results, emptyText) {
  if (!results.length) {
    return `<p class="search-modal__empty">${escapeHTML(emptyText)}</p>`;
  }

  return results.map(result => `
    <a class="search-result" href="${escapeHTML(result.url)}">
      <span class="search-result__title">${escapeHTML(result.title)}</span>
      <span class="search-result__desc">${escapeHTML(result.description)}</span>
    </a>
  `).join('');
}

function initSiteSearch() {
  const modal = document.createElement('div');
  modal.className = 'search-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'site-search-title');
  modal.innerHTML = `
    <div class="search-modal__backdrop" data-search-close></div>
    <div class="search-modal__dialog">
      <div class="search-modal__head">
        <p class="search-modal__title" id="site-search-title">Search Exeter Biology Symposium</p>
        <button type="button" class="search-modal__close" aria-label="Close search" data-search-close>&times;</button>
      </div>
      <div class="search-modal__body">
        <label class="sr-only" for="site-search-input">Search query</label>
        <div class="search-modal__field">
          <svg viewBox="0 0 23 22" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g stroke="currentColor" stroke-width="1.5" fill="none">
              <circle cx="9.2" cy="9" r="8.5"></circle>
              <path d="M14.85 14.64 L20.71 20.5"></path>
            </g>
          </svg>
          <input id="site-search-input" type="search" autocomplete="off" placeholder="Search pages, FAQs, resources, registration...">
        </div>
        <div class="search-modal__results" id="site-search-results" role="list"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const input = modal.querySelector('#site-search-input');
  const resultsEl = modal.querySelector('#site-search-results');
  let lastFocus = null;

  const render = () => {
    const query = input.value.trim();
    const results = getSearchResults(query);
    const emptyText = query
      ? `No results found for "${query}". Try searching for registration, volunteer, FAQ, resources, or judges.`
      : 'Start typing to search the EBS site.';
    resultsEl.innerHTML = renderSearchResults(results, emptyText);
  };

  const closeSearch = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };

  const openSearch = (seed = '') => {
    lastFocus = document.activeElement;
    input.value = seed;
    render();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => input.focus(), 0);
  };

  document.querySelectorAll('[data-search-open]').forEach(button => {
    button.addEventListener('click', () => openSearch());
  });

  modal.querySelectorAll('[data-search-close]').forEach(button => {
    button.addEventListener('click', closeSearch);
  });

  input.addEventListener('input', render);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const firstResult = resultsEl.querySelector('.search-result');
      if (firstResult) window.location.href = firstResult.getAttribute('href');
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (!isTyping) {
        event.preventDefault();
        openSearch();
      }
    }
    if (event.key === 'Escape' && modal.classList.contains('open')) closeSearch();
  });

  const homeInput = document.getElementById('ebs-search');
  const homeSearchBox = homeInput?.closest('.spotlight__search-box');
  if (!homeInput || !homeSearchBox) return;

  const inlineResults = document.createElement('div');
  inlineResults.className = 'spotlight__search-results';
  inlineResults.setAttribute('role', 'list');
  homeSearchBox.insertAdjacentElement('afterend', inlineResults);

  const renderInline = () => {
    const query = homeInput.value.trim();
    if (!query) {
      inlineResults.classList.remove('open');
      inlineResults.innerHTML = '';
      return;
    }
    const results = getSearchResults(query, 4);
    inlineResults.innerHTML = renderSearchResults(results, `No results found for "${query}".`);
    inlineResults.classList.add('open');
  };

  homeInput.addEventListener('input', renderInline);
  homeInput.addEventListener('focus', renderInline);
  homeInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const firstResult = inlineResults.querySelector('.search-result');
      if (firstResult) window.location.href = firstResult.getAttribute('href');
      else openSearch(homeInput.value);
    }
  });

  document.addEventListener('click', event => {
    if (!homeSearchBox.contains(event.target) && !inlineResults.contains(event.target)) {
      inlineResults.classList.remove('open');
    }
  });
}

// ── Theme Toggle ─────────────────────────────────────────────────────────────
function initThemeToggle() {
  const STORAGE_KEY = 'ebs-theme';
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  if (!toggles.length) return;

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      toggles.forEach(t => t.setAttribute('aria-pressed', String(next === 'dark')));
    });
  });

  const current = document.documentElement.getAttribute('data-theme') === 'dark';
  toggles.forEach(t => t.setAttribute('aria-pressed', String(current)));
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  insertIconSprite();
  initNav();
  initSiteSearch();
  initCountdown();
  initAccordion();
  initReveal();
  initContactForm();
  initThemeToggle();
});

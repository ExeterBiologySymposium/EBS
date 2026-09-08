# EBS reference rebuild — verification

Verified locally on 2026-09-07. Sixteen public routes now use React/TypeScript layouts, Tailwind-backed shared styling, native accessible controls and Motion. Original EBS crimson, white, charcoal and gray remain. This is a reference-derived EBS adaptation; pixel-identical reproduction is not claimed.

## Reference evidence

- Reference: [Institute of Health](https://www.instituteofhealth.com/), with [Courses](https://www.instituteofhealth.com/courses), [About](https://www.instituteofhealth.com/about) and [FAQ](https://www.instituteofhealth.com/faq) interior comparisons.
- Hosted crawl job: `01a07bbc-16e9-7494-ba58-805460a85075`. Terminal status `completed`, total 52, completed 52, saved page results 52, no next page.
- Full HTML/Markdown: [hosted-crawl.json](../.firecrawl/hosted-crawl.json). URL inventory: [crawl-coverage.json](../.firecrawl/crawl-coverage.json).
- Homepage screenshots: `../.firecrawl/ioh-desktop.png`, `../.firecrawl/ioh-mobile.png`; public CSS and source HTML retained alongside them.
- Interior screenshots at 1440px and 390px: `../.firecrawl/reference-{faq,about,courses}-{1440,390}.png`. Measured heading rectangles: [reference-layouts.json](../.firecrawl/reference-layouts.json).
- The crawl covers the job's discovered pages; it does not establish coverage of unlinked, authenticated or subsequently added pages.

## Implemented page families

| Routes | Layout and behavior |
|---|---|
| Home | Full-height photo hero and one rotating fact; centered course carousel with visible neighbors; guidance controls; scroll-driven story; mission split; organizer portraits; real FAQ preview; crimson closing scene; oversized footer |
| About, Team | Centered introduction and large original group image; full directory with original names and blank portrait slots preserved |
| FAQ | Topic links, labeled question groups, working disclosures and full-width contact section below |
| Resources, Data science, Python, RStudio | Broad reference-style introductions with reading-focused lessons, usable contents links, retained tables and code, copy controls and exact CSV download |
| Schools, registration and signup routes | Clear audience routes, school-first action, explicit free participation, original provider handoffs |
| Schedule, Researchers, Judges, Open source | Shared editorial shell with task-specific timetable, role information and embed fallback |

FAQ no longer places a single quick-link paragraph beside the whole page. Category labels identify real answer groups; desktop answers occupy roughly 76% of the available width. On phones, each label sits above its answers. Contact follows all groups. This keeps the reference's grouped disclosure pattern while making EBS's longer answers easier to read.

## Measured checks

| Check | Result |
|---|---|
| Production typecheck, build and prerender | Passed |
| Existing Node behavior tests / Python contracts | 10 / 7 passed |
| Direct public routes | 16 |
| Retained original content anchors | 77 |
| Exact retained code examples | 10 |
| Valid local link, anchor and asset references | 932 |
| Browser route/viewport cases | 80: all 16 routes at 320, 390, 768, 1024 and 1440px |
| Browser behavior checks | 41 passed |
| Runtime/hydration errors | 0 |
| Document-wide overflow in viewport matrix | 0px |

Machine evidence: [browser-results.json](qa/browser-results.json), [route-verification.json](route-verification.json), [gate ledger](../GATES.md). The content checker also rejects a deliberately changed code fixture, verifies original teaching tables, confirms the CSV matches the original dataset and checks all five distinct supplied image subjects.

Browser checks exercise actual built React output: carousel movement, guidance, rotating facts, normal-motion story progression, FAQ answers/deep links, search, Escape, theme persistence, mobile menu, blocked storage, clipboard denial, invalid remote schedule fallback, valid remote schedule rendering and contact rejection/success. All sixteen pages retain content without JavaScript. Network integration checks use controlled fixtures; no real contact messages or registrations were sent. These checks do not certify current availability of external providers.

## Visual review

Reviewed desktop and phone captures of the homepage, FAQ, About, Team, Schools, registration and long educational pages. Fixed overly large hero type, controls overlapping the registration action, an initially uncentered course carousel and Luke's portrait crop. Complete coding content remains locally scrollable where tables/code need more width.

Representative production screenshots:

- [Home desktop](qa/index-1440.png), [home phone](qa/index-390.png), [full homepage](qa/index-1440-full.png), [scroll story state](qa/story-motion-1440.png).
- [FAQ desktop](qa/faq-1440-full.png), [FAQ phone](qa/faq-390-full.png).
- [About desktop](qa/about-1440-full.png), [Team desktop](qa/team-1440-full.png), [Schools desktop](qa/schools-1440-full.png), [registration desktop](qa/register-1440-full.png).
- [Research guides phone](qa/resources-390.png), [Python phone](qa/python-390.png). Full lesson captures are saved beside these files.

The normal-motion story was tested separately from the reduced-motion viewport matrix. Narrow desktop reflow was checked at 720px; this is not a claim that browser-level 200% zoom or every operating-system text-scaling setting was tested. Theme switching and persistence passed; a full dark-theme screenshot matrix and exhaustive contrast audit were not performed.

## Deliberate differences and fidelity limits

- Typography uses Arial because an authorized Lay Grotesk file is not supplied. Exact glyph metrics and the earlier proposed 4px comparison target are not certified.
- EBS colors, copy, real photos and people replace the reference's health content. Still images replace source video. The pinned story uses a solid crimson canvas with real scroll-driven stages.
- Guidance uses one uncropped lecture image with topic controls. Organizer cards link to real profiles; there are no fake testimonial video controls. Mobile portraits form a readable vertical list.
- FAQ answer columns are wider than the reference and the home FAQ uses a wide preview. Coding lessons retain readable prose, contents, tables and code rather than copying a marketing page literally.
- Native menu, dialogs, disclosures and scrolling replace the reference's Webflow/GSAP stack. Source frame-by-frame motion, all open-state geometry and autoplay timing equality are not certified.

## Run and preview

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open `http://127.0.0.1:4173/` or `/faq.html`. Root `.html` files are retained migration/content fixtures; opening them with `file://` displays the old static input. Production output is `dist`, which contains prerendered route content and hydratable bundles. Deployment was not performed.

Browser QA requires Playwright with Chromium available. In this workspace it ran using the existing bundled Playwright package and a temporary Chromium installation; `NODE_PATH` and `PLAYWRIGHT_BROWSERS_PATH` select those local paths. Run `node scripts/verify-redesign.mjs browser` with those variables set. Static checks run through `npm run build` without browser tooling.

# EBS React + Tailwind conversion — Institute of Health reference

Status: superseded on 2026-09-07 by [Institute of Health reference rebuild](ioh-reference-rebuild-plan.md) and [DESIGN.md](../DESIGN.md). This historical plan does not describe current implementation completeness. Use the new reference evidence and plan for all subsequent design work.

## 1. Goal and evidence

Rebuild all sixteen EBS pages in React and Tailwind, closely matching the layout and interaction language of https://www.instituteofhealth.com/ while keeping the original EBS crimson, white, charcoal, and gray palette. This replaces the previous editorial research-file visual direction. The user selected redesigned composition, restrained animation, and complete coding lessons with easier access rather than a live code runner.

Firecrawl completed a four-page crawl of the reference homepage, courses, about, and FAQ pages. Crawl ID: `01a0797c-879a-7389-ab39-874400025662`; four pages returned, four credits reported. Desktop homepage was also visually inspected. A later browser connection failed, so mobile reference behavior has not yet been visually verified. During implementation, capture the reference at 390px and 1440px before styling; compare navigation, proportions, spacing, and expanded states against those captures.

The reference has a full-bleed photographic/video hero, navigation over the image, a lower-left headline, upper-right ruled facts, large arrow actions, course browsing, image/text storytelling, people slides, grouped FAQs, and a broad closing action. Recreate those relationships using EBS content. Do not copy its health claims, testimonials, statistics, logos, or third-party media.

## 2. Visual and interaction specification

### Shared design

- Restore the checked-in EBS palette: light background `#FFFFFF`, surface `#F4F5F5`, text `#17191B`, secondary text `#54595E`, crimson `#9D2235`, hover `#7F192A`. Retain dark equivalents `#151719`, `#202326`, `#F3F4F4`, `#B8BDC2`, and `#EEA4AE`. Remove the recent cream/brown overrides. Keep existing favicon artwork.
- Use Source Sans 3 with system fallback. Match the reference's tightly grouped, left-aligned sans-serif headings: home H1 64px/1.02 desktop and 40px/1.08 mobile; page H1 48px/40px; section H2 40px/30px; body 18px/1.6. Use responsive sizing between these limits. Keep coding prose at 65–70 characters per line.
- Use viewport-wide sections with 40px desktop and 20px mobile gutters, narrowing to 16px at 320px. Use 96px desktop/48px mobile section spacing. Images and large arrow actions are rectangular; controls have at most 4px corners. Use solid charcoal overlays where photographs need text contrast.
- Header: EBS wordmark, Research guides, Coding, Schedule, Team, FAQ; About and Register at the right, alongside compact search/theme controls. Coding links directly to the existing data-science hub. On the home hero use white navigation; interior pages use the same geometry on a solid canvas. Collapse below 1100px to an explicit Menu/Close control and full-height menu matching the reference's stacked link treatment. Put Contact, schools, and participation roles in that menu and the footer.
- Mobile menu uses an accessible dialog with scroll lock, Escape dismissal, focus containment, and focus return. All primary navigation remains available before JavaScript loads. Search uses a separate dialog, reuses the current route search ranking, and supplies empty/result/error states. Show only one modal at a time.

### Reference-to-EBS page mapping

| Reference pattern | EBS implementation |
|---|---|
| Full-bleed home hero | Broad Institute group photograph with a charcoal overlay; EBS title/eligibility at lower left, facts at upper right, large Register action at lower right. Facts are “100% Free,” “In person + online,” and “April 24th, 2027,” not animated impact statistics. Add a smaller school link. Use `min-height: 90svh` desktop, content-driven height on mobile; stack title/action before facts on narrow screens. |
| Course browsing | Homepage learning section with Curriculum, Python, and RStudio entries; horizontally scrollable on mobile with native scroll snap and Previous/Next buttons. Each entry has its real description and destination. The resources page uses the same visual language for grouped guides. |
| Image/text storytelling | Explain research, student support, and presentation in alternating image/text sections. Use a sticky image on wide screens and normal document flow on mobile; the lecture image remains uncropped and readable. |
| People carousel | Home organizer preview with named EBS members and links to the team directory. No testimonial quotes or implied endorsements. Manual controls and touch scrolling; no auto-advance. Team page shows all names, roles, biographies, and known photos without carousel-only access. |
| About page | Follow the reference's introduction, purpose, story, and method hierarchy using existing EBS mission and programme copy. |
| Grouped FAQ | Reference-style split heading/help column plus ruled questions with plus/minus indicators. Preserve linkable questions and contact section. |
| Closing action/footer | Full-width crimson registration section, then charcoal footer with grouped learning, participation, organization, and contact links. Use the same footer throughout. |

Schools begins with “100% Free” and “all middle and high school students,” prominent school registration, and a smaller individual-registration link. Preserve asynchronous 1–2 hours/week guidance, no teacher-supervisor requirement, travel responsibility, and online presentation. Registration keeps three distinct audience routes. Schedule stays a readable timetable. Judges/researchers retain role-specific requirements. Open Source retains the existing embed and direct fallback link. These utility pages use the shared reference styling without forcing a full-screen hero above their task.

### Animation

Use the installed Motion package for React-owned state transitions. Use CSS for hover/focus changes. Set global reduced-motion handling; disable displacement, stagger, and smooth scrolling when requested by the OS.

- Menu/search enter and exit: 180–240ms opacity and no more than 12px translation.
- Homepage supporting text: one short fade/slide, at most 400ms total. Essential title, facts, and registration remain visible in prerendered HTML and with JavaScript disabled.
- Below-fold marketing groups: reveal once, 300ms, no more than 16px translation and 50ms stagger. Do not conceal sections if animation initialization fails.
- Arrow hover: 3px movement over 150ms. Copy feedback and disclosure indicators: 150–200ms.
- Keep code, tables, and lesson paragraphs stationary. Preserve native page scrolling and normal page navigation; no scroll hijacking or route-exit delay.
- Audit the installed TextEffect before use. Limit it to one supporting hero sentence with accessible unsplit text; remove blur/scale presets from the site's usage. Core reading never depends on it.

## 3. React, Tailwind, content, and assets

### Architecture and output contract

- Use React 19, React DOM, TypeScript, Vite, `@vitejs/plugin-react`, and Tailwind's Vite plugin. Reuse installed Motion, Lucide, `clsx`, `tailwind-merge`, and `cn`. Resolve compatible package versions once and lock them. No new application backend or runtime code execution service.
- Build a static multipage React site. One typed route manifest owns page component, output filename, title, description, canonical URL, and search summary. Shared Header, Footer, action, image, and guide components are authored once. Native links preserve normal navigation and browser history; a client-side router is unnecessary for the existing sixteen-page structure.
- Render each route to complete HTML at build time using React's `prerenderToNodeStream`, collect the resulting stream into the output document, then hydrate the same component tree with `hydrateRoot` in the browser. Use one build script and separate client/server Vite entries; server build code must not ship in the client bundle. Route loading must resolve the selected page before hydration. Initial content must be deterministic: no network fetch, storage read, or viewport-dependent markup during prerendering.
- The build emits `dist/index.html` and the other fifteen existing `.html` names, with bundled assets under `dist/assets`. Preserve all existing fragments, including `resources.html#presenting`, and both `/` and `/index.html`. Unknown paths serve a real 404. Keep metadata, social previews, analytics, and existing public asset URLs. Configure static hosting to serve `dist`, retain `.html` URLs, and avoid a blanket SPA fallback.
- Commands: `dev` starts Vite; `typecheck` runs TypeScript; `test` runs behavior checks; `build` runs typecheck, client/server builds, prerendering, and built-output contracts; `preview` serves `dist`; `check` combines tests and build. Record Python/BeautifulSoup test prerequisites if the existing validator remains Python-based. Ignore `node_modules`, `dist`, and temporary server build output.
- Tailwind utilities and one semantic theme file become the styling authority. Convert actual page JSX; do not wrap old HTML in `dangerouslySetInnerHTML`. Retire old stylesheet overrides and DOM-owning scripts after their replacements pass. Keep the dirty worktree intact until content has been captured and migrated; no blanket reset.

### Coding pages

Keep `datascience.html`, `python.html`, and `rstudio.html` as full React pages. They currently exist; restore prominence through the header, homepage learning section, resource index, and search. Preserve the existing curriculum, ten code examples, data tables, exercise prompts, answer keys, and anchor IDs.

Provide desktop sticky contents and mobile native contents disclosure; visible current section; cross-links between tracks; syntax-highlighted selectable code with Copy controls; local horizontal scrolling for code and wide tables; and native answer disclosures. Contents navigation opens enclosing disclosures and moves focus to the target without hiding text under the header. Copy failure offers manual selection and never reports success falsely. Add an `enzyme_activity.csv` download derived exactly from the existing lesson table, with a test comparing downloaded data against the teaching example. No browser Python/R runtime in this scope.

### Every repository image

There are thirteen raster files representing five distinct subjects, plus the favicon. Use every distinct subject; use size/format duplicates as delivery variants rather than repeated decorations.

| Existing asset | Placement |
|---|---|
| Broad Institute group photo | Homepage hero; About/team story with accurate caption |
| Adrian portrait | Adrian's organizer preview and team profile |
| Reya portrait | Reya's organizer preview and team profile |
| Luke portrait, currently unused | Luke's organizer preview and team profile; preserve a suitable crop from the landscape original |
| Original EBS Cover Photo PNG | Full-resolution linked view of the recorded biology lecture in learning/about content |
| Eight 480/960/1440/1920 PNG/WebP cover variants | Responsive `<picture>` sources for that lecture image; WebP preferred, PNG fallback; preserve complete slide framing |
| Favicon SVG | Site icon, preserving its existing EBS artwork |

Keep Jaiden and Dr. Morrill photo slots blank. Generate smaller delivery sizes for large photos locally during implementation, retain originals, set intrinsic dimensions, and lazy-load below-fold media. Prioritize only the hero image. Create an asset map containing source, dimensions, alt text, crop position, and usage so the build can reject missing references.

### Existing integrations

Port search, theme, menu, and form behavior into React ownership. Preserve Appwrite configuration and validation: invalid, empty, incomplete, or over-100-record collections keep visible static fallback content; each schedule section fails independently; remote Date cards cannot override provisional timing. Fetch after hydration and abort on unmount.

Google Forms links retain their current destinations and explicit new-tab handoff. EBS never infers submission success. FAQ contact keeps validation, concurrent-submit prevention, timeout/abort handling, truthful provider success, retained input on failure, and retry. Keep email fallback. Test network behavior with mocks rather than submitting real messages.

## 4. Execution and acceptance

1. Capture all current routes/content/assets and record existing worktree changes. Save reference desktop/mobile captures and the crawl findings. Establish source and output contracts before migration.
2. Build the React/Tailwind foundation and representative home, team, coding, and schools views. Compare these against the reference at the same dimensions. Carry the requested reference composition forward, not the rejected stacked-CSS design.
3. Migrate remaining page families through shared components. Replace old behavior only after equivalent React paths work. Update design/build documentation to describe the new single source of truth.
4. Run type checking, existing logic regressions, React interaction checks, production build, and contracts against emitted HTML. Verify all sixteen direct URLs, anchors, metadata, asset variants, data downloads, form destinations, and image assignments. Require no hydration errors or content loss with JavaScript disabled.
5. Inspect the built site at 320, 390, 768, 1024, and 1440px in both themes. Check keyboard-only navigation, focus return, 200% zoom, reduced motion, blocked storage, failed fonts, clipboard denial, failed Appwrite, and failed contact requests. Page-level overflow fails; intentional code/table scrolling passes. Use screenshots for visual comparison—unit tests do not prove the reference match.

Completion requires all pages migrated, all five image subjects represented, coding accessible directly from shared navigation, lessons intact, school content constraints preserved, and documented visual comparison with the reference. Preserve working functionality with reduced motion and no JavaScript. Deliver the local production preview and test evidence. Deployment remains outside this request.

## 5. Sources and model request

- UI/UX reference: https://www.instituteofhealth.com/ ; https://www.instituteofhealth.com/courses ; https://www.instituteofhealth.com/about ; https://www.instituteofhealth.com/faq
- Tailwind integration: https://tailwindcss.com/docs/installation/using-vite
- React hydration: https://react.dev/reference/react-dom/client/hydrateRoot
- Vite prerender/build basis: https://vite.dev/guide/ssr
- Accessible Motion: https://motion.dev/docs/react-accessibility
- GPT-6 Astra migration: https://developers.openai.com/api/docs/guides/latest-model

The repository contains no OpenAI SDK, model setting, or API request to migrate to GPT-6 Astra. No AI feature is added to the website. Changing the coding task's selected model is separate from converting the site; no task-model change is claimed by this plan.

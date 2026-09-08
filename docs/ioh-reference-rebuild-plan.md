# EBS — Institute of Health reference rebuild

Status: implemented and verified locally on 2026-09-07. All sixteen routes now render React layouts; the hosted crawl completed with 52 saved pages. See [verification and deliberate differences](redesign-verification.md) for measured results and screenshot evidence. Supersedes `website-react-tailwind-plan.md`, the Apple visual pass and conflicting design-token guidance. Visual authority: [DESIGN.md](../DESIGN.md). The stages below preserve the original implementation brief, not a claim of pixel equality.

## 1. Outcome and boundaries

Reproduce Institute of Health's visual composition and interactions across EBS, using the original EBS color roles and factual content. Keep React/Tailwind/Motion, all sixteen existing `.html` URLs and fragments, all five distinct supplied image subjects, complete coding lessons, school-first messaging and existing provider destinations. Implementation now includes the shared shell, homepage sequence, all route families, interactions, prerendering and verification. Deployment is separate.

“Exact same” means reference-matched geometry, section sequencing and state behavior; it is not permission for another artistic direction. Differences caused by EBS copy/media, font availability and accessibility must be recorded alongside screenshot comparisons. No claim of pixel equality until compared.

## 2. Baseline gaps confirmed before implementation

| Current implementation | Required correction |
|---|---|
| Apple font stack, palette changes and blanket square controls | Restore EBS colors; match Lay Grotesk metrics and source component-specific corners/materials |
| Three stacked hero facts and oversized slogan | Rotating single fact panel, source-sized heading, event identity and source alignment |
| Static course links; missing mentorship, pinned story and organizer rail | Build the actual reference section structure and controls |
| Generic closing band and small footer | Full-height closing media and oversized footer lettering |
| `src/content.ts` imports raw HTML and `App` parses legacy main content | Convert real page content to JSX/data using shared page families; retain snapshots for content contracts |
| `src/main.tsx` uses `createRoot`; server uses `renderToStaticMarkup` | Produce hydratable server output, then `hydrateRoot` with deterministic initial markup |
| Hero renders `opacity:0` server-side until animation | Essential title, facts and actions visible in static output and with JS disabled |
| Search only filters nav labels plus two coding terms | Port existing relevance rules and index all sixteen routes, with real React interaction checks |
| Storage access unguarded; dialogs lack focus containment/return | Storage-safe theme initialization; native modal dialogs or equivalent tested keyboard behavior |
| Contact/Appwrite helpers tested outside the active React tree | Wire and test actual React contact and remote-content flows; retain truthful static fallback |
| Build contract checks root/script existence | Assert content, file existence of bundles, all links/anchors and actual hydration behavior |
| Preview points to source `file://.../index.html` | Serve built output over HTTP and open that preview; eliminate confusion between old source and new UI |

These explain why earlier passing builds did not prove a completed or visually matched conversion.

## 3. Reference evidence gate

Already saved: homepage desktop/mobile full-page screenshots and crops, branding plus full image inventory, rendered HTML, public stylesheet and inline interaction code, and markdown for Courses/About/FAQ. See `DESIGN.md` for exact paths and confidence.

Before finalizing prototype geometry, collect the remaining states: desktop header after scrolling, mobile Menu and Close, two course selections, two mentorship selections, each story stage, people rail end state, FAQ open/closed, and interior screenshots for Courses/About/FAQ at 1440 and 390 widths. Use existing captures instead of repeating successful scrapes. The interrupted bulk crawl is not a completed evidence source.

Record viewport, state, scroll position, font, bounding boxes and source URL in a small comparison manifest. Freeze a representative video/poster frame for repeatable comparisons. Respect EBS substitutions when comparing color/media regions; compare structure separately from image pixels.

Font: source is Lay Grotesk 400/500. Check for an authorized font in the repo. If unavailable, use Arial for the prototype, measure line wraps and label the font gap. Never fetch and ship a proprietary font from the reference CDN as though authorized. This does not block layout planning.

## 4. Page and section mapping

| EBS route(s) | Reference composition | Essential EBS content |
|---|---|---|
| `index.html` | Full homepage sequence in DESIGN.md | Event identity, eligibility, free participation, provisional timing, registration and school link |
| `resources.html`, `datascience.html` | Courses introduction, category browsing, detailed learning entries | Research guides, curriculum tracks, presenting links and actual lesson destinations |
| `python.html`, `rstudio.html` | Reference interior heading and spacing around readable lesson layout | Complete examples, exercises, answer disclosures, cross-links, sticky/phone contents and anchors |
| `about.html` | About introduction, purpose, story, philosophy/method hierarchy | Existing mission and programme facts; group photo and complete uncropped lecture image |
| `team.html` | People visual language, expanded into accessible full directory | All names/roles/bios; Adrian, Reya and Luke photos; named blank slots preserved |
| `faq.html` | Split help/accordion groups and closing scene | Existing answers and functioning contact form with email fallback |
| `schools.html` | Reference interior layout and registration action geometry | “100% Free” first; all middle/high school students; school action prominent, individual action smaller; asynchronous 1–2h/week, no supervisor requirement, transport/online guidance |
| `register.html`, `student-signup.html`, `volunteer-signup.html` | Shared compact task layout and arrow actions | Separate audience routes, existing Google Forms links, explicit new-tab handoff; no inferred submission success |
| `schedule.html` | Shared interior layout with readable timetable | Provisional date; independent Appwrite sections retaining valid static fallback |
| `researchers.html`, `judges.html` | Shared programme/role layout | Existing audience-specific requirements and links |
| `opensource.html` | Shared interior frame | Existing embed, title and direct fallback link |

### Homepage sequence and EBS content allocation
1. **Hero:** Broad Institute group photo as current EBS poster media. Upper-right fact carousel; event title and short eligibility copy lower-left; Register action lower-right and smaller school link. Phone ordering follows captured source. No animated fictional metrics.
2. **Course carousel:** Centered active item with metadata and overview; faded adjacent items. Five real destinations can populate it: curriculum, Python, RStudio, research guides, presenting. Use true labels rather than invented unit counts.
3. **Guidance slideshow:** Existing programme guidance in the source's left text/control and right thumbnail/image layout. Use approved lecture/group media where appropriate; do not imply each distinct topic has a unique photo if it does not.
4. **Pinned narrative:** Question, evidence, analysis and presentation, with source-like progress/choreography. The repository has no equivalent reference background video; start with an existing EBS still and record motion-media gap. Do not manufacture medical claims or media.
5. **Mission split:** Existing EBS purpose and About link in the reference two-column frame.
6. **Organizer rail:** Adrian/Reya/Luke using confirmed names and roles. Preserve portrait/card/control geometry but use profile links, not fake video controls. Team directory contains everyone.
7. **FAQ preview:** Actual EBS questions in source split-column disclosure layout.
8. **Closing scene:** EBS media/crimson treatment with centered registration heading and source-sized action.
9. **Footer:** Source proportions and oversized EBS wordmark text; actual links/contact only.

Asset mapping is mandatory: five subjects, responsive cover variants as alternate deliveries rather than repeated decorative copies. Record source path, intrinsic dimensions, alt, crop position and intended slot. Lecture image must remain uncropped in at least its learning placement; original links remain available. Keep Jaiden and Dr. Morrill blank. Avoid loading full-size Adrian portrait in small carousel cards.

## 5. Implementation stages

### A — Freeze content and establish failing contracts
Capture current route text, meaningful anchors, code blocks, teaching datasets, form URLs and image assignments. Preserve dirty worktree without blanket restore. Extend built-output checks to expose current hydration, missing content and integration gaps. Tests must exercise the shipped React tree, not only retired helpers.

Deliverable: route/content/asset manifests and baseline comparison evidence.

### B — Reference prototype and shared shell
Create typed route manifest and palette/type/component tokens from DESIGN.md. Implement reference header, mobile menu, arrow action, hero, course carousel and footer at 1440 and 390. Keep original EBS colors. Search/theme stay accessible in expanded menu/footer so the reference header density is preserved. Match active and inactive carousel states, not just initial render.

Deliverable: reviewable local prototype and paired screenshots. Correct geometry before duplicating it across pages; existing user direction authorizes this work without asking again about style.

### C — Complete homepage choreography
Build mentorship slideshow, pinned story, mission split, organizer rail, FAQ and media CTA. Use Motion/native scroll with a single state owner per component. Match source timings documented in DESIGN.md; verify actual visible behavior. Pause autoplay for focus/hover and user choice; disable cycling/displacement for reduced motion. Preserve reading and links with JS disabled.

Deliverable: entire homepage, every control functional, explicit media/font differences.

### D — Migrate page families
Build JSX/data versions of all routes in the mapping table. Reuse shared patterns, but keep timetable, forms and coding prose task-focused. Preserve all content-contract anchors. Add exact teaching-table-derived `enzyme_activity.csv`, a download link and equality check. Code Copy must select text or give truthful manual instructions on clipboard failure; one control per code block. Open containing disclosures on fragment navigation and move focus correctly.

Deliverable: sixteen migrated routes; remove runtime legacy HTML parsing once parity is proven.

### E — Restore actual integrations and production rendering
Reuse validated search ranking and Appwrite normalization logic through React lifecycle ownership. Remote calls happen after hydration and abort on unmount; invalid/empty/incomplete/over-100 collections retain section fallback independently; remote date cards cannot assert confirmed timing. Contact handles validation, concurrent submission, timeout/abort, provider-confirmed success and retained input/retry on failure. Mock network requests; never send real test messages.

Use one route manifest for dev, prerender, page metadata and search. Server entry creates complete hydratable output, client uses `hydrateRoot`, initial theme/page tree deterministic. Preserve metadata and original file URLs; unknown routes get 404 rather than homepage fallback. Configure existing hosting to serve `dist`; no deployment in this task. Retire old scripts/styles after replacements pass. Do not hide broken transforms behind production-only body replacement; dev/build must follow the same route contract.

Deliverable: complete built HTML, working hydrated interactions, correct assets and no hydration warnings.

### F — Reference comparison and acceptance
Inspect production output at 320, 390, 768, 1024 and 1440 widths, both EBS themes; include 200% zoom. Open the served production preview in the app, not the root HTML file. Compare reference and EBS at identical viewport and state. Document remaining differences instead of claiming an “exact” pass from build results.

Deliverable: screenshots, interaction results and final implementation status.

## 6. Completion checks
- All sixteen direct URLs and existing fragments work; bundle/asset paths resolve; real 404.
- All specified homepage sections exist in the correct order; active/neighbor carousel geometry, mentorship thumbnails, story states, FAQ and oversized footer match evidence.
- Proposed geometry tolerance at 1440/390: key gutter/control/card alignment within 4px of frozen reference after deliberate color/media substitution; text line counts match wherever EBS meaning allows. This is a project acceptance target, not a measurement already achieved. Accessibility-driven exceptions recorded.
- Only source-specific blur, corners and overlays; no additional stylistic interpretation.
- No accidental document-wide horizontal overflow; intended carousels/code/tables may scroll locally. No clipped registration action or overlapping hero facts on phones.
- Dialog focus, Escape, return focus, disclosure keyboard behavior, visible focus and adequate contrast tested.
- JS-disabled pages retain essential content and navigation. Reduced-motion pages remain complete. Blocked storage, failed font load, denied clipboard, failed remote data and failed form requests remain usable and truthful.
- Existing behavior/content checks plus React integration and production hydration tests pass. Passing legacy tests alone is insufficient.
- All five supplied image subjects used meaningfully; variant delivery verified; blank portraits preserved.
- Plan status and documentation updated to reflect what actually shipped. No “complete,” “exact,” or “fully applied” claim while required fidelity/integration checks remain open.

## 7. Intentional limits and unresolved fidelity details
The completed implementation retains Arial instead of licensed Lay Grotesk, EBS still images instead of source video, organizer profiles instead of testimonials, and lesson-specific reading layouts. Guidance uses topic controls with one real lecture image rather than implying a different photo for every topic. FAQ uses wider answer groups and places contact below. The proposed 4px fidelity target was not measured or certified; source open-state timing equality is also not certified. Interior desktop/phone screenshots and the 52-page hosted crawl are now saved. See the verification report for the actual acceptance scope and differences.

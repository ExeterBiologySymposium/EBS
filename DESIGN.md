# DESIGN.md: Institute of Health → EBS

## Source
- Reference: https://www.instituteofhealth.com/
- Related pages: `/courses`, `/about`, `/faq` on the same domain.
- Capture date: 2026-09-07.
- Target: existing React 19 / TypeScript / Vite multipage site, Tailwind 4, Motion.
- Authority: this document and [rebuild plan](docs/ioh-reference-rebuild-plan.md) supersede the Apple direction and previous layout/type guidance. Original EBS colors, factual content, audience rules and supplied portraits remain authoritative.
- Scope of this revision: design extraction plus implementation. Production UI now follows this evidence freeze.
- Full hosted crawl: job `01a07bbc-16e9-7494-ba58-805460a85075`, completed 52/52 pages. Full HTML/Markdown saved in `.firecrawl/hosted-crawl.json`. Desktop/phone interior screenshots and heading rectangles: `.firecrawl/reference-layouts.json`.
- September 7 correction: use measured source hero type near 4vw, 32px desktop gutters, 400/500 weight, centered snap cards, and oversized footer letters. Original EBS palette restored. FAQ category labels accompany actual answer groups; remove the unrelated quick-link sidebar. On EBS, answer groups get 76% of available width rather than squeezing long student-facing answers into half the screen.
- Per-route content now lives in `src/pages/*.tsx`; HTML snapshots remain parity fixtures. New layouts use shared page families, native disclosures/dialogs, hydratable React output, and isolated contact/schedule state.

## Reference Screenshot
![Institute of Health desktop full page](.firecrawl/ioh-desktop.png)

![Institute of Health mobile full page](.firecrawl/ioh-mobile.png)

Full-page captures: 1440 × 12061 and 390 × 10328 pixels; requested viewports were 1440 × 900 and 390 × 844. Inspect readable crops: [desktop hero and carousel](.firecrawl/ioh-desktop-top.png), [mobile hero and carousel](.firecrawl/ioh-mobile-top.png), [mentorship](.firecrawl/ioh-mentorship.png), [closing action and footer](.firecrawl/ioh-footer.png).

Use screenshots for hierarchy, proportions, density and framing. Video frames and animated sections vary with capture time. The repeated red imagery in the long capture includes scroll-story behavior; it is not evidence for building repeated static image bands.

## Evidence and confidence
| Evidence | Use | Limits |
|---|---|---|
| `.firecrawl/ioh-branding.json` | Detected font stacks, component colors, 86 image URLs including content imagery | Automated role labels conflict with actual CSS; image inventory does not grant reuse rights |
| `.firecrawl/ioh-reference.css` | Public Webflow stylesheet; font faces, units, breakpoints, surfaces | Rules must be evaluated with cascade and media scope |
| `.firecrawl/ioh-home.html`, `ioh-origin.html`, `ioh-inline.css` | Rendered/source structure and embedded interaction code | Source behavior is not an end-to-end interaction test |
| `.firecrawl/ioh-token-evidence.json` | Extracted selector rules for quick lookup | Lists responsive variants without their media scopes; consult full CSS |
| `.firecrawl/ioh-home.md` | Homepage content and navigation order | Originally returned as text by CLI screenshot command; correctly renamed |
| `.firecrawl/instituteofhealth.com-{courses,about,faq}.md` | Related page hierarchy and links | These are markdown, not verified screenshots of those pages |

Homepage branding scrape: `01a07ba2-e96e-757c-89b2-4c639c0fc31a`. Desktop screenshot: `01a07ba3-9a3d-72d8-8499-b13cbc3a152a`. Mobile screenshot: `01a07ba4-9eac-72b9-aae4-f2947e232ca4`. HTML: `01a07ba4-acd5-73be-9c7f-7a5f15d3023c`.

The earlier interrupted crawl was superseded by completed job `01a07bbc-16e9-7494-ba58-805460a85075`: 52/52 pages, full HTML/Markdown, no remaining pagination. Saved at `.firecrawl/hosted-crawl.json`; URL coverage at `.firecrawl/crawl-coverage.json`. Actual interior screenshots are `.firecrawl/reference-{faq,about,courses}-{1440,390}.png`. See [final verification](docs/redesign-verification.md) for implementation evidence and remaining fidelity differences.

## Design Summary
Reproduce the reference's composition and state transitions. It combines edge-to-edge video, compact fixed navigation, medium-weight grotesk headings, broad neutral surfaces, a centered course carousel, asymmetric mentoring content, a pinned narrative, portrait cards, split FAQs and enormous muted footer lettering. This is a fidelity brief, not an Apple-style or generic minimalist reinterpretation.

### What “same design” means here
- Match section order, widths, gutters, alignment, heading line counts, media framing, controls, active/inactive states, mobile reflow and motion choreography.
- The requested EBS palette replaces source color roles. EBS names, claims, destinations and approved media replace source content in the same visual slots.
- Do not substitute a static three-column link grid for the carousel, simple text bands for the pinned story, or a compact generic footer for the reference footer.
- Exact visual equality is not yet established. Different copy, unavailable reference font and different media are explicit differences to resolve or record in comparison evidence.

## Design Tokens

### Colors
Actual source CSS defines `--gray:#e6e6e6`, `--black:#242424`, `--white:#f1f1f1`. These override the branding extractor's blue/yellow summary, which is unsuitable as the source palette. Apply this EBS mapping:

| Role | EBS light | EBS dark |
|---|---|---|
| Canvas / white section | `#FFFFFF` | `#151719` |
| Gray section / course canvas | `#F4F5F5` | `#202326` |
| Text | `#17191B` | `#F3F4F4` |
| Secondary text | `#54595E` | `#B8BDC2` |
| Accent / active / primary action | `#9D2235` | `#EEA4AE` |
| Accent hover | `#7F192A` | `#F5BCC4` |
| Text on primary | `#FFFFFF` | `#151719` |
| Divider | `#D9DDDF` | `#474D52` |

Keep cinematic sections and footer dark with contrasting text in both themes. Map the source's red media treatment to EBS crimson. Preserve overlay opacity relationships where text remains readable. Do not add a new cream, blue or Apple-black palette.

### Typography
- **Observed:** `Lay Grotesk`, weights 400 and 500, with `Arial, sans-serif` fallback; body tracking `-.015em`. Source exposes two font files but their availability on a CDN is not a license for EBS hosting. EBS uses the operating system's native sans-serif stack for clearer reading. Do not claim exact font matching.
- **Observed CSS:** desktop body base is `1vw`; homepage `.h1` is `4em`, weight 500, line-height 1; `.h2` is `3.5em`; course introduction `.h2.spec_hero` is `4em`. At 1440px these resolve to 57.6px, 50.4px and 57.6px. At 1920px H1 resolves to 76.8px, explaining the branding sample; do not use 76.8px at every desktop width.
- **Observed phone CSS:** at ≤479px H1 is `10.2em` with line-height 1.1, approximately 39.8px at 390px. Specialized headings have different rules: `.h2.spec` is `6.2em` / 1.2, approximately 24.2px. Do not apply one giant H2 to FAQ, courses and lessons alike.
- Source small labels can be small on desktop. Preserve relative hierarchy while enforcing readable EBS controls and lesson copy. Record any accessibility adjustment as intentional.
- EBS lesson prose: 65–70ch, 16–18px body, local code/table scrolling. Marketing viewport sizing must not shrink educational text.

### Spacing And Layout
**Observed from CSS and screenshots:**
- Default horizontal gutters 32px; 20px at ≤991px; 16px at ≤767px.
- General section wrapper: 92px vertical desktop; 72px through tablet; phone 52px top / 32px bottom. Specialized sections override this; match those sections separately.
- Fixed header: wrapper padding 14px 32px desktop, 12px 16px phone. Its total height depends on controls; use screenshot alignment, not the old invented 80px cap.
- Main header links: 24px gaps. Desktop link groups hide at ≤767px; explicit Menu/Close appears.
- Hero: viewport-wide, `100vh` desktop, phone wrapper `100svh`; source hero is sticky at top while subsequent content passes over it.
- Desktop hero facts: right-aligned, width 25% of wrapper; 40% tablet, 50% small tablet, 100% phone. Only one fact slide is visible at a time. Do not stack three desktop fact rows.
- Hero content: headline and supporting text lower left, translucent action lower right; phone facts near top, copy lower down, wide action at bottom. Preserve this order, replacing current overlapping absolute-position assumptions with a resilient grid.
- Hero action: 4px corners, label upper left, bent arrow lower right, translucent surface with 20px backdrop blur in source CSS. Header action uses 5px corners and 12px blur. The previous blanket no-blur/no-radius rule is superseded for these evidenced components only.
- Course cards have visibly larger rounded corners than buttons. Approximate 16px pending computed-state measurement; active card white, neighbors muted, overview below active image. Do not infer all component radii from the branding button value.
- Footer: dark canvas, compact link columns above large empty space and oversized low-contrast organization lettering spanning the width.

## Components
| Component | Reference contract | EBS mapping |
|---|---|---|
| Fixed header | Wordmark left; five central links; two utility links and arrow action right; palette changes over light/dark sections | Central: Research guides, Coding, Schedule, Team, FAQ. Right: About, Contact, Register. Keep search/theme reachable in expanded menu and footer to avoid adding three square buttons to reference header |
| Mobile menu | Visible Menu label with two-line icon; explicit Close state | Same geometry; accessible modal, scroll lock, Escape, focus containment/return. Open-state capture remains required |
| Hero facts | Ruled fact panel, number/text, animated progress/dots, rotating slides | 100% Free; In person + online; April 24th, 2027. Eligibility visible in supporting copy. No invented impact counts; no counting animation applied to dates |
| Arrow action | Label upper left and bent arrow lower right in broad rectangle | Preserve geometry across Register, school registration and curriculum actions |
| Course carousel | Active centered image card; faded neighbors; separate category/metadata strip and overview panel; swipe/controls | Curriculum, Python, RStudio, research guides and presenting. Real destinations and descriptions; no invented course units |
| Mentorship slideshow | Centered heading above asymmetric two-column area; title/prev-next bar and text left; vertical thumbnails and tall image right | Existing EBS guidance, independent research and presentation content. Never imply staffed clinical-style mentorship |
| Pinned story | Full-screen media with staged centered text, progress and intermediate labels | Question → evidence → analysis → presentation using factual EBS copy. Normal scrolling drives progress; reduced-motion/no-JS becomes readable static content |
| Mission split | Two columns with divider, left headline/tags, right paragraph/action | EBS purpose and About route |
| People cards | Centered intro, horizontal portrait/video rail, name/role strips, progress and controls | Real organizer profiles; portraits link to team. Do not add fake play buttons where no video exists |
| FAQ | Heading/help/action left, ruled disclosure rows right, plus/minus state | Existing FAQ and contact destinations; stable anchors |
| Closing scene | Full-height media, small centered top copy, large centered heading and light action | EBS image with crimson treatment; registration action |
| Footer | Wordmark, grouped links/contact, oversized muted organization name | EBS branding and real contact links. No copied source socials, legal pages, endorsement or provider logo |

### Motion evidence and behavior
Source code contains hero counting/progress, an 8-second mentorship autoplay interval, ~0.32–0.48-second mentorship transitions, image crossfades, blur/3D line entrances, a pinned story with `end:'+=4000'`, and a people slider configured for 3.5 cards desktop / 2 at ≤991 / 1 at ≤767, 800ms transitions and 12px/8px gaps. These are source observations, not yet browser-tested state timings.

Recreate visible choreography with existing Motion and native scrolling. Do not install the source's entire GSAP/Webflow/Lenis stack simply to copy its appearance. Autoplay must pause on focus/hover and expose pause controls; reduced motion stops cycling and displacement. Source includes scroll smoothing, but wheel interception is not required for visual fidelity. Capture scrolling, drag, menu and FAQ states before declaring behavior matched.

## Page Patterns
Homepage order: hero → course carousel → mentorship slideshow → narrative media sequence → mission split → people rail → split FAQ → closing media scene → oversized footer. Source HTML contains desktop and mobile versions of the story; implement one accessible data model with responsive presentation, not duplicate spoken content.

Related page hierarchies, confirmed from scraped markdown:
- Courses: programme introduction → detailed module catalogue → FAQ → closing scene.
- About: introduction → purpose → education statement → story → philosophy → method → closing scene.
- FAQ: title → three topic groups → closing scene. Map to EBS topics rather than copying health questions.
- Interior desktop/phone screenshots are saved. EBS behavior checks cover its implemented states; exact source open-state timing and pixel equality are not certified.

## Content Style
Medium-weight sentence-case headings with deliberate short line groups; direct labels, restrained supporting paragraphs, generous contrast between headline and metadata. Fit EBS content to comparable line counts without borrowing source health claims or inventing participant outcomes. Keep the actual event identity prominent. Schools starts with “100% Free,” welcomes all middle and high school students, emphasizes school registration and offers a smaller individual link. Jaiden and Dr. Morrill portrait slots stay blank.

## Agent Build Instructions
1. Read this file and the rebuild plan. Use screenshot/CSS evidence, not recollection of the previous redesign.
2. Preserve original palette and content. Rebuild homepage structure and interactions; do not layer more overrides onto the current Apple stylesheet.
3. Build shared React page families and typed route/content data. Existing HTML is migration input, not a permanent `html-react-parser` runtime page layer.
4. Produce a reference-comparison prototype at 1440×900 and 390×844 before migrating all routes. Resolve font metrics and open-state evidence first.
5. Restore production hydration, actual React search/contact/Appwrite behavior, accessible dialogs, lesson anchors and copy feedback. Old helper tests alone do not establish these work in React.
6. Validate production output, not `file:///.../index.html`: that file is the old static input. Use Vite preview serving `dist` and put the correct preview in the app browser.
7. Match screenshot geometry and state behavior, document intentional EBS differences, and never mark an inferred value as measured or an untested interaction as passed.

## Rerun Inputs
```yaml
workflow: firecrawl-website-design-clone
source_url: https://www.instituteofhealth.com/
target_stack: React 19, TypeScript, Vite, Tailwind CSS 4, Motion
output: DESIGN.md
palette: original EBS crimson, white, charcoal, gray
mode: replan
```

# EBS website redesign plan — Astra

Date: 6 September 2026. Status: planning complete; implementation has not started under this plan.

This document replaces the design direction in `docs/redesign.md`, `docs/design-tokens.md`, and `docs/components.md` for the next redesign. Those files remain historical references until implementation updates them. Existing working-tree changes must be preserved. “Astra” means the `gpt-6-astra` model, not the Astro framework.

## UI overview

EBS should feel like a well-run student research programme: accessible, credible, and easy to join. The website must explain who can participate, what students will do, and how to begin. Its character comes from precise research content, real organizers, useful learning material, and the existing crimson identity. Typography and layout carry the hierarchy; color identifies actions and feedback.

The new composition uses a compact institutional header, a direct introduction, practical participation details, and page structures chosen for their content. Team profiles become a readable directory with modest portraits. Learning pages become clear articles with navigable contents. Registration becomes a short sequence of explicit choices. Generous spacing separates decisions and topics, while related information stays close together. Removing visual gimmicks is only a first check; the rendered pages must also feel composed, welcoming, and useful.

## 1. Product context

**Product:** Exeter Biology Symposium website, combining participation information, registration routes, and research learning resources.

**Users and jobs:**

| User | Main question | Next action |
|---|---|---|
| Middle or high school student | Can I join, and how do I start? | Register individually; then find the first guide |
| Teacher or administrator | What does participation cost and require? | Register your school |
| Researcher, judge, or volunteer | Where can I help, and what is expected? | Read role details and use the existing application route |
| Returning participant | Where is the lesson, deadline, or answer? | Use navigation, search, contents, or FAQ |

**Primary site action:** begin registration. The homepage uses “Register”; the schools page uses “Register your school.” A section has one dominant action, with secondary routes presented as links.

**Content constraints:**

- State eligibility as “all middle and high school students.” Preserve the accurate organizer affiliation without restricting eligibility to Exeter.
- Schools page begins with “100% Free.” Place the school action near the top and a smaller “Not a teacher/administrator? Register individually” link beside it.
- Preserve asynchronous participation, the existing 1–2 hours per week guidance, student support, transport responsibility, and online presentation information. Do not imply teacher supervision is required.
- Preserve confirmed event information. Keep provisional dates explicitly provisional; do not invent deadlines or availability.
- Preserve Jaiden and Dr. Morrill’s requested blank photo slots. Map other photographs only to confirmed identities. No generated headshots, invented endorsements, statistics, or institutional sponsorship claims.

## 2. Layout breakdown

### Shared frame

- Maximum content width: 1160px. Twelve-column desktop grid with 24px gutters; eight columns on tablet and four on mobile.
- Page padding: 32px desktop, 24px tablet, 20px mobile, reduced to 16px at 320px. Article text width: approximately 65 characters, never forced to fill the grid.
- Header: approximately 72px desktop and 64px mobile. Wordmark on the left; About, Research guides, Schedule, Team, FAQ, and Register in a stable sequence. Compact search and theme controls. Collapse before navigation overlaps, initially below 1024px.
- Footer: short organization context, contact and useful secondary links. No duplicate promotional block.
- Shared edges align wordmark, page title, main content, and footer. Desktop sidebars disappear into an accessible contents disclosure on mobile.

### Homepage (`index.html`), top to bottom

1. Shared header.
2. Direct title, “Exeter Biology Symposium,” with a concise explanation of the opportunity. Keep desktop title within roughly two lines; mobile wrapping must remain natural. “Register” is the dominant action; “Register your school” is secondary.
3. A compact definition list for eligibility, participation cost, format, and confirmed/provisional timing. No metric tiles.
4. “How to take part”: an ordered sequence grounded in the actual programme. Each step explains a real next action and points to relevant material.
5. A purposeful group photograph with an accurate caption and short organizer context. Size it to support the story; do not make visitors scroll through a huge image before finding practical information.
6. Selected research guides as an editorial list: title, useful description, and entry link.
7. Upcoming milestones, with explicit pending-date states, followed by the footer.

### Remaining routes

| Routes | Structure and hierarchy |
|---|---|
| `schools.html` | “100% Free” and eligibility → school registration → time, equipment, and support → transport/online details → practical questions |
| `team.html` | Short introduction → executive committee directory → other organizers → faculty advisors. Desktop profiles use two columns with 112px portraits and text alongside; mobile uses one column with 80px portraits. Blank slots remain blank at the same modest size. Names and roles precede expandable full biographies. No tall empty portrait panels. |
| `about.html` | Purpose → what participation involves → organizers and relevant history → registration link |
| `resources.html` | Guide introduction → recommended starting point → grouped guide index with meaningful descriptions |
| `datascience.html`, `python.html`, `rstudio.html` | Article title and prerequisites → contents → sequential lessons, examples, downloads, exercises, and answers. Preserve existing anchors and full teaching content. |
| `schedule.html` | Date/status introduction → semantic timetable or ordered schedule → practical attendance details. Pending dates remain visible text. |
| `register.html` | Registration introduction → clearly differentiated student, school, and volunteer routes → requirements and what happens next |
| `student-signup.html`, `volunteer-signup.html` | Requirements → existing form/application destination → privacy/context already required by the flow → genuine completion or failure feedback |
| `researchers.html`, `judges.html` | Role description → responsibilities and requirements → relevant application action |
| `faq.html` | Grouped, linkable questions → native disclosures → existing contact form with clear feedback |
| `opensource.html` | Explain the contribution destination → existing embed where useful → direct fallback link |

Each of the sixteen public URLs remains directly accessible. One page heading per route; section headings describe actual content. Do not impose homepage hero layouts on guides or forms.

## 3. Typography system

Use the existing **Source Sans 3**, with `system-ui, sans-serif` fallback. Its neutral, readable character already suits the programme; changing families will not fix weak hierarchy. Self-host only if a suitable licensed source is available. Validate both the loaded font and fallback.

| Role | Desktop | Mobile | Weight / line height |
|---|---|---|---|
| Homepage title | 56px | 36px | 600 / 1.08 |
| Standard page H1 | 40px | 32px | 600 / 1.15 |
| H2 | 28px | 24px | 600 / 1.25 |
| H3 / profile name | 20px | 20px | 600 / 1.3 |
| Introductory text | 20px | 18px | 400 / 1.5 |
| Article/body | 18px | 18px | 400 / 1.6 |
| Controls and navigation | 16px | 16px | 500 / 1.4 |
| Supporting text/captions | 14px | 14px | 400 / 1.5 |

Use 400, 500, and 600 consistently. Left-align prose. Keep headings closer to their following paragraphs than preceding sections. Use tabular numerals for times and numeric tables; monospace only for code. Underline inline links so color is not their only cue. Avoid decorative uppercase labels, stretched tracking, and arbitrary emphasis. Keep generous line spacing for educational reading even where a typography skill suggests denser defaults.

## 4. Color system

Retain the existing neutral/crimson identity and make roles explicit. These are proposed tokens; all actual foreground/background combinations must pass contrast checks before acceptance.

| Role | Light | Dark | Purpose |
|---|---|---|---|
| Background | `#FFFFFF` | `#151719` | Main canvas |
| Surface | `#F4F5F5` | `#202326` | Inputs, code, and grouped utility content |
| Main text | `#17191B` | `#F3F4F4` | Reading and headings |
| Secondary text | `#54595E` | `#B8BDC2` | Supporting copy; never essential instructions at low contrast |
| Primary action/link | `#9D2235` | `#EEA4AE` | Registration and interactive emphasis |
| Primary hover | `#7F192A` | `#F5BCC4` | Action feedback |
| Text on primary | `#FFFFFF` | `#151719` | Filled button labels |
| Divider | `#D9DDDF` | `#474D52` | Noninteractive separation |
| Control border | `#73797F` | `#92999F` | Discoverable input boundaries |
| Success | `#17663B` | `#83D6A0` | Confirmed completion, accompanied by text |
| Error | `#B42318` | `#FFB4AB` | Invalid field or failed request, accompanied by text |
| Focus | `#9D2235` | `#EEA4AE` | Visible keyboard outline with a contrasting offset |

Use accent sparingly: active links, focus, and primary actions. No tinted feature sections, color-coded audience cards, decorative gradients, or ambient glows. Feedback colors belong to actual states. Text contrast target: at least 4.5:1; meaningful controls and focus indicators: at least 3:1 against adjacent colors.

## 5. Component definitions

| Component | Definition |
|---|---|
| Primary button | Solid action color; 44px minimum height; 16px label; 16px horizontal padding; 6px radius. One dominant action per decision area. |
| Secondary action | Underlined text link for navigation; outlined button only for a real action of secondary priority. Do not render links as buttons without reason. |
| Icon button | 44×44px target, 18–20px monochrome icon, accessible name, clear hover and focus. Use Lucide for search, theme, menu, and functional disclosure indicators. |
| Field | Persistent label above input, optional help below, solid surface, visible border, minimum 44px control height, linked error message. Required/optional status expressed in text. |
| Content group | Plain aligned content by default. Use a bounded surface only when grouping helps interaction or interpretation; 8px maximum radius and no routine shadow. |
| Person profile | Modest portrait/blank slot, name, role, concise context, and biography disclosure. Consistent alignment with variable text height; no forced equal-height biographies. |
| Guide row | Descriptive title, brief learning purpose, relevant metadata only when verified, and an obvious link. No generic icon tiles. |
| Navigation | Semantic links with `aria-current`; visible mobile menu button; opening state and focus behavior communicated accessibly. |
| Disclosure | Native `details`/`summary` for FAQ, profiles, and mobile contents where appropriate. Preserve deep-link behavior. |
| Search | Existing search behavior in an accessible dialog, with query label, results, no-results state, Escape close, and focus restoration. |
| Form feedback | Adjacent explanatory message plus field associations; submit state prevents duplicates; success appears only after confirmed acceptance. |
| Schedule | Semantic table when column comparisons matter; readable ordered entries at narrow widths when information remains equivalent. |

Keep native semantics even when styling uses Tailwind. Component reuse includes shared tokens, consistent HTML contracts, and interaction code; it does not require mounting every piece of content in React.

## 6. Interaction notes

- Hover changes color, background, or border subtly. Active state slightly strengthens contrast. Never move or scale cards and buttons on hover.
- Use 120–180ms color/opacity transitions. Visible content appears immediately; no word-by-word entrance animation, scroll reveal requirement, parallax, or loading sequence for static content.
- Respect reduced motion. Motion is optional and must serve a demonstrated state change. The installed TextEffect component is not a requirement to animate the headline.
- Keyboard focus stays visible. Dialogs restore focus; menus expose expanded state. Check native control behavior before adding custom event handlers.
- Forms retain entered data after failure, explain the problem near the field or submit area, and offer retry. Loading labels describe the action. Mock success, validation failure, network failure, and repeated submission during testing; never submit real test applications.
- Appwrite updates only complete, valid sections and preserves static fallbacks on unavailable or malformed responses. Independent sections must not fail together unnecessarily.
- Search distinguishes initial, populated, no-results, and unavailable states. A clear no-results state offers navigation alternatives.
- Theme uses stored preference, then system preference, and remains functional when storage is blocked. Review all states in both themes.
- Essential content and registration destinations remain readable without JavaScript. Embedded external content gets a direct link fallback.

## 7. Spacing and rhythm

Use a single scale: **4, 8, 12, 16, 24, 32, 48, 64, 80px**.

- Label to field: 8px. Field to help/error: 8px. Field groups: 24px.
- Profile name to role: 4px. Related copy: 8–12px. Portrait to text: 20px, a documented component exception.
- Heading to content: 16px. Paragraphs: 16px. Subsections: 32px.
- Major page sections: 64px desktop, 48px mobile. Homepage introduction may use 80px desktop where the content warrants it.
- Prefer natural content height. Never reserve large empty rectangles solely to align missing photography or force sections to viewport height.
- Verify 200% zoom and long labels. Whitespace should reveal groups and decisions; it must not hide useful content below empty space.

## 8. Skills to use

These skill files are installed locally. Read the applicable skill fully at the phase where it is used; installation alone is not evidence of a completed review.

| Skill | Role in this redesign | Boundary |
|---|---|---|
| `design-taste-frontend` | Initial page composition and hierarchy; compare meaningful arrangements of real EBS content | Override novelty and animation defaults: variance 3, motion 2, density 4. The user's restraint brief wins. |
| `avoid-ai-design` | Review composition for generic patterns; demand content-specific reasons for layout choices | Audit prototypes and final pages, not merely class names or a banned-pattern score. |
| `no-slop-ui` | Keep surfaces, controls, colors, and motion restrained | Accessibility, real content, and this system override rigid stylistic rules. |
| `ui-typography` | Check reading measure, heading relationships, punctuation, alignment, and responsive text | Validate technical advice against actual HTML/React behavior; retain accessible link cues and article line spacing. |
| `design-audit` | Produce a prioritized visual/interaction review with concrete evidence | Do not treat a self-assigned score as user approval. |
| `unlazy` | Enforce complete route coverage, real checks, and explicit remaining work during implementation | Execution discipline, not a visual direction. |

Use the skills in sequence, not as competing simultaneous art directors. `design-intelligence` can support a focused unresolved design question; broad Bencium novelty-oriented skills should not dictate this restrained direction. Additional skill installation is unnecessary for this plan.

Local skill root: `/Users/adrianclasses/.agents/skills/`.

## 9. How Astra should create the website

### Current technical state

The repository contains sixteen static public HTML pages. Tailwind CSS, Motion, Lucide React, clsx, and tailwind-merge are declared in `package.json`. The class helper exists at `lib/utils.ts`; TextEffect exists at `components/motion-primitives/text-effect.tsx`. There is no configured React application build or TypeScript alias resolution. Merely installing these packages does not make the TSX component run.

The old design documents still describe a dependency-free site and Tailwind as documentation only. Production pages currently load generated Tailwind CSS alongside `css/style.css`. The next build must resolve these competing styling sources deliberately.

### Recommended build architecture

Keep semantic multipage HTML and the existing URLs. Add **Vite with TypeScript and small React islands** only for components that benefit from React. Keep articles, biographies, registration links, and primary navigation available in HTML. Vite supports multiple HTML entry points; React supports roots in selected parts of an existing page. This avoids making a content website depend on a client-side router. See the official [Vite multipage build guide](https://vite.dev/guide/build.html#multi-page-app) and [React createRoot guidance](https://react.dev/reference/react-dom/client/createRoot).

Use one Tailwind compilation path integrated with the build, following the [official Tailwind Vite setup](https://tailwindcss.com/docs/installation/using-vite). Declare React/ReactDOM and required build/type dependencies explicitly if React islands are used. Configure the `@/` alias consistently in TypeScript and Vite for the installed helper import. Type-check separately from bundling. Do not add Next.js, routing infrastructure, or a component library solely because a package was installed.

Keep existing behavior modules where sound. Never let React and existing DOM scripts own the same subtree. Mount optional controls in isolated containers; leave native disclosures native. For repeated HTML shell markup, first maintain one documented source/template and verify generated output; choose the smallest templating approach the repo can sustain.

### Ordered execution phases

1. **Baseline and content contract.** Astra records the dirty working tree and takes desktop/mobile screenshots of current home, team, schools, and a learning page. Inventory every route, anchor, form destination, asset identity, integration, and content constraint. Preserve existing work; no blanket reset. Run existing checks to record the baseline. Add behavior regression tests before changing affected behavior.
2. **Three representative prototypes.** Astra produces home, team, and one long learning page using real content, plus a schools introduction and shared component/state sheet. Keep prototypes separate from public routes. Compare only justified composition alternatives; settle on one coherent direction. Show 390px and 1440px views plus light/dark examples.
3. **Visual design gate.** Review those renders with `avoid-ai-design`, `no-slop-ui`, and `design-audit`. Check hierarchy, portrait proportions, reading measure, action prominence, and mobile order. Present concrete prototypes for user acceptance before propagating another site-wide design. Record unresolved feedback rather than declaring “no AI look” proven.
4. **Build foundation.** Configure Vite multipage output, Tailwind, TypeScript, aliases, and the optional React entry. Add appropriate ignores for dependencies and build output. Establish semantic tokens and shared primitives. Separate old CSS into an explicit temporary legacy boundary; remove it page by page as replacements become complete. Avoid stacking another override stylesheet on top.
5. **Roll out by page family.** Implement home and team first; then schools and registration; then guides; finally schedule, FAQ, about, researcher/judge pages, and open source. Preserve all sixteen URLs and anchors. For each family, verify its complete journey before moving on. Update old design documents to match the accepted implementation.
6. **Behavior and integration checks.** Run `npm test`; type-check React/TS code; build production output. Add focused tests for changed search, menu, theme, form, and Appwrite behavior. Check failed requests and retry paths with mocks. Verify output assets, downloads, direct links, metadata, and static fallbacks from the built site.
7. **Visual acceptance and handoff.** Inspect every route at 320, 390, 768, 1024, and 1440px in both themes. Check keyboard navigation, 200% zoom, reduced motion, font failure, no JavaScript, long text, and overflow. Record screenshots and actionable findings. Report which browser checks actually ran and which remain blocked. Fix failures, then provide the local preview and concise change report. Publishing remains a separate action.

### Acceptance criteria

- First mobile viewport explains the site and exposes the main next action.
- School eligibility and “100% Free” appear before secondary detail.
- Team profiles read as people with names and roles; missing photography does not dominate the page.
- Guide content, exercises, downloads, answer disclosures, and anchors survive intact.
- No broken URLs, clipped controls, horizontal page overflow, fabricated form success, or content loss when integrations fail.
- Shared component states and spacing remain consistent across all routes and both themes.
- Build and meaningful behavior checks pass. Visual review includes real screenshots and user acceptance; passing tests alone cannot establish visual quality.

### Astra implementation brief

> Use `gpt-6-astra` to implement `docs/website-plan-astra.md` in ordered phases. Begin with the existing worktree and content contracts. Read the named skills when their phase applies; this user-approved design brief overrides conflicting aesthetic defaults. Produce home, team, and guide prototypes plus the schools introduction before changing all public pages. Use real EBS content, preserve all sixteen URLs and requested blank photos, and show actual desktop/mobile renders. After prototype acceptance, build the shared system and migrate by page family. Verify behavior and the built site, document remaining limits honestly, and deliver a local preview. Do not publish as part of implementation.

## Design philosophy

Precision comes from making decisions legible: who can join, what happens next, who runs the programme, and where to learn. Reusable controls and aligned content reduce friction. Restrained crimson preserves identity without competing with reading. Modest photographs support people; useful prose supports trust. The website earns its character through EBS-specific information and deliberate composition, rather than decoration or generic component repetition.

## Stop boundary

This deliverable is the recreated plan only. No production code, new dependency installation, prototype implementation, or deployment is authorized by completing this planning step. Resume implementation only on the user's next instruction.

## GSTACK REVIEW REPORT

Reviewed 6 September 2026. Plan body remains unchanged by the review. Details and unabridged Codex output: [website-plan-review.md](website-plan-review.md). Source commit: `0d2412b`, with existing uncommitted changes preserved.

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope and strategy | 0 | Not run | Not assessed |
| Codex Review | `/codex` plan consult | Independent technical critique | 1 completed | FAIL | 5 findings: 3 P1, 2 P2; 0 fixed; eligibility concern disputed |
| Eng Review | `/plan-eng-review` | Architecture and tests | 0 | Not run | Required before full implementation |
| Design Review | `/design-review`, scoped to plan | UI/UX and generic-design risks | 1 | DONE_WITH_CONCERNS | 6 local findings; independent design voice used; no rendered-site grade |
| DX Review | `/plan-devex-review` | Developer experience | 0 | Not run | Not assessed |

**CODEX:** Identified external-form feedback, build output, and shared-template ownership as blocking plan gaps. Incorrect plan line references are corrected in the detailed report. No production fixes applied.

**VERDICT:** Suitable for prototype exploration after comparison criteria are clarified; full implementation is not cleared. Eng review required. Review completion is not user acceptance of the design.

**UNRESOLVED DECISIONS:**
- Map registration labels to exact destinations and remove repeated audience selection.
- Define baseline/proposed composition comparisons and prototype acceptance criteria.
- Specify mobile navigation, guide contents, and code/table/answer behavior at narrow widths.
- Identify any component requiring React and choose one shared-markup source/generation step.
- Define build output, asset handling, and validation against the generated site.
- Separate external registration handoff from locally controlled contact-form feedback.
- Make existing Appwrite fallback cases explicit and verify rendered fallback visibility.

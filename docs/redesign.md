# EBS website redesign

## Intent and direction

Rebuild all sixteen existing public HTML pages as a contemporary educational institution website for middle and high school students, educators, and research volunteers. The main job is to explain the symposium and make participation straightforward. Preserve static HTML/CSS/JavaScript, routes, meaningful anchors, educational content, application destinations, team facts, analytics, and external integrations.

Reading this as an educational event and learning resource for students and educators, with a clear, welcoming institutional language. Native HTML and CSS; design variance 3, motion intensity 2, density 5. Existing crimson identity and Source Sans 3 remain. No added runtime dependencies. Taste-skill's framework, motion, stock-image, and multi-font defaults yield to the approved brief.

The signature is the actual group photograph at the Broad Institute, presented without decorative overlays, paired with a concise invitation to student research. Photography establishes people and place; the writing explains the opportunity. Do not imply Broad Institute sponsorship or that the visit photograph depicts the symposium.

## Structure

- Header: EBS wordmark, About, Research guides, Schedule, Team, FAQ, Register; compact search and theme controls. Single line above 1024px, accessible menu below.
- Homepage: event name and purpose, student/school registration actions, provisional timing and location; full-width authentic photograph; participation routes; provisional timeline; learning resource links. At 390×844, identity, purpose, and registration appear before photograph.
- Schools: “100% Free” first, school registration primary, individual registration smaller. Practical eligibility, equipment, time, support, and participation details. No teacher-supervision requirement. Preserve 1–2 hours/week guidance and asynchronous learning.
- Learning: title and description, desktop contents sidebar, narrow readable article; mobile contents disclosure. Lessons, datasets, downloads, exercises, answers, and anchors survive.
- About/audience/registration: short introductions followed by prose and practical lists. Team uses actual portraits and expandable biographies, with requested blanks preserved. Schedule uses a real timetable. FAQ uses native disclosure elements.

## Components and behavior

Use docs/design-tokens.md and docs/components.md. Remove generic icon tiles, repetitive boxed feature rows, oversized origin-story headline, serif headings, colored border accents, scroll reveals, decorative labels, shadows, and gradients. Use links for navigation and buttons for actions. Consistent visible focus, keyboard operation, hover/active/disabled states, minimum 44px control targets, no photo text overlays.

One FAQ contact form retains Web3Forms with native validation and no fabricated success. Appwrite sections update independently only for complete valid data, retaining static fallbacks otherwise. Search uses native dialog and existing page-ranking behavior. Theme honors stored preference then OS, tolerating blocked storage. Existing Open Source iframe retains a direct fallback link.

## Validation and release

Prototype covers homepage, schools, and curriculum and must pass designer/design-critic review before production rollout. Check all sixteen pages in light/dark at 320, 390, 768, 1024, and 1440px; keyboard, 200% zoom, reduced motion, font failure, and no-JavaScript reading. Test form failures and retries using mocks, Appwrite fallback, search, fragments, theme persistence, and route/anchor integrity. No live form test submissions. Date copy and metadata say “April 24th, 2027.” Local review only; publishing separate.

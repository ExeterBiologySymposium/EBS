# EBS SEO refresh — 2026-10-31

Status: approved by the user in chat on 2026-10-31; implemented and verified locally.

## Outcome and scope

Refresh sitemap.xml, robots.txt, SEO terms, and metadata for every existing route using seo.config.json and scripts/update-seo.mjs. Use https://exeterbiosymposium.vercel.app as the canonical origin. Retain the exact Google verification token supplied in this chat across regeneration and production builds. Update the site's search descriptions to reflect the same current content. This change concerns metadata and discovery files, with no new screens, layout, registration behavior, authentication changes, deployment, or public announcement.

## Owning sources and findings

- seo.config.json owns all 20 route heads; scripts/update-seo.mjs currently overwrites index.html and loses its manually added verification tag.
- src/access-policy.ts identifies six member pages: resources, datascience, python, rstudio, opensource, and events. Account is also unsuitable for search indexing. Five learning pages are currently incorrectly included in sitemap.xml.
- src/pages/datascience.tsx, python.tsx, and rstudio.tsx now say coding lessons are coming soon. Their current metadata still advertises available lessons.
- src/pages/resources.tsx contains example posters and says research guides and tools are coming soon.
- Public page content supports free participation, middle and high school eligibility, no required prior research experience, dry-lab research, individual or teams of up to three, school/student/judge applications, adult chaperones, and the three research checkpoints.
- The symposium date is April 25, 2027. The schedule and venue details remain provisional. Do not imply final arrangements.
- Existing excludedTerms remain excluded. Existing unrelated local edits and deletions remain untouched.

## Acceptance criteria

1. All 20 routes have unique accurate titles, descriptions, canonical URLs, matching Open Graph/Twitter metadata, and parseable WebPage JSON-LD. Homepage canonical remains the origin with a trailing slash.
2. Store Google verification centrally; emit exactly one homepage verification meta tag with content `2Z5fl97yNeITcjZHCFydWygaEzeAIWNtDmKmB74A_E0`. It survives repeated generation and prerendering.
3. The sitemap contains exactly the 13 current public indexable routes: index, about, team, schedule, schools, researchers, judges, student-signup, register, faq, contact, terms, privacy. No account/member routes, fragments, duplicate URLs, or noncanonical origins.
4. Account and all six member-page heads use noindex. Their metadata is generic and accurate, without restricted event details or promises of available coding lessons.
5. robots.txt advertises the canonical sitemap and allows public pages and rendering assets. Disallow crawling /api/, /protected-assets/, /guides/, and /enzyme_activity.csv. Leave noindex HTML pages crawlable so robots rules do not prevent reading their noindex tags. Existing server authorization remains responsible for access control.
6. Use explicit, valid per-page modification dates in the configuration. Set refreshed pages to 2026-10-31; future updater/check runs must not advance dates solely because the clock changed.
7. Refresh every page's metadata using the content direction below. Keep existing relevant allowed terms and add the targeted terms below, without adding a meta-keywords tag or repetitive visible copy. Terms for future coding lessons may remain on their noindex pages only.
8. Align all 20 src/search-data.json entries with current page content while retaining access filtering in the existing site component. Labels remain useful to visitors; no private event details enter this public index.
9. SEO generation is repeatable, and --check validates outputs without modifying them. Typecheck, production build, focused generator regression tests, and generated artifact inspection pass.

## Metadata and term direction by route

| Route | Proposed title | Description/content direction | New targeted terms |
| --- | --- | --- | --- |
| index | Exeter Biology Symposium 2027 — Free Student Research | Free dry-lab biology program and poster symposium for middle/high school students; April 25, Exeter and online. | free dry-lab biology research program for students |
| about | About EBS — Beginner Biology Research at Phillips Exeter | Student organizers, beginner-accessible dry-lab research, program format, and research preparation. | beginner biology research symposium |
| team | EBS Team — Exeter Genetics and Biotechnology Club | Student organizing team and faculty guidance; current leadership. | Exeter Biology Symposium organizing team |
| schedule | EBS 2027 Schedule — April 25, Exeter and Online | Provisional Eastern Time schedule, keynote, poster sessions, judging and closing ceremony. | Exeter Biology Symposium 2027 schedule |
| schools | School Registration — Free Biology Research with EBS | School applications, free participation, student projects, and in-person/online options. | Exeter Biology Symposium school application |
| researchers | Student Research Projects and Deadlines — EBS 2027 | Dry-lab project areas, teams up to three, research checkpoints, abstracts/code, final posters. | EBS research checkpoints; Exeter Biology Symposium poster submission deadlines |
| judges | Judge Student Biology Research — EBS 2027 | Judge applications, qualifications, poster evaluation and feedback; in person or online. | Exeter Biology Symposium judge application |
| student-signup | Student Application — Exeter Biology Symposium 2027 | Free individual student applications; account sign-in, Google Form, teams up to three, presentation options. | Exeter Biology Symposium student application |
| register | Apply to Exeter Biology Symposium — Students, Schools, Judges | Choose participation role, sign in, complete Google Form; application and approval are distinct. | Exeter Biology Symposium applications |
| faq | EBS FAQ — Eligibility, Applications and Poster Presentations | Eligibility, costs, account approval, adult chaperones, online attendance, research and submission expectations. | Exeter Biology Symposium adult chaperone requirements; Exeter Biology Symposium account approval |
| contact | Contact the Exeter Biology Symposium Team | Participation, research, applications, account access, and event questions. | Exeter Biology Symposium contact |
| terms | Terms of Use — Exeter Biology Symposium | Participation, supervision, research integrity and ownership, account and research-tool terms. | EBS research ownership |
| privacy | Privacy Notice — Exeter Biology Symposium | Account/application data, messages, research folders, hosting and analytics. | Exeter Biology Symposium privacy notice |
| account | Your Account and Approval Status — EBS | Sign in to manage EBS account and approval; noindex. | None |
| events | Member Events — Exeter Biology Symposium | Sign in with an accepted account to view member events; noindex, no event details. | None |
| resources | Member Research Resources and Example Posters — EBS | Accepted-member example posters; guides and tools coming soon; noindex. | None |
| datascience | Coding Lessons Coming Soon — EBS | Coding curriculum is coming soon for accepted members; noindex. | None |
| python | Python Lessons Coming Soon — EBS | Python coding lessons coming soon; accepted-member area; noindex. | None |
| rstudio | RStudio Lessons Coming Soon — EBS | RStudio coding lessons coming soon; accepted-member area; noindex. | None |
| opensource | Member Open Source Resources — EBS | Accepted-member links to community datasets, code and curriculum materials; noindex. | None |

Descriptions will use concise natural prose rather than concatenate keyword phrases. New terms are content-based targets, not claims of measured search volume or rankings.

## Design decisions

No visible UI redesign is required. Preserve current component and navigation structure. Search labels/descriptions are the only visitor-facing copy in scope beyond document titles and sharing previews. Do not add new dependencies, tracking, or unsupported structured-data claims.

## Verification and limitations

- Before generator behavior changes, add focused Node built-in tests using disposable fixtures and confirm the relevant failures: retained verification, correct indexability/sitemap membership, fixed modification dates, --check safety and repeatability.
- Inspect source and built heads for the exact verification token, valid JSON-LD, canonical consistency, robots metadata, supported descriptions and no duplicate titles.
- Parse sitemap XML; compare its URL set against expected public routes and verify robots references the same canonical sitemap.
- Run generator, --check, focused tests, npm run build, and git diff --check for changed files. Confirm the build ships identical sitemap and robots artifacts.
- No claim of production deployment, Search Console ownership confirmation, ranking improvement, or live authenticated behavior is made by local checks.

## Primary references

- Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap — canonical sitemap URLs and truthful modification dates.
- Google: https://developers.google.com/search/docs/crawling-indexing/block-indexing — noindex pages must remain crawlable to read the directive.
- Google: https://developers.google.com/search/docs/crawling-indexing/special-tags — meta-keywords does not affect Google indexing/ranking.
- Google: https://support.google.com/webmasters/answer/9008080 — retain the ownership verification tag.

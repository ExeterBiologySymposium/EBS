# EBS Terms of Use and Privacy Notice

Status: approved by the user on October 31, 2026; local acceptance checks completed. Evidence: `docs/reviews/legal-pages/report.md`. Publication and institutional review remain separate.

## Requested outcome

Rewrite the supplied Academy Terms of Use and Privacy Notice for EBS and add two separate, publicly accessible website pages. Both pages describe EBS's free, student-run dry-lab biology research program and its actual website features.

## Concrete copy for review

- [Terms of Use](terms-of-use-copy.md), proposed `/terms.html`.
- [Privacy Notice](privacy-notice-copy.md), proposed `/privacy.html`.

The draft labels and proposed-route notes belong to these review artifacts only. The implemented pages will contain the approved substantive copy and last-updated date.

## Accepted behavior proposed for approval

1. Both pages are public, work on direct loads and site navigation, and require no account.
2. The shared footer links to both local pages. The Privacy Notice retains the user's requested link to `https://exeter.edu/privacy-notice/` as Academy-wide context. The two EBS pages also link to one another and Contact.
3. Reuse the existing article layout, tokens, heading styles, responsive contents navigation, header, and footer. No dependency or backend changes.
4. Terms explain educational purpose, account approval, respectful use, research integrity, ownership and limited submission permission, open licenses, third-party tools, current chaperone policy, and educational limitations.
5. Privacy describes accounts, forms, messages, hosting/measurement, research folders, sharing, retention limitations, requests, younger students, and provider links. Folder features are described conditionally because local code exists but live configuration is unverified.
6. Proposed age policy, adapted from the supplied text: direct accounts and personal-information form submissions are 13+, users 13–15 need parent/guardian supervision, and parents/guardians contact the team before arranging younger participation. This does not change middle/high school program eligibility or claim an implemented age-verification/parental-consent system.
7. No SMS subscriptions, tuition, admissions processing, donor profiling, ad networks, routine backups, fixed deletion deadlines, statutory certification, or Academy contract commitments are invented. No blanket commercial license to student research, blanket media release, arbitrary $100 damages cap, or one-year claim deadline.
8. The proposed statement against selling participant data or building advertising profiles is an operating commitment requiring approval, not a conclusion proved by a code review. The inspected repository has no EBS advertising integration; offline practices are not independently verified.

## Acceptance and verification

- Each page has unique metadata, one h1, dated copy, ordered section headings, a labeled contents navigation, and working anchor targets.
- Footer links work across all routes, including signed-out/unavailable-auth states; no restricted content leaks into public pages.
- Register pages in route maps, build inputs, prerender list, search index, SEO configuration and sitemap.
- First extend the existing navigation test to cover these routes, run it to confirm failure, then implement routing and rerun. Prose itself needs structural review rather than artificial unit tests.
- Run navigation/contact checks, production build/typecheck, built brand/link checks and access-build separation checks. Inspect both routes at desktop and mobile widths, including footer wrapping and same-page anchors.
- Review final text against the approved drafts and data-flow inventory.

## Review and authorization boundaries

This is proposed website policy copy, not a finding that the program or providers satisfy every legal requirement. The student team is not asserted to be a separate incorporated entity or authorized to bind the Academy. An authorized Academy/program reviewer should confirm legal responsibility, the age/consent process, actual retention and sharing practices, and institutional applicability before publication. The site code has no verified parental-consent workflow, so the text must not imply one exists.

Approval covers local implementation and checks. Publishing/deployment, live provider changes, consent/age-gate implementation, and changes to existing program eligibility are outside this plan. Preserve the extensive pre-existing local work.

## Evidence and sources

Repository: `src/site.tsx`, `src/main.tsx`, `src/clerk-provider.tsx`, `src/page-controls.tsx`, `src/research-folder.tsx`, `src/pages/about.tsx`, `src/pages/faq.tsx`, `src/pages/schools.tsx`, `server/clerk.ts`, `server/participant-folders.ts`, `server/drive/`, `docs/member-access.md`, and `docs/participant-folders.md`.

Source texts: the two user attachments. Checked against [Academy Terms](https://exeter.edu/terms-of-use/) and the [Academy Privacy Notice](https://exeter.edu/privacy-notice/). Provider sources are linked in the privacy copy. [FTC children's privacy guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions) identifies the need to review applicable child-data rules; no compliance determination is made from boilerplate or age language alone.

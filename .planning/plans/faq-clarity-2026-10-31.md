# FAQ clarity implementation plan

Status: approved by the user in chat on 2026-10-31; implemented and verified locally.
Specification: ../specs/faq-clarity-2026-10-31.md
Design: ../design/screens/faq-clarity-2026-10-31.md

1. Record the current 43-question FAQ's answer-word count and destination/anchor inventory. Preserve existing local changes. Add a small acceptance check using installed Vite/React server-render tooling and Node assertions for Pending, Accepted, signed-out, checking, and unavailable guidance; confirm relevant failures before introducing the help.
2. Rewrite the public FAQ to the 12 approved questions and three sections. Keep decision-critical policies public and preserve contact functionality. Add compact Account/Schools/Judges destination links and useful old-anchor pointers.
3. Add three concise Pending questions and seven Accepted participant questions using existing account-state conditions. Keep Accepted content within `accepted-account.tsx` and its protected dependency chain. Preserve live folder controls and existing Account actions.
4. Consolidate Schools to five role-specific questions and add three Judges questions. Trim duplicated role-page prose where those answers now live. Shorten the homepage registration FAQ so it points readers to their route instead of embedding school instructions.
5. Align affected search descriptions and FAQ metadata only where content has changed. If metadata changes, update its canonical configuration, regenerate via the existing script, and verify unrelated generated content remains stable.
6. Run focused state checks, production build/typecheck, emitted-HTML word-count/question-count/link/anchor checks, and protected-output checks. Inspect desktop and mobile disclosure use in a local preview where available. Review against every acceptance criterion, repair in-scope findings, and report evidence and limitations.

Approval covers the above local implementation, validation, and self-review once. Deployment, publishing, commits, PRs, and external messages are separate actions unless explicitly authorized later.


## Completion evidence

- Public FAQ reduced from 43 questions / 2,544 answer words to 12 questions / 391 answer words: 85% less answer text. Baseline recorded before implementation in `../specs/faq-baseline-2026-10-31.json`.
- Added three Pending questions and seven Accepted participant questions; Schools has five focused questions and Judges has three. Rewrote homepage registration summary and corrected resource/coding availability claims.
- `node scripts/check-faq-clarity.mjs` first failed on missing Pending guidance, then passed after implementation. It renders signed-out, loading, Pending (including null access), checking, unavailable, and Accepted states with the existing AuthContext; verifies application access, correct contextual help, no restricted Pending actions, and question/word-count limits.
- `npm run build` passed, including TypeScript, client build, and server prerendering. Accepted participant help remains exclusively in protected JavaScript assets, absent from all public HTML and public JavaScript.
- Built-HTML checks passed for unique IDs and local page/fragment links across FAQ, Schools, Judges, Account, and Home. The FAQ contact form and #contact anchor remain intact.
- `node scripts/update-seo.mjs --check` and all 12 existing SEO regression tests passed. Updated FAQ, Account, and Schools descriptions and associated search entries. Generator preserved all unrelated route heads, sitemap, robots, and verification metadata byte for byte.
- Browser preview: FAQ at 1280px and 375px had no horizontal overflow; native disclosures worked with Enter. The orientation fragment opened and focused its answer. Schools and Judges at 375px had no horizontal overflow, correct five/three question counts, and working keyboard disclosures. Browser checks used the in-app browser after the standalone Playwright tool reported Chrome unavailable; no browser software was installed.
- Self-review checked confirmed policies, resource availability, folder button labels, submission checkpoints, and guest uncertainty. No remaining in-scope findings. Task diff whitespace checks passed; unrelated existing changes and deleted suites were preserved.
- Live signed-in identities, application submission, Drive operations, and contact submission were not exercised. Account visibility is verified with rendered state tests; those tests do not claim live authentication or server authorization verification. No deployment, commit, PR, or external message was performed.

## Maintenance

Run `node scripts/check-faq-clarity.mjs` after changing contextual account help. The baseline file documents the pre-rewrite FAQ; do not regenerate it to mask a failed size check. Keep availability wording in sync with Resources and Coding. The existing `npm run build` remains the production/typecheck gate.

## Program-description follow-up — 2026-10-31

- At the user's request, added the two-part program description across FAQ, About, Student Research, Schools, and Accepted Account help. The main FAQ remains at 12 questions / 415 answer words (84% below its original baseline).
- Described the year-long research document written by experienced high school researchers, exercises for different ability levels, shared Google folder, regular progress checks and study refinements, ongoing email support, and regular office hours.
- Updated all third-checkpoint descriptions to first poster draft while retaining April 9, 2027. The second checkpoint requests the research abstract and all code or exported workflows. Added detailed written feedback by all four co-heads at every checkpoint.
- Added the user-supplied national outreach and more-than-seven-countries participation description to About and Student Research. Clarified the full-day April 25, 2027 event with keynote and two poster sessions and linked the existing Schedule page. Its supplied public URL was checked and agrees with the local schedule.
- Refreshed the research-page search/SEO description to remove the old final-poster checkpoint wording. Unrelated generated heads and discovery files remained unchanged.
- Verification: production build/typecheck, account-state/FAQ checks, all 12 SEO regression tests, generator freshness, built-HTML content/link/ID checks, and diff whitespace checks passed. No layout, authentication, Drive behavior, deployment, or external messages changed. The research document's contents and live account/Drive flows were not independently exercised.

# EBS SEO refresh implementation plan — 2026-10-31

Status: approved by the user in chat on 2026-10-31; implemented and verified locally.
Specification: ../specs/seo-refresh-2026-10-31.md

1. Add focused regression tests for generator behavior using Node's installed built-in test runner and temporary fixtures. Confirm failures for lost verification, incorrect protected-page sitemap inclusion, and date/check drift. Do not restore removed unrelated test suites.
2. Update seo.config.json: central Google verification token, explicit page modification dates, all 20 page titles/descriptions, protected-page noindex policy, supported new terms and assignments. Preserve excludedTerms.
3. Update scripts/update-seo.mjs: include escaped verification metadata; validate configuration/dates; generate the agreed robots rules and public-only sitemap using configured page dates; preserve safe nonwriting --check behavior. Keep existing dependency-free generation pattern.
4. Regenerate all route heads, sitemap.xml, robots.txt. Refresh all existing src/search-data.json entries to current content and access-neutral labels; preserve route set and access filtering.
5. Run focused tests, updater --check and production build. Inspect emitted heads, JSON-LD, XML, canonical consistency, noindex policy, source/built discovery-file equality, and verification persistence. Run git diff --check and inspect the task diff for unrelated changes.
6. Perform a self-review against the specification and fix in-scope findings. Report changes and evidence, with production deployment and Google Search Console submission left as separate authorized operations.

Affected files: seo.config.json; scripts/update-seo.mjs; a new focused scripts/update-seo.test.mjs; existing 20 root route HTML files; sitemap.xml; robots.txt; src/search-data.json. No dependency changes or UI layouts.

## Completion evidence

- All six implementation steps completed; self-review found no remaining in-scope issues.
- Updated all 20 route heads and all 20 site-search entries. Added 15 targeted terms, for 87 unique selected terms; preserved all six excluded terms.
- The sitemap now contains exactly 13 public canonical URLs. Account and all six member routes are noindex and absent from the sitemap.
- Regression tests first reproduced the old failures; final `node --test scripts/update-seo.test.mjs`: 12 passed, 0 failed.
- `npm run seo:update` and `node scripts/update-seo.mjs --check` passed. Checks use configured lastmod dates rather than the wall clock.
- `npm run build` passed, including TypeScript checking, client build and server prerendering.
- HTML parsing of source and built output confirmed all 20 titles/descriptions are unique, canonical/social metadata agrees, JSON-LD parses and uses the configured modification date, and exactly one correct Google verification tag exists in the homepage head.
- XML parsing confirmed the exact 13-URL sitemap membership. Built sitemap.xml and robots.txt are byte-identical to source. Restricted event details remain absent from public route HTML.
- Task-scoped `git diff --check` passed. Existing unrelated local changes and deletions were preserved. No dependencies changed.
- Deployment and Search Console ownership/sitemap submission were not performed.

## Maintenance

Edit seo.config.json for metadata/term changes and update each changed page's explicit lastmod only when its content or metadata changes. Run `npm run seo:update`, `node scripts/update-seo.mjs --check`, and `node --test scripts/update-seo.test.mjs`. Keep src/search-data.json descriptions aligned when page content changes. The ownership token is maintained centrally in googleSiteVerification.

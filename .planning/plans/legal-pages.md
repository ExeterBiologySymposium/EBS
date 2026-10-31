# Legal pages implementation plan

Status: combined plan, specification, design, and copy drafts approved by the user on October 31, 2026; local implementation, verification, and self-review completed. See `docs/reviews/legal-pages/report.md`. No deployment performed.

## 1. Confirm scope and protect existing work

Use `.planning/specs/legal-pages.md` and its linked drafts as the acceptance baseline. Recheck working-tree state immediately before edits. Modify only the required lines in shared files; do not revert or reformat unrelated changes.

## 2. Protect route behavior first

Extend `scripts/check-navigation.mjs` to assert `/terms.html` and `/privacy.html` are recognized, including links with section fragments, and retain external-link/native-anchor behavior. Run the test and record the expected failure before implementing routes.

## 3. Build the pages

Add `src/pages/terms.tsx` and `src/pages/privacy.tsx` using existing article/contents styles. A small shared `src/legal-page.tsx` may hold the static title, date, contents, and numbered section layout to avoid duplicated markup. Keep content in the two page modules with semantic paragraphs/lists and ordinary anchors; do not add a markdown runtime or unsafe HTML rendering.

Add `terms.html` and `privacy.html` to `src/page-routes.tsx`, `src/navigation.ts`, `vite.config.ts`, and `scripts/prerender.mjs`. Add SEO entries with empty keyword lists, generate normal HTML shells via the existing SEO script, update the sitemap, and add search-index records.

Update the shared footer in `src/site.tsx` to link to both local pages. Keep the Academy privacy URL within the EBS Privacy Notice. Add narrowly scoped CSS only if the existing article and footer styles need it for reading width, wrapping, or mobile layout. Preserve existing 16px minimum type and 44px link targets.

## 4. Verify and review

Run the changed navigation test, existing contact check, `npm run build`, `node scripts/check-brand.mjs --built`, and `npm run test:access-build`. Use a reproducible built-output structural check for metadata, links, section targets, public rendering, contents labels, copy presence, and exactly one h1 across the new routes. Check the new links in all generated footers.

Use the installed browser tooling for direct visits and footer navigation at desktop and mobile widths. Check content layout, horizontal overflow, anchors, cross-links, back/forward navigation, and console errors. Take local screenshots if useful. Review wording against the approved drafts and inspect the final diff for accidental unrelated changes.

## 5. Report

Report the two local routes, major content decisions, check results, and limitations. State that no publication, deployment, live-provider changes, or legal approval occurred. No further planning permission is needed unless scope or policy changes materially.

## Affected areas

New: two page modules, two HTML entry files, optional shared static legal-page layout. Existing: public routing, navigation tests, Vite inputs, prerender route list, SEO config/generated discovery files, search index, shared footer, and narrowly scoped styles if needed.

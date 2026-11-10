# Website content editor implementation plan

Status: implemented and verified locally on November 10, 2026, together with the [specification](../specs/website-content-editor-2026-11-10.md) and [screen design](../design/screens/website-content-editor-2026-11-10.md). No live migration, configuration, content publication or deployment has been performed.

## 1. Establish the current baseline

- Recheck working-tree changes before editing. Preserve concurrent copy work, particularly the Student research wet-lab eligibility change and generated SEO changes.
- Capture the current rendered text, links, image attributes and meaningful layout structures for the five pages as migration acceptance fixtures. Do not seed from an old commit.
- Run relevant existing checks and record any pre-existing failures separately. No database connection values are printed.

## 2. Specify failing acceptance tests, then content contracts

- Use the repository's Node test runner and Vite SSR module-loading pattern. First add focused tests for public/protected reads, Team-only draft/publish actions, revoked access, draft isolation, input validation, save/publish semantics, stale revisions and history restoration. Run them to demonstrate the missing behavior.
- Add shared typed content contracts/validation and page metadata with exactly five allowlisted page keys. Use page-specific Student research fields and structured section types for Resources/Coding. Keep protected initial content out of public imports.
- Add reader-rendering acceptance tests for text/code escaping, URL validation, all current content and auth-aware links before replacing page implementations.

## 3. Implement private persistence and content API

Likely files: `server/content/{types,store,service,handlers,runtime}.ts`, `api/page-content.ts`, `scripts/sql/page-content.sql`, and focused `scripts/content-*.test.mjs` files. Final module boundaries may be smaller where that keeps dependencies clearer.

- Prepare an additive migration for current draft/publication and immutable published-version records, scoped by verified instance and page key. Revoke public table access.
- Reuse the existing server database connection configuration and Neon driver. Keep Team authorization consistent with `organizationRuntime().service.isTeam()` and protected reader authorization with `clerkAccess`.
- Implement read, draft save, publish, history and restore-to-draft operations. Use conditional SQL to reject stale revisions; publication plus history is atomic. Expose bounded, sanitized errors and private/no-store responses.
- Test migration constraints, initial inserts, concurrent edits, cross-instance separation and atomic history against the existing optional PGlite runtime or isolated PostgreSQL. A skipped SQL suite is an unresolved verification item, not a pass.
- Prepare explicit setup/seed operations that cannot overwrite existing publications. Default setup reporting is read-only. Validate the migration on an isolated Neon branch before any later authorized Production application; do not change the shared local environment to point at a different database silently.

## 4. Integrate published content into reader pages

Likely files: the five `src/pages/` components, `src/content/` contracts/renderers/loading helpers, `vite.config.ts`, and `src/pages/accepted-account.tsx`.

- Extract latest content into validated defaults and replace hardcoded field values with shared renderers while preserving the page layouts.
- Add authorized runtime loading, cancellation on navigation/account changes, visible retry states and focus/reload refresh. Distinguish absent publication from read failure.
- Preserve the public Student research prerender baseline and document its build-time HTML limitation. Keep member content/defaults in protected chunks or server-only storage, including after code splitting.
- Preserve registration and learning-link behavior. Use evergreen Account guidance that links to editable pages rather than repeating checkpoint dates or fixed coming-soon promises.

## 5. Build the Team editor

Likely files: `src/pages/admin.tsx`, `src/pages/account.tsx`, `src/content-editor.tsx` or a small content-editor module group, `src/content-api.ts`, `src/styles.css`, and targeted navigation handling if needed.

- Add the content view to the existing admin route and Team-only entry links. Preserve participant management, native Team settings and hash handling.
- Build labelled fields, repeatable-entry controls, page selection, preview, save/publish and version history using current components and tokens.
- Protect unsaved changes across selection, reload and the site's intercepted link/history navigation. Implement recoverable errors/conflicts and revocation handling without stale responses repainting another page or account.
- Add a localhost-only fixture with fake auth/storage, analogous to the current org-admin fixture, for browser verification. It must not contact live Clerk or modify Production content.

## 6. Keep discovery and supporting copy consistent

Likely files: `seo.config.json`, relevant generated HTML/search data, `scripts/update-seo.test.mjs`, `scripts/check-faq-clarity.mjs`, and `docs/website-content.md`.

- Replace fixed coming-soon route/search descriptions with evergreen descriptions that remain true before and after a lesson is published. Keep private routes noindex and excluded from the sitemap. Preserve unrelated concurrent SEO edits.
- Change existing tests only where their old assertions intentionally conflict with the approved new behavior; keep equivalent checks for access, truthful copy and generated metadata.
- Write Team instructions for editing/publishing/restoring, supported image links, and page audience. Write operator instructions for additive migration, initial content, configuration, failure handling and deployment validation.

## 7. Verify, review and prepare delivery

Run the new focused content tests plus the relevant repository checks:

```sh
npm run test:org-admin
npm run typecheck
npm run build
node --test scripts/update-seo.test.mjs
node scripts/update-seo.mjs --check
node scripts/check-faq-clarity.mjs
git diff --check
```

Browser checks: all five page editors; draft save/reopen; draft preview; publication reflected in reader view; restoration; two-tab edit conflict; denied and revoked access; network failure; unsaved navigation; keyboard add/reorder; desktop and mobile layouts; participant admin and Team-settings regression. Inspect built public HTML/JS and API responses for protected-content/draft leakage.

Review the scoped diff against each acceptance criterion and fix introduced failures. Report actual evidence and remaining limitations. This is an implementation review by the executing agent; do not claim an independent reviewer unless one was actually requested and used.

Local delivery is the verified code, migration and usage/setup documentation. A live migration, real content publication, live permission test or deployment follows only under explicit release authorization. Successful local verification alone does not mean the feature is available on the deployed website.

## Completed verification

- Content suite (`npm run test:content`): 9 tests, including the PostgreSQL schema test on the optional PGlite runtime (revision races, atomic publication history, append-only versions, constraints, cross-instance isolation, end-to-end API restoration). Without PGlite the SQL test reports an explicit skip.
- `npm run test:org-admin` (28 tests, no skips with PGlite), `npm run typecheck`, `npm run build` (bundle, separation checks and prerender), 12 SEO tests, `node scripts/update-seo.mjs --check`, `node scripts/check-faq-clarity.mjs` and `git diff --check` pass.
- The new Student research and Resources readers were rendered server-side and diffed against the original components: identical markup apart from the intended case-by-case wet-lab copy (and one neutral wrapper on Resources).
- Built output inspected: member page content, drafts and server modules are absent from public JavaScript and prerendered HTML; a build guard now fails if server modules are bundled for the browser (verified by a deliberate violation).
- Fake-provider browser checks (`node scripts/content-browser-fixture.mjs`): editing all five pages, add/move/remove with focus and Undo, validation summary, linked phrases, image picker, save/preview/publish reflected on a fresh read, history and restoration, two-editor conflict, lost save and publish responses reconciled, unsaved-change prompts (links, page switch, Back), revoked Team access, Team-but-not-Accepted, anonymous visitors, admin workspace Back/Forward, and desktop/mobile layouts.
- Not verified: live Clerk, the hosted Neon database, Vercel routing and real publication. These need the release steps in `docs/website-content.md`.

# Website editing for all pages implementation plan

Status: approved for local implementation on November 14, 2026. See the [specification](../specs/website-content-all-pages-2026-11-14.md) and [editor design](../design/screens/website-content-all-pages-2026-11-14.md).

## 1. Establish the baseline and add tests

- Compare the root HTML route list, Vite inputs, prerender routes, page registry and protected paths. Record current reader markup, access and interactive behavior using the working tree. Preserve the eight existing modified files and respect their current contents during extraction.
- Add focused failing checks for the complete editor route list, authorization by audience, new and upgraded SQL constraints, and the new page fields reaching the actual reader layout. Reuse the existing content test harness, browser fixture, and cohorts and datasets tests.

## 2. Extend the existing content system

- Extend `src/content/model.ts` and `server/content/` with the page registry, typed per-page defaults and validators. Share existing field types and repeatable-entry validation across similar pages. Keep the five existing shapes and schema version so drafts and history remain readable. Use fixed identifiers where routing or search depends on them.
- Extend `scripts/sql/page-content.sql` with a transactional, repeatable upgrade of the page allowlist. Test the upgrade by starting with the existing five-key constraint and seeded drafts and publication history. Retain the existing storage and page API for revision-checked save, publish and restore.
- Add explicit reader authorization for public, Accepted, Team and state-dependent fields. In Account, project editorial content for the authenticated reader on the server before returning it. Keep protected defaults in server-only modules or the existing protected client chunks. Expose public fallbacks through the current prerender path.

## 3. Wire page layouts to published content

- Use the existing publication fetch, retry, refresh and fallback behavior with the reader components under `src/pages/`, the Home components in `src/site.tsx` and the existing gated lazy routes. Extract defaults from current source, including Account's updated guidance. Move each page's display values into its model while rendering the existing components and semantic markup.
- Bind FAQ disclosures, team profiles, legal sections, Schedule tables, project cards, matching labels and Dataset library guides and entries to typed content. Keep fixed route anchors and workflow identifiers. Preserve current Schedule fetch and transformations before the first publication. When preparing the first Schedule draft, show the active validated schedule when available and explicitly identify a built-in fallback. A published version is the source for all Schedule rows and sessions.
- Keep contact and invitation forms, redirects, participant management, native Team settings, project matching, dataset search and research folder operations on their existing paths. Separate editorial fields from integration controls. Verify that protected chunk separation still holds after adding previews.

## 4. Extend the Team editor

- Update `src/content-editor.tsx`, `src/content/editor-fields.tsx` and the page wrappers to provide grouped selection, page-specific editor fields and the authorized edit shortcuts. Use named and searchable entry groups for large catalogs. Reuse the existing error, focus, undo and draft controls and EBS tokens.
- Render the same reader components in previews while providing explicit state selection for conditional guidance and suppressing live actions. Load protected preview data only through the authorized editor API and keep large page content within the request size cap.
- Update `docs/website-content.md` and `docs/member-access.md` with the editor coverage, Schedule behavior, access and upgrade steps.

## 5. Verify and review before delivery

- Run `npm run test:content`, `npm run test:org-admin`, `npm run test:cohorts`, `npm run test:datasets`, `npm run build`, SEO and FAQ checks, and `git diff --check`. Run affected tests again after fixes.
- In the local browser fixture, open every selector option and preview. Exercise representative public, Accepted and admin pages end to end, including Schedule and Dataset library. Cover denied and revoked Team access, Team-only preview, Account state projection, save and publish isolation, conflicts, version restore, and keyboard and mobile access. Inspect built assets and prerenders for protected content leakage. Compare redirects, forms, anchors and interactive behavior against the baseline.
- Review the implementation against the acceptance criteria and fix in-scope findings. Report verified local behavior and remaining release steps. The [existing release instructions](../../docs/website-content.md#for-the-site-owner-setup-and-operation) provide the starting point for the database migration and deployment once authorized.

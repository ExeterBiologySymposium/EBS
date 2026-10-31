# Account, Contact, and Events verification

Date: October 29, 2026.

## Delivered locally

- `/account.html` has pending/checking/unavailable/signed-out and accepted views. Pending users see approval, profile, and Contact controls without registration, folder, or event links. Accepted users see their research-folder actions, learning links, and Events.
- Authenticated Register requests redirect to Account, preserving validated member return destinations. Shared registration calls to action, navigation, mobile menu, footer, and search adapt to member status. Anonymous registration remains available.
- Folder creation moved from Resources to accepted Account content; the existing Google/Neon implementation is retained.
- `/contact.html` reuses the existing contact form/CAPTCHA, error handling, email fallback, and FAQ contact entry point.
- `/events.html` contains the supplied Kate Adamala announcement, poster, biography, date/time/venue/virtual-speaker details, and Science/bioRxiv links. Event content, lazy bundles, and poster requests require Accepted membership. The original poster was copied unchanged; SHA-256 matches the source.
- Account/Register responses use private/no-store headers. Account/Events have generic metadata, noindex, and no public sitemap entries. Generated sitemap/robots files are copied into the production output.
- Instagram and LinkedIn remain in the shared footer and were checked on all 18 built HTML pages.

## Automated evidence

- New regression test failed on unprotected `/events.html` before implementation, then passed after the access/routing/UI changes.
- `npm run build` passed TypeScript, production bundling, and prerendering.
- `test:member-pages`, `test:auth`, `test:access`, `test:member-ui`, `test:navigation`, `test:contact`, `test:clerk-config`, `test:vercel-runtime`, `test:access-build`, and `test:participant-folders` passed.
- The public-build check rejects event content/reading identifiers/poster paths in public JS and event details in prerendered HTML. It verifies noindex and sitemap exclusion for Account/Events.
- `node scripts/update-seo.mjs --check` passed for all 18 page heads and discovery files.
- `git diff --check` passed.

## Browser and visual checks

[Browser results](browser-results.json) records 11 passing member-page scenarios. The harness runs the real App, persistent navigation, components, and server access handler, with Clerk membership, Google folder responses, and CAPTCHA mocked. No live contact message or Google mutation was sent.

Checks cover pending exclusion of folder API calls and Events/search links; authenticated Register redirection; direct/encoded Events and poster denial; accepted folder creation/reopening; event details, links, and poster loading; persistent header/navigation; header fit at 1280px; 375px layouts and mobile menu behavior; revocation removing already-mounted event content; public Contact/registration; and shared social links without uncaught browser errors.

The seven existing folder browser scenarios also passed after moving the folder component into Account. All nine production-preview navigation scenarios passed, with Account and Contact added to the public-route transition check (27 browser scenarios total across the three suites). Desktop and mobile screenshots for pending/accepted Account, Events, and Contact were visually inspected. Event copy remains readable outside the poster, poster images are uncropped, and mobile layouts have no horizontal overflow.

## Review and repairs

Self-review completed; no independent agent review was requested or claimed. Reviewed member-state gates, trusted identity/recipient behavior, safe redirects, direct HTML/asset authorization, private caching, build separation, new route registration, status handling, form reuse, responsive navigation, and preservation of existing local folder work.

The new build check exposed absent sitemap output. Prerendering now copies sitemap/robots to dist. An initial encoded-route browser failure came from the test harness checking only literal URL prefixes; the harness now invokes the real access handler for every request, matching production middleware. Mobile event screenshots now wait for the actual event body/poster rather than capturing a transient lazy-loading state.

## Remaining live work

This is local implementation, not a deployment. Production Vercel routing/Clerk membership and the external contact provider still need an authorized live preview check. The existing Google folder integration still requires service credentials, staff permission allowlist, Neon configuration/migration, and live Google ACL verification as documented in [participant-folders.md](../../participant-folders.md). No production settings, paid infrastructure, source Google files, or live permissions were changed.

Event time is explicitly October 29, 2026, 6:30 p.m. Eastern, based on the supplied poster and Exeter venue. The speaker joins virtually; no attendee meeting URL or event end time was supplied or invented. The two reading links were supplied by the user; earlier direct web access was blocked, so full-text review is not claimed.

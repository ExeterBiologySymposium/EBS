# EBS Terms of Use and Privacy Notice verification

Completed October 31, 2026, against the user-approved plan and copy drafts.

## Result

Implemented separate public `/terms.html` and `/privacy.html` pages with the approved substantive text. Terms include EBS's purpose and participation expectations; Privacy describes the inspected account, application, messaging, measurement, and research-folder flows. Both pages are available without signing in, cross-link, and include Contact links. The Privacy Notice retains the requested Academy privacy URL.

Added footer links on all 20 routes, unique SEO metadata, sitemap entries, and site-search entries. Reused existing typography, tokens, and article layout through a small shared static legal-page component. No dependencies, backend behavior, sign-in configuration, or live provider settings changed.

## Evidence

- Navigation regression test first failed because `terms.html` was not recognized, then passed after both routes were registered.
- `npm run test:navigation` — PASS.
- `npm run test:contact` — PASS.
- `npm run build` — PASS, including TypeScript and prerendering.
- `node scripts/check-legal-pages.mjs` — PASS: approved substantive copy matches generated article text, 34 contents anchors resolve, metadata/search/sitemap entries exist, IDs are unique, and both footer links appear on all 20 built pages.
- `node scripts/check-brand.mjs --built` — PASS: brand/accessibility guards and 1,067 local links/assets across 20 routes.
- `npm run test:access-build` — PASS: protected learning and member assets remain separated from public bundles and HTML.
- `PUPPETEER_EXECUTABLE_PATH='/Applications/Arc.app/Contents/MacOS/Arc' node scripts/browser-legal-pages.mjs` — PASS: 22 checks using isolated headless Arc (Chromium 156), covering direct public loading, desktop geometry, 320/375/767/768/1100/1440px widths, minimum text/link sizes, overflow, section focus, footer and cross-page navigation, history, search, and no-JavaScript reading.
- `git diff --check` — PASS.

Screenshot inspection caught a collision with the framework's `contents` utility: its `display: contents` removed the sidebar box and moved the article below navigation. A focused geometry test reproduced the failure. Explicit `display: block` on the scoped legal navigation fixed it; the browser suite then passed. Final desktop screenshots show the article beside the contents.

## Review artifacts

- [Browser results](browser-results.json)
- [Terms desktop](terms-1440.png), [Terms mobile](terms-375.png)
- [Privacy desktop](privacy-1440.png), [Privacy mobile](privacy-375.png)

## Limits

The browser reported no page JavaScript exceptions. Console 404 messages were traced to `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`, hosted Vercel integrations not supplied by `vite preview`. They did not prevent the policy pages or navigation from working. Production analytics behavior was not tested.

This is an implementation and self-review of approved website copy, not independent legal or institutional approval. Age/consent text does not implement age verification or verified parental consent. Live research-folder readiness, provider contracts, off-site retention/sharing practices, and institutional responsibility remain subject to the review boundaries recorded in the approved specification. No deployment, publication, or live data changes were performed. Extensive pre-existing local changes were preserved.

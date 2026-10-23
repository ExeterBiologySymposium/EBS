# Persistent navigation verification — 2026-10-23

Implemented the approved persistent-navigation specification and plan. `NavigationApp` remains below the existing AuthProvider and changes App's page prop without replacing the browser document, header, footer, or provider. No router dependency was added.

Eligible first-party HTML links fetch their destination with same-origin credentials and no-store caching before committing content. Server redirects determine the final route. The controller validates origin, known route, content type and React shell before rendering; failure falls back to normal browser navigation. Protected middleware and membership logic are unchanged. Canonical/description/social/structured metadata, page title, URL, active navigation and body route marker update with the destination.

Native external, download, modified-click and new-tab behavior is retained. Hash navigation remains native. Mobile menus and search dialogs close after navigation. Aborted/superseded requests cannot commit stale destinations. Back/forward restores saved scroll, including manual scrolling away from a hash destination. No Accepted-status cache was introduced.

## Evidence

Before implementation, a Chromium test failed because clicking About → FAQ discarded a document sentinel. After implementation the document sentinel and exact account-control/header DOM nodes remain intact.

- `npm run build`: passes TypeScript, production build and prerendering.
- All 12 `scripts/check-*.mjs` checks pass; includes authorization, public/protected bundle separation, membership UI, runtime configuration, CAPTCHA and link eligibility.
- `scripts/browser-navigation.mjs`: 9 passing browser scenarios: persistent shell/metadata; back/forward; anchors; saved scroll after an anchor visit; every public page transition; touch-enabled mobile menu; controlled protected-route server redirect; rapid-click latest-destination handling; and failed-fetch fallback.
- `git diff --check`: passes.

The optional browser runner requires Puppeteer and Chromium, available separately in this workspace. Run with `EBS_QA_BASE_URL` (default `http://127.0.0.1:4173`) and `PUPPETEER_EXECUTABLE_PATH` pointing to the installed Chromium, then `npm run test:navigation-browser`. It captures a failure screenshot in `/private/tmp/ebs-navigation-failure.png`.

## Limits

Browser checks used the local production preview and a controlled redirect response, not a real signed-in Clerk identity or live Vercel routing. They establish that internal navigation preserves the shell and handles authorization redirects, but live signed-in confirmation is still required. First visits, explicit reloads, and error fallbacks intentionally remain full document loads and can initialize Clerk. No deployment or commit was performed.

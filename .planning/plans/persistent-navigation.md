# Implementation plan: persistent internal navigation

1. Add a failing navigation regression harness covering persistent account mount, URL/content changes, history, hash navigation, superseded requests and native-link exclusions.
2. Implement a browser-only route controller below AuthProvider. Intercept only eligible same-origin known-page link clicks; fetch the destination with same-origin credentials/no-store and honor the final URL/redirect response. Keep ordinary document navigation as the failure fallback.
3. Feed the resolved page into the existing App while preserving the provider and shared shell. Update destination metadata and navigation selection. Close menu/search state and apply accessible focus/scroll handling after content commits. Preserve direct-page SSR initialization.
4. Recheck protected-route denial, redirected registration, private assets and public/protected build separation. Keep all existing security boundaries.
5. Run production build, the 11 existing checks, new navigation regressions, and Chromium desktop/mobile interaction tests. Review the final diff and document live Clerk verification limits.

Approval covers the routing change and necessary scoped fixes/tests. It does not cover deployment, publishing, account administration or unrelated redesign.

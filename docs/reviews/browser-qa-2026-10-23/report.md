# Full-site browser walkthrough — 2026-10-23

Used isolated headless Chromium with Puppeteer after the configured Chrome tools proved unavailable. The browser ran against the local production preview; no production messages or account changes were made.

## Completed browser coverage

- All 15 HTML routes loaded at 1280px desktop and 375px touch-enabled mobile widths: 30 page/viewport combinations, all HTTP 200.
- Scrolled pages and decoded their images before evaluating image failures. No missing/undecodable first-party images or horizontal page overflow remained. Initial lazy-image observations were harness timing artifacts, resolved by waiting for decoding.
- No uncaught application JavaScript errors were observed. Local preview lacks Vercel's analytics and speed-insights endpoints: those script requests return 404. They are recorded in the raw logs, not treated as deployed-site failures.
- Desktop search opened, filtered to Schedule, and closed with Escape. Mobile menu opened with touch, opened search, and closed behind the search dialog.
- Homepage guidance tabs and participation/location controls updated visible content.
- FAQ disclosures opened. The contact deep link scrolled after its smooth-scroll animation; empty submission focused the required name input. Actual hCaptcha provider frames loaded on desktop and mobile. No challenge was solved and no real submission was sent.
- All five protected routes displayed the signed-out membership gate and excluded protected article bodies.
- Rendered internal anchor references were checked against the crawled page IDs; no missing destinations were found in the public rendered content.
- The five protected page bodies were additionally loaded at both viewport sizes using a disposable local AuthContext fixture with Accepted access. All loaded without uncaught application errors or page overflow. This tests front-end rendering, not a real Clerk login or server authorization.
- Accepted-navigation geometry was inspected at 768, 820, 900, 1000, 1024, and 1280px. The navigation did not overlap the logo or right controls in that fixture. The fixture does not include a real Clerk UserButton popover.

## Observed limitations and unresolved report

The user reports a navigation bug while logged into Clerk. That exact symptom has not yet been described or reproduced with an authenticated session. Source inspection confirms that links navigate whole documents and the AuthProvider/ClerkSession mounts anew on each page. Membership initializes as checking and is fetched again, so a loading flash or temporary navigation changes are plausible. This does not establish the cause of a sign-out, error screen, or unintended redirect. The exact error, destination link, and real signed-in session are needed to distinguish those cases.

No additional confirmed site defect was found in this browser pass. The production preview cannot verify live Vercel middleware redirects, real session persistence across origins, Accepted/Pending/revoked users, provider dashboard policies, or real email delivery. Third-party application completion and registration submission were not exercised.

Evidence: `pages.json` contains 30 public page results; `interactions.json` contains 11 passing interaction/gate checks; `accepted-ui.json` contains 10 simulated Accepted page results. Four desktop/mobile home and FAQ screenshots are retained. The temporary runner scripts and QA fixture were outside the repository and did not change application routing or authentication.

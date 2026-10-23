# EBS code, debugging, and security review — 2026-10-23

## Scope and approach

Reviewed the application entry points, Vite body replacement and prerendering, all first-party form implementations, external form links and embeds, shared data loading, Clerk provider and server adapter, membership API, routing middleware, path policy, protected module loading, dependency lockfile, and existing regression checks. Static searches covered the source and public tree; generated output checks covered all 15 routes. This is a source/build review with isolated behavioral tests, not a production penetration test.

Applied the diagnosing-bugs and ECC security-review skills. No separate reviewer or formal Codex Security scan service was used.

## Findings and repairs

1. **Original CAPTCHA script was stripped by the build.** `reactShell()` replaces each HTML body with the React shell. The original document-level Web3Forms script therefore never survived the Vite transform. Earlier discussion attributed the missing widget to an asynchronous race; the build transformation provides a stronger, definitive explanation. The already-committed component-based integration avoids this removal.
2. **CAPTCHA script injection repeated under Strict Mode.** Replaying the real component effects produced two script nodes before this review's patch. Loading now shares one promise and waits for the provider's explicit ready callback. Script errors/timeouts release the failed loader so a subsequent mount can retry. Widget instances are removed on unmount, and callbacks from disposed instances are ignored.
3. **CAPTCHA token lifecycle was incomplete.** The component now captures the verified token explicitly, clears expired/error tokens, sets exactly one response field in submitted FormData, and resets a token after a rejected request. Retrying a failed request requires a new verification. CAPTCHA validation remains mandatory.
4. **Two high-severity dependency entries in the committed lockfile.** A clean lockfile install and npm audit identified Vite 8.2.2 and source-map-js 1.2.1. Updated to Vite 8.3.5 and source-map-js 1.2.2 within the existing dependency ranges, including Vite's required bundler dependencies. No forced major upgrades. These advisories concern development tooling or processing attacker-controlled source maps; no production exploitation path was demonstrated here.
5. **Stale homepage assertion.** The test expected the squaremark before participation facts, although the current homepage places it beside student registration. Updated the assertion to protect that existing registration grouping without changing the page design.

Advisories reported by npm: https://github.com/advisories/GHSA-68fv-2mgg-jv7q (source-map-js); Vite's advisory group included https://github.com/advisories/GHSA-587h-7wmj-h5pm and https://github.com/advisories/GHSA-rq7h-c2jc-7f22. These are dependency advisory findings, not independently reproduced exploits.

## Security observations

- Learning pages, protected bundles and downloads use a shared server path policy; anonymous and non-Accepted access fails closed in the handler tests.
- Enrollment derives user identity from authenticated state, restricts cross-origin POSTs, and cannot accept a caller-supplied user ID or Accepted status.
- Access responses use private/no-store caching. The build checks confirm protected lesson bodies are absent from public startup JavaScript and prerendered page bodies, and that public bundles contain no Clerk secret-key pattern.
- Registration URLs are hidden by a client UI gate, but that gate does not secure externally hosted Google Forms. Provider-side access settings control those forms.
- Appwrite's schedule/session reads are public content paths. Dashboard write permissions were not inspected.
- No additional confirmed first-party authorization bypass or injection defect was established by this bounded review.

## Evidence

- Reproduced Strict Mode failure: two script nodes from effect replay, with assertion failure before the patch.
- Added `npm run test:contact`: real component effect replay with isolated provider/network doubles checks singleton loading, load failure/retry, expiration, verified-token transmission, rejected-submit reset, fresh-token retry, and widget removal. The harness uses React's private hook dispatcher; it is intentionally isolated and may need adjustment on a future React upgrade. It does not emulate a real CAPTCHA challenge.
- `npm run build` passes, including TypeScript, production bundles, and prerendering.
- All 11 `scripts/check-*.mjs` checks pass after repairs; brand check also runs with `--built` and verifies 15 routes and 654 local links/assets.
- Security update installation reports zero known npm vulnerabilities across the installed locked dependency tree.
- `git diff --check` passes.

## Remaining verification gaps

- Automated browser startup failed because Chrome is missing from the configured tool path. Actual third-party iframe rendering, interactive challenge completion, responsive appearance, and real email delivery remain unverified.
- Web3Forms dashboard enforcement must be enabled and checked separately; client CAPTCHA validation alone is not server-side spam enforcement.
- Live Vercel middleware routing/caching, authenticated Accepted/Pending identities, revocation, Clerk organization capacity/settings, and Appwrite ACLs were not exercised against provider dashboards or production.
- Dependency advisory scanning does not cover every unknown vulnerability, external service setting, or repository-history secret.

No deployment, publishing, account changes, or real message submissions were performed.

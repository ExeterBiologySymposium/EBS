# Participant research folders — local verification

Date: October 29, 2026.

## Result

Approved local implementation is prepared. No deployment, live Drive creation/sharing, database provisioning, production environment updates, or paid service purchase was performed. Live Google, Clerk account-linking, and hosted Neon behavior remain unverified.

## Scope reviewed

Self-review of the Resources UI, trusted Google identity lookup, Vercel endpoint, durable PostgreSQL provisioning state, Google Drive adapter, protected bundle placement, migration, and setup/recovery documentation. No independent agent review was requested or performed.

- Authorization is checked server-side for current Accepted membership; request bodies cannot select another user or recipient.
- Google recipient selection requires exactly one verified linked Google identity.
- SQL uniqueness and conditional claims prevent concurrent provisioning; stale claims cannot overwrite another worker's state.
- Folder IDs are persisted before creation. Copy intent is permanent across retries and lease expiry; ambiguous Docs copies require reconciliation rather than a second copy.
- The Drive adapter fixes the configured destination/template, rejects My Drive destinations and unknown/broad inherited permissions, and adds only a specific user editor permission. Staff-only group membership still needs administrator verification.
- All endpoint responses are private/no-store and exclude upstream error details. Browser links are restricted to the expected Google hosts and paths.
- Development/preview refuse the production destination or template IDs. The feature fails closed until explicitly configured/enabled.

## Checks passed

- `npm run test:participant-folders`: authorization, verified Google identity, self-only ownership, non-mutating GET, disabled endpoint, repeated/concurrent creation, partial failures, uncertain-copy protection, permission request bodies, pagination, accessible UI states, and unsafe-link rejection.
- The same suite runs the migration and storage queries against the PGlite PostgreSQL engine, verifying actual SQL uniqueness, claims, lease expiry, stale-token fencing, permanent copy intent, parameter binding, and namespace isolation. No hosted Neon connection is claimed.
- `npm run build`: TypeScript, client production bundle, and prerendering passed.
- `test:auth`, `test:clerk-config`, `test:access`, `test:member-ui`, `test:access-build`, `test:vercel-runtime`, `test:navigation`, and `test:contact` passed.
- Seven isolated browser scenarios passed with a temporary Chromium runtime: keyboard creation/double-click prevention, saved links after reload, account-profile action/read-only recheck, failure/retry, processing/staff-review states, 375px layout, and no uncaught browser errors. Google and Clerk were mocked in this harness.
- All nine existing production-preview navigation browser scenarios passed.
- Desktop/mobile screenshots were visually inspected: existing typography/buttons, readable status text, and no horizontal mobile overflow. The isolated harness omits the global site shell; it is not proof of live authenticated behavior.
- `git diff --check` passed.

## Repairs during verification

The first production build emitted a public Resources facade that statically imported a protected chunk. The existing access-build check failed. Chunk routing now keeps the facade and participant-folder UI under `protected-assets/`, the build verifier covers the new component, and the build/access checks passed afterward. Public JavaScript is also checked for participant UI text and server configuration variable names.

## Remaining setup and release checks

Follow [the setup guide](../../participant-folders.md). Supply a Google service identity, staff permission allowlist, and private Neon connection; apply the SQL migration. Confirm that the destination is a true Shared Drive folder and permits folder sharing with non-members/external participants. Test actual folder/document ACLs using authorized disposable identities before deployment.

A dependency audit reported four high-severity package entries arising from the existing Vercel → Zod dependency chain. The affected versions (`@vercel/functions` 3.10.1, `@vercel/oidc` 4.0.1, `@vercel/cli-config` 0.3.1, and `zod` 4.1.11) were present in HEAD before this change. No new dependency appeared in the advisory report; unrelated dependency upgrades were not performed.

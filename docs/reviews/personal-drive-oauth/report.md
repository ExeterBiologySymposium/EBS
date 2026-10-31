# Personal EBS My Drive OAuth verification

Date: October 29, 2026.

## Local outcome

The approved OAuth revision is implemented. JWT/service-account authentication is replaced with the installed Google OAuth2Client and a server-only owner refresh token. Preflight verifies the authenticated Drive user, the pinned EBS owner of the My Drive parent, create/share capabilities, staff-only parent ACLs, and template copy capability. Recovery searches use the exact participant parent/app-property marker in the user corpus. Created/recovered resources must retain the pinned owner, expected parent, and operation markers.

Neon schema, record namespace, folder IDs, leases, permanent copy intent, Clerk membership/recipient checks, and accepted Account UI were retained. No database reset or data migration was performed. Retired service-account variables are no longer read; no actual credential was deleted or revoked.

The local owner helper uses an exact loopback callback, offline consent, PKCE, random single-use state, configured-owner and granted-scope checks, cancellation/timeout, and private atomic storage in the ignored `.env.google-drive.local`. It preserves unrelated file values, rejects symlink destinations, never logs tokens/codes/client secrets, and does not create files or sharing permissions. There is no public owner callback route.

## Evidence

- The modified personal-folder test first failed against the old mandatory Shared Drive adapter, before implementation.
- `test:participant-folders` passed, including the OAuth transport/configuration checks and actual PostgreSQL/PGlite state tests.
- Adapter checks cover wrong authenticated identity, wrong folder/document owner, missing sharing capability, unexpected/public ACL entries, parent-bounded My Drive searches, fixed template, specific recipient sharing, pagination, reuse of created folders, and recovery after a create response fails.
- OAuth transport checks use the actual library with a mocked token endpoint: an initial token refresh, caching of a valid access token, and refresh after expiry. They also verify configuration/preview isolation, unchanged namespace, sanitized revocation, and no automatic retry of uncertain copy mutations.
- `test:owner-authorization` passed using fake credentials and local HTTP callbacks: offline permission/PKCE/state, cancelled/invalid/duplicate callbacks, owner/scope mismatch, missing refresh token, timeout/close, concurrent callback single use, forged Host rejection, secret-free failures, private file mode, preserved settings, and symlink rejection. The Host test uses raw HTTP because Node fetch normalizes the Host header.
- `npm run build` passed TypeScript, production client bundling, and prerendering.
- `test:access-build`, `test:vercel-runtime`, `test:member-pages`, `test:auth`, `test:access`, `test:member-ui`, `test:navigation`, `test:contact`, and `test:clerk-config` passed. Public build checks include OAuth secret/config variable exclusion.
- The seven focused folder browser scenarios and all eleven member-page browser scenarios passed with mocked Google/Clerk. No new UI layout was introduced by the backend revision.
- `git diff --check` passed.

## Review

Self-review covered owner pinning, bounded resource selection, refresh behavior, mutation retry control, credential storage/callback handling, preview isolation, durable mapping preservation, and participant access gates. No independent reviewer was requested or claimed. The setup guide now describes the actual personal-owner OAuth implementation, exact callback URI, environment variables, Neon setup, restricted-scope considerations, and reconnect/revocation handling.

## Not live-verified

No real owner consent flow was run; no real client ID/secret/token or owner email was supplied to the new helper during testing. No live folder/template metadata, storage capacity, Google permissions, hosted Neon connection, or production deployment was changed or verified. Google publishing/verification requirements and the actual owner/staff ACLs must be resolved during setup. External/Testing Drive refresh tokens generally have a seven-day lifetime; no claim of permanent authorization or verification exemption is made.

Follow [the current setup guide](../../participant-folders.md). Use disposable folder/template IDs and a separate Neon branch/database for preview, then verify owner/staff/participant/other-participant access before production deployment.

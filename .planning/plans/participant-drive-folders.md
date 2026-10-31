# Personal EBS account folder implementation plan

Status: approved by the user on October 29, 2026; personal-account OAuth implementation and local verification completed. Live credentials, owner consent, external verification, and deployment remain outstanding.

## Intended behavior

The personal EBS Google account authorizes the server once. The server creates owner-held research folders and template copies under the supplied staff-shared My Drive parent. Accepted participants receive access only to their own folders. Neon prevents duplicate resources and supports safe retry/recovery.

## Ordered work

1. **Establish failing regression tests.** Extend the existing Drive tests for a My Drive destination, authenticated/pinned owner match, create/share capability, template copy capability, staff-only parent ACL, user-corpus marker search, missing credentials, and OAuth refresh/revocation. Keep the existing authorization, self-only recipient, concurrency, permanent-copy-intent, and partial-failure tests. Add local setup-helper tests for state/PKCE, owner mismatch, cancellation, timeout, single callback, and secret-free outputs.
2. **Replace server authentication.** Reuse installed `google-auth-library` with `OAuth2Client`, configured from the dedicated owner client ID, secret, and refresh token. Validate configuration and owner identity; remove service-account requirements. Refresh access tokens without automatically retrying an uncertain Docs-copy mutation. Fail safely on missing scope or revoked/invalid credentials.
3. **Adapt the Drive adapter.** Require the destination to be a My Drive folder owned by the pinned EBS account, retain fixed IDs and staff ACL checks, and replace mandatory driveId/corpora=drive searches with exact-parent user searches. Verify newly created/recovered resource ownership, parentage, and operation markers. Preserve template copying and specific-recipient sharing without public access or invitation emails.
4. **Provide owner-only local setup.** Add a loopback authorization helper using offline consent, random state, PKCE, bounded lifetime, and exact callback validation. Verify the EBS owner before saving a refresh token to a restrictive ignored file; preserve unrelated local configuration and never print credentials or authorization codes. Do not expose an owner OAuth callback on the production site or alter participant Google sign-in.
5. **Preserve durable state and member behavior.** Retain the existing Neon schema, mapping namespace, pre-generated folder IDs, leases, and permanent copy intent. Do not reset or migrate records silently. Keep folder creation in accepted Account, with no pending-user API calls. If live records exist, check app-property access under the new OAuth app before continuing.
6. **Rewrite setup documentation.** Replace service-account/Workspace instructions with personal-owner OAuth setup, exact helper callback URI, the proposed variable table, owner-email pin, staff ACL list, storage expectations, secure Vercel configuration, token reauthorization, and separate preview resources. Retain Neon creation/SQL instructions unchanged. Explain the full-Drive restricted scope and resolve applicable Google consent/publishing requirements before live rollout; material scope/cost changes require a decision.
7. **Verify and review locally.** Run focused tests, typecheck/build, member/access/auth/navigation/contact/folder regression checks, and relevant browser suites. Review the diff for secret exposure, broad resource selection, permission leaks, stale identity, lost mappings, duplicate copies, and unrelated changes. Record real evidence and remaining live limitations.
8. **Prepare live verification as a separate authorized step.** With configured credentials, the human EBS owner grants consent. Use disposable folders/templates and test identities to verify ownership, staff inheritance, participant-only effective access, retry/reopen behavior, token refresh, and revocation/reauthorization. Production deployment, live sharing, credential revocation, and purchases remain separate operations.

## Configuration after migration

New server settings: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, and `GOOGLE_DRIVE_OWNER_EMAIL`.

Retained settings: `EBS_DRIVE_DATABASE_URL`, `EBS_DRIVE_STAFF_EMAILS`, `EBS_DRIVE_PARENT_ID`, `EBS_DRIVE_TEMPLATE_ID`, `EBS_DRIVE_ENABLED`, and existing Clerk settings.

Retired runtime requirements: `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`. Do not delete/revoke any actual key without separate authorization.

No database migration or Account screen redesign is expected. The one-time owner consent helper runs locally; participant screens retain their existing design.

Specification: `.planning/specs/participant-drive-folders.md`.

Earlier local evidence: `docs/reviews/participant-folders/report.md` and `docs/reviews/member-pages/report.md`. Those reports do not establish that this personal-account OAuth revision works.

Current OAuth evidence: `docs/reviews/personal-drive-oauth/report.md`. Current setup: `docs/participant-folders.md`.

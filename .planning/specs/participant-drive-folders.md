# Participant research folders — personal EBS Google account

Status: approved by the user on October 29, 2026; personal EBS account ownership confirmed. OAuth implementation and local verification completed; live owner consent, credentials, external setup, and deployment remain outstanding.

## Outcome and confirmed inputs

Accepted EBS participants use Account to create and reopen one personal research folder containing a copy of the research document template. The personal EBS Google account owns the newly created folders and documents. EBS staff retain inherited access from the parent folder. The app grants each participant editor access only to their own folder.

- Destination folder: `16PGOXHpM1WBmD9XVqbqxAQ27zpu7bGWJ`.
- Document template: `1eYJvxcDL-3BuzuaMWaC3pRWl5htz9X_rA0C-sLQj9DY`.
- Ownership model: a folder in the personal EBS account's My Drive, shared with EBS staff. No Google Workspace Shared Drive or service account is required.
- Personal-account ownership is user-confirmed. The actual owner email, live ACLs, template copy capability, available storage, and OAuth consent configuration remain to be verified during authorized setup.
- One folder per Clerk user; no change to Account, Contact, Events, or membership behavior.

## Architecture and scope decisions

1. Replace JWT service-account authentication with `OAuth2Client` from the installed `google-auth-library`. The server uses a refresh token authorized by the EBS owner account and refreshes short-lived access tokens as needed.
2. Keep the owner Drive OAuth client separate from participant Google sign-in in Clerk. Participants link their Google identity through Clerk; they never authorize access to their own Drive.
3. Request `https://www.googleapis.com/auth/drive` only from the EBS owner during one-time setup. This is broad access to that account's Drive, selected to retain the supplied existing resource IDs and current permission checks without adding a Picker interface. Runtime operations remain constrained to configured IDs and stored participant resources. Google classifies this as a restricted scope. Review the applicable consent/publishing/verification requirements before rollout; do not promise an exemption, approval, or absence of assessment costs. A narrower `drive.file` plus owner file-picker flow is a possible later scope change, not a silent fallback.
4. Add an explicit `GOOGLE_DRIVE_OWNER_EMAIL` pin. Verify the authenticated Drive account and the destination folder's owner match it before provisioning. Do not assume that a login hint proves ownership. Require a live folder (not a shortcut), My Drive ownership, and create/share capabilities; verify that the template is a readable, copyable Google Doc.
5. Replace Shared Drive `driveId`/`corpora=drive` search with a My Drive/user search bounded by the exact participant parent and app-property marker. Never search broadly by folder name or create an alternative parent if the configured one is unavailable.
6. Preserve Neon Postgres, the current schema, unique-user records, folder IDs, permanent copy intent, claims, and partial-recovery behavior. Do not introduce a namespace change merely because authentication changes. No automatic reset or recreation of existing records is permitted. If any live records exist, verify ownership and app-property visibility under the new OAuth app before using them; a client/project change may affect access to private app properties.

## One-time owner authorization design

Provide a local setup helper, using installed dependencies and a short-lived loopback HTTP callback. Register its exact callback URI in a dedicated Google OAuth Web application client, for example `http://127.0.0.1:53682/oauth/callback`.

- Read the client ID, client secret, and expected owner from server/local configuration.
- Generate a cryptographically random one-use state value and PKCE verifier/challenge. Bind only to loopback; validate callback path/state, reject missing/duplicate/error callbacks, and close the listener after success, cancellation, error, or a short timeout.
- Open the consent URL in the user's normal browser with offline access and consent prompting. Authorization is performed by the human EBS owner; do not automate their login or approval.
- Exchange the authorization code through `OAuth2Client`, require a refresh token, and verify the resulting Drive identity against the configured owner. Fail clearly if the token or owner is wrong.
- Save the token only to an ignored, owner-readable local credentials/environment file with restrictive permissions, without overwriting unrelated settings. Never print authorization codes, client secrets, access tokens, refresh tokens, or complete provider error bodies to logs or the callback page.
- The browser completion page shows a simple success/failure message. Do not add a public owner-connection route or participant-facing Drive-consent screen.
- Document secure transfer to Vercel environment variables, token replacement/revocation, and reauthorization. Do not claim refresh tokens last forever. Google's External/Testing status generally gives Drive refresh tokens a seven-day lifetime; production readiness must address publishing status and applicable requirements.

## Proposed configuration after implementation

| Server variable | Purpose |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | Dedicated EBS-owner Drive OAuth client |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Secret for that client |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Offline authorization granted by the EBS owner |
| `GOOGLE_DRIVE_OWNER_EMAIL` | Exact expected owning Google account; to be supplied during setup |
| `EBS_DRIVE_DATABASE_URL` | Existing private Neon PostgreSQL URL |
| `EBS_DRIVE_STAFF_EMAILS` | Existing allowed staff user/group emails; owner is also explicitly allowed |
| `EBS_DRIVE_PARENT_ID` | Existing destination ID |
| `EBS_DRIVE_TEMPLATE_ID` | Existing template ID |
| `EBS_DRIVE_ENABLED` | Explicit feature switch; fail closed until configured |

Existing Clerk variables remain required. Remove service-account email/private-key requirements from the revised runtime and setup instructions. Do not delete or revoke real credentials automatically. No new secrets use a `VITE_` prefix. Keep preview/development on disposable folder and template IDs and a separate Neon database/branch; do not override Vercel's environment identity to bypass production-resource protection.

## Authorization, sharing, and UI acceptance criteria

- Preserve current server verification of Accepted membership, trusted linked Google recipient resolution, self-only ownership, same-origin mutations, and private/no-store responses. Anonymous/Pending requests cannot create or share files.
- Preserve the existing accepted Account create/loading/ready/retry/review states and contact fallback. Pending Account must not mount the folder component or request its API.
- Verify the parent permission list before any mutation: allow only the pinned owner and configured staff users/groups. Reject anyone/domain-wide or unexpected access. Staff group membership must be verified administratively; the app does not inspect group members.
- Create the participant folder under the fixed destination, copy the fixed document template into it, and share only that folder with the trusted participant email. Do not add participants to the parent, enable public links, transfer ownership, or send invitation emails.
- Newly created resources belong to the authenticated personal EBS account and use that account's available Drive storage. Staff access comes from parent sharing. Verify live ownership and effective permissions during release checks.
- Repeated clicks, concurrent requests, lease expiry, and interrupted retries reuse the same folder/document. Persist the pre-generated folder ID before creation. Preserve permanent Docs-copy intent and marker-based reconciliation; unresolved copies require staff review, not another automatic copy.
- OAuth revocation, invalid/expired refresh tokens, insufficient scope, inaccessible/moved files, exhausted storage, and permission failures fail safely. Retain existing records; do not fall back to participant credentials or create resources elsewhere. Public errors exclude provider secrets. Setup documentation explains owner reauthorization.
- Removing Accepted membership blocks the site feature but does not automatically remove the already-granted Google permission. Retain the existing staff revocation procedure.

## Affected areas and verification

Primary changes: `server/drive/google.ts`, `api/participant-folder.ts`, a local owner-authorization helper and its tests, Drive adapter/configuration tests, setup documentation, and verification records. The existing Account UI, participant service/store, Neon schema, and unrelated pages stay in scope only for necessary regression checks or clear configuration-error copy.

Write failing tests for personal ownership, pinned identity mismatch, user-corpus queries, configured resource bounds, OAuth refresh behavior, missing/invalid configuration, consent callback validation, secret handling, permission limits, and recovery after auth/storage errors. Preserve concurrency and uncertain-copy tests. Run typecheck/build and the existing member/access/auth/navigation/contact/folder checks, then the relevant browser suites. Self-review and repair within the agreed scope; do not claim an independent review.

Live verification, after authorization/configuration: owner signs in and grants consent; use disposable test resources and two participant identities; verify owner/staff/participant/other-participant permissions, ownership, template copying, retries, token refresh, and reauthorization after revocation. Report separately what is verified locally and live.

## Boundaries

The approved local OAuth migration is implemented. It does not authorize creating credentials or a database, requesting live owner consent, changing Google files/permissions, publishing, deploying, purchasing services, or revoking credentials automatically. Current local evidence is in `docs/reviews/personal-drive-oauth/report.md`; earlier reports describe the prior implementation.

## Primary references

- Google OAuth web-server flow: https://developers.google.com/identity/protocols/oauth2/web-server
- Installed Google authentication library workflow: https://github.com/googleapis/google-auth-library-nodejs
- Drive scopes and restricted-scope requirements: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Refresh-token expiry/revocation: https://developers.google.com/identity/protocols/oauth2
- My Drive search: https://developers.google.com/workspace/drive/api/guides/search-files
- Shared Drive/service-account ownership distinction: https://developers.google.com/workspace/drive/api/guides/about-shareddrives

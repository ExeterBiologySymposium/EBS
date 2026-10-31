# Participant research folders — personal EBS Google account

Accepted participants use **Account → Create my research folder** to create one personal folder and a copy of the research document template. The personal EBS Google account owns these resources in My Drive. Staff inherit access from the parent folder; the app adds only the participant's specific Google email to their child folder. It never shares the parent with participants or enables public links, and it does not send invitation emails.

## Current status

The local implementation now uses owner-authorized OAuth instead of a service account. No live owner consent, Google file/permission changes, hosted Neon setup, or deployment was performed during implementation. Live setup and verification are still required. Neon records/schema and the Account UI are retained.

## 1. Prepare the owner folder and template

Sign in as the personal EBS Google account that owns [the destination](https://drive.google.com/drive/u/0/folders/16PGOXHpM1WBmD9XVqbqxAQ27zpu7bGWJ). In Share, confirm its owner and set General access to Restricted. Give the existing EBS staff user/group accounts access to this parent; do not add participants to it. Verify any staff group contains only staff.

Confirm that the same owner account can read and copy [the template](https://docs.google.com/document/d/1eYJvxcDL-3BuzuaMWaC3pRWl5htz9X_rA0C-sLQj9DY/edit). The destination must be a real My Drive folder owned by this account, rather than a shortcut or Workspace Shared Drive folder. Created folders/documents use the EBS owner's Drive storage.

Collect the owner's exact email and all staff user/group emails listed on the destination, including inherited access. The server checks owner identity/ownership and the parent permission list before creating resources. Unknown users, anyone access, or domain-wide access fail the preflight. Existing manual sharing remains governed by Google Drive permissions.

## 2. Create the dedicated owner OAuth client

1. In [Google Cloud Console](https://console.cloud.google.com/), create/select an EBS-controlled project dedicated to owner Drive authorization, separate from participant Google sign-in in Clerk.
2. Enable [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com).
3. Configure Google Auth Platform branding/audience and the owner's consent app. Set an External audience, and add the personal EBS owner as a test user during testing. In Data Access, declare `https://www.googleapis.com/auth/drive`. No participant needs to authorize this owner app.
4. In [Credentials](https://console.cloud.google.com/apis/credentials), create an OAuth client ID of type Web application.
5. Register this exact Authorized redirect URI:

   `http://127.0.0.1:53682/oauth/callback`

6. Save the Client ID and Client Secret locally. Do not use the Clerk callback URI for this dedicated owner client.
7. The helper requests `https://www.googleapis.com/auth/drive`: full Drive access to the consenting EBS account. This is a Google restricted scope. The code restricts operations to configured/stored resources; the credential itself is broader. Review applicable publishing, verification, and assessment requirements before ongoing production use. Do not assume a verification exemption or a fixed fee.

Service accounts, JSON service-account keys, and domain-wide delegation are not required. Participant Google identity linking in Clerk remains unchanged and does not request participant Drive access.

References: [Google owner OAuth flow](https://developers.google.com/identity/protocols/oauth2/web-server), [Drive scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).

## 3. Authorize the owner locally

Create a plain-text `.env.google-drive.local` in the repository root with these three values (replace the placeholders):

```dotenv
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_DRIVE_OWNER_EMAIL=THE_ACTUAL_EBS_OWNER_EMAIL
```

From the repository directory run:

```sh
chmod 600 .env.google-drive.local
npm run authorize:drive
```

Use the printed Google consent link in a normal browser, sign in as the configured EBS owner, and grant the requested Drive permission. The local helper listens on loopback for five minutes, validates state and PKCE, verifies the authorized account and scope, and requires a refresh token. It then saves `GOOGLE_OAUTH_REFRESH_TOKEN` in the same ignored file with owner-only permissions. It preserves other configuration and does not print the token or create/share files.

Open the file locally to copy its values into Vercel. Do not paste credentials into chat, source files, screenshots, or public build variables. No public website OAuth callback or new participant screen is needed. If port 53682 is occupied, stop the conflicting process or resolve the conflict before rerunning; the registered redirect must match exactly.

If consent is cancelled, scopes are declined, a different account is selected, or a refresh token is missing, no token is saved. Correct the settings/account and run the helper again. An existing token remains untouched on a failed attempt.

## 4. Configure Neon

Use a dedicated [Neon project](https://console.neon.tech/) and production database/branch. Run [the unchanged SQL migration](../scripts/sql/participant-folders.sql) once in its SQL Editor, then copy that same database's PostgreSQL connection string from Connect. Set it as `EBS_DRIVE_DATABASE_URL`. A Neon API key is not required.

Use a separate database/branch and disposable destination/template IDs for preview/development. The table stores Clerk user IDs, recipient emails, Google resource IDs, provisioning state, and temporary claim tokens. Keep database access server-side. No schema migration, record reset, or new namespace is required by this OAuth change.

If any actual Google resources were created using an earlier OAuth app/project, verify ownership and private app-property visibility before changing identity/project. Do not delete mappings or reset copy intent to resolve visibility problems.

## 5. Set server environment variables

In [Vercel](https://vercel.com/dashboard), select the EBS project → Settings → Environment Variables. Existing Clerk variables in [member-access.md](member-access.md) remain required.

| Variable | Value |
| --- | --- |
| `GOOGLE_OAUTH_CLIENT_ID` | Dedicated owner OAuth Client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | That client's secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Value saved by the local owner helper |
| `GOOGLE_DRIVE_OWNER_EMAIL` | Exact expected personal EBS owner email |
| `EBS_DRIVE_DATABASE_URL` | Private Neon PostgreSQL connection string |
| `EBS_DRIVE_STAFF_EMAILS` | Comma-separated allowed staff user/group emails; owner is allowed automatically |
| `EBS_DRIVE_PARENT_ID` | Production: `16PGOXHpM1WBmD9XVqbqxAQ27zpu7bGWJ` |
| `EBS_DRIVE_TEMPLATE_ID` | Production: `1eYJvxcDL-3BuzuaMWaC3pRWl5htz9X_rA0C-sLQj9DY` |
| `EBS_DRIVE_ENABLED` | `true` only when ready; otherwise false/missing fails closed |

The retired `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` are no longer read. This change does not delete or revoke existing real credentials. No OAuth secret or refresh token has a `VITE_` prefix.

Production defaults are permitted only when Vercel supplies `VERCEL_ENV=production`. Preview/local environments must override both Google IDs with disposable resources, and use development Clerk settings and their own Neon connection. Do not manually override `VERCEL_ENV`. Use `vercel dev` for server authorization; Vite alone is frontend-only. Redeploy after changing environment variables; no deployment is performed automatically by owner authorization.

## Refresh, expiry, and reauthorization

The installed Google OAuth library refreshes short-lived access tokens from the stored refresh token. Missing/revoked/expired authorization or insufficient permissions causes a private generic unavailable response and does not fall back to another identity or a different destination.

Google OAuth External apps left in Testing generally receive Drive refresh tokens that expire after seven days. Resolve publishing status and applicable Google requirements before ongoing production operation. Refresh tokens can also be revoked or invalidated later; they are not permanent.

To reconnect, run the local helper with the same owner and OAuth client, then update the Vercel refresh-token value and redeploy. Do not reset Neon mappings or recreate participant folders. If the owner account or Google Cloud project must change, review ownership and private app-property access first. Owner access can be reviewed/revoked in [Google Account connections](https://myaccount.google.com/connections).

Reference: [Google refresh-token expiration](https://developers.google.com/identity/protocols/oauth2#expiration).

## Failure recovery and duplicate prevention

The database primary key admits one record per participant per namespace. SQL claims allow one active worker, with token checks and a 120-second lease. Each new folder uses a Google-generated ID persisted before creation; retries use the same ID. The 60-second Vercel function timeout is shorter than the claim lease.

Google Docs copies cannot use pre-generated IDs. Before issuing the copy, the app permanently records copy intent. Each copy also receives an application property identifying the participant folder. If the response or database write fails, the next request searches that folder for the tagged copy. It never issues another copy after intent is recorded. A still-running request, an expired lease, or a timeout cannot reset intent.

If no tagged copy can be found after an uncertain request, the UI asks for staff review. This is intentional: a late response or delayed search visibility must not produce duplicate documents. Staff should:

1. Wait until no worker can still be active (at least 120 seconds after the last attempt), then inspect the participant's stored folder and Google activity.
2. If the tagged document exists, have the participant retry; the app can recover it automatically. If staff moved it, restore it to the correct folder rather than creating another copy.
3. If absence of a copy is confirmed, an authorized database administrator may reset `copy_started=false` for that exact namespace/user record only after verifying `document_id IS NULL` and that no claim is active. This permits a new copy attempt. Never reset all records or delete participant content as a generic retry.
4. If multiple copies are found, preserve them and reconcile with the participant before changing the mapping.

Transient permission failures retain the folder/document IDs and retry the sharing step. A changed linked Google account stops automatic sharing; staff must review and update/revoke existing permissions before changing the stored recipient. Deleted or moved existing folders/documents are not silently replaced.

## Revocation

Removing a participant from Clerk Accepted blocks the website feature on subsequent requests. It **does not revoke Google access** already granted. To revoke it, remove that participant's direct permission from their folder in Drive and check for any separately granted document permissions. Retain or archive research according to EBS policy. Automatic Google revocation is outside this feature.

## Verification and release

Run `npm run test:participant-folders`, `npm run test:owner-authorization`, `npm run build`, and the member-access checks in [member-access.md](member-access.md), plus `npm run test:navigation` and `npm run test:contact`.

The folder suite exercises authorization, recipient selection, partial failures, concurrency, exact permission bodies, accessible UI states, and the actual migration/SQL using the PGlite PostgreSQL engine. It does not connect to a hosted Neon instance. `scripts/browser-participant-folders.mjs` uses the installed Puppeteer and a Chromium executable (`PUPPETEER_EXECUTABLE_PATH` when needed) for an isolated, mocked browser acceptance test; it cannot create live Google files or grant real access.

Before deployment approval, test an authorized preview with disposable Google resources and identities: anonymous/Pending denial, Accepted creation, reload/retry, simultaneous tabs, direct Drive access by the recipient, denial for another participant, staff access, external-domain restrictions, account linking, and a hosted Neon connection. Inspect the actual ACLs on both folder and document. Live Google and hosted database verification remain required before describing this feature as operational.

## API

`GET /api/participant-folder` reads the signed-in participant's saved state. `POST` creates or resumes it and requires an exact same-origin Origin header. Both independently verify current Accepted membership and resolve the Google identity server-side. Request bodies cannot select a user, email, template, or destination. All responses are private/no-store; errors do not return upstream diagnostics or credentials.

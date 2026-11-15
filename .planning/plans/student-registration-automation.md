# Student registration automation implementation plan

Status: approved by the user in chat on 2026-11-14 with the amendments below; implemented locally. Going live follows the [student registration runbook](../../docs/student-registration.md) and needs separate authorization. See [specification](../specs/student-registration-automation.md) and [design](../design/screens/student-registration-automation.md).

1. Preserve the existing worktree changes. Add focused failing tests for the registration status endpoint and the Apps Script workflow with fake Clerk, Form, Sheet, clock, and mail services.
2. Add a read-only `POST /api/registration-status` route using the existing Clerk gateway and EBS organization registry. Authenticate with a random registration-only bearer token stored in Vercel and Apps Script properties. Use a small, bounded request payload and no-store headers. Return the account match, stable Clerk account ID, current EBS state, and earliest current Accepted membership timestamp. Send no account names or application answers. Fail closed on configuration or provider errors. Test registered Accepted pools, Pending, unrelated organizations, invitations, missing/ambiguous accounts, and bad credentials.
3. Add copy-ready Apps Script and setup files. Use a standalone Apps Script project controlled by the Gmail owner so Sheet editors do not gain access to script properties. Read the student form's responses by stable response ID and a configured account email question. A time-driven trigger polls responses and pending statuses, so existing Clerk accounts and approvals are detected without adding a webhook or relying on event order. Use a script lock and a durable send record keyed by Clerk account. Persist a send attempt before calling MailApp, commit a sent timestamp on success, and leave ambiguous results for manual reconciliation. Test dry runs, catch-up, quota, duplicate submissions, simultaneous runs, old applications, and interruption after the mail call.
4. Update the student signup and FAQ text. Add the optional private tracker link inside the existing Team-gated Participants workspace. Check that the student copy and existing access gates still render correctly and that signed-out visitors do not see the tracker link.
5. Include a runbook with copy-and-paste setup, configuration names, controls for pausing mail, sender checks, and a test with a staff-controlled address before enabling production delivery. A Google connector for editing the live form or Sheet is unavailable in this session. The script will set up the tracker in the form's linked spreadsheet once the owner runs it.
6. Run the focused tests, affected participant administration checks, typecheck, the website build, and diff checks. Use fake mail in local tests. Verify the real sender and delivery in the owner-controlled release test after authorized deployment and Google setup.

## Provider references

- [Clerk Backend user lookup](https://clerk.com/docs/reference/backend/user/get-user-list)
- [Link Google Forms to Sheets](https://support.google.com/docs/answer/2917686)
- [Read Google Form responses](https://developers.google.com/apps-script/reference/forms/form)
- [Apps Script installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)
- [Apps Script MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)
- [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)

## Amendments approved 2026-11-14

The user approved a revised plan in chat. It keeps the six steps above with these changes:

- **Trigger:** staff tick **Send welcome email** (column A) in the Registration tracker. The hourly trigger only refreshes statuses, processes boxes that are still ticked and retries Researcher tracker appends; it never starts a send on its own. *Superseded:* time-driven polling as the send trigger, dry runs and catch-up sending.
- **Duplicate protection:** a cut-over time (`AUTOMATION_START`, set by the first `setup()`), a staff **Welcomed by hand** box, the Researcher tracker email list, permanent per-application records, and records keyed by Clerk account and hashed email. Attempts are recorded before `MailApp.sendEmail`; a send that may have happened becomes **Needs owner review** and is never retried automatically.
- **Tracker integrity:** the tab is protected so staff edit only the two checkbox columns; rows are keyed by Submission ID and the script re-reads it before every write; staff use filter views instead of a shared filter.
- **Guards:** restricted sharing, no resharing by editors, response editing and summary publishing off, pinned question items, the confirmed sender, a document-level claim by the script, granted scopes and mail quota. A definite guard failure turns sending off.
- **Website:** the contact address becomes `exeterbiosymposium@gmail.com`, and the orientation call is removed from the FAQ, Schools and Student research (separate commits before the feature).
- **Test email:** always `exeterbiosymposium@gmail.com`. The end-to-end release test uses a staff-controlled `+tag` address and `TEST_ONLY_RECIPIENT`.
- During implementation no real email is sent and the live Sheets, Form and Clerk accounts are not changed.

## Verification

Run locally on 2026-11-15. This session's network policy blocked the npm registry, so dependencies could not be installed.

**Ran and passed**
- `node --test scripts/registration-apps-script.test.mjs`: 38 tests (plain Node, using fakes of the Apps Script services).
- Server suites through a scratch loader that transpiles TypeScript with a global TypeScript install and stubs `vite` and the uninstalled packages (repository tests unchanged):
  - `scripts/registration-status.test.mjs`: 9 tests.
  - `scripts/org-api.test.mjs`, `org-rollover.test.mjs`, `org-store.test.mjs`: 30 pass, 1 skipped (needs PostgreSQL).
- `node --test scripts/update-seo.test.mjs` (14 tests) and `node scripts/update-seo.mjs --check`.
- TypeScript syntax checks of every changed `.ts`/`.tsx` file. A scratch TypeScript 6 check of `server/` and `api/` shows only errors caused by the missing Clerk types.
- Text checks:
  - no orientation-call phrases in `src/`, the page heads or `seo.config.json`; "orientation" remains only in the judges' briefing and the event-day schedule;
  - no `exeterbiologysymposium` outside historical `.planning` files;
  - no Sheet or Form IDs, tokens or personal addresses in the added lines;
  - `git diff --check`.
- Mutation checks:
  - Removing any single safeguard in the endpoint fails its tests.
  - In `Code.gs`, every safeguard except two is pinned by a test. The two survivors are deliberate duplicates: the account-record and time-budget checks are repeated right before the send.

**Not run here** (they need the npm registry):
- `npm run typecheck` and `npm run build`;
- the React-based checks: `scripts/org-ui.test.mjs`, `scripts/content.test.mjs`, `scripts/cohorts.test.mjs`, `scripts/datasets.test.mjs`, `scripts/check-faq-clarity.mjs`;
- browser QA with `scripts/org-browser-fixture.mjs`.

Their new assertions were checked by reading the code. Run them once the registry is reachable.

**Differences from the approved plan**
- `scripts/cohorts.test.mjs:150` was left unchanged: it passes at HEAD, because the search dialog lists Projects among its default results.
- Every copy of a duplicated Submission ID waits for owner review, instead of the first copy being used, so a re-paired row can never send.
- `setup()` repairs missing checkboxes and protection but refuses to overwrite changed headers, because rewriting headers over shifted columns would misalign the data.
- No real email was sent, and the live Sheets, Form and Clerk accounts were not changed.

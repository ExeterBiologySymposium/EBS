# Student registration tracker and welcome email

Students sign in to EBS, then submit the student application Google Form with the email address of their EBS account. Staff review the application and approve the student in **EBS administration → Participants**. Then staff request the welcome email by ticking **Send welcome email** in the private **Registration tracker** tab of the Form's response spreadsheet.

A Google Apps Script owned by `exeterbiosymposium@gmail.com` keeps that tab current and sends the welcome email. Before sending it checks, through the read-only `POST /api/registration-status` endpoint, that the application email belongs to exactly one verified EBS account that is **Accepted**. Nothing is sent without a tick, and a tick is never kept for later.

- Code: [`apps-script/student-registration/`](../apps-script/student-registration/) (`Code.gs` and `appsscript.json`), copied by hand into a standalone Apps Script project. The website build does not deploy it.
- Endpoint: [`server/registration-status.ts`](../server/registration-status.ts). Configuration: [organization administration](organization-admin.md#required-server-configuration).
- Tests: `npm run test:registration`.
- The repository is public. Sheet and Form IDs, the researcher form link, the token and student data live only in Script Properties and Vercel environment variables. Never commit them.

## For the EBS Team

### Request a welcome email
1. Review the application in the response tab (**Researcher Signup**).
2. Approve the student in **EBS administration → Participants** (**Accept participant**).
3. Open the tracker from **Participants → Open registration tracker** and tick **Send welcome email** on the student's row.
4. Within seconds the box clears and **Welcome email** shows the result. **Sent** means the email went out; a copy is in the EBS inbox (bcc).

A tick is a one-time request. If the student cannot be welcomed yet, the box clears and the row says why and what to do. Tick again once it is fixed. Approval alone never sends anything.

- Tick 5 or fewer boxes at a time, one by one or as one block. More than 5 at once are cleared without sending. Ctrl/Cmd multi-selections are seen only at the hourly check.
- Edit only the two checkbox columns; the rest of the tab is protected. To filter or sort, use **Data → Filter views** so your view does not change anyone else's.
- Keep notes in the response tab, not in the tracker.
- If you welcome a student yourself, send it from `exeterbiosymposium@gmail.com`, then tick **Welcomed by hand** on their row. The script will never send that student a welcome.
- Row 1 shows **Last successful check**. If it is more than 2 hours old, tell the account owner instead of emailing by hand.
- A bounce in the EBS inbox means the address needs review; tell the account owner.
- Editor access to this spreadsheet lets someone request welcome emails from the EBS account. Only EBS staff get Editor; everyone else gets Viewer.

### Columns
| Column | Shows |
| --- | --- |
| Send welcome email | Tick to request the welcome email (one-time) |
| Welcomed by hand | Tick after welcoming a student yourself |
| Application received | When the Form response arrived |
| Name in email | The Full Name the email will use |
| Application email | Researcher Email, or the adult contact email when Researcher Email is blank |
| Email source | Researcher Email or Adult contact |
| Clerk account | Verified match / No match / Ambiguous / Unavailable / No valid email |
| EBS status | Accepted / Pending / — |
| Welcome email | What happened, below |
| Welcome sent at | When the script sent the welcome |
| Submission ID, Clerk account ID | Stable identifiers for reconciliation; never edit them |

### Welcome email statuses
| Status | Meaning | What to do |
| --- | --- | --- |
| Not requested | Nothing has been asked for this row | Approve the student, then tick |
| Sent | The welcome went out at **Welcome sent at** | Nothing |
| Welcomed by hand | Recorded as welcomed outside the tracker | Nothing |
| Already welcomed (row N) | The same student was welcomed from row N | Nothing |
| Queued — sends at the next check (untick to cancel) | The daily mail limit, the per-run limit or the time limit was reached | Wait for the hourly check, or untick to cancel |
| Check unavailable — retries at the next check (untick to cancel) | The EBS lookup or the Researcher tracker could not be read | Wait; tell the owner if it lasts more than a few hours |
| Not sent (date): account is Pending. … | The student is not approved yet | Approve in Participants, then tick again |
| Not sent (date): account has no EBS status yet. … | The account has never opened its Account page | Ask the student to sign in and open Account, approve them, then tick again |
| Not sent (date): no EBS account uses this email. … | No verified EBS account has the application email | Ask the student to add and verify that email in their EBS account, or email them by hand and tick Welcomed by hand |
| Not sent (date): no valid email in the application. … | The application has no usable email | Email the student by hand and tick Welcomed by hand |
| Not sent (date): approved before the tracker started. … | Approved before the tracker went live, so it may have been welcomed by hand | If not yet welcomed, email them by hand and tick Welcomed by hand |
| Not sent (date): already in the Researcher tracker. | The email is already on the Researcher tracker list | Nothing |
| Not sent (date): sending is off. … | The owner has paused sending | Ask the owner, then tick again |
| Not sent (date): test mode. | Only the test address can receive email right now | Ask the owner |
| Not sent (date): too many boxes ticked at once. Tick 5 or fewer. | More than 5 boxes were ticked in one edit | Tick them again, 5 or fewer at a time |
| Needs owner review: … | The script will not send until the owner checks (reasons below) | Tell the account owner |
| Response deleted | The Form response was deleted | Nothing |

Owner-review reasons: **delivery unknown** (a send may or may not have gone out), **several applicants share this email**, **more than one EBS account**, **email welcomed under another account**, **account already welcomed for another applicant**, **send record missing**, **name needs checking** (the name looks like a link or address), **duplicate row** (a Submission ID appears on more than one row; every copy waits).

## Owner setup

Do these once, in order, signed in as `exeterbiosymposium@gmail.com`. Steps 5 and later change live systems: do them only as part of an authorized release.

1. **Sharing.**
   - Add each EBS staff Google account as Editor on the response spreadsheet ("EBS Outreach Form Responses"). Then set its General access to **Restricted**.
   - Do the same for the **Researcher tracker** spreadsheet and the Form.
   - In each file's share settings, turn off **Editors can change permissions and share**.
   - Confirm **File → Share → Publish to web** is off for both spreadsheets, and that the Form's collaborators are staff only.
2. **One-time audit.** The response spreadsheet was editable by anyone with the link, so check it once:
   - **Extensions → Apps Script** shows no bound project. Never authorize one there.
   - Search every tab, including hidden ones, for `IMPORTXML`, `IMPORTHTML`, `IMPORTDATA`, `IMPORTRANGE`, `IMAGE`, `HYPERLINK` and `http`.
   - Review named ranges, protections, the share list and **File → Version history**.
   - Alternative: link the Form to a new spreadsheet owned by the EBS account (Form → Responses → Link to Sheets → new spreadsheet). Use that for `TRACKER_SPREADSHEET_ID`, and keep the old file restricted as an archive.
3. **Form settings.** Make **Researcher Email** a required question with email validation. Turn off response editing and summary publishing.
4. **Token.** Generate one on your computer:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```
5. **Vercel (Production).**
   - Set `EBS_REGISTRATION_STATUS_TOKEN` to the token, marked **Sensitive**.
   - Set `EBS_REGISTRATION_TRACKER_URL` to the editable link of the Registration tracker tab (`https://docs.google.com/spreadsheets/d/…/edit#gid=…`).
   - The endpoint needs `EBS_ORG_POOLS_ENABLED=true`. Redeploy; this also publishes the updated website copy.
6. **Check the endpoint.** Read the token without echoing it, and test only with a reserved address:
   ```bash
   read -rs TOKEN
   ```
   ```bash
   curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://www.exeterbiosymposium.page/api/registration-status -H 'Content-Type: application/json' -d '{"emails":["nobody@example.invalid"]}'
   ```
   ```bash
   curl -sS -X POST https://www.exeterbiosymposium.page/api/registration-status -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"emails":["nobody@example.invalid"]}'
   ```
   Expect `401` without the token, then `{"results":[{"email":"nobody@example.invalid","account":"none"}]}`.
7. **Apps Script project.** Turn on 2-Step Verification for `exeterbiosymposium@gmail.com` first.
   1. Go to [script.google.com](https://script.google.com) → **New project** (a standalone project, not one opened from the spreadsheet). Keep the default Google Cloud project.
   2. Replace `Code.gs` with this repository's `apps-script/student-registration/Code.gs`.
   3. In **Project Settings**, tick **Show "appsscript.json" manifest file in editor**. Replace its contents with `appsscript.json`.
   4. Add the Script Properties below.
   5. Run `setup()` and grant **every** permission. Expect Google's "unverified app" screen; continue as the owner.
   6. In **Triggers**, set failure notifications to **Notify me immediately** for all three triggers.
   7. Never share or deploy the project: whoever can edit it can send email as the EBS account.
8. **Review the tracker.**
   - Check row 1 (status line), the headers in row 2 and one row per application. **Sending: Paused** is expected.
   - From a non-owner staff account, confirm the protection: sorting the tab, deleting rows, renaming the tab and editing **Submission ID** are refused, while the two checkboxes work.
9. **Test email.** Run `sendTestEmail()`. It always goes to `exeterbiosymposium@gmail.com`, with the subject `[Test] [Action Required] EBS Registration Update`. Then search the mailbox for `in:sent subject:"[Test]"` and note whether MailApp copies appear in Sent.
10. **End-to-end test** with a staff-controlled address:
    1. In the Clerk Dashboard, check without changing it whether email subaddresses are blocked, and confirm the Accepted list has space.
    2. Sign up on the website as `exeterbiosymposium+ebstest@gmail.com`, verify the email and open **Account**. This enrols the account in Pending.
    3. Submit the student Form as "EBS Test" with that Researcher Email.
    4. Set the Script Property `TEST_ONLY_RECIPIENT` to `exeterbiosymposium+ebstest@gmail.com` and run `enableSending()`. Row 1 shows **Sending: Test mode**.
    5. From a non-owner staff account, tick **Send welcome email** on the test row. Expect "Not sent (date): account is Pending…", and **Executions** should show `onTrackerEdit`.
    6. Accept the test participant in Participants, then tick again. Expect **Sent** within seconds: exactly one email plus the bcc copy, and one new Researcher tracker row.
    7. Untick and tick again: nothing more is sent.
    8. Clean up: delete the test user in the Clerk Dashboard, the Researcher tracker row and the test Form response. The tracker row then shows **Response deleted**.
11. **Go live** only with the project lead's go-ahead: delete `TEST_ONLY_RECIPIENT` and run `enableSending()`. Row 1 shows **Sending: On**.

### Script Properties
| Property | Required | Purpose |
| --- | --- | --- |
| `EBS_STATUS_TOKEN` | Yes | The same value as `EBS_REGISTRATION_STATUS_TOKEN` in Vercel (at least 32 characters) |
| `FORM_ID` | Yes | The student application Form's ID: the part after `/forms/d/` in its edit link |
| `TRACKER_SPREADSHEET_ID` | Yes | The ID of the Form's linked response spreadsheet. The script checks that the Form really is linked to it |
| `RESEARCHER_TRACKER_ID` | Yes | The Researcher tracker spreadsheet ID. It needs exactly one **Researcher** (or **Reseacher**) header and one **Email** header in row 1 |
| `RESEARCHER_FORM_URL` | To send | The researcher information form link used in the email (`https://docs.google.com/forms/…` or `https://forms.gle/…`) |
| `TRACKER_SHEET_NAME` | No | Tab name. Default `Registration tracker` |
| `ACCOUNT_EMAIL_QUESTION` | No | Default `Researcher Email` |
| `FALLBACK_EMAIL_QUESTION` | No | Default `Adult Contact Person Email` |
| `NAME_QUESTION` | No | Default `Full Name` |
| `RESEARCHER_TRACKER_SHEET` | No | Default `Sheet1` |
| `REGISTRATION_CYCLE` | No | Default `2027`. One welcome per EBS account per cycle |
| `MAX_SENDS_PER_RUN` | No | Default 10, at most 50 |
| `TEST_ONLY_RECIPIENT` | No | While set, only this address can receive the welcome. It must be `exeterbiosymposium@gmail.com` or a `+tag` of it |
| `TAKEOVER_FROM_SCRIPT_ID` | Rarely | Only when moving the tracker to a new project (below) |
| `RESOLVE_SUBMISSION_ID`, `RESOLVE_OUTCOME` | Rarely | Inputs for `resolveSend()`. They are deleted when it runs |

The sender address, the test recipient and the endpoint address are fixed in the code; properties with those names are ignored. The script writes `SENDING_ENABLED`, `SENDING_CYCLE`, `AUTOMATION_START` (set by the first `setup()`), `PINNED`, `PENDING_EDIT`, `LAST_SUCCESS`, `LAST_STATUS`, `LAST_FULL_REFRESH` and records whose names start with `ebs:`. Never edit those by hand; the records are what prevent duplicate welcomes.

### What the script checks
On every run the script refuses to write student data or send unless all of these hold:
- the response spreadsheet is Restricted and editors cannot reshare it;
- the Form is linked to `TRACKER_SPREADSHEET_ID`, with response editing and summary publishing off;
- the three configured questions still exist with the same titles;
- it runs as `exeterbiosymposium@gmail.com`, and this project holds the tracker's claim;
- the tracker's headers, checkboxes and protection are intact.

While sending is on, it also requires the same `REGISTRATION_CYCLE` that `enableSending()` recorded, every granted permission and a valid `RESEARCHER_FORM_URL`.

A failed check writes only a "Paused — …" line in row 1. A definite failure also turns sending off. The tracker never shows exception text, and logs contain only row numbers and counts.

## Operations
- **Stop sending at once:** run `pauseSending()`, or set the Script Property `SENDING_ENABLED` to `false`. To resume, run `enableSending()`. It first clears any boxes ticked while sending was off.
- **After changing `appsscript.json`:** run `setup()` from the editor and grant every permission.
- **Needs owner review: delivery unknown.**
  - Search the EBS inbox for the student's address; every welcome has a bcc copy there. Then set `RESOLVE_SUBMISSION_ID` to the row's **Submission ID** and run `resolveSend()`:
    - set `RESOLVE_OUTCOME=sent` if the copy is there, or if you have now emailed the student yourself. The row shows Sent and the student is added to the Researcher tracker;
    - set `RESOLVE_OUTCOME=retry` only if there is no copy. Staff can then tick the row again.
  - A row already recorded as sent is never downgraded.
- **"A welcome with no record"** (in row 1, or "send record missing" on a row): a row shows Sent or Welcomed by hand, but the records are gone, for example after the project was re-created. That row blocks every welcome for the same student. Check the inbox, then record it with `RESOLVE_OUTCOME=sent`.
- **"Tracker layout changed — owner runs setup()":**
  - Undo the change first (**File → Version history**), for example a moved or inserted column, or edited headers. Then run `setup()`.
  - `setup()` repairs missing checkboxes and protection, but refuses to overwrite changed headers.
- **Moving to a new project:** in the new project, set `TAKEOVER_FROM_SCRIPT_ID` to the old project's script ID (**Project Settings → IDs**), run `setup()`, then `enableSending()`. Sending starts off with a new cut-over time. Remove the old project's triggers or delete it.
- **When someone with access leaves:**
  - Remove their Drive and Form access.
  - Rotate the token in both Vercel and Script Properties (setting both together pauses lookups only briefly).
  - Change the `exeterbiosymposium@gmail.com` password if they knew it.
- **Quotas** (consumer Google account):
  - 100 email recipients a day. Each welcome uses 2 because of the bcc, so about 50 welcomes a day.
  - 90 minutes of trigger runtime a day, and 6 minutes per run.
  - The script queues sends rather than exceeding a limit.
- **New registration cycle:** create or link the new Form, update `FORM_ID`, `TRACKER_SPREADSHEET_ID` (if the spreadsheet changes) and `REGISTRATION_CYCLE`, run `setup()`, then `enableSending()`. Records for earlier applications stay and keep blocking duplicates.
- **Deleting a student's data:** delete the Form response (the tracker blanks the row), the Researcher tracker row and the inbox copy. Records hold IDs, hashed emails and timestamps, plus the error text of a failed send.
- **Website text:**
  - Published Website content may still mention the old orientation call or the old contact address; check it in **EBS administration → Website content**.
  - The live site keeps old page text until the next deploy.

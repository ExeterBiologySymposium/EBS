# Student registration automation

Status: approved by the user in chat on 2026-11-14 with the amendments below; implemented locally. Going live follows the [student registration runbook](../../docs/student-registration.md) and needs separate authorization.

Students sign into EBS and submit the existing student Google Form with the same email address. Staff review the response in a private Google Sheet and approve eligible students in **Account → Manage participants**. Google Apps Script sends one welcome email from `exeterbiosymposium@gmail.com` after EBS confirms a matching verified Clerk account and its Accepted membership. School registration is outside this feature.

## Acceptance criteria

- The student signup page and FAQ explain the account, application, review, and welcome steps. Students can still apply with their existing EBS account and Google Form.
- The form's linked Sheet retains its response tab. The script creates a separate **Registration tracker** tab with the submission date, application email, account match, EBS status, email status, and send time. Staff can see mismatches and unresolved sends. The tracker never grants access or changes Clerk memberships.
- Staff approval is the actual Accepted membership in a registered EBS organization. A Pending account, unmatched or ambiguous email, outstanding invitation, or unavailable lookup cannot trigger the welcome email. Existing verified accounts can match. Matching trims whitespace and ignores case without treating aliases as equivalent.
- A recipient must have a new Accepted membership after submission and after the automation start time. Older applications that staff approve after launch can still receive a welcome. Previously Accepted students stay visible in the tracker without an automatic backfill. Multiple submissions from one Clerk account share one welcome per registration cycle.
- The script runs with automatic sending disabled until the owner enables it. It checks that it is running as the confirmed Gmail sender and uses the available mail quota. If sending may have succeeded but could not be confirmed locally, the tracker surfaces the attempt for staff review instead of retrying automatically.
- The integration uses a dedicated credential. Clerk credentials stay on the EBS server. Student data and the Sheet stay private. Setup instructions cover the linked Sheet, Apps Script configuration, trigger, dry run, email template, and release test.

## Amendments approved 2026-11-14

These replace the matching parts of the text above. The approved implementation plan is summarized in [the plan](../plans/student-registration-automation.md).

### Staff request each welcome
- Staff request a welcome by ticking **Send welcome email** in the private Registration tracker. Nothing is sent without a tick, and no email is sent automatically after approval. *Superseded:* sending as soon as EBS confirms an Accepted membership, and polling-driven automatic sends.
- A tick is a one-time request. If the row is eligible the email is sent within seconds and the box clears. If the script itself must wait (lookup unavailable, quota, per-run cap, busy), the box stays ticked and the row says it is queued. Otherwise the box clears and the row explains why and what to do, for example "account is Pending — approve in Participants, then tick again".
- A row is eligible only when its email belongs to exactly one verified Clerk account with an Accepted membership in a registered EBS pool, that membership began after sending went live (`AUTOMATION_START`, recorded by the first `enableSending()` outside test mode), and the student has not been welcomed. *Superseded:* the separate "new Accepted membership after submission" rule; staff now decide when to request the email after reviewing the application.
- **Welcomed by hand** records a welcome sent outside the script, so the script never sends that student another. Before any send, the script also checks that the email is not already listed in the Researcher tracker.
- One welcome per Clerk account per registration cycle, and never two for one application. Applications that share an email need one consistent name; otherwise the row needs owner review.

### Email
- The script reads "Researcher Email" from the Form response; if it is blank, it uses "Adult Contact Person Email". Recipient and name always come from the Form response and the EBS lookup, never from tracker cells.
- Subject: `[Action Required] EBS Registration Update`. Body, used verbatim with `[Name]` replaced by the applicant's Full Name. On 2026-11-15 the second paragraph changed: students now complete the researcher information form before they are approved, so the email no longer links to it and keeps only the Drive folder sentence.

  ```text
  Dear [Name],
  We are pleased to inform you that you have successfully passed the first round of the EBS application — Congratulations! We have chosen you because of your passion and willingness to dedicate time and effort to our Symposium.
  You will be receiving an invitation to a Google Drive folder where you can store all your research, as well as your research mentor assignment.
  The EBS team is beyond excited to have you start your research journey.
  Best regards,
  Adrian Chan
  Founder, Exeter Biology Symposium
  P H I L L I P S   E X E T E R   A C A D E M Y
  20 Main Street | Exeter, NH 03833
  exeterbiosymposium@gmail.com
  ```

- Welcomes come from `exeterbiosymposium@gmail.com` with a bcc copy to the same inbox as delivery evidence. The owner's test email always goes to `exeterbiosymposium@gmail.com`.
- After each welcome the script sends, it appends the student's name and email to the Researcher tracker (Sheet1) unless the email is already listed.

### Privacy and control
- The script refuses to run unless the response spreadsheet is Restricted, editors cannot reshare it, Form response editing and summary publishing are off, and the configured questions still match. The same sharing checks apply before it reads or writes the Researcher tracker.
- Sending starts off and is enabled by the owner (`enableSending()`); `pauseSending()` stops it at once. A test mode limits sending to the EBS inbox.
- The repository is public. Sheet and Form IDs and the token live only in Vercel environment variables and Apps Script properties.

### Website
- The signup page and FAQ tell students to enter their EBS sign-in email in the Researcher Email field, then explain review, Account access and the welcome email from `exeterbiosymposium@gmail.com`.
- The site contact address is `exeterbiosymposium@gmail.com` everywhere.
- The orientation call is no longer offered and was removed from the FAQ, Schools and Student research.

# Student registration automation

Status: proposed for approval.

Students sign into EBS and submit the existing student Google Form with the same email address. Staff review the response in a private Google Sheet and approve eligible students in **Account → Manage participants**. Google Apps Script sends one welcome email from `exeterbiosymposium@gmail.com` after EBS confirms a matching verified Clerk account and its Accepted membership. School registration is outside this feature.

## Acceptance criteria

- The student signup page and FAQ explain the account, application, review, and welcome steps. Students can still apply with their existing EBS account and Google Form.
- The form's linked Sheet retains its response tab. The script creates a separate **Registration tracker** tab with the submission date, application email, account match, EBS status, email status, and send time. Staff can see mismatches and unresolved sends. The tracker never grants access or changes Clerk memberships.
- Staff approval is the actual Accepted membership in a registered EBS organization. A Pending account, unmatched or ambiguous email, outstanding invitation, or unavailable lookup cannot trigger the welcome email. Existing verified accounts can match. Matching trims whitespace and ignores case without treating aliases as equivalent.
- A recipient must have a new Accepted membership after submission and after the automation start time. Older applications that staff approve after launch can still receive a welcome. Previously Accepted students stay visible in the tracker without an automatic backfill. Multiple submissions from one Clerk account share one welcome per registration cycle.
- The script runs with automatic sending disabled until the owner enables it. It checks that it is running as the confirmed Gmail sender and uses the available mail quota. If sending may have succeeded but could not be confirmed locally, the tracker surfaces the attempt for staff review instead of retrying automatically.
- The integration uses a dedicated credential. Clerk credentials stay on the EBS server. Student data and the Sheet stay private. Setup instructions cover the linked Sheet, Apps Script configuration, trigger, dry run, email template, and release test.

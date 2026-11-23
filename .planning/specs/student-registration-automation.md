# Student registration in EBS

**Status** Deferred proposal. The [current workflow](../../docs/student-registration.md) uses the embedded Google Form and the existing approval screen.

Students should submit their application on Student registration and see the submitted state in Account. Staff should review applications and approve access in Participants. An approved student receives a welcome from the EBS inbox after a staff member reviews and sends the prepared message. Staff retain control of each welcome, including the decision to send it and the send confirmation.

## In scope

- An authenticated student application bound to the Clerk user ID and to a verified account email selected from that account. Use the installed authentication and private Neon database. Carry forward the current required application questions and consent text once staff verify the form inventory. Capture the minimum data staff need to review an application.
- A Team-only **Student applications** view in Participants with application details, existing approval, and a welcome action. Keep application submissions distinct from the general Pending membership list. Keep the existing EBS welcome template and sender.
- Registration and Account status on the server. The native workflow covers individual student entries. Each researcher applies individually. The school and judge forms stay on their own signup pages.
- Maintain older submissions in the private form response archive and finish reviewing that backlog through the existing Participants workspace. No historical import or bulk welcome is required for launch.

## Acceptance criteria

- A signed-in student with a verified email can submit once per registration cycle and see the confirmation across devices. Repeated or simultaneous submissions cannot create duplicate applications. A signed-out visitor cannot submit. A student can read only their own record, and account IDs and staff decisions are set on the server.
- Creating an account does not place a record in the applications queue. Submitted applications are visible only to current EBS Team members. Staff can open the submitted answers and approve the associated verified account using the existing pool-aware flow.
- Only actual Accepted membership grants access. A failed or incomplete approval shows a retryable message and preserves the application. If approval succeeded but Pending cleanup failed, the existing cleanup retry remains available.
- Website approval also attempts research folder and starter document setup using the existing participant folder workflow. Report the folder outcome alongside approval so staff can follow up without repeating an access decision.
- Welcome preparation checks current Accepted membership and a still-verified recipient. Staff copy the prepared recipient, subject and body into the EBS inbox and send explicitly. Staff can record the send once per account and cycle. The record shows a staff confirmation time. An older Accepted account does not generate a queued welcome solely because the feature goes live.
- Inputs are bounded and validated. Application data stays out of public content, prerendered HTML, analytics payloads and application logs. Follow the existing EBS privacy workflow for access and deletion requests and confirm the retention rule before launch.
- At cutover, the application instructions and Account state reflect the live workflow, including any saved website content overrides. Existing submissions remain reviewable, and a rollback preserves all records created before it.

## Dependencies

Use the current website, Clerk and Neon. Staff use regular access to the EBS inbox to send welcomes. No mail API, new Google authorization, new provider account, or paid plan is required.

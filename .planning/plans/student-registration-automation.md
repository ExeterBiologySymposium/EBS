# Student registration implementation plan

**Status** Deferred proposal. The default student registration method is the [embedded Google Form](../../docs/student-registration.md). The previous automation stopped at Google authorization. Its November 23 inspection found zero installed triggers and no recent executions.

See the [specification](../specs/student-registration-automation.md) and [screen design](../design/screens/student-registration-automation.md).

## Implementation

1. Confirm the current application's required questions, consent text, and retention expectations with the form owner before freezing the field list. Define a per-cycle application record keyed by the authenticated Clerk user ID. Include verified recipient, form answers and submission time, and a staff-confirmed welcome timestamp. Apply a unique database constraint per cycle and user. Keep approval truth in Clerk.
2. Add the authenticated submission and self-status API, a Team-only paginated application list and detail flow, and a Team-only action for confirming a welcome. Reuse the existing production, same-origin, request-size, no-store and fresh Team authorization checks as applicable. Bind the user and verified emails on the server. Resolve the selected application account and verify its email before approving or preparing a welcome. Reuse the pool-aware approval and research folder setup, with separate approval and folder outcomes.
3. Update `src/pages/student-signup.tsx`, the student progress and Account UI, and Participants in `src/pages/admin.tsx` using the existing site and admin components. Update the registration and FAQ guidance, privacy copy, editor preview and relevant content defaults. Preserve the existing signup path behind a deployment switch during validation and use that switch to select the active public instructions. Confirm whether saved editorial overrides require an update at cutover.
4. Produce the welcome recipient, subject and body for staff after approval. Use the existing template from the staff guide. Staff send it in the EBS inbox, then mark it sent in Participants. Recheck server eligibility when recording, and use a conditional update so the first recorded send is retained. Staff check Gmail Sent if another person could have handled the welcome or delivery is uncertain.
5. Update the staff runbook for the new flow and the backlog. Prepare the additive migration and rollback instructions. Before cutover, complete a staff-controlled test and agree on the last submission date for the old form. Process earlier responses in the current private archive and retain any application records created in EBS during rollback. Apply production changes and send controlled test email only with release authorization.

## Verification

- Write failing acceptance tests before adding behavior. Cover signed-out access, cross-origin writes, missing or changed verification, attempts to read another student's record, database deduplication, separate applications and Pending membership, staff revocation, approval failure and cleanup retry, and welcome gating and idempotent confirmation.
- Exercise SQL constraints in the installed PostgreSQL-compatible test runtime. Verify retry after interrupted submission and duplicate confirmation across staff sessions.
- Run `npm run test:org-admin`, the new registration suite, `npm run test:content`, `npm run build`, and the SEO checks if public metadata changes. Use a localhost fixture for student and staff flows at desktop and mobile widths, including keyboard navigation and editor preview.
- During an authorized cutover, verify one controlled student submission, cross-device status, staff approval, correct sender and welcome confirmation, and continued staff access to past submissions. The server does not send mail.

## Release coordination

After deploying the repository cleanup, the owner can remove the two retired registration-only environment settings in Vercel and decommission the unused external automation. Preserve the current response archive. This plan does not require changing the Drive authorization used by participant research folders.

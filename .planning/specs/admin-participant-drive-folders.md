# Bulk research folder creation for Accepted participants

Status: Approved November 23, 2026.

In **Admin → Participants → Accepted**, an EBS Team member can choose **Create Google Drive folders** to provision a research folder and starter Google Doc for each eligible participant across all Accepted lists. The server collects the Accepted roster for the run and deduplicates by Clerk user ID. It checks the participant's current Accepted membership before attempting each folder. Pending applicants and outstanding invitations are outside the action's scope.

Use the same EBS-owned Drive destination, starter document, and folder record as the Account workflow. Share the generated folder with the participant's single verified linked Google account, using the existing sharing rules. Existing generated folders are reused, custom links are honored, and participants without a single verified Google account are listed for follow-up. A different Google identity on a saved record requires staff review. The participant can open a provisioned folder from Account. Folder creation itself sends no email.

## Acceptance criteria

1. One click starts a run covering all Accepted pools, including participants beyond the current list page and accounts in more than one pool. The list can be empty. Each participant is attempted once per run.
2. The server rechecks Team access on every request and Accepted membership before each write. Same-origin JSON, body validation, and private response headers follow the Team endpoint's existing rules. It resolves the Google recipient server-side.
3. An eligible participant can open the same folder and starter Doc from Account after an admin run. Repeat runs and simultaneous Account requests use the existing folder record and claim, including its partial-failure recovery.
4. Staff can see progress, successful and skipped counts, and the explanation for each participant requiring follow-up. A participant-level failure allows the next eligible participant to proceed. Loss of Team access stops further work.
5. Completed folders remain available if the tab closes or an admin reruns the action. Staff can retry safely once an account is linked or another recoverable problem is resolved.

See the [screen design](../design/screens/admin-participant-drive-folders.md) and [implementation plan](../plans/admin-participant-drive-folders.md).

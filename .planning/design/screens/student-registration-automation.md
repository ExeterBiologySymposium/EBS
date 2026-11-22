# Student registration and staff tracker

Status: approved by the user in chat on 2026-11-14 with the amendments below; implemented locally. Going live follows the [student registration runbook](../../../docs/student-registration.md) and needs separate authorization.

The student registration page keeps its current layout and **Open student application** action. The text next to that action tells students to use their EBS account email in the form. After the form, staff review the application. The student receives an email after approval and can check access on their Account page. The FAQ gives the same sequence.

The Participants workspace shows an **Open registration tracker** link when a valid Sheet URL is configured. The link uses the same staff workspace and existing button styles. Google sharing controls access to the Sheet. The page keeps its current approval controls.

| Tracker column | Example |
| --- | --- |
| Application received | Nov 16, 2026, 4:15 PM |
| Application email | student@example.org |
| Clerk account | Verified match / No match / Ambiguous / Unavailable |
| EBS status | Pending / Accepted |
| Welcome email | Waiting for approval / Ready / Sent / Needs review / Held for historical review |
| Welcome sent at | Nov 16, 2026, 4:40 PM |

Keep stable submission and account identifiers for reconciliation. Freeze the header and add filters. Status is shown as text so it remains clear without color. Keep application answers in the linked response tab for staff review.

## Amendments approved 2026-11-14

Staff request each welcome email from the tracker. The approved tab layout replaces the column table above:

| Column | Header | Values |
| --- | --- | --- |
| A | Send welcome email | Checkbox; staff edit |
| B | Welcomed by hand | Checkbox; staff edit |
| C | Application received | Date and time |
| D | Name in email | The Full Name the email will use (display only) |
| E | Application email | The address read from the Form response |
| F | Email source | Researcher Email / Adult contact |
| G | Clerk account | Verified match / No match / Ambiguous / Unavailable / No valid email |
| H | EBS status | Accepted / Pending / — |
| I | Welcome email | Status text (below) |
| J | Welcome sent at | Date and time |
| K | Submission ID | Stable Form response ID, written once |
| L | Clerk account ID | Stable account ID |

- **Welcome email statuses**, first match wins: Sent; Welcomed by hand; Already welcomed (row N); Needs owner review: delivery unknown; Response deleted; Queued — sends at the next check (untick to cancel); Check unavailable — retries at the next check (untick to cancel); Not sent (date): reason and next step; Needs owner review: reason; Not requested. *Superseded:* Waiting for approval, Ready and Held for historical review.
- Row 1 shows the last successful check, whether sending is on, paused or in test mode, any problems and counts. Rows 1–2 are frozen and the status header carries a legend note.
- The tab is protected: staff can edit only columns A–B. Staff filter with filter views rather than a shared filter, so sorting can never re-pair rows. *Superseded:* "add filters" as a shared basic filter.
- Status stays text-only. Application answers and staff notes stay in the linked response tab.
- Participants shows **Open registration tracker** beside **Refresh lists and capacity** when a valid editable Sheets link is configured, with the hint "After accepting a participant, tick Send welcome email for them in the tracker." It opens in a new tab and is never shown to signed-out or non-Team visitors.

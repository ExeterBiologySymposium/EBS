# Student application screens

## Student registration and Account

Keep the current Student registration heading, eligibility notes and sign-in controls. After sign-in, show the verified account address and the application questions in a single form. If the account has multiple verified emails, offer a labeled selector. If verification is needed, direct the student to their Account settings.

Use an error summary linked to invalid fields and keep entered answers visible after a recoverable error. Disable duplicate submission while the request is in progress. After confirmation, focus a status heading. Show the same server-confirmed status in Account.

| Server state | Student sees |
| --- | --- |
| No application | Application form on Student registration and a link to it from Account |
| Submitted | **Application received**, the date, and the next review step |
| Accepted membership | **Accepted** in Account with the existing member links |
| Temporary lookup or submission error | A retry action and the existing EBS contact link |

## Participants

Add **Student applications** alongside Pending, Accepted and Invitations. Use the current participant row layout and pagination. Display the applicant's name, submission date, and review or welcome status on each row. A **Review application** control opens the answers in the same view. Keep all actions accessible by keyboard and preserve focus after a refresh.

1. Staff open an application and select **Approve student** after reviewing the answers. Show the result of research folder setup alongside the approval and surface any follow-up.
2. After confirmed approval, **Prepare welcome email** reveals the verified address, subject and message with copy controls. Staff send it from the EBS inbox.
3. **Mark welcome sent** records the staff confirmation and timestamp. Staff can see a previous confirmation before composing. If someone has the same record open, a fresh fetch shows the recorded send and prevents a second confirmation.

Use the existing button, form, error and private page patterns. Show only sample content in the website editor preview and keep all submission, approval and email controls inert there. On narrow screens stack labels, answers, and actions in reading order.

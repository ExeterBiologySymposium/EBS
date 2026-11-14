# Custom participant research folder links

Status: Approved November 14, 2026

## Behavior

An EBS Team member can assign a custom research folder URL to an Accepted participant in **Admin → Accepted**. The assignment is per participant. Accept absolute HTTP and HTTPS URLs from any provider, including Google Drive, Dropbox and OneDrive. Reject malformed URLs, embedded credentials, and non-web schemes. Use a shared length limit and validate at the admin API and before rendering the link.

The participant’s **Open my folder** button opens the assigned link from Account. While the custom link is set, the account shows just that destination and skips the Google-account and folder-creation steps. The EBS team must grant the participant access on the linked service. Clearing the custom link returns that participant to their existing Google Drive folder and starter document, or lets them create a folder if they have none.

## Design for the existing screens

- On the Accepted list, each participant row has a **Research folder link** disclosure. Opening it loads the saved custom link for that participant. Use the existing admin form styling, with a labeled **Custom URL** field and a **Save folder link** button. The hint explains how to clear the link and where to manage sharing. Show an inline status after saving, and let staff retry if loading or saving fails. The disclosure and form stay keyboard accessible and stack within the row on narrow screens.
- On Account, reuse **Your research folder** and **Open my folder**. For a custom link, show a short status that the EBS team shared the link. Update the existing account help to explain both assigned and generated folders and direct participants to EBS for access problems.

## Access and persistence

- Reuse `/api/team-admin` and its fresh Team authorization, same-origin write check, request size limit, and private responses. Admin reads and writes also check that the target still has Accepted membership. Load the link only when staff open its editor.
- Store one URL per Clerk user ID under a dedicated key in private user metadata. Merge that key only and remove it by saving an empty field. This needs no new database table or environment variable.
- `/api/participant-folder` checks the signed-in user’s current Accepted membership before looking up their URL. Both GET and POST honor an already-assigned custom link before checking Google identity or configuring Drive. The participant endpoint only reads the custom link and always resolves the target from the session.

## Acceptance criteria

1. Staff can load, assign, replace, and clear a custom URL for an Accepted participant. The saved value is available after reload.
2. An Accepted participant sees their own saved URL even without a linked Google account or a configured Drive integration. With a custom URL set, Account renders one folder link and the API skips automatic folder provisioning.
3. Clearing the URL recovers the existing Google Drive behavior and any previously provisioned folder and document. Participants without an assignment experience the existing Drive flow.
4. Requests from non-Team users cannot load or change assignments through the admin endpoint. Signed-out, Pending and unassigned users cannot read assignments through Account. Staff requests for non-Accepted targets, cross-origin writes and unsafe URLs are rejected.
5. The existing admin list remains usable on desktop and mobile. Loading, validation and save results are available to keyboard and screen-reader users.

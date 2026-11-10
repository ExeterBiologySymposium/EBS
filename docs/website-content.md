# Website content editor

EBS Team members can update five pages through the website, without repository access, a build or a deployment:

| Page | Route | Who can read it |
| --- | --- | --- |
| Student research | `/researchers.html` | Everyone (public) |
| Resources | `/resources.html` | Accepted members |
| Coding | `/datascience.html` | Accepted members |
| Python | `/python.html` | Accepted members |
| R / RStudio | `/rstudio.html` | Accepted members |

Other pages, navigation labels, search descriptions and research Google Docs are not edited here.

## For the EBS Team

### Opening the editor

Use **Account → Edit website content**, **EBS administration → Website content** (`/admin.html?view=content`), or **Edit this page** at the top of any of the five pages. Editing requires membership in the EBS Team organization, the same access as participant administration. You do not need to be Accepted to edit or preview; reading the member pages themselves still requires Accepted.

### Editing

Choose a page from **Page**. Fields are grouped by the visible parts of the page and use the page's existing layout, so you only supply words, links and images.

- **Required** fields are marked. If something needs fixing, **Save draft** lists each problem; select one to jump to the field.
- **Repeated entries** (timeline entries, research areas, formats, sections, links, images) have **Up**, **Down** and **Remove** buttons. A removal can be reversed with **Undo** in the bar at the bottom until you make another change.
- **Text and links.** Leave a blank line between paragraphs. To add a link, select the words in the text and choose **Add a link**, then enter where it goes. A link can point to a site page (`faq.html`, `faq.html#contact`), a full `https://` address, or an email address (typed addresses become `mailto:` links). External links open in a new tab.
- **Images.** Choose an existing site image by name, or paste a full `https://` image link. Always describe what the image shows; the description is read aloud to people who use screen readers. Uploading files is not supported yet.
- **Resources and Coding pages** are built from sections: **Text**, **List**, **Links**, **Images** and **Code**. A section with a heading starts a new part of the page; sections without a heading continue the part above. Code is displayed exactly as typed, with a Copy button; it never runs on the website.
- **Student research** keeps its existing sections. The registration form link is shared by both registration buttons, which still ask visitors to sign in first. The second button can open any member page; visitors who are not Accepted are sent to sign in or to their Account instead.

### Saving, previewing and publishing

1. **Save draft** stores your changes privately. Readers keep seeing the live version.
2. **Preview draft** shows the page exactly as readers will see it, labelled as unpublished. Links are disabled in previews.
3. **Publish** makes the saved draft live. Readers see it the next time they open the page (an open tab updates when it regains focus). No deployment is needed. Publish is available only when the draft is saved and differs from the live page.
4. **Published versions** lists every publication with its time and publisher. **Preview** shows an older version; **Restore to draft** copies it into your draft. Restoring never publishes by itself: review it, then select **Publish**. Restoring the version marked **Live now** is a quick way to discard a saved draft.

### Messages you might see

- **Unsaved changes.** Leaving the editor, switching pages or reloading asks before discarding them.
- **Someone else saved this page after you opened it.** Your edits are kept on screen and nothing was overwritten. Choose **Discard my edits and load the latest version**, or **Save my edits over the latest version** (their draft is replaced; anything they published stays in Published versions).
- **We could not confirm whether your save (or publication) finished.** The connection dropped after the request was sent. Select **Check what was saved**; the editor compares your edits with the saved version and tells you whether to try again. Do not simply repeat the action.
- **Your team access has changed.** Team membership was removed or your session ended, so the editor closed. Sign in again or ask the account owner.
- **Website editing has not been set up yet.** The site owner has not finished the setup below.

## For the site owner: setup and operation

Local implementation does not apply the migration, enable configuration, publish real content or deploy. Do these as a release step.

### Requirements

- Participant administration configured as in [Organization administration](organization-admin.md). Team checks reuse its verified Production instance and `CLERK_TEAM_ORG_ID`, so editing works wherever participant administration works (Production only).
- The existing private Neon database (`EBS_ORG_DATABASE_URL`, or `EBS_DRIVE_DATABASE_URL` through the same fallback) and `EBS_ORG_INSTANCE_ID`. Content rows are keyed by this instance ID. Never expose the connection string in browser variables.

### Enabling

1. Validate on an isolated Neon branch first: run [`scripts/sql/page-content.sql`](../scripts/sql/page-content.sql) there and test with a disposable deployment.
2. Apply the same script once to the Production database with a private server role, for example in the Neon SQL Editor. It is additive and safe to re-run: it creates only `ebs_content_pages` (current draft and publication per page), `ebs_content_versions` (append-only publication history) and triggers that block changing, deleting or truncating versions. It does not touch organization or research-folder tables. (Tables named `ebs_page_content`/`ebs_page_publications` from an earlier unreleased draft of this feature are unused.)
3. In Vercel Production, set the server-only variable `EBS_CONTENT_ENABLED=true` and redeploy.
4. Verify on the live site: anonymous visitors can read Student research; Resources/Coding/Python/R redirect anonymous and Pending visitors; a Team member can save, preview and publish a harmless change (and restore the previous version afterwards); a non-Team account gets "does not have access" from the editor.

No seeding is needed. Until a page is first published, readers receive its built-in content, and the editor starts from that content.

### Behaviour and failure handling

- **Disabled or not yet set up** (`EBS_CONTENT_ENABLED` not `true`): readers receive the built-in content and the editor explains that setup is incomplete. Turning the flag off later hides published changes (they remain stored) and shows the built-in content again.
- **Database or configuration errors** are reported, never treated as an empty database. Student research keeps its built-in snapshot with a "could not be loaded" notice and Try again; member pages show the notice without content. Drafts are never shown to readers.
- **Concurrency.** Every write names the revision it was based on and is checked atomically in SQL; a stale write is refused with a conflict. A publication and its history record are written in one statement.
- **Search engines and no-JavaScript visitors** see the build-time Student research snapshot in `src/content/defaults/researchers.ts`; published changes replace it once the page's JavaScript loads. After significant publications, copy the published text into that file in a normal code change so the snapshot and the page metadata stay current. Member pages are noindex and never prerendered with content.
- **Removing content.** Versions cannot be edited or deleted. To take something down, publish a corrected version.

### Security model

- Every editor request authenticates the Clerk session and freshly checks EBS Team membership server-side; member-page reads check Accepted membership; Student research reads are public. Page, audience and instance come from server configuration, never from the request.
- Mutations require a same-origin `Origin`, `application/json`, a bounded body (about 200 KB per page) and an exact field set. Content is validated against fixed page schemas: unknown fields or section types are rejected, text is length-limited and rendered as text, links must be site paths, `https://` or `mailto:`, and images must be site paths or `https://`. Scripts, HTML, `javascript:` and `data:` links are rejected.
- All responses are private and `no-store`. Member page defaults live in `server/content/defaults.ts` and never enter public JavaScript or prerendered HTML.
- The history triggers stop the website and ordinary SQL from rewriting publications, but a database owner can still disable triggers. Where your Neon setup allows it, run the website with a role limited to `SELECT, INSERT, UPDATE` on `ebs_content_pages` and `SELECT, INSERT` on `ebs_content_versions`, and keep owner credentials out of Vercel.

### API

`/api/page-content?page=<page>` with `action`:

| Method | Action | Access | Result |
| --- | --- | --- | --- |
| GET | `read` (default) | Public for `researchers`; Accepted otherwise | Published (or built-in) content only |
| GET | `edit` | Team | Draft, live content, revision and edit/publish metadata |
| GET | `history` | Team | Up to 50 publications, newest first |
| GET | `version&version=N` | Team | One publication's content |
| POST | `save` `{revision, content}` | Team | Saves the draft |
| POST | `publish` `{revision}` | Team | Publishes the saved draft |
| POST | `restore` `{revision, version}` | Team | Copies a publication into the draft |

### Verification

Run `npm run test:content`, `npm run test:org-admin`, `npm run typecheck` and `npm run build`. The SQL tests need the optional `@electric-sql/pglite` runtime (`npm install --no-save @electric-sql/pglite`) and report a skip without it; a skipped SQL suite is not database verification.

`node scripts/content-browser-fixture.mjs` (also needs PGlite) starts a localhost-only fixture at `http://127.0.0.1:4181/admin.html?view=content` with fake identities and an in-memory database. Its QA controls simulate a lost response, a concurrent editor, revoked Team access, a Team member who is not Accepted, and a signed-out visitor. It cannot reach Clerk or the hosted database.

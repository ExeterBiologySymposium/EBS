# Website content editor

Status: implementation requested by the user on November 10, 2026 and completed locally; see [Website content editor](../../docs/website-content.md) for usage and setup. Applying the migration, enabling `EBS_CONTENT_ENABLED` and deploying remain separate release steps. Prepared November 10, 2026.

## Outcome and confirmed scope

Existing EBS Team members can change website content through signed-in website forms without repository access. The user confirmed both Resources and Student research, plus Coding. Coding includes the existing overview, Python and R/RStudio routes.

| Page | Route | Published content audience |
| --- | --- | --- |
| Student research | `/researchers.html` | Public |
| Resources | `/resources.html` | Accepted members |
| Coding | `/datascience.html` | Accepted members |
| Python | `/python.html` | Accepted members |
| R / RStudio | `/rstudio.html` | Accepted members |

Editing and draft previews require verified membership in the existing configured EBS Team organization. Team members can preview within the editor even if they do not also belong to Accepted. Ordinary page access continues to follow the table above. No new staff role or invitation flow is needed.

## Current implementation

- React/TypeScript with Vite and prerendered HTML; Vercel middleware and API functions provide runtime authentication. The older static-only description in `CLAUDE.md` is superseded by the actual implementation and `docs/member-access.md`.
- Current content lives in the five page components. Resources contains two example posters. The three Coding routes currently contain placeholders. Student research includes introductory copy, research areas, checkpoints, presentation formats, support and registration links.
- `src/pages/admin.tsx` and `src/pages/account.tsx` already expose Team-only administration. `organizationRuntime().service.isTeam()` freshly verifies the configured Team membership and Production instance. `clerkAccess.membership()` recognizes registered Accepted organizations.
- The repository already uses `@neondatabase/serverless`, private server credentials and parameterized SQL. Reuse these patterns; no CMS service, authentication replacement or runtime dependency is proposed.
- Concurrent uncommitted copy updates appeared during investigation, including case-by-case wet-lab presentation eligibility. Preserve the latest working-tree content when capturing defaults; do not restore older text from Git or this planning session.

## Authoring experience

Add **Account → Edit website content**, also linked from EBS administration. Use a separate Content workspace on the existing `/admin.html` route so participant management and Clerk's native Team settings retain their existing behavior.

The editor provides a page selector, audience label, fields for the current page, and **Preview**, **Save draft**, **Publish** and **Published versions** controls. Inputs use plain-language labels. Editors do not need HTML, JSON, JSX or Markdown.

Editable content includes page titles, introductory text, headings, paragraphs, lists, link labels/destinations, image URLs/alt text/captions, research timeline dates and descriptions, presentation/support entries and coding examples. Existing page layouts and semantic heading levels remain defined by the site's components. Repeated entries support add, remove, move up and move down. Resources and Coding also support adding ordered text, list, link, image and code sections so placeholders can become actual lessons. Student research retains its current section templates and supports editing/reordering the entries within them.

Preserve registration-aware and membership-aware links as fixed semantic controls; editors may change their text and allowed destinations without bypassing sign-in behavior. Existing poster and research imagery remain available. The first version supports existing site images and pasted HTTPS image links; it does not include uploading files or arbitrary embeds.

Saving a draft leaves the published page unchanged. Preview uses the same rendering components as the reader view and is explicitly labelled as unpublished. Publishing atomically makes a saved version current. When there are unsaved changes, require saving before Publish is enabled. Published-version history shows timestamp and editor identity, and can restore a selected publication into the draft for preview and a later explicit Publish.

Warn before navigating away from unsaved edits, including the site's intercepted navigation and page selection. Show saving, saved, publishing, published, conflict and error states without discarding typed content. On revoked Team access, close editor data and deny subsequent requests.

## Data, API and authorization

Add a private content table keyed by the existing verified Clerk instance namespace and an allowlisted page key. Store a schema version, typed JSON content for draft and publication, a monotonically increasing revision, and edit/publication timestamps and actor IDs. Add immutable published-version records with publication metadata. The migration must be additive and must not modify organization registry or research-folder tables.

Use a dedicated server content service and API rather than adding content actions to the participant administration handler. Public read responses contain only published Student research content. Accepted read responses contain only published learning content. Team-only responses may contain drafts and version history. Do not return drafts and rely on the browser to hide them.

Every write and administrative read freshly authenticates the session and verifies Team membership server-side. Every protected read verifies Accepted membership server-side. Use existing private/no-store response patterns, exact action/page validation, same-origin checks for mutations, JSON content-type checks, streamed request-size limits, bounded arrays/strings and parameterized SQL. Page audience and instance identity come from server configuration, never editable fields or client parameters.

Render text as React text nodes. Validate links by purpose: allow safe site-relative links, HTTPS links, and email links where appropriate; images allow existing site paths or HTTPS only. Reject scripts, raw HTML, inline event handlers, data URLs and unknown block types. No executable code is introduced by a code-example field.

Writes require the revision last read by the editor and perform the revision check atomically in SQL. A stale save/publish/restore returns a conflict and leaves the other editor's version intact. Publishing and its history record commit together. Handle an uncertain network response by reloading the authoritative revision rather than blindly republishing or reporting success. Keep all database secrets server-side.

## Page delivery and initialization

Existing URLs and access gates remain. Browser views fetch the current publication, so a content publication needs no code commit, build or deployment. After publishing, a fresh page load shows that version; an already-open page refreshes on focus or explicit reload.

Preserve current content as validated initial data and the initial public Student research prerender snapshot. Member defaults must remain in protected chunks or server-only modules, never imported into the public bundle through a shared defaults index. The editor reads initial data through its authorized API. A missing publication can use the initial content; a database/authentication error must be an explicit failure, not silently treated as an empty database. An already displayed public snapshot may remain with a visible update/retry notice. Protected failures must not open access.

The public Student research page remains client-updated after hydration. Its initial HTML and no-JavaScript content remain the build-time snapshot in this version. Live server rendering and automatic search-engine snapshot regeneration are outside scope. Use evergreen route metadata/search descriptions and Account guidance so they do not promise that Coding is perpetually coming soon or repeat editable checkpoint dates. Metadata, navigation labels, other pages and research Google Docs are not editable through this workspace.

## Acceptance criteria

1. A Team member can edit and publish each of the five listed pages through the website without codebase access.
2. Anonymous, Pending, Accepted-only and revoked-Team accounts cannot read drafts or mutate content. Team membership works independently of the active Clerk organization.
3. Student research remains public. Resources, Coding, Python and R retain Accepted-only reader access, including their content API responses.
4. Saving and reopening a draft preserves its fields and leaves the publication unchanged. Preview renders the draft without publishing it.
5. Publishing changes the appropriate visible page on a fresh load without a new site deployment. Other pages are unchanged.
6. Concurrent updates fail with a recoverable conflict instead of overwriting another editor's work. Failed/uncertain writes do not falsely show a successful publication.
7. A prior publication can be restored into a draft and explicitly republished; publication history and the page update are atomic.
8. Initial content preserves the latest copy, research layouts, posters, accessibility text and registration/access-aware links.
9. Unsafe URLs, raw HTML, invalid blocks, oversized bodies and arbitrary page/instance selections are rejected by the server. Code examples are displayed as text.
10. Protected content and drafts do not appear in public prerender output, public JavaScript, public API responses or search descriptions.
11. Editor labels, keyboard reordering, focus handling, status announcements and mobile layout work with the existing EBS styling. Unsaved input is protected during navigation and recoverable errors.
12. Participant administration, Team settings, invitations, research folders, navigation, SEO/noindex policy and existing relevant checks continue to work.

## Authorization and delivery

Approve specification, screen design and implementation plan together before substantial implementation. The approval covers local implementation, tests, review, migration preparation and usage/setup documentation. Applying a migration to the live database, enabling live configuration and deploying require separate release authorization unless the user explicitly includes them. Do not send invitations, create organizations or publish real content during verification.

## References checked

- Repository: `docs/member-access.md`, `docs/organization-admin.md`, current page/auth/API/store code, build configuration and test scripts.
- [Clerk membership API](https://clerk.com/docs/reference/backend/user/get-organization-membership-list): current server-side membership lookup and pagination, checked through Context7 and official documentation.
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver): parameterized `sql.query` and non-interactive transaction support, checked through Context7 and official documentation.

Related artifacts: [screen design](../design/screens/website-content-editor-2026-11-10.md), [implementation plan](../plans/website-content-editor-2026-11-10.md).

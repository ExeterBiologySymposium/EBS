# Member Account, Contact, and Events

Status: approved by the user on October 29, 2026; local implementation and verification completed. Live configuration/deployment remain outstanding.

## Requested outcome

Create an Account destination for signed-in users, with distinct pending and accepted views. Replace authenticated Register entry points with Account. Move participant-folder creation out of Resources and into the accepted Account view. Add a Contact page and an accepted-only Events page containing the supplied Kate Adamala event.

User addition: show Instagram (`https://www.instagram.com/ebs_2027/`) and LinkedIn (`https://www.linkedin.com/company/exeter-biology-symposium/`) on every page. Implemented independently in the shared footer; retain these links when adding the new screens.

## Access and routing

| Visitor | Account | Registration | Events |
| --- | --- | --- | --- |
| Signed out | Sign-in guidance; no member information | Existing public registration routes | No event body, poster, or reading links |
| Pending/unassigned | Account heading, pending approval status, refresh action, account settings, Contact link | No registration options or links in the Account view; shared Register CTA becomes Account | Denied server-side and client-side; absent from navigation/search |
| Accepted | Account heading/status, research-folder actions, account settings, Resources/Coding, Events and Contact links | Authenticated Register route resolves to Account | Full event content and protected poster |
| Loading/unavailable | Neutral checking/unavailable state without member content or registration-form flash | Do not infer acceptance | Fail closed |

- Add `/account.html`, `/contact.html`, and `/events.html` to the actual multi-page Vite/navigation/prerender route lists.
- Use one Account URL and title for both member states. No separate pending URL is needed.
- Signed-in visits to `/register.html` redirect to `/account.html`; preserve safe existing protected return destinations when acceptance is confirmed. Anonymous registration remains available.
- Update header, mobile menu, footer, search filtering, and shared registration calls to action so authenticated members reach Account. Remove direct Student registration links from the member Account shell. Public informational/application pages remain available for their original roles.
- Contact is public, assuming pending participants and prospective applicants need help. Reuse the existing ContactForm, Web3Forms setup, CAPTCHA lifecycle, error handling, email fallback, and native accessible controls. Keep existing FAQ contact anchors functional.
- Account and personal API responses use private/no-store behavior. Never prerender personal data.
- Events require current Accepted membership for the HTML route, lazy content bundle, and poster asset. Include normalized/encoded direct-route denial tests. Do not rely on hiding links or robots metadata for access control.

## Account UI

Move, rather than duplicate, ResearchFolder from Resources. Keep the existing verified Google identity, specific-recipient permissions, durable provisioning, duplicate prevention, and failure recovery behavior. The pending Account page must not mount or fetch the folder component. Resources returns to resource/example-poster content without the creation section. Update search text and setup/tests accordingly.

Accepted Account: short status summary, research-folder section, Events and learning links, Contact, and account settings.

Pending Account: short pending-review explanation, Check approval status, account settings, and Contact. No registration cards, application links, folder action, or Events link.

## First event

- Title: EBS Speaker Series: SpudCells.
- Speaker: Dr. Kate Adamala, Associate Professor, Genetics, Cell Biology and Development, University of Minnesota.
- Date: Thursday, October 29, 2026, at 6:30 p.m. America/New_York. The date comes from the supplied poster and current year; Eastern time is an explicit assumption based on the Exeter venue.
- Format: speaker joins virtually; local gathering at Phelps Science Center, Room 307, as stated on the poster. Do not invent a remote attendee join URL or imply one is available.
- Announce the first guest speaker of the school year. Describe her lab's synthetic-cell work and invitation to hear about synthetic biology, then include the supplied MIT/Boyden, Build-a-Cell, startup, biosafety, and biosecurity biography in concise prose.
- Describe research as synthetic systems modeling cell growth and division; avoid adding unsupported claims that the systems are living, identical to human cells, or the first of their kind.
- Provide labeled links to the user's Science article and bioRxiv manuscript; label the latter as the linked preprint version. Neither link could be read directly through the web tool (403), so do not claim full-text review or current peer-review status.
- Use the supplied poster at `/Users/adrianclasses/Downloads/EBS Media.png`, copied unchanged into a protected asset namespace during implementation. Include equivalent event details in real HTML and descriptive alt text. Preserve the original image.
- Use the absolute date in copy instead of perpetually saying “this Thursday.” No invented event end time or meeting URL. Keep the event as an entry after its date; avoid static “upcoming” claims that become stale.

## Sources inspected during planning

- User-supplied announcement and poster: event date, time, venue, format, title, and biography.
- https://cbs.umn.edu/directory/kate-adamala — current title and synthetic-cell research scope.
- https://synthneuro.org/people/kate-adamala/ — MIT/Boyden background.
- https://www.buildacell.org/team — Build-a-Cell involvement.
- https://www.science.org/content/article/lab-created-spudcell-marks-major-step-toward-building-life-scratch — supplied link, direct access blocked.
- https://www.biorxiv.org/content/10.64898/2026.07.01.735724v1.full — supplied link, direct access blocked.

## Affected areas

Auth presentation and redirects, access policy/server guards, Account/Contact/Events components, folder component placement, navigation/search, protected assets/bundle rules, Vite/prerender entries, page shells/metadata, existing auth/access/build/browser checks, setup and verification documents. Follow current repository code and docs rather than the outdated static-only notes in CLAUDE.md.

## Verification and completion

Write failing regression/acceptance tests before behavior changes. Verify the visitor-state table, absence of member registration links, old Register resolution, safe return paths, no pending folder API requests, accepted-only Events and direct poster access, static/public bundle exclusion, Contact CAPTCHA/error behavior, responsive layout, keyboard focus, persistent navigation, and existing folder idempotency tests.

Run build/typecheck, all affected existing scripts, the folder suite, new member-page checks, and browser scenarios at desktop/mobile sizes. Self-review and repair within scope. Record evidence and remaining live configuration limitations. No deployment, live Google modifications, contact-message sending, credential provisioning, or paid services are authorized by this revision.

Verification: `docs/reviews/member-pages/report.md`.

## Folder authentication revision

Personal EBS account ownership was subsequently confirmed. The Account/Contact/Events UI remains implemented; the folder backend now uses the approved OAuth revision in `.planning/specs/participant-drive-folders.md`. Current local evidence is in `docs/reviews/personal-drive-oauth/report.md`; live owner consent/setup remain outstanding.

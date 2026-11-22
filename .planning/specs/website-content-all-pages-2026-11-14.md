# Website editing for every EBS page

Status: approved for local implementation on November 14, 2026. Extends the [five-page editor specification](website-content-editor-2026-11-10.md).

## Outcome

An EBS Team member can select any of the 24 website pages in **EBS administration → Website content**, edit its page-specific copy, links, images and content entries, preview the result, and publish when ready. The site's existing layouts and application behavior define how each page renders and works. Shared site navigation, footer, SEO metadata and application configuration are outside this page-content scope.

| Pages | Editable content |
| --- | --- |
| Home, About, Team | Page and section copy, hero and feature imagery, team profiles, questions, and links |
| FAQ, Contact | Questions and answers, page copy, contact guidance and links. Contact forms retain their validation, CAPTCHA and submission configuration. |
| Schedule, Events | Schedule rows, venue and session information, event copy, poster and reading links |
| Register, Student registration, Schools, Judges | Instructions, eligibility copy, route cards, and registration button copy and approved destinations. Existing sign-in, redirect and application controls apply. |
| Student research, Resources, Coding, Python, R / RStudio, Open Source | Preserve the five existing editors and add Open Source copy, links and other page content. |
| Research projects, Dataset library | Page guidance, project and dataset descriptions, guides, examples and links. Existing filters, recommendations, eligibility rules, stable record identifiers and submission behavior continue to apply. |
| Terms, Privacy | Legal page copy, section headings, links and section bodies, with existing section anchors and structure. |
| Account, Accept invitation, EBS administration | Page copy and guidance, including role-specific help on Account and Team workspace introductions in administration. Clerk, participant management and research-folder operations continue to supply personalized data and execute actions. |

## Behavior and acceptance criteria

1. The selector covers all 24 routes, including Home (`/`), hidden routes, and each account and admin route. A direct editor URL opens the requested page. Team members can preview any page, including member content without Accepted membership and registration copy that normally redirects signed-in visitors.
2. Editor fields correspond to actual page content. The default page matches the current site before the first publication, including copy and links already changed in the working tree. Page-specific content publishes within its normal layout, retaining headings, anchor destinations, interactive controls and accessibility. Pages with structured content expose their native fields, including schedule rows, FAQ entries, team profiles, project content and dataset entries.
3. Draft, preview, publish, version history, restore to draft, conflict handling and unsaved-change protection work on every page. An edit to one page takes effect on that route on a fresh load without a deployment. A live Schedule publication takes precedence over the existing remote schedule and session data, while the pre-publication reader continues to use the existing schedule sources.
4. Existing page access still applies. The seven member routes require Accepted for published reads. Administrative content and all drafts and history require fresh Team authorization. Account reads return only fields for the reader's applicable state. Accepted-only content and private administrative copy stay out of public prerenders, public bundles and unauthorized API responses. Public fallback HTML continues to reflect the build-time snapshot until client hydration reads the publication.
5. Text, links and images use validated fields, with purpose-specific URL checks and limits. Protected workflow destinations retain their existing authorization and current provider restrictions. Authentication rules, membership decisions, remote form endpoints, secret keys and personalized records remain controlled by the existing integrations. Preview disables submissions and other live actions.
6. The database upgrade permits all 24 page keys on both fresh and existing installations. The five existing pages retain their stored drafts, versions and revision history. The same Team authorization and atomic publishing and revision checks protect every page.
7. Local delivery includes focused automated tests, reader and browser verification, and updated setup and usage instructions. Applying the migration to the hosted database, deploying, and publishing real content are separate release actions.

[Editor design](../design/screens/website-content-all-pages-2026-11-14.md) · [Implementation plan](../plans/website-content-all-pages-2026-11-14.md)

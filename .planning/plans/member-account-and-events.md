# Account, Contact, and accepted-only Events implementation

Status: approved by the user on October 29, 2026; local implementation and verification completed. Live configuration/deployment remain outstanding.

1. Add focused failing tests for Account states, authenticated Register resolution, member navigation/search/CTA labels, pending exclusion of registration/folder/events actions, and Accepted-only Events HTML/assets.
2. Extend shared route/access policy and current server middleware for member Account handling and protected Events. Register new page shells in Vite, persistent navigation, prerendering, and appropriate metadata. Keep public registration available when signed out and preserve safe accepted return paths.
3. Build the Account views with existing tokens/components. Move the existing folder component from Resources into accepted Account content; retain its API/storage logic and test coverage. Update shared member navigation and registration CTAs.
4. Add a public Contact page reusing ContactForm and email fallback. Keep FAQ contact links/anchors functional and avoid real message submission during QA.
5. Add the Events screen, protected supplied poster, supplied biography/announcement, date/format/venue details, and two reading links. Check direct asset/encoded-route denial and prevent private content entering public bundles, prerendered HTML, metadata, or sitemap.
6. Run affected auth/access/navigation/contact/folder tests, build/typecheck, and desktop/mobile browser acceptance tests. Visually review screenshots, self-review the final diff, and repair failures within scope.
7. Update setup and verification documentation, noting existing Google/Neon configuration requirements. Report local completion and outstanding live verification accurately. Deployment and live external mutations remain separate.

Specification: `.planning/specs/member-account-and-events.md`.
Design: `.planning/design/screens/member-pages.md`.

Verification: `docs/reviews/member-pages/report.md`.

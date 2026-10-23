# Preserve Clerk across internal navigation

## Problem

The browser entry mounts AuthProvider around App, whose page is fixed at document startup. Site links use normal document navigation, replacing the entire React tree on every click. Clerk and membership initialization repeat, briefly replacing account controls and Accepted-only navigation with loading states.

## Intended behavior and design

Keep the existing header, Clerk provider, account control, and footer mounted when moving between known first-party HTML routes. Replace only page content after a successful same-origin document fetch. Preserve current visual design, URLs, direct links, and normal browser link behavior. First visits and explicit reloads may still initialize Clerk.

The fetched destination document supplies the actual authorized destination and page metadata. Honor server redirects, including protected-route redirects to registration; never treat client state as authorization. Membership APIs and protected-asset middleware remain authoritative. Do not cache Accepted status to bypass checks.

## Acceptance criteria

- Clicking a first-party page link updates the URL, title, metadata, current navigation marker and content without remounting Clerk/account controls.
- Desktop and mobile navigation work; menus close after navigation. Rapid clicks cannot render an older destination after a newer one.
- Back/forward, deep links, FAQ anchors/disclosures, page-top scrolling and keyboard focus remain correct.
- Modified clicks, new tabs, downloads, external links, email links, and provider UI retain native behavior.
- Direct visits/reloads continue to work with prerendered HTML and hydration.
- Protected destinations honor server denial/redirects; failures do not grant access or strand the user on mismatched content.
- Rendered public bundles and HTML continue to exclude protected bodies and startup imports.

## Affected areas

Browser routing wrapper near src/main.tsx, App/Header navigation state and cleanup in src/site.tsx, focused navigation tests, browser QA fixtures, and routing documentation. A small dedicated navigation module may be added. No new router dependency or page redesign is planned.

## Verification limits

Use a persistent account-marker fixture to assert no remount across routes and actual browser history/link behavior. Check protected redirects with a controlled server fixture, plus existing access/build tests. A real signed-in Clerk session remains necessary for direct production confirmation; do not claim that fixture testing proves live provider behavior.

# FAQ and contextual help design

Status: approved with the combined FAQ plan on 2026-10-31; implemented using existing components and styles.
Specification: ../../specs/faq-clarity-2026-10-31.md

## Public FAQ

Keep the existing heading, shell, serif headings, crimson accents, borders, native details/summary controls, and responsive FAQ section layout. Shorten the introduction to one sentence. Reduce eight category chips to three: About EBS, Taking part, Getting started.

Below the introduction, add a compact text row: Account help / For schools / For judges. Use ordinary links, not new cards or tabs. Account links lead to Account, whose current state determines help. School and judge links lead directly to their FAQ sections.

Each question uses one concise answer paragraph and a relevant inline link. At most three grouped sections, with 4 / 5 / 3 questions. Keep contact form and the existing contact anchor at the bottom. Preserve old category fragments as semantic aliases or short destination pointers where useful; do not leave the full old content in hidden duplicate disclosures.

## Account

Keep status, Check approval status, Account settings, and Contact controls in their current position. For Pending, add a section below the heading called While you wait with three disclosures. Include a student application link so a signed-in Pending student can complete registration from Account.

For Accepted, retain the existing live research-folder panel and Explore EBS actions. Add Participant questions within the existing accepted-only lazy content. Keep the folder workflow explanation separate from the functioning controls, and use exact current labels. Group research and event help under short headings if seven disclosures need additional scanability.

Signed-out, checking, unavailable, and error views retain their existing state messages; they do not display Pending or Accepted help accidentally.

## Schools and Judges

Keep Schools' existing Questions from schools section and reduce it to five focused questions. Add a matching Questions from judges section using existing shell/section/reading and disclosure styles. Link registration calls to action to the existing form controls; keep role FAQs discoverable before registration.

## Accessibility and mobile

Use native details/summary and meaningful headings. Keep touch targets, visible focus, and existing reduced-motion behavior. No custom accordion keyboard code, new dependency, new design system, or new screen route. Verify narrow-screen wrapping and that links into disclosures reveal the destination through the site's existing hash handler.

# EBS component inventory

| Component | Purpose and contract |
|---|---|
| Shared header/footer | Real navigation links; consistent current-page indication, skip link, compact mobile menu. Footer contains identity, existing contact/social links, and secondary routes. |
| Page introduction | H1, concise factual description, necessary actions. No eyebrow, badge, or aspirational filler. |
| Photo figure | Genuine supplied image with descriptive alt text, intrinsic dimensions, accurate caption. No fabricated provenance or endorsement. |
| Link collection | Links grouped by actual task or subject; headings and brief descriptions. Use spacing; do not box each item or append arrows. |
| Event facts/timetable | Definition list for facts, semantic table for sessions. Provisional dates explicitly labeled; wide table scrolls locally. |
| Article with contents | 720px text measure; sticky desktop contents; native mobile disclosure. Anchors and original learning content retained. |
| Disclosure | Native details/summary for FAQs, biographies, and answers; real text label, keyboard support, hash opens target. |
| Action and form controls | Solid primary or bordered secondary, 4px corners, 44px target. Visible labels, required/errors/loading/success states. |
| Search dialog | Native dialog, labeled search input, page results, no-results state, close button, focus restoration. |
| Theme switch | Accessible button with current state; user preference persists where storage available, otherwise OS preference. |
| External embed | Descriptive iframe title, normal direct link always visible; no claim of control over embedded UI. |

Prototype at docs/prototype.html demonstrates homepage, schools, and curriculum composition. Prototype controls preview theme and mobile navigation; production behavior belongs to existing shared scripts.

## Required interaction states

- Contact: native required/email validation precedes request; submit disables during one in-flight request, label “Sending…”, status announced politely. HTTP success plus service `success: true` alone produces confirmation. Rejection, malformed response, network failure, or 15-second timeout retains input, restores submit, and shows actionable error with email fallback. No timed simulated success.
- Search: opening focuses query; closing or Escape restores trigger focus. Empty query offers page navigation; no matches states “No pages found” and invites another term. Result selection uses ordinary links. Opening search closes mobile navigation and vice versa.
- CMS: complete validated sections replace their matching static section independently. Empty, malformed, incomplete, or failed responses leave original readable content untouched. Unconfirmed event date always remains static.
- Mobile navigation remains available without JavaScript; only enhanced mode hides it behind a Menu button. All navigation links and disclosure summaries have 44px minimum clickable targets.

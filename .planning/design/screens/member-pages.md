# Account, Contact, and Events screen design

Status: approved by the user on October 29, 2026; local implementation and verification completed. Live configuration/deployment remain outstanding.

Use existing EBS light palette, crimson primary buttons, muted supporting text, shell widths, section borders, typography, focus styling, and mobile spacing from `src/styles.css`. No new design system or dependencies.

## Account

One H1: Account. Compact introduction and an explicit membership status.

Pending: single-column status block, explanation that EBS reviews access, primary Check approval status, secondary Account settings, and Contact the EBS team. Do not show registration routes or a disabled folder teaser.

Accepted: status introduction, existing research-folder section with its create/pending/ready/retry/review states, then concise links to Events, Resources, Coding, Contact, and account settings. Keep the folder as the primary action. Ready state exposes the two existing Google links.

Checking/error: stable space for status and retry; no flash of registration options or accepted content. Live regions announce status changes. Status text carries meaning without depending on color.

The persistent header offers Account for signed-in members. Events appears only after Accepted verification; Contact remains available to everyone. Mobile menu and footer follow the same access rules.

## Contact

One H1: Contact the EBS team. Short guidance for registration, access, research, and event questions; existing contact form and email fallback. Reuse labels, honeypot/CAPTCHA setup, validation, submission-pending state, success focus, and retained text after failure. Retain links from FAQ and Account. Do not submit a real message during verification.

## Events

One H1: Events. First entry: EBS Speaker Series: SpudCells. Display the explicit date, 6:30 p.m. Eastern time, Kate Adamala's role, and separate speaker-format and local-gathering details. At desktop, use an existing two-column layout with announcement/details and the full uncropped poster. Stack readable event text and poster on mobile; no text embedded only in the image.

Follow with speaker biography and two clearly labeled reading links (Science news article and bioRxiv preprint). Do not add a Join button without a verified attendee link. A Contact link provides help.

Both the page content and full-resolution poster are served through Accepted-only protection. Public metadata is generic and contains no event detail. Use noindex for Account/Events and omit them from the public sitemap.

Verification: `docs/reviews/member-pages/report.md`.

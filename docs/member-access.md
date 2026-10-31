# Resource and coding access

EBS uses Clerk membership in **Accepted** to authorize Events (including its poster), Resources, Data Science, Python, R/RStudio, Open Source, their browser lesson bundle, `/enzyme_activity.csv`, and `/guides/**`. Public symposium pages and the signed-in application forms remain available without acceptance.

## Approve a participant

1. In the Clerk Dashboard, select **Exeter Biology Symposium** and the **Production** instance.
2. Open **Organizations → Accepted → Members** and add the existing user as **Member** (`org:member`). New signed-in accounts automatically join **Pending**.
3. Optionally remove their Pending membership after adding Accepted. The server checks actual Accepted membership, regardless of which organization is active.
4. Ask the participant to return to the site or click **Check access again**. The site also checks when the browser returns to the foreground.

To revoke access, remove the user from Accepted. Subsequent protected server requests are denied. Previously downloaded material cannot be recalled.

Do not grant ordinary members organization administration permissions. Users cannot accept themselves through the website, organization names, client metadata, or request parameters.

## Organization IDs

| Instance | Pending | Accepted |
| --- | --- | --- |
| Production | `org_3KqTmgwM6ivIHuoZf6cZp0vDdmM` | `org_3KqTn6S2xdy4l0yLlkKP7TQp1qp` |
| Development | `org_3KqToDW1JC4iWENRmeEdwESe50Y` | `org_3KqTocshAxpbkh6KPGi0vjMzlSK` |

The existing limit is **five members per organization**. No paid plan upgrade was made. Pending enrollment shows an unavailable/retry message if capacity is reached; contact the EBS administrator to resolve it.

## Vercel configuration

Production uses the existing production Clerk keys. Preview and Development use development Clerk keys and organization IDs. Server-only variables:

- `CLERK_SECRET_KEY`
- `CLERK_ACCEPTED_ORG_ID`
- `CLERK_PENDING_ORG_ID`
- `CLERK_AUTHORIZED_PARTIES` (comma-separated trusted origins)

The public key is `VITE_CLERK_PUBLISHABLE_KEY`, with the existing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` supported as a production fallback. Never expose the secret key through Vite definitions. Preview additionally trusts its Vercel-generated deployment hostname.

Use `vercel dev` for full local server authorization. `vite` alone supplies the frontend and cannot implement the membership API or protect downloads. Production requires Vercel routing middleware and the `/api/access` function; a plain static host is insufficient.

Protected responses use private/no-store caching. A dedicated `/protected-assets/` bundle keeps lesson bodies out of public JavaScript and prerendered HTML. Public repository history and third-party services retain their own visibility and access policies.

## Verification

Run `npm run build`, `npm run test:auth`, `npm run test:clerk-config`, `npm run test:access`, `npm run test:member-ui`, `npm run test:access-build`, and `npm run test:vercel-runtime`. A live preview must also verify anonymous/Pending denial, Accepted access, direct files, private caching, and revocation before release. Use disposable development identities and delete them after QA.

## Account, Contact, and Events

Signed-in visitors use **Account**, with pending approval and accepted views at the same `/account.html` URL. `/register.html` redirects authenticated visitors to Account; anonymous visitors retain registration. Pending Account views contain approval, profile, and Contact controls without registration links or research-folder/event actions. Accepted Account views include the existing [research-folder integration](participant-folders.md), learning links, and Events.

Contact is a public page reusing the existing CAPTCHA-protected form; the FAQ contact anchor remains available. Events HTML, lazy content, and poster are protected server-side for Accepted members, and event content is excluded from public prerendering and JavaScript. Account/Events are noindex and excluded from the sitemap. Account/Register responses are private/no-store.

Run `npm run test:member-pages` and `npm run test:member-pages-browser` (requires the same optional Puppeteer/Chromium setup as the navigation browser suite). Browser member-state tests use mocked Clerk/Google/CAPTCHA with the real server access policy; production Clerk/middleware verification still requires an authorized live preview.

Research-folder Google operations now use owner-authorized OAuth for the personal EBS My Drive account. Follow the updated [folder setup guide](participant-folders.md); earlier Workspace/service-account instructions are superseded.

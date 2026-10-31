# Production participant administration

EBS Team members use **Account → Manage participants** (`/admin.html`). Staff choose Pending or Accepted, look up an exact email, and either add the verified existing account or send an invitation. An Accepted addition grants access immediately; an Accepted invitation grants access after Clerk accepts the invitation. The server selects an organization with room. Staff cannot choose arbitrary organization IDs or participant administrator roles.

Pending, Accepted and Invitations combine registered organizations. Full lists remain viewable. Approval adds Accepted membership before removing Pending; **Accepted — cleanup needed** exposes retryable partial success. Adding an Accepted account to Pending does not downgrade it. Duplicate outstanding invitations are blocked across both destinations.

**Team organization settings** uses Clerk's native OrganizationProfile. Its **Invite team member** control follows Clerk's membership-management permission and grants staff access. It is separate from participant invitations. Ordinary Team members can administer participants without receiving administrator roles in each participant organization.

## Authorization and capacity

The server freshly checks membership in the configured Production EBS Team organization for every admin request. Revocation denies subsequent requests. Access to research pages/downloads is based on actual membership in any exact Accepted organization ID registered in the private database, regardless of the active organization. Names or client metadata do not authorize access.

Each new participant organization has 20 seats. Both members and outstanding invitations consume capacity. The allocator reuses the oldest open list and then creates **EBS Pending 002**, **EBS Accepted 002**, etc. It never assigns an applicant as creator/admin. Existing organizations retain their current limits until the owner explicitly changes them.

There is a conservative ceiling of **100 total Production organizations**, including Team/unrelated organizations and unresolved provisioning reservations. This is an application safeguard; Clerk measures its allowance using monthly retained organizations. At the ceiling, existing space remains usable. When no space remains, additions/invitations stop with a capacity message. No paid upgrade or billing change is automatic.

Neon stores the registry, allocator leases and operation journal. Clerk memberships remain the access authority. Unknown write outcomes are reconciled before repeating; uncertain email delivery or provisioning enters **needs review** rather than blindly issuing a second write.

## Required server configuration

Set these only for the Production deployment:

- Existing matching `CLERK_SECRET_KEY=sk_live_…` and `VITE_CLERK_PUBLISHABLE_KEY=pk_live_…` (the existing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` fallback is retained).
- `CLERK_TEAM_ORG_ID`: the replacement, verified **Production** Team organization. Do not reuse the Development ID previously provided in chat.
- Existing `CLERK_PENDING_ORG_ID` and `CLERK_ACCEPTED_ORG_ID`: the original Production seed organizations. **Keep the original Accepted ID fixed**, because it anchors existing research-folder storage records.
- `EBS_ORG_INSTANCE_ID`: the Production instance ID shown by the bootstrap report.
- `CLERK_AUTHORIZED_PARTIES`: trusted origins, with the canonical HTTPS EBS origin first and no trailing slash. Participant invitation redirects are fixed to this origin's `/accept-invitation.html`.
- `EBS_ORG_DATABASE_URL`: the existing private Neon database connection, or reuse `EBS_DRIVE_DATABASE_URL` through the supported fallback. Never expose either connection in browser environment variables.
- `EBS_ORG_POOLS_ENABLED=true`: enable registry-based membership reads and allocation after bootstrap. Leave unset/false before setup; the original single-organization behavior remains available.
- `EBS_ORG_ROLLOVER_ENABLED=true`: allow new organizations when existing lists are full. Set this to false to stop creation while preserving pooled access and use of existing capacity.

The instance environment, pinned instance ID and frontend key domain are checked against Clerk. Preview/Development keys cannot enable live pool operations. Real organization creation is Production-only; automated/browser QA uses fake providers.

## Bootstrap and release procedure

Local implementation does not apply this setup, create live organizations, send live invitations, or deploy. Use this procedure during an authorized release:

1. In Clerk's **Production** instance, identify the replacement Team organization and verify the original Pending/Accepted organizations. Set the server-only variables above, initially leaving both feature flags false. Development invitation recovery is outside this feature; recreate those invitations in Production separately.
2. Run the default **read-only** report with the Production environment securely loaded. For a local ignored environment file, use `node --env-file=.env.production.local scripts/org-bootstrap.mjs`. The first report can discover the instance ID before `EBS_ORG_INSTANCE_ID` is pinned. Review instance, Team/seed IDs, current limits/counts, total organization count and registry states. The report never creates a Clerk organization or sends email.
3. Apply `scripts/sql/organization-pools.sql` to the existing private Neon database. Use a private server database role; no public/browser role should access these tables. The script creates only the registry/lease/journal tables and does not alter research-folder tables.
4. Pin `EBS_ORG_INSTANCE_ID` to the reviewed value. Run the read-only report again. If the seeds still have a smaller limit, optionally increase each to 20 in the Clerk Dashboard after reviewing the report; bootstrap does not change Clerk limits.
5. Register the seeds with `node --env-file=.env.production.local scripts/org-bootstrap.mjs --apply --confirm-instance=ins_REVIEWED_VALUE`. This explicit apply action changes only the private registry, is repeatable for the same seeds, and refuses conflicting registrations. It does not move people or create invitations.
6. Enable `EBS_ORG_POOLS_ENABLED` and verify existing Accepted accounts, protected files and research folders before enabling `EBS_ORG_ROLLOVER_ENABLED`. Release/deploy only under the repository's authorization procedure.

**After rollover has been used, disable only `EBS_ORG_ROLLOVER_ENABLED` to stop growth.** Turning off registry-based reads would return to the legacy single Accepted ID and deny access to later Accepted groups. Keep the registry and original Drive namespace; do not reset or migrate existing folder mappings.

## Failure recovery

- **Processing:** another allocator owns a short lease. Wait a few seconds and retry. The SQL lease lasts 120 seconds and is refreshed/fenced around writes; a stale worker cannot update journal/registry state or release a successor's lease.
- **Cleanup needed:** Accepted access already exists. Refresh Pending, then choose **Retry cleanup**. Never remove Accepted as a rollback.
- **Needs review, provisioning:** the bootstrap report lists the unresolved registry operation. Compare its exact operation ID with Clerk organization private metadata (`ebsOperationId`, `ebsInstanceId`, `ebsDestination`). A subsequent allocation adopts a unique matching organization. Names alone are insufficient.
- **Needs review, invitation/member:** inspect the private operation journal and the exact destination in Clerk. A subsequent request can finish an operation when actual membership or matching invitation metadata proves success. Do not reset the operation or resend while the original result remains unknown.
- **Confirmed absent side effect:** an authorized operator may repair only the exact journal/registry record after ensuring no worker remains in flight and acquiring the allocator lease. Preserve the audit identifiers and unrelated records. Do not bulk-delete registry/journal rows or delete participant content to force a retry.
- **Capacity:** reuse available seats, resolve expired/revoked invitations through Clerk, or have the owner review the plan/ceiling. Neither an upstream authentication error nor rate limiting triggers organization creation.

## Verification

Run `npm run test:org-admin`, `npm run typecheck`, `npm run build`, `node --test scripts/update-seo.test.mjs`, and `node scripts/update-seo.mjs --check`. The SQL suite uses the installed optional `@electric-sql/pglite` PostgreSQL runtime when present and explicitly reports a skip when it is absent. Do not count a skipped SQL suite as database verification.

`node scripts/org-browser-fixture.mjs` starts a localhost-only fake-provider fixture on port 4180. It cannot send real email or mutate Clerk. Verify exact lookup, Pending/Accepted selection, acceptance cleanup retry, invitation views, pagination, full-capacity disabled submission, revoked Team access, native-widget permission/context boundaries, and desktop/mobile keyboard behavior. The mocked widgets do not establish live Clerk invitation delivery or native UI behavior.

Before a live release, verify the real Team permissions, invitation acceptance for signed-out/already-signed-in recipients, capacity and rollout configuration under authorized Production testing. No such live validation is implied by local tests.

## Clerk references

- [Organization creation](https://clerk.com/docs/reference/backend/organization/create-organization)
- [Membership limits](https://clerk.com/docs/guides/organizations/configure)
- [Organization usage and MROs](https://clerk.com/docs/guides/organizations/overview)
- [Quota errors, including outstanding invitations](https://github.com/clerk/clerk-docs/blob/main/data/api_errors.json)
- [Backend invitation contract and optional destination-admin inviter](https://github.com/clerk/openapi-specs/blob/main/bapi/2021-02-05.yml)
- [Invitation authentication/acceptance](https://clerk.com/docs/guides/development/custom-flows/organizations/accept-organization-invitations)
- [OrganizationProfile](https://clerk.com/docs/reference/components/organization/organization-profile)
- [InviteMembersButton](https://clerk.com/docs/reference/components/organization/invite-members-button)

# EBS administration and production organization rollover

Status: approved by the user in chat on October 31, 2026. This replaces the earlier single Pending/Accepted organization specification.

Team members may add verified existing accounts or invite by email into Pending or Accepted. The admin page combines organizations into status lists, resolves exact email before submission, defaults to Pending and explains immediate versus invitation-based acceptance. Staff choose status, never raw organization IDs. Same-status additions are no-ops; Accepted users cannot be downgraded into Pending.

Allocate the oldest trusted organization with capacity, counting memberships and outstanding invitations. New organizations have 20 seats, no applicant creator/admin, and server metadata identifying their provisioning operation. Create live organizations only in the verified Production instance. Cap total organizations at 100, including unrelated/Team organizations and unresolved provisioning reservations. Reuse available capacity before provisioning. Never purchase an upgrade automatically.

Clerk memberships remain the authorization source. Trust only exact IDs in a private Neon registry. Use Neon leases and a durable operation journal to serialize writes and recover uncertain outcomes without duplicate organizations or invitation emails. Check production instance, live keys, replacement Team organization and seed IDs before writes. The previously supplied Team organization ID is invalid and must not be used. Enrollment and API requests retain authentication, same-origin checks, validation, private caching and fail-closed behavior.

Accepted access applies to every registered Accepted organization regardless of active org. Preserve the original Accepted organization ID as the research-folder namespace anchor. Add Accepted membership before cleaning Pending memberships; expose partial cleanup and safe retries. Preserve roles and block outstanding duplicate invitations across both groups.

Keep native OrganizationProfile/InviteMembersButton for permission-controlled EBS Team settings, with separate staff and participant invitation wording. Add a supported Clerk invitation landing page. Preserve current EBS styling, mobile/keyboard access, cleanup, and SEO changes. New pages are noindex and excluded from sitemap.

Use explicit pool-read and rollover-create switches. Disabling creation must preserve multi-organization access. Provide a read-only bootstrap report before registry writes or changes to existing limits. Development invitation recovery is excluded: the owner will recreate those invitations. Live configuration, invitation delivery and deployment remain separate release actions.

References: Clerk organization creation, membership configuration, organization invitations, API quota error definitions, OrganizationProfile, and InviteMembersButton documentation referenced in the approved chat plan.

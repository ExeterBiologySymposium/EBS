# Implement bulk research folder creation in Admin

Status: Approved November 23, 2026.

1. Add failing tests to the organization API suite for the full and deduplicated Accepted roster, Team authorization, same-origin writes, target validation, and the folder outcomes. Use fake Drive and storage to verify that the Account API can open a folder provisioned by an admin, that custom links and missing Google identities bypass provisioning, and that repeat or overlapping requests reuse the folder record.
2. Use the existing organization service to gather a deduplicated Accepted roster in one private Team request. Add one same-origin Team POST action that accepts a Clerk user ID, rechecks Accepted membership, and reuses the existing Clerk folder settings and Drive provisioning. Share Drive runtime construction with the Account endpoint. Keep Drive access and writes server-side. Use the existing schema, configuration, and credentials.
3. Add the bulk control to the Accepted view. Process one participant per request, sequentially, within the existing per-request time limit. Present counts and follow-up reasons, continue after individual failures, and stop issuing new requests on lost Team access or when the view unmounts. Reuse the existing admin styles and update the participant-folder guide.
4. Run the focused tests, `npm run test:org-admin`, `npm run build`, and the repository's SEO checks. Exercise a roster larger than one page using the local fake-provider browser fixture. Check the button and feedback at desktop and mobile widths with keyboard navigation. Review scope, authorization, sharing recipient selection, repeat runs, and Account compatibility in the final diff.

Approval covers local implementation and verification using fake providers. A live run would create and share real Google resources and requires release and live-operation authorization.

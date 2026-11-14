# Implement custom participant research folder links

Status: Approved November 14, 2026, with the [specification and screen design](../specs/participant-folder-links.md).

1. Extend the existing organization API tests with a fake private metadata store. Cover assigning, replacing and clearing a link from the Team endpoint, denied requests, URL validation, account isolation, and skipping Drive for a custom link. Keep the existing test that reopens a generated folder in a later Accepted pool. Run the new assertions to confirm the feature is missing before changing application code.
2. Add a shared URL validator and a thin server adapter for the private Clerk metadata key. Extend the Team handler with targeted read and save actions. Resolve the current account’s assignment before entering the Google path, using the same user read for Google identity when falling back. Keep existing folder records and provisioning code in place.
3. Add the inline disclosure to the existing Accepted participant row and use the existing admin fetch and error handling. Update the account folder panel and help text. Add brief usage and sharing guidance to the participant-folder guide and update any existing checks affected by the revised copy.
4. Run the focused API and rendered UI checks, `npm run test:org-admin`, `npm run build`, and the applicable account-help and SEO checks. Exercise the Accepted row and Account states using fake providers at desktop and mobile widths, including keyboard interaction and a failed save. Review the diff for private data exposure, access checks, and fallback behavior. Report live verification separately.

The plan covers local implementation and verification. The local branch is 11 commits behind its cached `origin/main`. Coordinate the implementation base with upstream before changing overlapping files and preserve local working-tree edits. Production deployment and live participant changes require release authorization.

## Verification

- The new API assertions and rendered Account assertion failed before implementation and passed afterward. All 31 organization tests and the rendered UI checks passed. The production build, website-content suite, SEO checks, Account help check, and `git diff --check` passed.
- The localhost fixture confirmed keyboard saves, custom URL display on Account, reloading the saved URL at mobile width, the error message and retained input after a failed save, and restoration of the generated folder and Doc on clear.
- In a temporary copy of the cached `origin/main`, the patch applied with a manual merge of the overlapping Account help text. Typecheck and the focused API and rendered UI tests passed with the newer upstream copy. The working branch contains the local implementation.

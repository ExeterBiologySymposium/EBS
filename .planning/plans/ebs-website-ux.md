# EBS UX implementation

1. Add focused regression checks for navigation access, external handoff, and local progress isolation.
2. Update shared navigation, homepage hierarchy and registration routes. Keep editable copy and destinations wired to their existing fields.
3. Add the shared application sequence and browser marker. Build the Accepted Account hierarchy and member navigation. Improve lesson contents and dataset layout.
4. Run typecheck, static build, organization, content, cohort and dataset checks. Verify responsive and keyboard behavior and exercise signed-out, Pending, Accepted and unavailable states with local fixtures.
5. Review the resulting diff against the approved UX scope. Deployment requires separate authorization.

## Local verification

The build, TypeScript check, content, organization, cohort, dataset, and UX regression tests passed. Headless Chromium checked reduced-motion navigation at 375, 768, and 1440 pixels and exercised Search, the Google Forms link, saved application progress and account isolation, the Pending access gate, the Accepted folder action, lesson links, and the dataset filter layout. Browser verification used fixture identities and mocked service responses.

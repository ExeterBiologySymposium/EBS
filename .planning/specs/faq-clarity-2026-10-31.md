# FAQ clarity and placement

Status: approved by the user in chat on 2026-10-31; implemented and verified locally.
Date: 2026-10-31

## Outcome

Replace the 43-question public FAQ with a concise starting point. Put account instructions beside the relevant account state and role-specific questions on Schools and Judges. Rewrite all retained answers in plain language, with the answer first and a clear next step where needed.

## Findings from current source

- `src/pages/faq.tsx` has 43 disclosures across eight categories. Several answers repeat the registration process, eligibility, remote participation, or poster arrangements.
- Schools already has eight questions, repeating several public answers. Judges has explanatory sections but no dedicated FAQ.
- Account has separate Pending and Accepted states. Accepted content is already loaded through `accepted-account.tsx` in the protected asset namespace.
- Resources currently offers example posters; research guides and tools are coming soon. Coding, Python, and RStudio currently say coming soon. FAQ promises of available beginner guides and lessons must be corrected.
- User-confirmed policy: orientation is a 20-minute Zoom meeting arranged by an EBS team member by email. The school form is for schools seeking to sign up; previously contacted schools provide a contact person, and researchers register individually. Faculty-advisor contact goes through the EBS email. Folder creation uses the Account button.

## Proposed public FAQ: 12 questions

### About EBS

1. **What is EBS, and when is it?** A student-organized biology research symposium at Phillips Exeter Academy on April 25, 2027, with in-person and online poster presentations. Link to About/Team instead of listing organizers.
2. **Who can take part?** Middle and high school students from any school; no prior research experience required. International students may participate online only in 2027.
3. **What does it cost?** Participation and in-person poster printing are free. Participants pay their own travel and lodging; EBS does not provide travel funding or housing.
4. **What research can I present?** Original dry-lab biological research using public data, published studies, computational methods, or biology-related product design supported by research. No wet-lab experiments; methods and evidence must be available for review. Link to Researchers for examples.

### Taking part

5. **How much time will I need?** Most students spend 1–2 hours weekly; materials can be completed at their own pace.
6. **Can I work in a team?** Work alone or in a team of up to three. Each student registers individually, contributes meaningfully, and can explain the project.
7. **Can I present online?** Yes, with poster presentation and judging. International participation is online only in 2027. Presentations are in English and the schedule uses Eastern Time; link to Schedule.
8. **What do I need to attend in person?** Ability to travel and cover costs, plus an adult chaperone. Preserve the visiting school's authority over chaperone eligibility, supervision, and group liability. International students remain online only.
9. **Can I submit my project elsewhere?** Yes; EBS permits submissions to other competitions and journals.

### Getting started

10. **How do I sign up?** Sign in, open Student registration, and submit the Google Form using the account email. Each researcher applies individually; creating an account does not submit an application. School and judge routes are adjacent links, not extra instructions within this answer.
11. **What happens after I apply?** EBS reviews applications and emails approved applicants. Check approval on Account; Accepted accounts can use research folders, Events, and currently available member resources. Link to Account for troubleshooting.
12. **What is the orientation meeting?** A 20-minute Zoom introduction and chance to ask questions, arranged by an EBS team member by email. No new attendance rule or fixed schedule.

Keep answers to one short paragraph, normally 25–50 words. Allow a slightly longer chaperone answer to retain the existing policy. Preserve the FAQ contact form and `#contact` entry point.

## Contextual destinations

| Destination | Questions / content |
| --- | --- |
| Pending Account: three short questions | Why Pending? Have I completed my application? What if I received approval but still see Pending? Include the individual student-application link and matching-email reminder, existing Check approval status action, and support route. No protected lesson/folder/event actions. |
| Accepted Account: seven questions | Where are resources and lessons? How do I create/open my folder? How do I choose a topic and tools? What are the submission checkpoints? What do I present and bring? What about food and guests? How do I change attendance mode? |
| Schools: five questions | Do we need the school form? What does our contact person do / is a research supervisor required? How much time do students need? How is orientation arranged? How do we contact the EBS faculty advisor? Keep individual application requirement explicit. Replace redundant cost/team/reuse answers with a concise public FAQ link. |
| Judges: three questions | Who can judge? Can I judge online / what is the commitment? What briefing will I receive? Consolidate existing duplicated prose as needed. Preserve undergraduate-degree baseline, 4–6 presentations at about 15 minutes each, virtual briefing the week before, and full-/half-day availability. |
| Existing Researchers and Schedule pages | Continue to own detailed project examples, the three dated submission checkpoints, and event schedule. Link to these instead of restating long guidance in the FAQ. |

Accepted answers stay short, with a compact list allowed for folder steps. Keep topic selection/tool guidance general and tied to the research question; do not claim all tools are browser-only or that guides already exist. Keep December 18, 2026 / March 12, 2027 / April 9, 2027 checkpoint requirements available through Researchers. Preserve abstract/code review, poster checks, free in-person printing, online camera/microphone guidance, lunch and dietary guidance, and capacity/chaperone constraints when changing mode. Guest arrangements remain provisional; remove the speculative minimum-one-guest promise. Keynote information belongs on Schedule. Remove speculation about future international attendance.

## Content coverage of the old FAQ

- General five questions merge into public EBS/date, research, and cost answers; organizer detail links to Team.
- Registration six questions become public signup/review summaries, Pending support, and Accepted tools/folder support.
- Student six questions remain brief public eligibility, commitment, teams, reuse, and orientation answers.
- Research four questions become one public eligibility answer, Accepted research/checkpoint help, and links to Researchers.
- Symposium eleven questions become public online/in-person/cost policy, Accepted preparation/logistics/change-mode help, and Schedule links for keynote and timings.
- International four questions merge into public eligibility/online answers; future speculation is removed.
- School four questions move into the consolidated Schools FAQ; eligibility is already answered publicly.
- Judge three questions move into the new Judges FAQ and consolidate existing explanatory content.

## Affected areas

Primary: `src/pages/faq.tsx`, `src/pages/account.tsx`, `src/pages/accepted-account.tsx`, `src/pages/schools.tsx`, `src/pages/judges.tsx`, homepage FAQ in `src/site.tsx`.
Supporting where needed: a small pending-help component for isolated state-render checks; `src/search-data.json`; FAQ metadata in `seo.config.json` and its generated route head; focused account-state check script; scoped CSS only if existing classes are insufficient.

Preserve unrelated local edits/deletions. Retain existing authentication, membership rules, API behavior, folder creation, contact form, Google Form URLs, dependencies, and release boundaries. No deployment in this scope.

## Acceptance criteria

1. Public FAQ has 12 clearly grouped questions and at least 50% less answer text than the current page.
2. Main answers are concise; detailed instructions have one clear destination rather than being copied between pages.
3. Pending and Accepted account help renders only for the corresponding state. Existing Pending actions remain available, including individual application access through the new help.
4. Accepted research help remains in the existing protected lazy bundle; public prerendering does not include it.
5. School and judge guidance is easy to find on the respective page, with no conflicting signup or orientation directions.
6. Current confirmed policies are retained, including school outreach exemption, individual signup, Zoom/email orientation, faculty-advisor email, folder-button labels, public chaperone policy, costs, and international restrictions.
7. Availability wording matches the existing coming-soon resource/coding pages.
8. Internal page/fragment links resolve, and relevant existing public FAQ anchors remain usable through a short pointer or retained alias where practical. `#contact` is unchanged; relocated instructions link to the destination rather than triggering automatic authentication redirects.
9. Existing visual styles and native accessible disclosures work on desktop and mobile with keyboard focus and readable wrapping.
10. Focused state-render checks, typecheck/build, structural content/link checks, and diff review pass. Report any live-authentication verification limitation accurately.

## Verification

Record baseline disclosure and answer-word counts. Add a focused rendered-output check before changing conditional account guidance and confirm it fails for missing Pending/Accepted help. Use the installed build tooling and a Node check without adding dependencies or restoring deleted test suites. Verify Pending does not render Accepted guidance/actions, Accepted renders its help, and signed-out/checking/error states do not render inappropriate guidance. Build and parse emitted HTML for public question count, text reduction, unique IDs, destination links, retained contact entry point, and protected-content separation. Check desktop/mobile disclosure interaction and layout through a local preview where available. Run `npm run build`, generator checks if metadata changes, and task-scoped `git diff --check`. Perform a self-review; no independent reviewer is required by this workflow.

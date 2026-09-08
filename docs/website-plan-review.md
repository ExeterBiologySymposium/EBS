# EBS redesign plan review

Scope: `docs/website-plan-astra.md`, with selective source checks. This is a plan review, not rendered-site QA. No prototype screenshots or visual grades are claimed. No production files were changed.

## Local design and implementation review

Status: **DONE_WITH_CONCERNS**. The plan supports prototype exploration. Resolve the following specifications before a full site rollout. All six findings below are P2 planning gaps or design risks; none establishes a current production incident.

### R1. Define registration destinations and ask for audience only once

Plan references: lines 26, 49, 66–67.

The homepage action becomes “Register,” but its destination is unspecified. Existing `register.html:41` sends students and schools to `student-signup.html`, which asks visitors to choose between those audiences again at lines 39–42. The plan proposes further differentiation without mapping the resulting links, so builders may preserve or increase this repetition.

Recommended change: add a route/action matrix with exact labels, destinations, and expected result. Keep a general registration chooser accessible from navigation; audience-specific actions should advance the selected audience. Specify whether “Register as a student” opens the existing form directly or opens a student-specific information page. Keep the prominent school action and small individual-registration link required by the user.

### R2. Specify what will visibly improve over the rejected homepage

Plan references: lines 46–54, 76, 97–108, 190–191.

The plan retains the existing font and core palette and describes much of the existing homepage content order. Preserving these elements is reasonable, but changing token sizes and removing patterns does not establish a stronger composition. The team directory is a concrete change; the homepage's visual improvement is still a hypothesis.

Recommended change: require side-by-side baseline/proposed home and team views. Define comparison criteria before choosing a prototype: first focal point; title, description, facts, and action grouping; photograph scale; section rhythm; and the amount of useful information visible on mobile. Accept only changes with a visible, content-specific benefit. Do not force decorative novelty or a new font to manufacture difference.

### R3. Define mobile navigation and guide overflow behavior

Plan references: lines 40–44, 64, 123–125, 136, 195.

Column counts and a collapse threshold do not define menu composition, the school route, search/theme placement, or what happens after a contents link is selected. The guide specification preserves content and forbids page overflow but omits code, wide tables, equations, and nested answer disclosures. A builder could satisfy “no overflow” by shrinking or wrapping material until it becomes hard to use.

Recommended change: add a mobile menu/state diagram and a difficult guide prototype section. Define link order, expanded/collapsed state, Escape and focus behavior, no-JavaScript navigation, anchor scrolling, and opening enclosing disclosures. Keep code whitespace intact; use locally scrollable code/table containers with accessible overflow cues. Maintain readable math and explicit download labels. Scope page-overflow checks separately from intentional component scrolling.

### R4. Name the components that justify React and settle markup ownership

Plan references: lines 181–185, 192.

The plan recommends Vite, TypeScript, and React islands while describing nearly every component as native HTML with existing behavior. It never identifies a concrete React island or chooses how shared header/footer markup will be generated. This defers the architecture decision to implementation and risks duplicate rendering and styling systems without a user-visible benefit.

Recommended change: identify any component that requires React and its isolated DOM mount. If no component needs it, keep the first implementation HTML, Tailwind, and existing JavaScript; installed React-oriented packages can remain unused. Vite can still serve as a build tool if justified. Choose the shared markup source and generation step before changing sixteen pages. Document exactly which CSS source owns migrated and unmigrated pages.

### R5. Extend validation to the production output

Plan references: lines 183, 194–195.

The listed `npm test` command checks source HTML. `tests/site_contract.py:8–9` fixes its root to the repository; line 19 requires the literal `js/main.js` script path. A Vite build can emit transformed asset paths, so passing source checks will not establish that built routes, scripts, or downloadable files work. Applying the same literal assertion to build output would also reject legitimate bundling.

Recommended change: add an explicit built-output verification step with a configurable site root and separate source-specific assertions. Check every output route, script, stylesheet, image, download, fragment, and static content contract. Serve the generated output for browser acceptance. Define the build command, output directory, asset-copy policy, and test dependency setup before treating the foundation as complete.

### R6. Separate external form handoff from feedback EBS controls

Plan references: lines 67, 126, 137.

Student and school registration links open Google Forms (`student-signup.html:41–42`); volunteer and judge links do likewise (`volunteer-signup.html:41–42`). EBS cannot normally observe those external submissions. The generic requirement for loading, success, error, data retention, and retry needs an ownership boundary. The local contact form is a different integration.

Recommended change: specify provider handoff text, new-tab behavior, and contact fallback for external applications. Keep submission success and validation inside the provider. Apply locally controlled submission-state testing to the FAQ contact form. Never present a locally inferred registration confirmation after an external link click or return visit.

## Skill calibration

`design-review` normally reviews and fixes a live website; this invocation is explicitly scoped to a plan. Its source-mutation, clean-tree, screenshot-grade, and atomic-commit workflow does not apply here. Its hierarchy, wayfinding, mobile interaction, and consistency criteria were used for plan critique.

The user's restrained brief overrides that skill's generic landing-page demands for gradients, full-bleed heroes, minimum animation counts, or aggressive deletion of instructional text. Learning material must remain complete. No changes to fonts or palette are recommended solely to satisfy a blacklist.

Independent local design voice identified the registration, homepage comparison, mobile navigation, and guide-content gaps. The primary review also identified architecture, build validation, and form ownership gaps. Agreement is advisory; these are not independent-model results.

## Codex CLI review

Completed after the user approved the exact plan and thirteen named source files. CLI exited 0 and emitted `turn.completed`. Usage: 170,280 input tokens (119,808 cached), 2,753 output tokens; 173,033 total input plus output. No cost estimate is inferred.

**CODEX SAYS (consult), verbatim:**

[P1] **Clarify signup feedback boundary — plan lines 196–198, 249–251.** Plan requires “genuine completion or failure feedback” for `student-signup.html` and `volunteer-signup.html`, but current pages link externally and contain no forms. Contract explicitly requires no forms on these routes and only tests FAQ contact submission ([site_contract.py](/Users/adrianclasses/Documents/GitHub/EBS/tests/site_contract.py:45)). Define external-provider handoff behavior separately; do not promise feedback EBS cannot observe.

[P1] **Define Vite output/deployment contract — plan lines 236–247, 264–267.** Current project has Tailwind CLI and test scripts only; no Vite, React, TypeScript, or build script ([package.json](/Users/adrianclasses/Documents/GitHub/EBS/package.json:9)). “Vite multipage output” does not specify entry discovery, output paths, static hosting configuration, or whether generated HTML remains visible to existing tests. Add explicit build/deploy artifact rules before implementation.

[P1] **Resolve template ownership before rollout — plan lines 248–252, 270–276.** Plan proposes repeated HTML shell markup from “one documented source/template” while preserving sixteen static pages. No template engine or generation step currently exists; tests scan root-level HTML files and require each page’s shell ([site_contract.py](/Users/adrianclasses/Documents/GitHub/EBS/tests/site_contract.py:8)). Choose source-generated HTML or hand-maintained HTML, then define validation. Current wording permits two competing authorities.

[P2] **Normalize eligibility copy globally — plan lines 37–43.** Plan requires exact “all middle and high school students,” but current FAQ says “all middle school and high school students” ([faq.html](/Users/adrianclasses/Documents/GitHub/EBS/faq.html:308-311)). Audit footer, metadata, search descriptions, and route copy during content-contract work. Otherwise redesign may preserve conflicting eligibility language.

[P2] **Make dynamic-content fallback acceptance testable — plan lines 225–229, 258–262.** `appwrite-content.js` independently preserves static sections when requests fail, but valid data must be nonempty, ≤100 records, and have `total === documents.length` ([appwrite-content.js](/Users/adrianclasses/Documents/GitHub/EBS/js/appwrite-content.js:10-26)). Plan should state whether zero-item collections, pagination beyond 100, and malformed individual records remain fallback cases. Current tests cover failure isolation but not rendered fallback visibility ([behavior.test.cjs](/Users/adrianclasses/Documents/GitHub/EBS/tests/behavior.test.cjs:103-107)).

Recommendation: revise these contracts first. Design direction is restrained and materially addresses generic-redesign risk, but plan is not ready to implement until P1 items resolve.

**Gate: FAIL under the skill's marker rule (three P1 findings).** No findings were fixed during this review.

### Verification and disagreement

- Codex's plan line numbers do not match the saved document. Correct references: signup feedback, lines 67 and 126–137; build/output contract, lines 181–183 and 192–195; shared templates, line 185; eligibility, lines 30–32; Appwrite fallback, lines 138 and 194. Use these references, not the embedded-review numbering above.
- Accept the three contract gaps. Local findings R4, R5, and R6 cover them. Codex classifies them as P1 prerequisites; the local review classified them as P2 plan gaps. Both recommend resolving them before full implementation.
- Dispute the eligibility finding as a functional defect: “all middle school and high school students” includes the same audience. Exact wording may be normalized as editorial consistency; it is not evidence of restrictive eligibility.
- Accept the Appwrite item as an additional acceptance-criteria detail. Existing tests already cover empty, incomplete, malformed, and over-100-item collections (`tests/behavior.test.cjs:87–100`). The remaining useful addition is to state that these cases preserve existing fallback content and verify that content remains visible in the rendered page. No need to add pagination or change data semantics for this redesign.
- This is an independent CLI run plus an independent local design agent, not evidence that two different model families agreed. No actual browser performance or visual grade was measured.

Recommendation: define registration ownership, shared-template generation, and the production build/test contract before implementation. Proceed only with comparative prototypes once their review criteria are explicit.

## Highest-value plan edits

1. Add the registration route/action matrix and external-provider ownership boundary.
2. Add the baseline/prototype comparison rubric and difficult mobile guide example.
3. Resolve React component ownership, shared markup generation, and built-output validation.

These are recommended edits, not accepted design decisions. The plan body has not been rewritten during this review.

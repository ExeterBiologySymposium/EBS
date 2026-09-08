# Gates: Institute of Health full-site rebuild

OWNS: src/**, scripts/**, tests/**, public/**, docs/**, DESIGN.md, GATES.md, package.json, package-lock.json, vite.config.ts

Scope: Complete hosted reference crawl, rebuild all public page layouts, make FAQ useful, preserve EBS content/colors/images/coding, and verify shipped behavior.

- [x] G1: Hosted crawl reaches completed status and its discovered-page results are saved
  CHECK: node scripts/verify-redesign.mjs crawl
  EXPECT: CRAWL_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=f30719c9f5055c42b5d35552feed38f0e2c9ad70e77653e2638b8af9d96a641c; exit=0; EXPECT=matched; output-sha256=92f1fa99ed750034adae6b0fcf88c25fe858fde14d3c78e38694541d6d18532e; output-bytes=72; shell=/bin/sh; cwd=/Users/adrianclasses/Documents/GitHub/EBS; path=3ee4041c2d97/31 entries

- [x] G2: Every public route has a React layout with retained anchors, teaching content, destinations, and image subjects
  CHECK: node scripts/verify-redesign.mjs routes
  EXPECT: ROUTES_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=ba04f9a10a7788c27d8472934865d22f2e482bfe3cbdb0f6bfd5ded5aa1b0f50; exit=0; EXPECT=matched; output-sha256=6edc6a7dd7a97ac9c9ea3e7d3c669feb491e7863b443ac157b8cce0533d71289; output-bytes=66; shell=/bin/sh; cwd=/Users/adrianclasses/Documents/GitHub/EBS; path=3ee4041c2d97/31 entries

- [x] G3: Production build and existing behavior contracts succeed
  CHECK: npm run build
  EXPECT: BUILD_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=4985473ec3e0f43e1ec449b05354d064cbc7ac380e0628bb3fc1d11c56f881c3; exit=0; EXPECT=matched; output-sha256=f6e161bf45e8e13a7c2dc9ddf5e96928859a0853d5de39cd6b06e97237dd493c; output-bytes=4610; shell=/bin/sh; cwd=/Users/adrianclasses/Documents/GitHub/EBS; path=3ee4041c2d97/31 entries

- [x] G4: Production browser checks pass for navigation, carousel movement, FAQ, dialogs, theme, and mobile overflow
  CHECK: node scripts/verify-redesign.mjs browser
  EXPECT: BROWSER_VERIFIED
  EVIDENCE: automatic-evidence=v1; definition-sha256=14e0ed32367260cf2e540484d52e0984ee3d7333466d9df44fbe3aa0b7d590ff; exit=0; EXPECT=matched; output-sha256=8f09075b02d2ffefc2c887275ee74973c2303a457a4d49b6bce0379eb1e146f7; output-bytes=236; shell=/bin/sh; cwd=/Users/adrianclasses/Documents/GitHub/EBS; path=3ee4041c2d97/31 entries

- [x] G5: Desktop and phone screenshots show reference-derived layouts across page families with useful FAQ density
  EVIDENCE: Manual visual review 2026-09-07 of docs/qa/{index,faq,about,team,schools,register,resources,python}-{1440,390} screenshots and full-page variants against saved homepage and interior reference captures. Corrected initial carousel centering, action overlay and Luke portrait crop. FAQ groups contain actual answers with contact below; no quick-link sidebar. Normal-motion story captured at docs/qa/story-motion-1440.png. Deliberate differences and unmeasured pixel/timing equality are recorded in docs/redesign-verification.md.

- [x] G6: Reference differences, crawl coverage, and final route evidence are documented without unsupported exactness claims
  EVIDENCE: docs/redesign-verification.md records completed 52-page job, saved source URLs and screenshots, 16 routes, 77 anchors, 10 exact code examples, 932 local references, 80 viewport cases and 41 behavioral checks. It distinguishes Arial/still-media/content/layout adaptations, mocked provider checks and remaining pixel/timing/zoom/dark-matrix limits. DESIGN.md and docs/ioh-reference-rebuild-plan.md now point to current evidence and implementation status.

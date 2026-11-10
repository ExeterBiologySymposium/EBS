# Research cohorts and the project finder

`projects.html` (hidden from the site navigation for now; add `['Projects','projects.html']` back to `nav` in `src/site.tsx` to show it in the header) helps students choose one of the six no-code cohort projects and sign up. It is public, so club members do not need an EBS account to use it.

| Cohort | Project | Difficulty |
| --- | --- | --- |
| Galaxy | Virus Under Pressure | Medium |
| Galaxy | The Itch Germ | Easier |
| iDEP | Old Age or Alzheimer’s? | Medium |
| iDEP | Tumor on the Move | Harder |
| Biblioshiny | The Serotonin Storm | Medium |
| Biblioshiny | Machines vs. Memory Loss | Medium |

The page has four parts:

1. **Five quick questions.** Curiosity questions, research fields, kind of data, challenge level and computer. Every question is optional, and the match updates as students answer.
2. **Your best match**, with plain-language reasons, a second choice (the sign-up asks for two), and anything ruled out by the student's computer.
3. **Sign up for a cohort**, pre-filled from the answers: first and second choice, computer and partner preference.
4. **All six projects**, with each project's question, data, what students make, difficulty and 6-week plan, plus the shared 6-week arc and short FAQs.

## Where the content comes from

Everything on the page summarizes the guides in the Drive folder **EBS Non-Coding Research Cohorts**: the six guides plus *Overview and Sign-Up*. The page deliberately leaves out:

- The names of the club members each project was built around.
- Every **MENTOR** placeholder and the mentor dry-run checklists.
- The reserve projects. The FAQ only says a second choice counts if a project fills up.

Project text lives in `src/cohorts/projects.ts`. After a dry run changes a guide, for example its data, tools or week plan, update the matching project there in a normal code change.

## Publishing a guide link

Until a guide has a link, its card says *"Your cohort lead shares the full click-by-click guide when the cohort starts."* The guides are private today. To publish one:

1. Finish the dry run and fill in every MENTOR placeholder.
2. Delete the **Mentor dry-run checklist** section, and remove the *"Built around …"* line under the title. It names students, and the link will be public.
3. In Google Docs choose **Share → General access → Anyone with the link → Viewer**, then **Copy link**.
4. Paste the link into that project's `guideUrl` in `src/cohorts/projects.ts`. The card then shows **Open the step-by-step guide**.

## Sign-up

While `cohortSignup.formUrl` is empty, **Email my sign-up** opens an email to `exeterbiologysymposium@gmail.com` with the student's choices filled in, and **Copy my choices** copies the same text. To collect sign-ups in a Google Form instead:

1. Create the form with questions for name, first choice, second choice, computer, and solo or partner.
2. Paste the form's full `https://docs.google.com/forms/d/e/…/viewform` link into `cohortSignup.formUrl`. Short `forms.gle` links work, but cannot be pre-filled.
3. Optional pre-filling: in the form editor choose **⋮ → Get pre-filled link**, type anything into the four choice questions and select **Get link**. The link contains one `entry.<number>` per question. Copy those IDs into `cohortSignup.prefill` (`firstChoice`, `secondChoice`, `computer`, `partner`). Students' answers then arrive filled in, as text such as *The Itch Germ (Galaxy)*, so make those questions short-answer, not multiple choice.

## How matching works

The logic is in `src/cohorts/match.ts` and is covered by `npm run test:cohorts`.

- A picked curiosity question adds 8 to its project.
- Research fields add up to 7.5, from how strongly each project uses the picked fields. Each project's `fields` table rates these 1 (touches on it), 2 (uses it) or 3 (built around it). The fields are averaged, so ticking all fourteen cannot outweigh everything else.
- A matching kind of data adds 5 to both projects in that cohort.
- Challenge level adds up to 3: easier favors The Itch Germ, harder favors Tumor on the Move.
- A Chromebook, a locked school laptop, or a phone or tablet rules out both Biblioshiny projects, because they need R installed. The match explains what was ruled out. Students can still choose any project themselves.
- Ties go to the easier project. None of the six is an ecology project, so students who pick ecology are told so and pointed to the closest one.

Answers are saved only in the student's browser (`localStorage`, key `ebs-project-finder`) so they can come back to their match. Nothing is sent to EBS until a student sends the email or the form. **Start over** clears everything.

## Verification

Run `npm run test:cohorts`, `npm run typecheck` and `npm run build`. If you change `seo.config.json`, also run `npm run seo:update`, then `node --test scripts/update-seo.test.mjs`.

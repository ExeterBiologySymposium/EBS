# SEO term choices

Edit `selectedTerms` in [`seo.config.json`](seo.config.json), keeping terms accurate for EBS. Then run:

```sh
npm run seo:update
```

`selectedTerms` contains 74 approved phrases: 62 from the original proposal and 12 additional Phillips Exeter Academy, PEA, and Exeter phrases. There is no arbitrary term-count limit.

Each page's `terms` list assigns relevant phrases to that page's structured metadata. To add a term, add it to both `selectedTerms` and a relevant page's `terms`. Page titles and descriptions are separately editable under `pages`; the updater does not automatically write prose or change visible content. Topic-specific terms can also guide future research resources.

`excludedTerms` records the six phrases explicitly excluded from SEO targeting:

- biology research from home
- biology research without a teacher supervisor
- flexible biology research opportunities for students
- how to choose a biology research question
- how to conduct research using public datasets
- public biology datasets for student research

These exclusions apply to target phrases, not to removing useful educational content. School-related terms describe EBS as organized by students in the Genetics and Biotech Club at Phillips Exeter Academy (PEA); participation remains open to all middle and high school students.

Validate generated files without rewriting them with `node scripts/update-seo.mjs --check`. Structured keywords alone do not establish search relevance or guarantee rankings; useful page content and accurate titles remain necessary.

Use phrases EBS can support with visible page content. Avoid unrelated terms, repeated variants, or claims about geography, awards, or outcomes that the site cannot substantiate.

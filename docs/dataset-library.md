# Dataset library

The Dataset library (`/datasets.html`) helps participants find a free public dataset for their question and analyze it. It is hidden from the site navigation for now; members reach it from **Account → Explore EBS**, the participant FAQ, site search or a direct link. To show it in the header again, add `['Datasets','datasets.html']` back to `nav` in `src/site.tsx`. It has:

- **Tool guides** for esquisse, Galaxy, iDEP and biblioshiny: what each tool is for, the data it accepts, step-by-step instructions, tips and official links, plus a “Which tool fits your data?” table.
- **A filterable catalog** of datasets in 14 research fields. Each entry shows the provider, level, suggested tools, format, access terms, a starter research question, a caution where misuse is likely, and “How to get and use it” steps (some with copyable R or Python code).
- **Responsible-use guidance**: citation, licenses, privacy, account and age rules, research logs and careful conclusions.

Like Resources and Coding, it is for **Accepted** members only (see [Resource and coding access](member-access.md)). Unlike those pages it is not in the Website content editor: its content lives in code, so changes go through a normal code change and deployment.

## Where things live

| What | File |
| --- | --- |
| Fields and datasets | `src/learning/datasets/catalog.ts` |
| Tool guides, tool names and the tool chooser table | `src/learning/datasets/tools.ts` |
| Shared types | `src/learning/datasets/types.ts` |
| Page layout, filters and cards | `src/pages/datasets.tsx` |
| Styles | “Dataset library” section at the end of `src/styles.css` |
| Checks | `scripts/datasets.test.mjs` (`npm run test:datasets`) |

## Adding or changing a dataset

1. Add an entry to `datasets` in `catalog.ts`, in its field’s group. Give it a unique `id` (lowercase words joined by hyphens); the card’s anchor is `datasets.html#dataset-<id>`.
2. Prefer sources that are free, documented and likely to stay online. State plainly when a free account, an age rule, a data-use agreement or a non-commercial license applies.
3. List tools best fit first. Use `code` (“R or Python”) when the dataset needs programming before any of the four tools can use it.
4. Write steps for the suggested tool, naming the site’s real buttons and menus, and add a `caution` when the data are easy to misread (causation, sampling bias, privacy, modeled estimates).
5. Run `npm run build` and then `npm run test:datasets`. The test checks every field, tool and link, renders the page, and confirms the catalog stays out of public files.
6. Open each link you added or changed. Dataset sites reorganize often.

## Access and build safeguards

- `datasets.html` is listed in `learningPages` (`src/access-policy.ts`). Routing middleware sends visitors who are not Accepted to Register or Account, exactly as for Resources and Coding (`server/access.ts`).
- Everything under `src/learning/` is member content. Vite puts the page and its catalog in their own chunk, `protected-assets/learning-datasets-*.js`, which only loads on this page and is protected by the middleware. The build fails if any `src/learning/` module would end up in a public chunk, so never import it from a public page.
- The page is `noindex` and excluded from the sitemap (`seo.config.json`). Its site-search entry is shown only to Accepted members.

## Reviewing locally

`npm run dev` cannot show member pages without Clerk. To review the library as a fake Accepted member, run:

```bash
node scripts/datasets-browser-fixture.mjs
```

Then open `http://127.0.0.1:4182/datasets.html`. The fixture runs only on localhost and never contacts Clerk, the content API or a database.

## Keeping it current

- The guides match esquisse 2.1, Galaxy’s Activity Bar interface, iDEP 2.4 and bibliometrix 5.5. Check menu and button names at the start of each school year, or when a tool announces a redesign.
- The Galaxy guide links to `galaxy-main.usegalaxy.org`, the main usegalaxy.org server. Galaxy tutorials list which public servers have their tools.
- Recent changes reflected in the catalog: MGnify results now come from several pipeline versions, Global Forest Watch dashboards now appear under Global Nature Watch, and WHO COVID-19 data have been mostly weekly since August 2023.

# Website content editor screen

Status: implemented locally November 10, 2026 (`src/content-editor.tsx`, `src/content/editor-fields.tsx`).

## Entry and structure

Team members see **Edit website content** on Account and within EBS administration. Open `/admin.html?view=content`, keeping Clerk Team settings' existing hash routes separate. The participant workspace remains the default admin view. The content workspace never requires changing the active Clerk organization.

```text
EBS administration
Participants    Website content    Team organization settings

Website content
Page [Student research v]       Audience: Public
Last published: Nov 10, 2026    Draft saved: 10:42 AM

[Edit] [Preview] [Published versions]

Page title
[Student research                                      ]
Introduction
[EBS has two parts...                                   ]

Research overview                         [Expand/collapse]
Research areas                            [Expand/collapse]
Timeline                                  [Expand/collapse]
  Checkpoint date  [Friday, December 18, 2026            ]
  Title            [Check 1: Idea and Research Plan     ]
  Description      [Submit your project idea...        ]
  [Move up] [Move down] [Remove entry]
  [Add checkpoint]
Presentation formats                      [Expand/collapse]
Research support                          [Expand/collapse]
Registration                              [Expand/collapse]

Unsaved changes
[Save draft] [Publish]
```

Resources/Coding use the same outer workspace with a list of editable sections. **Add section** offers Text, List, Links, Image and Code. Image entries expose URL, descriptive alt text and optional caption. Code entries expose a multiline plain-text field and language label. Existing posters can be selected by human-readable names. Reordering uses buttons with explicit labels rather than drag-only interaction.

## Appearance and preview

Use existing `.shell`, `.section`, `.actions`, `.button`, `.button.secondary`, form styling and CSS tokens (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--crimson`, `--gutter`). Use the site's typography, borders and spacing. Keep forms in a readable column; group fields by their visible page sections.

Preview occupies the workspace below the toolbar and uses the reader renderer, including existing two-column research sections, timeline and poster treatment. Show **Draft preview — not published** above it. On narrow screens use stacked controls and the site's existing responsive page layout. Avoid a side-by-side preview that squeezes both panes.

## States and behavior

| State | Behavior |
| --- | --- |
| Checking access | Status message; no draft data or enabled editing controls |
| Signed out / denied | Sign-in or return-to-Account action; no editor data |
| Loading a page | Keep the selected page name visible; announce loading |
| Editing | Mark Unsaved changes; Save draft enabled when valid |
| Saving | Disable duplicate submission; retain all fields |
| Saved | Show saved time; enable Publish if draft differs from publication |
| Publishing | Disable duplicate publishing; show success only after confirmed response |
| Field validation error | Inline label-associated message plus focusable error summary |
| Network failure | Keep local text; offer retry or reconciliation, never silently reload over edits |
| Conflict | Explain that another editor saved a version; preserve local text and provide an explicit reload/discard choice |
| Revoked access | Close editor data and refresh access; no further reads/writes |
| Published versions | Newest-first dated list; Preview version and Restore to draft; restoration does not publish |

No confirmation is needed for an ordinary save. Publish is already an explicit action. Leaving unsaved changes asks whether to keep editing or discard; destructive entry removal can offer immediate Undo within the local draft. Reverting a publication goes through Restore to draft, Preview and Publish.

## Accessibility and copy

- Every input has a persistent label. Group repeated items with fieldsets/legends or equivalent semantic headings.
- Announce save/publish results with a polite status region and failures with an alert. Move focus to errors or newly added entries as appropriate.
- Keep controls keyboard reachable, preserve visible focus and provide descriptive reorder/remove labels.
- Preserve a single reader-page H1, image alt text, code-copy behavior and registration/access controls in preview and published views.
- The audience label explains **Public** or **Accepted members**; it is informational and cannot be edited.
- Human-facing wording describes pages, drafts, publication and access. Database IDs, JSON and deployment details belong in operator documentation.

Acceptance and delivery boundaries: [specification](../../specs/website-content-editor-2026-11-10.md).

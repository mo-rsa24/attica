# Fixing create-event: illustrated map

The six defects in Attica's event-creation path, where each one sits, and the three-step order that
closes them. Pictures for [this scope's plans](MASTER_PLAN.md), not for the domain.

6 prompts · 0 rendered · 6 waiting

## Table of contents

- [Art direction](#art-direction)
- [Meaning palette](#meaning-palette)
- [Glyph vocabulary](#glyph-vocabulary)
- [Reading axes](#reading-axes)
- [Devices in play](#devices-in-play)
- [Subject lane](#subject-lane)
- [Prompt 1 (Subject): Two wrong strings, two dead paths](#prompt-1-subject-two-wrong-strings-two-dead-paths)
- [Prompt 2 (Subject): Where all six defects sit](#prompt-2-subject-where-all-six-defects-sit)
- [Subject capstone: The create-event surface, with every fault marked](#subject-capstone-the-create-event-surface-with-every-fault-marked)
- [Process lane](#process-lane)
- [Prompt 1 (Process): Unblock, then re-classify](#prompt-1-process-unblock-then-re-classify)
- [Prompt 2 (Process): Three plans, and what each gate proves](#prompt-2-process-three-plans-and-what-each-gate-proves)
- [Process capstone: From six unrecorded bugs to a runbook that remembers](#process-capstone-from-six-unrecorded-bugs-to-a-runbook-that-remembers)

## Art direction

Navigation: 📋 [TOC](#table-of-contents) | [Next](#meaning-palette) ➡️

**Vivid circuit.** Every defect in this scope is a value travelling between two components and
arriving wrong: a path that 404s, a key nothing reads, a field that passes a check that was never
written. That is traffic on a topology, and this direction gives each kind of traffic its own
colored line.

**This deliberately differs from [the context illustrated map](../../../../context/diagram-prompts.md),
which pins Outline cartoon.** That map says of itself "pictures for the context folder, not for the
code", so it claims no authority here. Its subject is people coordinating; this one's is a request
path. Where a glyph overlaps (the organizer, an event) the meanings below match it, so the two sets
still read as one project.

The style paragraph is embedded verbatim at the head of every prompt, so any single prompt survives
being pasted alone.

## Meaning palette

Navigation: ⬅️ [Art direction](#art-direction) | 📋 [TOC](#table-of-contents) | [Next](#glyph-vocabulary) ➡️

Four colors, each carrying exactly one meaning, the same in every image.

| Color | Means |
|---|---|
| Amber | a request or value travelling correctly |
| Red | a request or value arriving wrong: a 404, a rejected write, a key nothing reads |
| Green | a guard that now holds, and a passing check |
| Muted gray | a component present but not exercised, or a result nobody can trust |

## Glyph vocabulary

Navigation: ⬅️ [Meaning palette](#meaning-palette) | 📋 [TOC](#table-of-contents) | [Next](#reading-axes) ➡️

Inherited where it overlaps the project's context map; the rest are additions this scope needs.

| Glyph | Stands for | Tier |
|---|---|---|
| Cartoon person with a clipboard | the organizer (inherited) | primary |
| Gold calendar card | an event (inherited) | primary |
| Browser window | the React frontend | primary |
| Server platform with a Django glyph | the backend | primary |
| Small key icon | a `localStorage` entry | artifact |
| Shield | a validation guard, drawn broken when absent | artifact |
| Paper-clip on a card | an uploaded asset attached to a draft | artifact |
| Beaker | a test suite | secondary |
| Red cross badge | a defect, numbered 1 to 6 | artifact |
| Gray question badge | a defect whose status cannot be determined | artifact |

## Reading axes

Navigation: ⬅️ [Glyph vocabulary](#glyph-vocabulary) | 📋 [TOC](#table-of-contents) | [Next](#devices-in-play) ➡️

**Dominant axis: left to right**, meaning the direction a request travels in the subject lane, and
the order the plans run in the process lane. **Secondary axis: vertical**, separating the browser
half above from the backend half below, so a defect's position tells you which side to open.

## Devices in play

Navigation: ⬅️ [Reading axes](#reading-axes) | 📋 [TOC](#table-of-contents) | [Next](#subject-lane) ➡️

The subject lane uses tinted grouping panels and numbered defect badges, no sequencing. The process
lane adds numbered step badges, phase containers, and pass and fail status chips over the same cast.

## Subject lane

Navigation: ⬅️ [Devices in play](#devices-in-play) | 📋 [TOC](#table-of-contents) | [Next](#prompt-1-subject-two-wrong-strings-two-dead-paths) ➡️

The create-event surface and where the faults sit. No time in these.

### Prompt 1 (Subject): Two wrong strings, two dead paths

Navigation: ⬅️ [Subject lane](#subject-lane) | 📋 [TOC](#table-of-contents) | [Next](#prompt-2-subject-where-all-six-defects-sit) ➡️

This is the picture of [Unblock the truth](plans/01-unblock-the-truth.md)'s
[what happens (visual)](plans/01-unblock-the-truth.md#what-happens-visual) ASCII.

[traced] ⏳ not rendered
Save as: `diagrams/subject-01-two-wrong-strings.png`

```
Style: premium system-design infographic. Clean white or very light gray background. Glossy semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms. Flows drawn as vivid color-coded directional arrows, each color meaning exactly one kind of traffic, with a small legend inside the image. Solid lines are actual transfers; dashed lines are reserved for control, acknowledgement, retry, and optional paths. Related components grouped inside rounded soft-tinted panels with a short title on the panel. A bold title banner across the top. Official product logos only on components that ARE that product; every other component gets a clean generic glyph. Small cartoon figures or vehicles for external actors (users, clients). Clean sans-serif labels under every icon, short and lowercase-friendly. Depth is relative: only the primary component icons carry dimensionality, containers stay flat and low contrast, and arrows are flat vector overlays above everything. Shadows are soft and directly beneath their object, never dramatic or angled. No glassmorphism, no neon glow, no photorealism, no heavy bevelling, no gradients except subtle material shading inside an icon. Generous spacing, no clutter, no watermark.

Scene: two rounded tinted panels side by side, each titled, each showing one defect as a two-component exchange that fails. Beneath both panels, a single wide green panel spanning the full width, showing the shared outcome after both are fixed. A small legend sits in the lower right.

Left panel, titled "BUG 1: THE WRONG PATH": a browser window icon on the left, a Django server platform on the right. One red arrow from browser to server labelled with the requested path, hitting a red cross badge numbered 1 before it reaches the server. Below it, one amber arrow from the server back toward the browser labelled with the path the server actually serves, drawn shorter and not connecting, to show nothing asks for it. Two small gray icons under the browser labelled as the two callers.

Right panel, titled "BUG 2: THE WRONG KEY": a beaker icon on the left representing the test helper, a browser window on the right. A red arrow from the beaker to a small key icon inside the browser, the key labelled with the name the helper writes, carrying a red cross badge numbered 2. Beside it a second, separate key icon labelled with the name the application reads, drawn gray and unconnected. A small cartoon organizer figure at the far right stands behind a gray barrier, meaning logged out.

Bottom green panel, titled "AFTER BOTH FIXES": one amber arrow browser to server arriving cleanly with a green check, and one amber arrow from the beaker into a single key that the browser reads, with a green check. Two small gray question badges sit at the right of this panel, each turning into a green check, meaning two previously undecidable defects now get a verdict.

Flows: red for a value arriving wrong, amber for a value arriving correctly, green for a check that now holds, gray for a component present but not exercised.

Text in the image: title banner "TWO WRONG STRINGS". Left panel label "/api/events/my/" on the red arrow and "/api/events/my-events/" on the amber one. Right panel labels "authTokens" on the red key and "tokens" on the gray key. Bottom panel caption "TWO UNKNOWNS GET A VERDICT". Legend rows: "AMBER: ARRIVES", "RED: ARRIVES WRONG", "GREEN: NOW GUARDED", "GRAY: NOT EXERCISED".

Exclusions: no code snippets, no file trees, no third bug, no database icons, no duplicated components, no orphan arrows, no arrow terminating in whitespace, no color used without a legend entry, no decorative circuitry or filigree, no invented or misapplied brand logos, no paragraphs of text, no illegible pseudo-code, no crossing arrows where routing could avoid it, no untitled containers, no icon without a label, no perspective distortion applied to arrows, no visual metaphor that contradicts the system's actual semantics, no watermark.
```

Faithfulness note: bug 1's failing arrow must stop short of the server, and bug 2's two keys must be
separate objects that never touch. If the render connects either pair, it draws a working system and
says the opposite of the plan.

### Prompt 2 (Subject): Where all six defects sit

Navigation: ⬅️ [Prompt 1 (Subject): Two wrong strings, two dead paths](#prompt-1-subject-two-wrong-strings-two-dead-paths) | 📋 [TOC](#table-of-contents) | [Next](#subject-capstone-the-create-event-surface-with-every-fault-marked) ➡️

The scope's whole subject: the six defects positioned on the surface they break, so a reader can see
that [Close the gaps](plans/02-close-the-gaps.md)'s four are all server-side while
[01](plans/01-unblock-the-truth.md)'s two straddle the boundary.

[traced] ⏳ not rendered
Save as: `diagrams/subject-02-where-the-six-sit.png`

```
Style: premium system-design infographic. Clean white or very light gray background. Glossy semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms. Flows drawn as vivid color-coded directional arrows, each color meaning exactly one kind of traffic, with a small legend inside the image. Solid lines are actual transfers; dashed lines are reserved for control, acknowledgement, retry, and optional paths. Related components grouped inside rounded soft-tinted panels with a short title on the panel. A bold title banner across the top. Official product logos only on components that ARE that product; every other component gets a clean generic glyph. Small cartoon figures or vehicles for external actors (users, clients). Clean sans-serif labels under every icon, short and lowercase-friendly. Depth is relative: only the primary component icons carry dimensionality, containers stay flat and low contrast, and arrows are flat vector overlays above everything. Shadows are soft and directly beneath their object, never dramatic or angled. No glassmorphism, no neon glow, no photorealism, no heavy bevelling, no gradients except subtle material shading inside an icon. Generous spacing, no clutter, no watermark.

Scene: one wide image split into two horizontal bands by a faint dividing line. The upper band is a tinted panel titled for the browser side; the lower band is a tinted panel titled for the backend side. A cartoon organizer with a clipboard stands at the far left, spanning both bands, with amber arrows leaving them into the upper band. Six red cross badges, numbered 1 to 6, are placed on the components they break.

Upper band cast, left to right: a browser window showing a wizard step, a second browser window showing a dashboard, and a beaker icon for the test suite. Badge 1 sits on the arrow leaving the dashboard window. Badge 2 sits on a small key icon beside the beaker.

Lower band cast, left to right: a Django server platform, then three small artifact icons on their own rounded platforms: a broken shield labelled for date validation, a second broken shield labelled for price validation, and a card with a paper-clip drawn detached and falling away. At the far right of the lower band, two small server icons side by side with mismatched status chips, meaning two paths that disagree. Badge 3 on the first broken shield, badge 4 on the second, badge 5 on the detached paper-clip, badge 6 on the mismatched pair.

Flows: amber arrows from the organizer into the upper band and from the upper band down into the server, meaning the ordinary request path. Red short arrows at each badge, each pointing at the exact component that fails. No arrow crosses the band divider except the two amber ones.

Text in the image: title banner "SIX DEFECTS, TWO SIDES". Upper panel title "IN THE BROWSER". Lower panel title "IN THE BACKEND". Badge captions, each four words or fewer: "1 WRONG API PATH", "2 WRONG STORAGE KEY", "3 NO DATE GUARD", "4 NO PRICE GUARD", "5 ASSET NOT SAVED", "6 TWO STATUS CODES". Legend rows: "AMBER: ORDINARY REQUEST", "RED: WHERE IT BREAKS".

Exclusions: no code snippets, no seventh badge, no file paths as long strings, no database schema, no duplicated components, no orphan arrows, no arrow terminating in whitespace, no color used without a legend entry, no decorative circuitry or filigree, no invented or misapplied brand logos, no paragraphs of text, no illegible pseudo-code, no crossing arrows where routing could avoid it, no untitled containers, no icon without a label, no perspective distortion applied to arrows, no visual metaphor that contradicts the system's actual semantics, no watermark.
```

Faithfulness note: badges 3 to 6 must all sit in the lower band and badges 1 and 2 in the upper. That
split is the claim: plan 02's work is entirely server-side, plan 01's straddles the boundary. A badge
in the wrong band misroutes whoever reads it.

### Subject capstone: The create-event surface, with every fault marked

Navigation: ⬅️ [Prompt 2 (Subject): Where all six defects sit](#prompt-2-subject-where-all-six-defects-sit) | 📋 [TOC](#table-of-contents) | [Next](#process-lane) ➡️

[traced] ⏳ not rendered
Save as: `diagrams/subject-capstone-the-whole-surface.png`

```
Style: premium system-design infographic. Clean white or very light gray background. Glossy semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms. Flows drawn as vivid color-coded directional arrows, each color meaning exactly one kind of traffic, with a small legend inside the image. Solid lines are actual transfers; dashed lines are reserved for control, acknowledgement, retry, and optional paths. Related components grouped inside rounded soft-tinted panels with a short title on the panel. A bold title banner across the top. Clean sans-serif labels under every icon. Generous spacing, no clutter, no watermark.

Scene: one continuous left-to-right journey of a single request, drawn across three tinted panels titled for the three stages an organizer passes through. A cartoon organizer with a clipboard starts at the far left. A gold calendar card sits at the far right as the outcome. Every one of the six red cross badges from the previous image reappears exactly once, on the same component, so the two pictures can be read together. A small in-image legend runs along the bottom edge.

Panel one, titled for building the draft: a browser window with a wizard step, an amber arrow into a Django server platform, and two broken shields on the server platform carrying badges 3 and 4. A card with a detached paper-clip carrying badge 5 sits beneath the server.

Panel two, titled for seeing what you have: a second browser window showing a dashboard, its outgoing arrow red and stopping short, carrying badge 1. Beside it two small server icons with mismatched status chips carrying badge 6.

Panel three, titled for proving it works: a beaker with a gray question mark over it, a key icon carrying badge 2, and two gray question badges meaning results nobody can trust.

At the far right, past all three panels, the gold calendar card is drawn in muted gray rather than gold, meaning the outcome is not reliably reachable today.

Flows: one amber route line carrying the organizer left to right through all three panels, going red inside panel two where the dashboard request fails, and going gray through panel three.

Text in the image: title banner "THE CREATE-EVENT SURFACE TODAY". Panel titles "BUILD THE DRAFT", "SEE WHAT YOU HAVE", "PROVE IT WORKS". A caption under the gray calendar card reading "NOT RELIABLY REACHABLE". Legend rows: "AMBER: WORKS", "RED: BREAKS", "GRAY: CANNOT TRUST".

Exclusions: no seventh badge, no code, no renumbering of the badges, no gold on the final calendar card, no duplicated components, no orphan arrows, no arrow terminating in whitespace, no color used without a legend entry, no decorative circuitry or filigree, no invented or misapplied brand logos, no paragraphs of text, no illegible pseudo-code, no crossing arrows where routing could avoid it, no untitled containers, no icon without a label, no perspective distortion applied to arrows, no visual metaphor that contradicts the system's actual semantics, no watermark.
```

Faithfulness note: the final calendar card must be gray, and the badge numbers must match prompt 2
exactly. Drawing it gold claims the flow works end to end today, which is what this whole scope
exists to make true rather than to assert.

## Process lane

Navigation: ⬅️ [Subject capstone: The create-event surface, with every fault marked](#subject-capstone-the-create-event-surface-with-every-fault-marked) | 📋 [TOC](#table-of-contents) | [Next](#prompt-1-process-unblock-then-re-classify) ➡️

The same cast with the three plans drawn over it: what runs when, and what each gate proves.

History: `diagrams/process-versions/`. This lane is regenerated whole, never patched.

### Prompt 1 (Process): Unblock, then re-classify

Navigation: ⬅️ [Process lane](#process-lane) | 📋 [TOC](#table-of-contents) | [Next](#prompt-2-process-three-plans-and-what-each-gate-proves) ➡️

Plan 01's own shape: the two fixes, and the re-run that is the actual point of going first.

[traced] ⏳ not rendered
Save as: `diagrams/process-01-unblock-then-reclassify.png`

```
Style: premium system-design infographic. Clean white or very light gray background. Glossy semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms. Flows drawn as vivid color-coded directional arrows, each color meaning exactly one kind of traffic, with a small legend inside the image. Solid lines are actual transfers; dashed lines are reserved for control, acknowledgement, retry, and optional paths. Related components grouped inside rounded soft-tinted panels with a short title on the panel. A bold title banner across the top. Clean sans-serif labels under every icon. Generous spacing, no clutter, no watermark.

Scene: a left-to-right flow of four rounded stage platforms, each carrying a small numbered step badge, grouped into two titled panels. The first panel holds two stages side by side; the second panel holds two stages in sequence. A gate marker sits between the panels.

Panel one, titled for the two edits, holds stage 1 and stage 2 side by side. Stage 1 carries a browser window icon and two small caller icons beneath it, with a red-to-amber arrow above it meaning a path being corrected. Stage 2 carries a beaker and a key icon, with a red-to-amber arrow meaning a key being corrected.

The gate between the panels is drawn as a vertical amber bar with a check inside, captioned as the point where evidence becomes trustworthy.

Panel two, titled for reading the result, holds stage 3 then stage 4. Stage 3 carries a beaker with an amber arrow running into it, meaning the suite re-run. Stage 4 carries two badges side by side: one gray question badge turning green, and one gray question badge turning red, meaning the two previously-undecidable defects each receive a verdict and the verdicts may differ.

Flows: amber arrows connecting stage 1 and stage 2 into the gate, then the gate into stage 3, then stage 3 into stage 4. One dashed gray arrow loops from stage 4 back to panel one, labelled as the path taken if a verdict reveals a new defect.

Text in the image: title banner "UNBLOCK, THEN RE-CLASSIFY". Panel titles "FIX TWO STRINGS" and "READ WHAT THE SUITE NOW SAYS". Stage captions "1 CORRECT THE PATH", "2 CORRECT THE KEY", "3 RE-RUN THE SUITE", "4 TWO VERDICTS". Gate caption "EVIDENCE NOW TRUSTWORTHY". Dashed loop caption "NEW DEFECT FOUND". Legend rows: "AMBER: PROCEEDS", "GREEN: HOLDS", "RED: STILL BROKEN", "DASHED: ONLY IF".

Exclusions: no fifth stage, no code, no test output text, no duplicated components, no orphan arrows, no arrow terminating in whitespace, no color used without a legend entry, no decorative circuitry or filigree, no invented or misapplied brand logos, no paragraphs of text, no illegible pseudo-code, no crossing arrows where routing could avoid it, no untitled containers, no icon without a label, no perspective distortion applied to arrows, no visual metaphor that contradicts the system's actual semantics, no watermark.
```

Faithfulness note: stage 4's two badges must resolve to different colors. Drawing both green claims
the two unknowns are both fine, which is exactly what nobody knows yet and what the plan refuses to
assume.

### Prompt 2 (Process): Three plans, and what each gate proves

Navigation: ⬅️ [Prompt 1 (Process): Unblock, then re-classify](#prompt-1-process-unblock-then-re-classify) | 📋 [TOC](#table-of-contents) | [Next](#process-capstone-from-six-unrecorded-bugs-to-a-runbook-that-remembers) ➡️

The whole [running order](MASTER_PLAN.md#running-order), with each plan's engagement gate drawn as
the thing it actually checks.

[traced] ⏳ not rendered
Save as: `diagrams/process-02-three-plans-three-gates.png`

```
Style: premium system-design infographic. Clean white or very light gray background. Glossy semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms. Flows drawn as vivid color-coded directional arrows, each color meaning exactly one kind of traffic, with a small legend inside the image. Solid lines are actual transfers; dashed lines are reserved for control, acknowledgement, retry, and optional paths. Related components grouped inside rounded soft-tinted panels with a short title on the panel. A bold title banner across the top. Clean sans-serif labels under every icon. Generous spacing, no clutter, no watermark.

Scene: three large tinted panels left to right, one per plan, each carrying a numbered step badge in its corner and each closed on its right edge by a tall gate marker. The gates are the emphasis: each is drawn as a vertical bar with an icon inside naming what it checks, and each is captioned with the thing that must be true to pass.

Panel one, step 1: a browser window and a beaker, with two small red-to-amber correction arrows. Its gate holds a browser icon, captioned that a real dashboard must show seven rows.

Panel two, step 2: two shields drawn intact and green, a card with its paper-clip attached, and two server icons whose status chips now match. Its gate holds an organizer figure, captioned that a person must have tried each fix in a browser, not merely watched a suite go green.

Panel three, step 3: a beaker with a green check, and an open book icon representing the runbook, with four small arrows entering the book from the two earlier panels. Its gate holds a stopwatch, captioned that three symptoms must be findable in under thirty seconds without search.

Flows: one thick amber route line running left to right through all three panels and their gates. Two thin amber arrows arcing from panels one and two into the book in panel three, meaning findings being written down. One dashed gray arrow from panel one's gate back into panel two, labelled as the case where a verdict adds work.

Text in the image: title banner "THREE PLANS, THREE GATES". Panel titles "1 UNBLOCK THE TRUTH", "2 CLOSE THE GAPS", "3 WRITE IT DOWN". Gate captions "SEVEN ROWS ON SCREEN", "TRIED IT AS AN ORGANIZER", "FOUND IN THIRTY SECONDS". Legend rows: "AMBER: THE ROUTE", "GREEN: NOW HOLDS", "DASHED: ONLY IF".

Exclusions: no fourth panel, no code, no checklist text, no duplicated components, no orphan arrows, no arrow terminating in whitespace, no color used without a legend entry, no decorative circuitry or filigree, no invented or misapplied brand logos, no paragraphs of text, no illegible pseudo-code, no crossing arrows where routing could avoid it, no untitled containers, no icon without a label, no perspective distortion applied to arrows, no visual metaphor that contradicts the system's actual semantics, no watermark.
```

Faithfulness note: all three gates must be drawn at equal weight. Every one of them is a person
checking something a test cannot, and shrinking the third makes the runbook look like paperwork
rather than the scope's deliverable.

### Process capstone: From six unrecorded bugs to a runbook that remembers

Navigation: ⬅️ [Prompt 2 (Process): Three plans, and what each gate proves](#prompt-2-process-three-plans-and-what-each-gate-proves) | 📋 [TOC](#table-of-contents)

[traced] ⏳ not rendered
Save as: `diagrams/process-capstone-bugs-to-runbook.png`

```
Style: premium system-design infographic. Clean white or very light gray background. Glossy semi-3D icons with soft drop shadows, one icon per component, sitting on subtle rounded platforms. Flows drawn as vivid color-coded directional arrows, each color meaning exactly one kind of traffic, with a small legend inside the image. Solid lines are actual transfers; dashed lines are reserved for control, acknowledgement, retry, and optional paths. Related components grouped inside rounded soft-tinted panels with a short title on the panel. A bold title banner across the top. Clean sans-serif labels under every icon. Generous spacing, no clutter, no watermark.

Scene: one continuous left-to-right journey. At the far left, six red cross badges numbered 1 to 6 float loose with no container around them, deliberately unorganised, above a caption saying they are recorded nowhere. The route line gathers them into three tinted stage panels in the middle, matching the three plans. At the far right sits a large open book icon with six small green entries visible on its pages, and beside it a gold calendar card now drawn in full gold rather than gray.

Middle stages, left to right: stage one shows two corrections and a beaker turning from gray to amber. Stage two shows four badges turning from red to green. Stage three shows the book being written into, with four thin arrows entering it.

Beneath the book, a small cartoon organizer figure with a clipboard stands reading it, meaning the next person who meets one of these symptoms.

Flows: one thick amber route line from the loose badges through all three stages into the book. Six thin red lines, one from each loose badge, converging into the route as it enters stage one. Six thin green lines leaving stage three into the book's pages.

Text in the image: title banner "SIX BUGS, ONE RUNBOOK". Caption above the loose badges "RECORDED NOWHERE". Stage captions "UNBLOCK", "FIX", "WRITE DOWN". Caption under the book "RECOGNISED, NOT REDISCOVERED". Caption under the gold calendar card "REACHABLE". Legend rows: "RED: A DEFECT", "AMBER: THE WORK", "GREEN: WRITTEN DOWN".

Exclusions: no seventh badge, no code, no fourth stage, no gray on the final calendar card, no duplicated components, no orphan arrows, no arrow terminating in whitespace, no color used without a legend entry, no decorative circuitry or filigree, no invented or misapplied brand logos, no paragraphs of text, no illegible pseudo-code, no crossing arrows where routing could avoid it, no untitled containers, no icon without a label, no perspective distortion applied to arrows, no visual metaphor that contradicts the system's actual semantics, no watermark.
```

Faithfulness note: the six badges must start loose and uncontained, and end as six entries inside the
book. That transition is the whole argument of the scope: the bugs existing was not the failure, the
bugs leaving no trace was. Drawing them merely fixed, without the book, tells the smaller story.

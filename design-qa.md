# Product Design QA

Date: 2026-09-09

## Visual target

- Direction: `Quiet Focus / 安静聚焦`
- Reference: `design/reference/selected-today-workbench.png`
- Comparison: `design/qa/reference-vs-implementation.png`
- The implementation preserves the reference's warm neutral background, deep-teal hierarchy, card rhythm, local-only privacy cue, focused next action, three-item overview, and four-destination app navigation. The production card gives the exercise image more space so the movement remains readable on a phone.

## Viewports checked

- Compact mobile: 360 × 800
- Mobile: 390 × 844
- Desktop: 1280 × 900
- Baseline screenshots: `design/qa/today-mobile.png`, `design/qa/chain-desktop.png`
- Expanded-scope screenshots: `design/qa/training-mobile-expanded.png`, `design/qa/functional-mobile-expanded.png`, `design/qa/chain-mobile-expanded.png`, `design/qa/chain-desktop-expanded.png`

## Journey checks

- First run starts with no selected health condition and offers explicit `选择身体问题` and `载入示例` actions.
- The empty-condition setup state still shows the active default split's current-day summary, so Today and Training Today do not diver.
- Example data loads only after an explicit action and can be cleared after confirmation.
- `今日 / 身体 / 动力链 / 训练` remain available as persistent app navigation.
- Body map, issue library, and inline searchable muscle reference work at mobile width, including a clear no-result state.
- Kinetic-chain nodes reveal their detail immediately below the tapped node on mobile and update the adjacent sticky detail on desktop; all selected relationship groups, branches, cycles and directed edges are retained, while unlinked observations stay in a separate section.
- Exercise details expand to show setup, cues, side, equipment, regression, progression, compensations, stop conditions, and sources.
- Today and Training resolve the same applicable session from selected conditions and the current weekday plan.
- Five split templates expose audience, trade-offs, recovery guidance, full weekly schedule and per-day support actions; chest / legs / back remains the default.
- Training uses four clear subviews: Today, Split Plans, Sport-Specific and Exercise Library.
- Running, HYROX and Fitness each expose three purpose-led modules with duration, frequency, placement and an inclusion reason for every action.
- Fitness uses A (power / force transfer) and C (whole-body coordination / loaded movement) as primary modules; B (multidirectional landing / deceleration) is optional and warm-up-only actions are excluded.
- Today shows the selected sport-track module only as a weekly suggestion and does not auto-merge it into the session.
- Completing an exercise in Training updates the shared Today progress.
- Primary controls remain at least 44 px high at compact mobile width.
- No document-level horizontal overflow at 360 px, 390 px, or 1280 px; intended segmented controls and selectors scroll inside their own bounds.
- Browser log contains no errors; only the expected Vite connection and app launch messages.

## Asset checks

- 41 of 41 exercises have a project-owned 960 × 640 WebP image and descriptive alt text, including all 22 new performance actions.
- Contact-sheet review found no obvious extra limbs, impossible joint positions, clipped subjects, embedded text, or logos.
- Exercise images total about 928 KB in the source static directory; the complete H5 build is about 4.6 MB.

## Verification

- `npm test`: 22 passed, 0 failed.
- `npm run build:h5`: passed.
- H5 output: about 4.6 MB.
- `git diff --check`: passed.
- `openspec validate expand-training-and-chain-library --strict`: passed.
- Browser journey: 5 split selectors, 3 sport tracks × 3 modules, `鹅足` search hit, 390 px and 1280 px layouts passed.
- Two-axis review initially found four specification gaps and two hard standards gaps; the final tree addresses them with empty-state Today synchronization, inline mobile chain detail, complete upstream/downstream edge collection, valid-calendar pruning, and explicit pes-anserine load/return guidance. Remaining notes are refactoring judgements, not requirement failures.

final result: passed

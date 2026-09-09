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
- Screenshots: `design/qa/today-mobile.png`, `design/qa/chain-desktop.png`

## Journey checks

- First run stays blank and offers explicit `选择身体问题` and `载入示例` actions.
- Example data loads only after an explicit action and can be cleared after confirmation.
- `今日 / 身体 / 动力链 / 训练` remain available as persistent app navigation.
- Body map, issue library, and inline searchable muscle reference work at mobile width, including a clear no-result state.
- Kinetic-chain nodes switch the adjacent detail immediately; relationship status and non-diagnostic copy remain visible.
- Exercise details expand to show setup, cues, side, equipment, regression, progression, compensations, stop conditions, and sources.
- Today and Training resolve the same applicable session from selected conditions and the current weekday plan.
- Full Plan shows the weekly schedule, target, assumptions, exercise list, post-training notes, cardio, recovery principles, and practical tips.
- Completing an exercise in Training updates the shared Today progress.
- Primary controls remain at least 44 px high at compact mobile width.
- No horizontal overflow at 360 px, 390 px, or 1280 px.
- Browser log contains no errors; only the expected Vite connection and app launch messages.

## Asset checks

- 19 of 19 exercises have a project-owned 960 × 640 WebP image and descriptive alt text.
- Contact-sheet review found no obvious extra limbs, impossible joint positions, clipped subjects, embedded text, or logos.
- Exercise images total about 472 KB in the production static directory.

## Verification

- `npm test`: 9 passed, 0 failed.
- `npm run build:h5`: passed.
- H5 output: about 4.1 MB.
- `openspec validate mobile-personal-rehab-workbench --strict`: passed.
- Two-axis review: no hard repository-standard violations and no current specification findings.

final result: passed

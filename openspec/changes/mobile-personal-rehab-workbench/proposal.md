## Why

SportsHealth currently mixes a public encyclopedia, a muscle atlas, a personal six-day plan, and a long kinetic-chain graph without a clear mobile-first task hierarchy. The change turns the existing GitHub Pages app into a focused personal rehabilitation workspace that is safer to read, easier to navigate on a phone, and still useful on desktop.

## What Changes

- Replace scattered page entry points with a persistent four-destination shell: Today, Body, Kinetic Chain, and Training.
- Make the first-run experience private by default: no condition is preselected, and selections/progress remain in local device storage.
- Keep the existing personal chain only as an explicitly loaded example template.
- Reorganize encyclopedia and muscle-atlas material under Body, and exercise/program/progress material under Training.
- Replace the fixed narrow kinetic-chain graph with a compact mobile path and a desktop path-plus-detail layout.
- Replace deterministic medical wording such as “root cause”, “causes”, and “confirmed” with evidence-aware relationship language and visible uncertainty/status.
- Expand all 19 current exercises with consistent instructional imagery, dosage, side, cues, common compensations, regression, progression, stop conditions, and authoritative references.
- Remove duplicate exercise presentation, unavailable “to be added” actions, redundant headings, and non-actionable content.
- Add responsive behavior and acceptance coverage for common phone and desktop viewports.

## Capabilities

### New Capabilities

- `responsive-workbench-shell`: Persistent mobile-first navigation, Today dashboard hierarchy, responsive desktop composition, and clear empty states.
- `local-personal-profile`: Private-by-default condition selection, local persistence, optional example-chain loading, and recoverable clearing/reset behavior.
- `evidence-aware-kinetic-chain`: Compact relationship paths, node details, evidence/status language, branching behavior, and non-diagnostic safety wording.
- `rehab-exercise-guidance`: A deduplicated 19-exercise library with actionable dosage, teaching visuals, progressions/regressions, safety stops, sources, and local completion state.

### Modified Capabilities

None. This repository has no existing OpenSpec capability specifications.

## Impact

- Affects the uni-app page shell, routes/tab configuration, global styles, current page composition, kinetic-chain and exercise components, local-storage keys/migration behavior, and structured JSON content.
- Adds project-owned raster teaching assets and source metadata; no account, backend, cloud sync, or online diagnosis service is introduced.
- Existing GitHub Pages deployment remains static. Build output may change, but deployment and pushing are outside this change.

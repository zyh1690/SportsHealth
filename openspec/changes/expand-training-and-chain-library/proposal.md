## Why

The personal rehabilitation workbench currently has one fixed chest/legs/back schedule, no sport-specific functional-training path, and a kinetic-chain view that prioritizes one longest path. Users need flexible training structures, purposeful performance work for their sport, safer medial-knee guidance, and a complete view of multiple simultaneous relationship groups.

## What Changes

- Add searchable “鹅足滑囊炎 / 鹅足区疼痛” guidance with differential cues, red flags, conservative load management, and progressive exercise support.
- Replace the single fixed plan surface with five explained split templates: full body, upper/lower, chest/legs/back, four-way, and five-way; keep chest/legs/back as the default.
- Reorganize Training into Today, Split Plans, Sport-Specific, and Exercise Library while preserving the four primary app destinations.
- Add Running, HYROX, and Fitness functional-training tracks with purpose-led 20–30 minute modules and explicit placement/frequency guidance.
- Add four running, six HYROX, and twelve fitness performance exercises, deduplicating actions reused by more than one track and applying the existing complete-guidance and project-owned-image standard.
- Make Fitness prioritize “power and force transfer” and “whole-body coordination and loaded movement”; keep multidirectional strength and landing/deceleration as an optional module and exclude warm-up-only mobility drills from the Fitness track.
- Persist the selected split and primary sport track locally, record completion by natural day, retain 28 days of recent completion, and migrate existing local selections and completion safely.
- Replace longest-path-only kinetic-chain presentation with deterministic connected groups that expose every node and edge, including branches, cycles, and unlinked observations.

## Capabilities

### New Capabilities

- `training-split-templates`: Five selectable, explained weekly split structures and their day-level preparation/support content.
- `sport-specific-functional-training`: Running, HYROX, and Fitness tracks, modules, purposes, frequency/placement guidance, and performance-exercise mapping.
- `medial-knee-condition-guidance`: Searchable, non-diagnostic pes-anserine/medial-knee guidance with safety escalation and progressive actions.

### Modified Capabilities

- `responsive-workbench-shell`: Training gains Today, Split Plans, Sport-Specific, and Exercise Library subviews while the four-destination shell remains unchanged.
- `local-personal-profile`: Local state gains split selection, primary sport track, date-scoped completion, 28-day retention, and v2 migration.
- `rehab-exercise-guidance`: The complete structured guidance, image, reference, and shared-completion requirements extend to every newly added performance exercise.
- `evidence-aware-kinetic-chain`: The chain must present every connected relationship group and all branches instead of reducing the selection to one primary path.

## Impact

- Content: condition, exercise/guidance, split-template, sport-track, and module data.
- State: a new versioned local-workspace schema with deterministic migration and bounded completion history.
- UI: Training, Today, Body search/detail, kinetic-chain visualization, and exercise library filters/cards.
- Assets: project-owned instructional images for all new exercise records and updated static-build size.
- Verification: content-integrity and state tests, responsive browser journeys, visual QA, production H5 build, and strict OpenSpec validation.

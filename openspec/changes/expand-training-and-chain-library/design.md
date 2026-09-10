## Context

SportsHealth is a static uni-app/Vue 3 GitHub Pages application with JSON content, a four-destination responsive shell, a versioned local-only workspace, 19 fully guided exercises, and a cautious kinetic-chain presentation. Training currently imports one fixed `plan.json`; completion is one persistent set; and chain rendering derives one longest spine plus secondary branches. The confirmed change crosses content, state, scheduling, responsive UI, assets, and graph presentation.

## Goals / Non-Goals

**Goals:**

- Make five common strength splits understandable and selectable while keeping the current three-way plan as default.
- Add purposeful Running, HYROX, and Fitness functional-training tracks without silently increasing daily workload.
- Add complete, source-backed, project-owned guidance for 22 performance actions.
- Add safe pes-anserine/medial-knee guidance.
- Preserve local-only behavior while moving completion to natural-date buckets with a 28-day bound.
- Show every selected kinetic-chain relationship in deterministic groups on phone and desktop.

**Non-Goals:**

- Prescribing fixed primary-lift loads, sets, or individualized medical treatment.
- Accounts, cloud synchronization, cross-device history, or long-term analytics.
- Automatically merging sport-module actions into Today.
- Adding a fifth primary navigation destination.
- Committing, pushing, or deploying without separate authorization.

## Decisions

### Use content-driven split and sport-track files

Add `training-splits.json` for template metadata/schedules and `functional-programs.json` for tracks/modules/action-purpose mappings. Keep exercise mechanics in the existing exercise and guidance records so reused actions have one canonical definition.

Alternative considered: encode plans directly in Vue. Rejected because it duplicates IDs and makes content integrity difficult to test.

### Preserve the four-destination shell

Training uses four internal subviews: Today, Split Plans, Sport-Specific, and Exercise Library. Split selection occurs inside Split Plans; track and module selection occur inside Sport-Specific. Mobile uses horizontally scrollable segmented controls and stacked cards; desktop uses bounded selector/detail columns.

Alternative considered: add Function as a fifth bottom-navigation item. Rejected because it weakens the already confirmed app hierarchy and crowds compact phones.

### Keep sport work opt-in

Today reads the selected track only to show one weekly suggestion card. It does not merge a sport module into required actions. Module actions become trackable only after the user opens/chooses the module.

Alternative considered: automatically append the selected track’s module. Rejected because it can create an unreviewed jump in daily volume.

### Upgrade local state to v3

Use `sportshealth:workspace:v3` with `selectedConditionIds`, `selectedSplitId`, `selectedSportTrackId`, and `completionByDate`. Use local calendar keys (`YYYY-MM-DD`), prune to 28 newest valid keys, and expose the current date bucket through the existing completion API so current components need minimal change.

When v3 is absent, valid v2 selections migrate unchanged and v2 completed IDs enter the migration-day bucket. The v2 key remains untouched. Invalid payloads fall back to a clean v3 workspace with the default three-way split.

Alternative considered: mutate the v2 payload in place. Rejected because rollback would lose the known-good state format.

### Resolve split days deterministically

Each template owns a seven-slot schedule containing training focuses or recovery days. Today derives its local weekday slot from the selected template, presents template preparation first, then adds at most three deduplicated selected-condition actions matching the day's upper-body, lower-body, or full-body focus. The two groups are labelled separately so rehabilitation work is not mistaken for warm-up. Switching templates changes the plan-derived portion only; completion remains keyed by date and exercise ID.

### Model modules as purposes over shared actions

Each module contains an ordered list of `{ exerciseId, purpose }`. Track/module metadata owns duration, frequency, placement, priority, and suitability. Fitness priorities are explicit: A and C are primary; B is optional. Warm-up-only mobility drills are excluded from every Fitness module even when they remain in the general library.

### Generate and validate project-owned teaching images

Create one visual per new canonical exercise at the existing 3:2 slot, convert to compressed WebP, use lazy loading and descriptive alternative text, and compare each pose/equipment detail with the written setup. Authoritative references are stored per guidance record; unavailable videos remain hidden.

### Compute complete relationship groups

Build the selected directed edge set as today, then derive weakly connected components from the underlying undirected adjacency. Sort groups by the earliest stable condition order, nodes by condition order/name, and edges by source/target order. A singleton with no edge is an unlinked observation. Render nodes once per group and list every directed edge, including cycles; do not use a longest path as the data-loss boundary.

Alternative considered: render one large free-form graph. Rejected because it produces poor mobile readability and unstable layouts.

## Risks / Trade-offs

- [Twenty-two new images increase static payload] → compress each WebP, lazy-load below the fold, and report aggregate/build sizes.
- [Static templates can look prescriptive] → foreground audience, trade-offs, recovery, and adjustability; avoid fixed primary-lift loading.
- [Fitness actions with jumps or throws have higher skill and space demands] → provide regression, equipment, clearance, landing, and symptom stop rules.
- [Natural dates can shift across time zones] → use the device’s local calendar date rather than UTC and test day-boundary helpers independently.
- [Migration can duplicate old completion into one day] → migrate once only when v3 is absent and preserve v2 for rollback.
- [Complete chain groups contain more text] → use progressive disclosure, count summaries, and bounded mobile group cards while never hiding edges from the group detail.
- [Pes-anserine wording may imply diagnosis] → use dual naming, differential cues, red flags, and explicit uncertainty throughout search/detail copy.

## Migration Plan

1. Add new content files and integrity tests before wiring UI.
2. Introduce pure v3 state helpers and migration tests, then switch the Vue store adapter.
3. Add split and sport-module UI behind existing Training navigation.
4. Add the condition and full-chain grouping UI.
5. Generate/optimize images and run visual QA at 360/390 px and desktop.
6. Build and validate. Rollback can restore the prior code while leaving the v2 key intact; the new v3 key is ignored by older builds.

## Open Questions

None.

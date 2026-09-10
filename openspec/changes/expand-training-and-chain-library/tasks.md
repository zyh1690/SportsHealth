## 1. Evidence and Content Model

- [x] 1.1 Research authoritative sources for pes-anserine/medial-knee guidance and all 22 confirmed performance actions
- [x] 1.2 Add split-template and sport-track/module schemas plus JSON content files
- [x] 1.3 Add “鹅足滑囊炎 / 鹅足区疼痛” with search aliases, differential cues, red flags, and conservative guidance
- [x] 1.4 Add the 22 canonical performance exercise records and complete structured guidance
- [x] 1.5 Extend content-integrity tests for split schedules, track modules, action purposes, exercise uniqueness, references, and source URLs

## 2. Date-Scoped Local Workspace

- [x] 2.1 Implement pure v3 state, local-date, current-day completion, and 28-day pruning helpers
- [x] 2.2 Implement one-time v2-to-v3 migration while leaving the v2 key unchanged
- [x] 2.3 Expose selected split, primary sport track, and date-scoped completion through the Vue workspace adapter
- [x] 2.4 Add state tests for defaults, persistence, migration, date rollover, template/track switching, clearing, and retention pruning

## 3. Split-Template Experience

- [x] 3.1 Replace the fixed plan import with deterministic selected-template and weekday resolution helpers
- [x] 3.2 Add Split Plans selection, explanation, advantages/trade-offs, recovery guidance, weekly schedule, and day detail
- [x] 3.3 Keep chest/legs/back selected by default and synchronize Today with the selected split
- [x] 3.4 Preserve distinct preparation/personal-rehabilitation groups and same-day completion when switching templates

## 4. Sport-Specific Functional Training

- [x] 4.1 Reorganize Training subviews as Today, Split Plans, Sport-Specific, and Exercise Library
- [x] 4.2 Add Running and HYROX introductions plus preparation, sport-capacity, and recovery-support modules
- [x] 4.3 Add Fitness introduction, primary A/C modules, and optional B module with no warm-up-only actions
- [x] 4.4 Show module duration, frequency, placement, purpose, and action-by-action inclusion rationale
- [x] 4.5 Add a non-mandatory selected-track suggestion to Today without auto-merging module actions

## 5. Exercise Assets and Guidance UI

- [x] 5.1 Generate one project-owned 3:2 teaching image for each new canonical exercise
- [x] 5.2 Validate pose, equipment, movement phase, and written safety cues for all new images
- [x] 5.3 Convert images to compressed WebP, add descriptive alt text, lazy-load, and inspect aggregate payload
- [x] 5.4 Extend library categories/search and exercise detail rendering for performance actions and sport uses

## 6. Complete Kinetic-Chain Groups

- [x] 6.1 Implement deterministic weakly connected components and complete directed-edge grouping
- [x] 6.2 Handle branches, cycles, multiple groups, and unlinked observations without omitting nodes or relationships
- [x] 6.3 Rebuild mobile chain groups as readable stacked cards with immediate selected-node detail
- [x] 6.4 Rebuild desktop chain groups as bounded multi-column cards with concurrent detail
- [x] 6.5 Add graph helper tests for empty, singleton, disconnected, branching, cyclic, and multi-group selections

## 7. Responsive Verification and Handoff

- [x] 7.1 Verify condition search/detail, five template selections, date state, three tracks, modules, and complete chain groups in browser journeys
- [x] 7.2 Inspect compact phone and desktop layouts, interactive target sizes, overflow, empty states, and browser errors
- [x] 7.3 Run full tests, production H5 build, source/link checks, build-size inspection, and `git diff --check`
- [x] 7.4 Update visual QA evidence and compare the revised Training and Chain views with the selected design direction
- [x] 7.5 Run strict OpenSpec validation and a two-axis repository-standards/specification review
- [x] 7.6 Report delivered scope, evidence, limitations, archive status, and deployment status without committing or publishing

## 8. Training-Day Relevance Fix

- [x] 8.1 Add regression tests proving chest days exclude lower-chain concern actions and personal work is capped at three
- [x] 8.2 Separate template preparation from personal rehabilitation in Today and Training Today
- [x] 8.3 Filter personal rehabilitation by upper-body, lower-body, or full-body training focus and remove preparation duplicates
- [x] 8.4 Verify the corrected chest-day browser journey, full test suite, production build, and strict OpenSpec validation

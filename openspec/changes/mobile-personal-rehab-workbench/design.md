## Context

SportsHealth is a static uni-app Vue 3 site deployed through GitHub Pages. It currently has seven independently navigated pages, a large atlas-first home screen, a fixed-width kinetic-chain component, JSON-backed health and exercise content, and local-storage persistence. The confirmed product direction is a personal rehabilitation workspace used primarily on phones and occasionally on desktop. The existing warm neutral background, deep teal accent, anatomy images, and platform choice remain the visual and technical foundation.

The content is health-related but is not a diagnostic service. Existing copy sometimes presents personal observations as proven causation and two self-checks as confirmation; those statements must be downgraded to observable clues and possible relationships.

## Goals / Non-Goals

**Goals:**

- Make the four primary tasks continuously understandable and reachable on a phone.
- Keep personal state private to the current device and empty by default.
- Make kinetic-chain relationships compact, inspectable, and explicitly uncertain where appropriate.
- Make every current exercise actionable, safe to follow, visually consistent, sourced, and non-duplicative.
- Use desktop width for supporting context without changing the mobile-first content hierarchy.
- Preserve a static GitHub Pages build and the current uni-app/Vue data model.

**Non-Goals:**

- Accounts, cloud sync, backend services, clinical decision support, diagnosis, personalized prescriptions, or content expansion beyond the 19 existing exercises.
- Publishing, pushing, or replacing the current GitHub Pages deployment as part of implementation.
- Replacing the existing anatomy artwork or introducing a new visual brand.

## Decisions

### Keep the existing uni-app application and reorganize its top-level pages

The implementation will retain Vue 3, uni-app routing, the existing palette, and reusable components. The four destinations will be Today, Body, Kinetic Chain, and Training. Encyclopedia and muscle content will become Body subviews; plan and exercise-library content will become Training subviews.

Alternative considered: rebuild as a new mobile-app template. Rejected because the existing application is the selected source product, already compiles for H5, and contains reusable body-map, search, plan, and content logic.

### Use a persistent four-destination bottom shell on compact screens

The shell will keep all four destinations reachable, provide a selected state, reserve safe-area space, and use real icons from a maintained icon source or a label-forward treatment selected by the approved visual concept. On wider viewports it will become a compact side or top navigation while preserving the same information architecture.

Alternative considered: keep card-based navigation from Home. Rejected because it hides location and makes long pages dependent on Back navigation.

### Introduce a versioned local workspace state

New state will use a versioned namespace and start with no selected conditions. Old keys remain untouched for rollback, but the prior automatically seeded flagship chain is not migrated because it cannot be distinguished reliably from an intentional user selection. The example chain remains available through an explicit load action.

Alternative considered: migrate every existing selection. Rejected because it could silently reassert a health state the user did not choose.

### Derive Today from existing local data

Today will combine the local weekday's plan block, selected-condition summary, incomplete exercise state, and the next useful action. Sunday or absent selections will produce recovery and setup empty states rather than invented recommendations.

Alternative considered: add a scheduling backend or recommendation engine. Rejected as outside scope and inconsistent with static hosting.

### Replace the network graph with an adaptive path model

The data remains a directed graph, but presentation changes by viewport. Mobile uses a readable primary path with short relationship labels, branch summaries, and a selected-node detail sheet/panel. Desktop places the path next to persistent details. Cycles and disconnected items degrade to grouped lists rather than producing unstable layout.

Relationship metadata will include a display status such as personal observation, source-supported, or needs validation. UI language uses “may relate”, “possible compensation”, and “observation clue”; it does not label a node as the root cause.

Alternative considered: repair the current fixed 330 px node canvas. Rejected because overlapping edge labels, long labels, branching, and off-screen detail are structural problems rather than spacing defects.

### Extend exercise content as structured guidance

Each of the 19 exercise records gains purpose, image, dosage, side, setup, cues, common compensations, regression, progression, stop conditions, and one or more references. One project-owned teaching image per exercise will show one or two key positions in a consistent visual system. Images will be newly generated from the selected visual direction and checked against authoritative instructions; third-party images will not be copied or hotlinked.

Condition pages will resolve duplicate rehabilitation/prevention references into one prioritized list with context labels. Unverified or unavailable external media will not appear as actionable buttons.

Alternative considered: use external thumbnails as the primary visual. Rejected because availability, licensing, visual consistency, and mobile performance are not controllable.

### Apply responsive layout through shared tokens and bounded content widths

Global spacing, typography, surface, radius, and color tokens will replace repeated page-local values. Compact layouts target 360–430 px. At tablet/desktop breakpoints, compatible sections become two columns and long-form text remains bounded. Interactive targets remain at least 44 px in the H5 rendering.

## Risks / Trade-offs

- [Generated teaching images may depict an inaccurate pose] → Validate every image against its exercise instructions, keep text instructions primary, and regenerate any ambiguous asset.
- [Health content may still imply diagnosis] → Search the full content set for deterministic terms and require cautious language plus stop/seek-care conditions.
- [A new storage namespace discards visible legacy progress] → Leave legacy keys intact and document rollback; prioritize the confirmed private empty-first behavior.
- [Nineteen raster assets can increase page weight] → Use appropriately sized project-owned WebP/PNG assets, lazy-load below-the-fold images, and inspect build size.
- [uni-app platform differences] → Treat H5/GitHub Pages as the acceptance target and avoid browser-only APIs in shared state logic.
- [Visual concept is not yet selected] → Complete the required three-option mobile ideation gate before implementation and record the selected direction here without changing functional requirements.

## Migration Plan

1. Add the new shell and routes while keeping legacy pages reachable during development.
2. Add versioned local state without deleting old storage keys.
3. Migrate kinetic-chain presentation and content wording.
4. Extend the exercise schema/content and add validated teaching assets.
5. Consolidate Body and Training subviews, then remove redundant entry points from the visible navigation.
6. Build and visually verify H5 at mobile and desktop breakpoints.
7. Roll back by restoring the prior route configuration and components; legacy local keys remain available.

## Open Questions

None.

## Selected Visual Direction

The user selected the first generated direction, “Quiet Focus / 安静聚焦”. The source visual truth is `design/reference/selected-today-workbench.png`. Implementation SHALL preserve its hierarchy: a calm Today heading and local-only privacy note, one dominant next-action module, compact current-focus and possible-relationship summaries, generous off-white space, deep teal primary actions, restrained surfaces, and four-item persistent navigation. Exercise guidance remains text-led when generated imagery cannot communicate a safety-critical detail.

## ADDED Requirements

### Requirement: Non-diagnostic relationship language
The application SHALL describe kinetic-chain nodes and edges as observations, possible compensations, related manifestations, or source-supported associations and SHALL NOT present them as a confirmed root cause or diagnosis.

#### Scenario: Display a personal chain relationship
- **WHEN** an edge is based on the existing personal example or user observation
- **THEN** the edge SHALL use tentative language and display an observation or needs-validation status

#### Scenario: Display a sourced relationship
- **WHEN** an edge has a directly linked supporting reference
- **THEN** the edge MAY display a source-supported status while still avoiding individual diagnostic certainty

### Requirement: Compact mobile path
The mobile kinetic-chain view SHALL present a legible primary path, relationship direction, and branch/disconnected summaries without overlapping labels.

#### Scenario: Five-node primary chain
- **WHEN** the example five-node chain is rendered at 390 px wide
- **THEN** all node names and relationship controls SHALL remain readable without overlap or horizontal page scrolling

#### Scenario: Select a node
- **WHEN** a user activates a node on mobile
- **THEN** its description, adjacent relationships, status, and detail action SHALL appear in an immediately visible panel or sheet

### Requirement: Desktop path and detail composition
The desktop kinetic-chain view SHALL show the relationship path and selected-node explanation concurrently when space permits.

#### Scenario: Inspect a node on desktop
- **WHEN** a user selects a node at a viewport of at least 1024 px
- **THEN** the path SHALL remain visible while the adjacent detail area updates

### Requirement: Stable graph edge cases
The chain view SHALL degrade safely for empty, disconnected, branching, or cyclic selections.

#### Scenario: No selection
- **WHEN** the selected set is empty
- **THEN** the view SHALL show a setup empty state and SHALL not render an empty graph canvas

#### Scenario: Disconnected selection
- **WHEN** selected conditions have no defined relationship
- **THEN** the view SHALL list them as unlinked observations and SHALL not invent an edge

#### Scenario: Cyclic or branching data
- **WHEN** the selected graph is not a single acyclic path
- **THEN** the view SHALL choose a deterministic primary path and expose remaining relationships as branches without layout failure

### Requirement: Safety escalation remains prominent
Condition and chain detail SHALL keep stop-training and seek-care signals visually distinct from explanatory relationship content.

#### Scenario: Condition has red flags
- **WHEN** a user opens a condition with red flags
- **THEN** the view SHALL present those red flags before exercise guidance and SHALL not hide them inside a collapsed chain node

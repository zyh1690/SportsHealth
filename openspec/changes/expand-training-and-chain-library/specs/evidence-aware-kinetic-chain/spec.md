## MODIFIED Requirements

### Requirement: Compact mobile path
The mobile kinetic-chain view SHALL divide the selection into deterministic connected relationship groups and SHALL present every node and every defined edge in legible vertical group cards without overlapping labels.

#### Scenario: Multiple connected groups
- **WHEN** selected conditions form two or more disconnected relationship groups
- **THEN** mobile SHALL show every group in stable order and SHALL expose every group node and relationship without horizontal page scrolling

#### Scenario: Select a node
- **WHEN** a user activates a node on mobile
- **THEN** its description, all adjacent relationships, statuses, and detail action SHALL appear in an immediately visible panel or sheet

### Requirement: Desktop path and detail composition
The desktop kinetic-chain view SHALL show multiple relationship groups, their complete branch structure, and the selected-node explanation concurrently when space permits.

#### Scenario: Inspect grouped chains on desktop
- **WHEN** the viewport is at least 1024 px wide and multiple groups exist
- **THEN** group cards SHALL use a bounded multi-column composition while the selected detail remains available without hiding any relationship

### Requirement: Stable graph edge cases
The chain view SHALL degrade safely for empty, disconnected, branching, or cyclic selections and SHALL never omit a selected node or defined relationship merely because it is not part of a longest path.

#### Scenario: No selection
- **WHEN** the selected set is empty
- **THEN** the view SHALL show a setup empty state and SHALL not render an empty graph canvas

#### Scenario: Unlinked selection
- **WHEN** a selected condition has no defined relationship to any other selected condition
- **THEN** the view SHALL list it in a “待建立关联” area and SHALL not invent an edge

#### Scenario: Branching data
- **WHEN** a connected group contains one or more branches
- **THEN** every branch node SHALL remain visible once per group and every defined edge SHALL remain available without collapsing the group to one primary path

#### Scenario: Cyclic data
- **WHEN** a connected group contains a directed cycle
- **THEN** the view SHALL render each node once, list every directed relationship, and label the structure as a relationship network rather than a one-way causal sequence

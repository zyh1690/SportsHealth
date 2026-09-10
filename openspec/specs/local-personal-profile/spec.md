# local-personal-profile Specification

## Purpose
TBD - created by archiving change mobile-personal-rehab-workbench. Update Purpose after archive.
## Requirements
### Requirement: Empty and private first run
The application SHALL start a new versioned workspace with no selected health condition and SHALL store selections and completion state only on the current device.

#### Scenario: First visit
- **WHEN** no current-version workspace state exists
- **THEN** the selected-condition list and completion list SHALL both be empty

#### Scenario: Refresh after local changes
- **WHEN** the user refreshes after selecting conditions or completing exercises
- **THEN** the application SHALL restore those values from local device storage without transmitting them

### Requirement: Explicit example-chain loading
The existing right-ankle-to-shoulder chain SHALL be available only as an explicitly named example template and SHALL not be presented as the user's current state until loaded.

#### Scenario: Load the example
- **WHEN** the user activates “Load example chain”
- **THEN** the application SHALL explain that it is an example and SHALL require an explicit load action before adding its conditions to local state

### Requirement: Recoverable local clearing
The user SHALL be able to clear current selections and completion state without deleting legacy storage keys used by the previous application version.

#### Scenario: Clear current workspace
- **WHEN** the user confirms the in-app clear action
- **THEN** current-version selections and completion state SHALL become empty and the application SHALL return to its empty states

### Requirement: Selection from discovery
Condition selection SHALL be available from Body and condition detail surfaces with an explicit selected/unselected state.

#### Scenario: Select a condition from detail
- **WHEN** the user adds a condition from its detail view
- **THEN** the condition SHALL appear in the local profile and kinetic-chain view and its control SHALL indicate the selected state


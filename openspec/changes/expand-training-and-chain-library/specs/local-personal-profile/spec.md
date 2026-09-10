## MODIFIED Requirements

### Requirement: Empty and private first run
The application SHALL start a new versioned workspace with no selected health condition, the chest/legs/back split selected by default, no primary sport track selected, and no completion history, and SHALL store all such state only on the current device.

#### Scenario: First visit
- **WHEN** no current-version workspace state exists
- **THEN** selected conditions, primary sport track, and completion history SHALL be empty while the chest/legs/back split SHALL be active

#### Scenario: Refresh after local changes
- **WHEN** the user refreshes after changing conditions, split, sport track, or daily completion
- **THEN** the application SHALL restore those values from local device storage without transmitting them

### Requirement: Recoverable local clearing
The user SHALL be able to clear current selections and completion history without deleting legacy storage keys used by previous application versions.

#### Scenario: Clear current workspace
- **WHEN** the user confirms the in-app clear action
- **THEN** selected conditions, primary sport track, and completion history SHALL become empty, the split SHALL return to chest/legs/back, and the application SHALL return to its setup states

## ADDED Requirements

### Requirement: Date-scoped bounded completion
The application SHALL store completion by local natural date, SHALL preserve completion when the user changes templates or sport tracks during the same date, and SHALL retain no more than the latest 28 natural dates.

#### Scenario: Local date changes
- **WHEN** the application opens on a date later than the most recent completion date
- **THEN** the current day SHALL start with no completed actions while prior retained days remain available for recent progress calculation

#### Scenario: Retention is pruned
- **WHEN** completion contains more than 28 dated buckets
- **THEN** the store SHALL deterministically remove the oldest buckets and keep the most recent 28

### Requirement: Version-two migration
The current v2 selected conditions SHALL migrate unchanged, and v2 completion IDs SHALL migrate into the local date on which v3 first loads, without rewriting the v2 storage key.

#### Scenario: Existing v2 user opens v3
- **WHEN** valid v2 state exists and no valid v3 state exists
- **THEN** v3 SHALL contain the same selected conditions, the default split, no primary sport track, and the prior completion IDs under the migration date


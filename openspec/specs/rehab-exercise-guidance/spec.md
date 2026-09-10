# rehab-exercise-guidance Specification

## Purpose
TBD - created by archiving change mobile-personal-rehab-workbench. Update Purpose after archive.
## Requirements
### Requirement: Complete structured guidance for every existing exercise
Each of the 19 current exercise records SHALL provide a purpose, teaching image, dosage, side instruction, setup, execution cues, common compensations, regression, progression, stop conditions, and at least one reference.

#### Scenario: Open any exercise
- **WHEN** a user opens any of the 19 exercise details
- **THEN** every required guidance field SHALL be present and readable, with no “to be added” placeholder presented as an action

### Requirement: Original validated teaching imagery
Each exercise SHALL use a project-owned instructional image in the selected visual system, created for this project and validated against its written setup and execution cues.

#### Scenario: Image and instructions agree
- **WHEN** an exercise image is shown
- **THEN** the depicted equipment, body position, side convention, and key movement phase SHALL agree with the adjacent instructions

#### Scenario: Image cannot establish safety detail
- **WHEN** a safety-critical cue cannot be demonstrated unambiguously in the image
- **THEN** the written cue SHALL remain explicit and the image SHALL not imply that it replaces instruction

### Requirement: Authoritative and usable references
Exercise guidance SHALL link to authoritative or clearly identified sources that were checked during implementation, and SHALL hide unavailable or unverified media actions.

#### Scenario: Open a source
- **WHEN** a user activates a reference
- **THEN** the application SHALL open the checked source URL and identify the source organization or author

#### Scenario: Existing unverified video
- **WHEN** a legacy video URL has not been verified or is unavailable
- **THEN** the UI SHALL not present it as a playable or verified action

### Requirement: Deduplicated condition guidance
A condition detail view SHALL show each referenced exercise once and SHALL explain whether it is a priority recovery action, maintenance action, or both.

#### Scenario: Exercise appears in rehabilitation and prevention arrays
- **WHEN** the same exercise is referenced by both arrays
- **THEN** one exercise entry SHALL be rendered with combined context rather than two duplicate cards

### Requirement: Actionable dosage and progression
Exercise guidance SHALL tell the user how much to perform, how to regress, and what readiness signal permits progression without claiming a treatment prescription.

#### Scenario: Follow an entry-level exercise
- **WHEN** a user reads an exercise marked difficulty 1
- **THEN** the view SHALL show a conservative starting dosage, a simpler alternative where relevant, and a clear symptom-based stop rule

### Requirement: Local completion state
Exercises surfaced by Today, condition detail, or Training SHALL share one current-version local completion state for the applicable day/session.

#### Scenario: Complete an exercise from Today
- **WHEN** the user marks an exercise complete on Today
- **THEN** the same exercise SHALL appear complete in the corresponding Training session without network synchronization


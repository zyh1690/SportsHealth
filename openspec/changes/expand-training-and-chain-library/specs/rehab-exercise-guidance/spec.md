## MODIFIED Requirements

### Requirement: Complete structured guidance for every existing exercise
Every rehabilitation or performance exercise record, including all 22 newly confirmed sport-specific actions, SHALL provide a purpose, teaching image, dosage, side instruction, setup, execution cues, common compensations, regression, progression, stop conditions, and at least one reference.

#### Scenario: Open any exercise
- **WHEN** a user opens any exercise detail from a condition, plan, sport module, Today, or the library
- **THEN** every required guidance field SHALL be present and readable, with no “to be added” placeholder presented as an action

### Requirement: Original validated teaching imagery
Each exercise SHALL use a project-owned instructional image in the selected visual system, created for this project and validated against its written setup and execution cues.

#### Scenario: Image and instructions agree
- **WHEN** an exercise image is shown
- **THEN** the depicted equipment, body position, side convention, and key movement phase SHALL agree with the adjacent instructions

#### Scenario: Image cannot establish safety detail
- **WHEN** a safety-critical cue cannot be demonstrated unambiguously in the image
- **THEN** the written cue SHALL remain explicit and the image SHALL not imply that it replaces instruction

### Requirement: Local completion state
Exercises surfaced by Today, condition detail, split plans, sport modules, or the library SHALL share one local completion state for the applicable natural date.

#### Scenario: Complete an exercise from Today
- **WHEN** the user marks an exercise complete on Today
- **THEN** the same exercise SHALL appear complete in Training on that date without network synchronization

#### Scenario: Complete a sport-module exercise
- **WHEN** the user marks an exercise complete inside a sport module
- **THEN** the same exercise SHALL appear complete in every other surface for that date while a later date starts incomplete


## MODIFIED Requirements

### Requirement: Logical secondary information architecture
Body SHALL contain anatomy exploration, condition search/encyclopedia, and muscle reference; Training SHALL contain Today, Split Plans, Sport-Specific, and Exercise Library subviews with completion progress available in the relevant action surfaces.

#### Scenario: Find a condition from Body
- **WHEN** a user searches or selects an anatomy region in Body
- **THEN** the application SHALL present matching conditions and a clear path to select or inspect one

#### Scenario: Find a split plan from Training
- **WHEN** a user opens Split Plans
- **THEN** the application SHALL present the five templates, the active selection, its explanation, and its weekly schedule without leaving Training

#### Scenario: Find sport-specific training
- **WHEN** a user opens Sport-Specific
- **THEN** the application SHALL present Running, HYROX, and Fitness tracks and their modules without adding another primary navigation destination

#### Scenario: Find an exercise from Training
- **WHEN** a user opens the Training exercise library
- **THEN** the user SHALL be able to browse every exercise and open complete guidance without first navigating through a condition or program


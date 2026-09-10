# responsive-workbench-shell Specification

## Purpose
TBD - created by archiving change mobile-personal-rehab-workbench. Update Purpose after archive.
## Requirements
### Requirement: Persistent primary navigation
The application SHALL expose Today, Body, Kinetic Chain, and Training as four persistent primary destinations and SHALL clearly indicate the current destination.

#### Scenario: Navigate between primary destinations on mobile
- **WHEN** a user activates any primary destination at a 390 px viewport
- **THEN** the destination content SHALL open without requiring browser Back and the selected navigation item SHALL remain visible

#### Scenario: Navigate on desktop
- **WHEN** the viewport is at least 1024 px wide
- **THEN** the same four destinations SHALL remain available in a desktop-appropriate persistent navigation treatment

### Requirement: Mobile-first Today dashboard
Today SHALL prioritize the next useful action, current local state, and a compact kinetic-chain summary before secondary reference content.

#### Scenario: User has selected conditions and incomplete exercises
- **WHEN** Today loads with local selections and incomplete exercises
- **THEN** it SHALL show the current focus, the next incomplete action, and concise links to the full chain and training views

#### Scenario: User has no selected conditions
- **WHEN** Today loads without local selections
- **THEN** it SHALL show a non-diagnostic setup empty state with a clear path to Body and SHALL NOT infer or preselect a condition

### Requirement: Responsive readable layout
All primary and detail views SHALL remain readable and operable from 360 px phone width through desktop widths without horizontal page scrolling, overlapping content, or forced zoom.

#### Scenario: Compact phone layout
- **WHEN** a primary flow is rendered between 360 px and 430 px wide
- **THEN** text, images, navigation, and controls SHALL fit the viewport and interactive targets SHALL render at least 44 px in their actionable dimension

#### Scenario: Wide desktop layout
- **WHEN** a content-rich view is rendered at 1024 px or wider
- **THEN** related content SHALL use available width through bounded two-column or multi-column composition while long-form text remains comfortably readable

### Requirement: Logical secondary information architecture
Body SHALL contain anatomy exploration, condition search/encyclopedia, and muscle reference; Training SHALL contain today's training, the full plan, the exercise library, and completion progress.

#### Scenario: Find a condition from Body
- **WHEN** a user searches or selects an anatomy region in Body
- **THEN** the application SHALL present matching conditions and a clear path to select or inspect one

#### Scenario: Find an exercise from Training
- **WHEN** a user opens the Training exercise library
- **THEN** the user SHALL be able to browse the 19 exercises and open complete guidance without first navigating through a condition


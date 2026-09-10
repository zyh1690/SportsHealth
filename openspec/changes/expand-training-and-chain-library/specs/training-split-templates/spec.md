## ADDED Requirements

### Requirement: Five selectable split templates
The application SHALL provide full-body, upper/lower, chest/legs/back, four-way, and five-way split templates and SHALL use chest/legs/back as the default selection.

#### Scenario: Open split plans for the first time
- **WHEN** no saved split selection exists
- **THEN** the chest/legs/back template SHALL be selected and identified as the default

#### Scenario: Select a different split
- **WHEN** the user selects any other split template
- **THEN** its weekly schedule SHALL replace the prior schedule without clearing condition selections or same-day completion

### Requirement: Explained adaptable structures
Each split template SHALL state its suitable audience, weekly frequency, advantages, trade-offs, recovery requirements, and day-level training focus.

#### Scenario: Inspect a split template
- **WHEN** the user opens a template description
- **THEN** the user SHALL be able to understand who it suits, how often it runs, how it distributes training, and what recovery burden it creates

### Requirement: Support content is not a fixed lifting prescription
Each template day SHALL map to conservative preparation and functional-support exercises while leaving primary lift selection, weight, sets, and repetitions adjustable.

#### Scenario: Inspect a training day
- **WHEN** a user opens a day in a split template
- **THEN** the application SHALL show the day focus and supporting actions and SHALL NOT present one fixed loading prescription as universally appropriate

### Requirement: Selected split drives Today
Today and Training Today SHALL resolve the same date-appropriate schedule from the locally selected split while keeping selected-condition actions first.

#### Scenario: Change split on the current day
- **WHEN** the user changes the selected split and returns to Today
- **THEN** both Today surfaces SHALL show the new split day while retaining current-condition actions ahead of template support actions


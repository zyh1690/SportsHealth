## ADDED Requirements

### Requirement: Three sport-specific tracks
The application SHALL provide Running, HYROX, and Fitness tracks, each with an introduction that states the performance problem addressed and the intended use of the track.

#### Scenario: Compare tracks
- **WHEN** the user opens Sport-Specific training
- **THEN** all three tracks SHALL be discoverable with concise purpose, audience, and expected-use descriptions

### Requirement: Purpose-led modules
Running and HYROX SHALL each provide preparation, sport-capacity, and recovery-support modules; Fitness SHALL provide power/force-transfer, whole-body coordination/loaded-movement, and optional multidirectional/landing-deceleration modules. Each module SHALL state expected duration, frequency, schedule placement, and the purpose of every included action.

#### Scenario: Open a module
- **WHEN** the user selects a module
- **THEN** the application SHALL show its purpose, 20–30 minute duration guidance, weekly frequency, placement guidance, and an action-by-action “why this is included” explanation

### Requirement: Fitness prioritizes transferable performance
The Fitness track SHALL prioritize power/force-transfer and whole-body coordination/loaded-movement, SHALL present multidirectional/landing-deceleration as optional, and SHALL exclude warm-up-only mobility drills such as 90/90 hip switches or shoulder/hip controlled circles from its module lists.

#### Scenario: Open Fitness
- **WHEN** the user views Fitness recommendations
- **THEN** the power and loaded-coordination modules SHALL appear before the optional multidirectional module and every listed action SHALL have a meaningful performance-training demand

### Requirement: Confirmed performance exercise scope
The content library SHALL add the confirmed four Running actions (calf raise, bent-knee soleus raise, step-down, runner lunge balance), six HYROX actions (farmer carry, front-rack carry, bear crawl, walking lunge, sled-push rehearsal, wall-ball rehearsal), and twelve Fitness actions (kettlebell swing, Turkish get-up, landmine rotation, rotational medicine-ball throw, medicine-ball slam, box jump, broad jump with stable landing, lateral bound, Cossack squat, front-rack reverse lunge, suitcase carry, Copenhagen side plank), storing any action reused across tracks as one shared exercise record.

#### Scenario: Validate sport action content
- **WHEN** content integrity checks run
- **THEN** all 22 confirmed action IDs SHALL resolve to exactly one complete exercise and guidance record and every module reference SHALL resolve

### Requirement: Sport track is advisory and opt-in
The user SHALL be able to save one primary sport track locally, while Today SHALL show only a weekly suggestion and SHALL NOT automatically merge sport-module actions into the required daily list. Running and HYROX suggestions SHALL rotate deterministically among their modules; Fitness suggestions SHALL alternate between primary modules A and C and SHALL NOT recommend optional module B by default.

#### Scenario: Select a primary sport track
- **WHEN** a user selects Running, HYROX, or Fitness
- **THEN** the selection SHALL persist and Today SHALL show an entry suggestion without marking a module as mandatory

#### Scenario: Change primary sport track
- **WHEN** the user changes the primary track
- **THEN** the new suggestion SHALL replace the old suggestion without clearing same-day exercise completion

#### Scenario: Receive a Fitness suggestion
- **WHEN** Fitness is the saved primary track
- **THEN** Today SHALL suggest module A or C in deterministic alternation and SHALL leave module B available only through explicit selection

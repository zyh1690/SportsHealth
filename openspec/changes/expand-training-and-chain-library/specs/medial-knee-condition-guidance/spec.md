## ADDED Requirements

### Requirement: Searchable pes-anserine guidance
The condition library SHALL include “鹅足滑囊炎 / 鹅足区疼痛” and SHALL match searches for 鹅足, 鹅足滑囊炎, and 膝内侧.

#### Scenario: Search by common term
- **WHEN** the user searches any supported common term
- **THEN** the pes-anserine/medial-knee entry SHALL appear and open like other condition records

### Requirement: Non-diagnostic differential framing
The entry SHALL state that inferomedial knee location is an observation clue rather than a diagnosis and SHALL briefly distinguish possible pes-anserine symptoms from other medial-knee presentations such as collateral-ligament or meniscal involvement.

#### Scenario: Open the condition detail
- **WHEN** the user reads the condition overview
- **THEN** the application SHALL avoid self-diagnosis language and SHALL explain when location or symptom behavior warrants professional assessment

### Requirement: Safety-first progressive guidance
The entry SHALL show red flags before exercise guidance and SHALL provide conservative load modification, comfortable-range movement, hip/knee control, and gradual return suggestions with authoritative references.

#### Scenario: User has a red-flag symptom
- **WHEN** the entry is opened by a user with locking, marked swelling, instability, inability to bear weight, or worsening symptoms
- **THEN** the visible guidance SHALL tell the user to stop or reduce training and seek appropriate assessment rather than continue the progression


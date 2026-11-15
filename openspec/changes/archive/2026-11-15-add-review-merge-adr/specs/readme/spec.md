# Spec Delta

## MODIFIED Requirements

### Requirement: README says what is not covered
The README SHALL have a "Not covered" section listing what governance decides
nothing about. Each item SHALL be either an exclusion that a shipped ADR
states, linked to that ADR, or a topic that no shipped ADR addresses. The
section SHALL NOT promise that a topic will be covered later.

#### Scenario: An item from an ADR's exclusion
- **WHEN** the section lists static analysis of your own code or licence compliance
- **THEN** the item links to ADR-0019, which states both as not concerned

#### Scenario: A topic an ADR covers
- **WHEN** a topic has a shipped ADR that decides it
- **THEN** the section does not list it

#### Scenario: Review beyond who merges
- **WHEN** the section's item on code review is read
- **THEN** it lists required approvals and ownership (`CODEOWNERS`) only, and links to ADR-0022, which names both as outside its question

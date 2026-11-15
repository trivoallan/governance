# Spec Delta

## MODIFIED Requirements

### Requirement: README says what each domain gains and what is verified
The README SHALL hold a table with one row for each of these domains:
Workflow, Delivery, Supply chain, Architecture, Code, Decisions & docs,
Agents. Each row SHALL say what a repository gains and what
`governance-check` verifies for that domain. It SHALL state as verified only
what `governance-check` actually checks, and SHALL say plainly when nothing
is checked. The Architecture row SHALL link to arc42, C4 and LikeC4. The
Agents row SHALL say that ontrack writes the accepted rules into a managed
block of `AGENTS.md`. After the table, the README SHALL state that checks
confirm the wiring is present but not that it is right, and that a
repository may reject any question that does not fit it.

#### Scenario: A domain with no check
- **WHEN** no ADR of a row's domain has a check
- **THEN** the row names no check, and says that nothing is verified

#### Scenario: Code row
- **WHEN** the Code row is read
- **THEN** it says that a scan workflow sending its SARIF to code scanning or to an artifact is verified, and that the threshold is not

#### Scenario: A verified claim
- **WHEN** a row says `governance-check` verifies something
- **THEN** `governance-check` has a check, run against that domain's ADRs, that verifies it

### Requirement: README says what is not covered
The README SHALL have a "Not covered" section listing what governance decides
nothing about. Each item SHALL be either an exclusion that a shipped ADR
states, linked to that ADR, or a topic that no shipped ADR addresses. The
section SHALL NOT promise that a topic will be covered later.

#### Scenario: An item from an ADR's exclusion
- **WHEN** the section lists licence compliance
- **THEN** the item links to ADR-0019, which states it as not concerned

#### Scenario: Static analysis covered
- **WHEN** the section is read
- **THEN** it does not list static analysis of your own code, which ADR-0024 decides

#### Scenario: A topic an ADR covers
- **WHEN** a topic has a shipped ADR that decides it
- **THEN** the section does not list it

#### Scenario: Review beyond who merges
- **WHEN** the section's item on code review is read
- **THEN** it lists required approvals and ownership (`CODEOWNERS`) only, and links to ADR-0022, which names both as outside its question

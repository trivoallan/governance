# Spec Delta

## MODIFIED Requirements

### Requirement: Shipped ADRs
governance SHALL ship exactly these ADRs, each adapted from the named SDR
unless the table says it is original:

| ADR | slug | from | status as shipped |
|---|---|---|---|
| ADR-0001 | record-architecture-decisions | SDR-0001 | accepted |
| ADR-0002 | localization | SDR-0002 | proposed |
| ADR-0003 | architecture | SDR-0003 | proposed |
| ADR-0004 | languages | SDR-0004 | proposed |
| ADR-0005 | validation | SDR-0005 | proposed |
| ADR-0006 | commits | SDR-0006 | proposed |
| ADR-0007 | tests | SDR-0007 | proposed |
| ADR-0008 | documentation | SDR-0008 | proposed |
| ADR-0009 | branching | SDR-0009 | proposed |
| ADR-0010 | architecture-documentation | SDR-0003 (`architecture.document` only) | proposed |
| ADR-0011 | forge-and-ci | SDR-0010 | proposed |
| ADR-0012 | delivery | SDR-0011 | proposed |
| ADR-0013 | frontend | SDR-0013 | proposed |
| ADR-0014 | work-tracking | SDR-0014 | proposed |
| ADR-0015 | secrets | none (original to governance) | proposed |
| ADR-0016 | changes | none (original to governance) | proposed |
| ADR-0017 | agent-tooling | none (original to governance) | proposed |
| ADR-0018 | dependencies | none (original to governance) | proposed |
| ADR-0019 | vulnerabilities | none (original to governance) | proposed |
| ADR-0020 | adding-dependencies | none (original to governance) | proposed |
| ADR-0021 | build-provenance | none (original to governance) | proposed |
| ADR-0022 | review-and-merge | none (original to governance) | proposed |
| ADR-0023 | tools | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-three files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

### Requirement: ADR-0023 asks where tools outside the package manager are pinned
ADR-0023 SHALL ask, through one trait `tools.manager` (`mise`, `aqua`,
`script`, `none`), how a tool outside the package manager is installed and
pinned. Its Decision SHALL fix, whatever the repository rules:
- one place holds each named tool's version and checksum;
- that place serves the workstation, the runner and an agent session;
- a tool manager is installed pinned, under ADR-0020;
- the ADR states what keeps the pins current.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0023 is read
- **THEN** it holds exactly `tools.manager`, empty, with `revision: 1`

#### Scenario: One tool
- **WHEN** a repository has a single tool outside the package manager
- **THEN** ADR-0023 says `script` can be the right answer and states its cost

#### Scenario: Same list everywhere
- **WHEN** a tool named by an accepted ADR is needed on a workstation, a runner and an agent session
- **THEN** ADR-0023's Decision requires all three to read the one place holding its version and checksum

#### Scenario: Original to governance
- **WHEN** ADR-0023's References are read
- **THEN** they say it is original to governance and hold the key table

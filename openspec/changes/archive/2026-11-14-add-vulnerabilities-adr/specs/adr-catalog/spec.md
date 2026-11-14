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

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the nineteen files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

### Requirement: ADR-0019 asks what a release contains and what blocks on its vulnerabilities
ADR-0019 SHALL ask `vulnerabilities.sbom` (`cyclonedx`, `spdx`, `none`),
recommending `cyclonedx`, `vulnerabilities.scanner` (a tool name or
`none`), recommending `grype`, and `vulnerabilities.fail_on` (`critical`,
`high`, `medium`, `low`, `none`), recommending `critical`. Its Decision
SHALL fix, whatever the repository rules:
- `fail_on` other than `none` requires `forge.gate: blocking` (ADR-0011);
- the scan runs on every pull request and on a schedule, at least weekly;
- only a vulnerability with a fixed version fails the check;
- an agent never silences a finding by an ignore rule, a lower threshold or
  a removed job; an ignore rule it proposes is merged by a person;
- every ignore rule names one vulnerability and gives a reason;
- the SBOM is built by the release job from what is released and published
  with the release.
ADR-0011's stage table SHALL list a `scan` stage conditioned on
`vulnerabilities.scanner`, without a change to ADR-0011's `revision`.

#### Scenario: Three traits
- **WHEN** the `traits:` block of ADR-0019 is read
- **THEN** it holds exactly `vulnerabilities.sbom`, `vulnerabilities.scanner` and `vulnerabilities.fail_on`

#### Scenario: Blocking scan without a blocking gate
- **WHEN** a repository rules `vulnerabilities.fail_on: critical` while its ADR-0011 rules `forge.gate: informative`
- **THEN** ADR-0019's Decision names that combination as forbidden

#### Scenario: Agent meets a red scan
- **WHEN** an agent's change fails the scan on a vulnerability with no fixed version
- **THEN** ADR-0019's Decision lets it only propose an ignore rule with a reason, for a person to merge

#### Scenario: Scan stage exists
- **WHEN** ADR-0011's stage table is read
- **THEN** it has a `scan` row conditioned on `vulnerabilities.scanner` and its `revision` is `1`

#### Scenario: Original to governance
- **WHEN** ADR-0019's References are read
- **THEN** they state that no surdesrails SDR asks this question

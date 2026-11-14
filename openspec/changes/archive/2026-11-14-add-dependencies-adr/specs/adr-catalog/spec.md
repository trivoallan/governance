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

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the eighteen files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

### Requirement: ADR-0018 asks what keeps dependencies current
ADR-0018 SHALL ask `dependencies.updater` (`dependabot`, `renovate`,
`none`), recommending `dependabot`, and `dependencies.automerge` (`none`,
`patch`, `minor`), recommending `patch`. Its Decision SHALL fix, whatever
the repository rules:
- automerge other than `none` requires `forge.gate: blocking` (ADR-0011);
- no update is proposed before a cooldown of at least three days after its
  release;
- updates to GitHub Actions are never merged automatically;
- major updates are always reviewed by a person;
- the ecosystems watched follow from tracked files, and an ecosystem no
  file justifies is not configured.
It SHALL state that Dependabot does not merge by itself, and that the
workflow that merges its pull requests obeys ADR-0011's rules.

#### Scenario: Two traits
- **WHEN** the `traits:` block of ADR-0018 is read
- **THEN** it holds exactly `dependencies.updater` and `dependencies.automerge`

#### Scenario: Automerge without a blocking gate
- **WHEN** a repository rules `dependencies.automerge: patch` while its ADR-0011 rules `forge.gate: informative`
- **THEN** ADR-0018's Decision names that combination as forbidden

#### Scenario: Actions excluded from automerge
- **WHEN** a repository that ruled `dependencies.automerge: patch` receives a patch update of a SHA-pinned action
- **THEN** ADR-0018's Decision requires a person to merge it

#### Scenario: Original to governance
- **WHEN** ADR-0018's References are read
- **THEN** they state that no surdesrails SDR asks this question

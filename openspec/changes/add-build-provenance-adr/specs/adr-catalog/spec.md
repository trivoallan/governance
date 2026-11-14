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

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-one files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

### Requirement: ADR-0021 asks what proves where an artifact was built
ADR-0021 SHALL ask `supply_chain.build_level` (`0`, `1`, `2`, `3`), the SLSA
v1.x Build track level of the repository's published artifacts,
recommending `2`: a provenance signed by the hosted build platform
(`actions/attest-build-provenance`, `npm publish --provenance`, or PyPI
Trusted Publishing with PEP 740 attestations). Its Decision SHALL fix,
whatever the repository rules:
- the key applies when ADR-0012's `delivery.target` is `package` or
  `container`, whatever `delivery.release_tool` says; otherwise the ADR is
  ruled `rejected`;
- a provenance is worth only its verification, and the ADR names the
  consumer-side commands (`npm audit signatures`, `gh attestation verify`,
  and `pypi-attestations verify pypi` as a manual step for Python, which no
  installer verifies) and ADR-0020's admission rule;
- the recommendation states level `2`'s precondition on a private
  repository (npm provenance needs a public source repository, GitHub
  attestations need GitHub Enterprise Cloud);
- the provenance is produced by the publishing workflow, under ADR-0011's
  rules, never on a workstation.
Its Alternatives Considered SHALL state the cost of level `3`.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0021 is read
- **THEN** it holds exactly `supply_chain.build_level`

#### Scenario: A repository that publishes nothing
- **WHEN** a repository's ADR-0012 rules `delivery.target: none`
- **THEN** ADR-0021's Decision tells it to rule ADR-0021 `rejected`

#### Scenario: A repository that publishes by hand
- **WHEN** a repository's ADR-0012 rules `delivery.target: package` and `delivery.release_tool: manual`
- **THEN** ADR-0021's Decision says the key applies to it

#### Scenario: Verification is named
- **WHEN** ADR-0021's Decision is read
- **THEN** it names `npm audit signatures`, `gh attestation verify`, `pypi-attestations verify pypi` and ADR-0020

#### Scenario: Private repository precondition
- **WHEN** ADR-0021's recommendation and Negative consequences are read
- **THEN** they state that npm provenance needs a public source repository and GitHub attestations on a private repository need GitHub Enterprise Cloud

#### Scenario: Level 3 has a cost
- **WHEN** ADR-0021's Alternatives Considered are read
- **THEN** level `3` is listed with an isolated builder and the cost it adds

#### Scenario: Original to governance
- **WHEN** ADR-0021's References are read
- **THEN** they state that no surdesrails SDR asks this question

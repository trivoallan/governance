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
| ADR-0023 | license | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-three files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

### Requirement: ADR-0023 asks under which licence others may use the repository
ADR-0023 "License" SHALL ask one trait, `license.spdx`, holding a free SPDX
license expression, with the recommended value `MIT`. It SHALL name
`Apache-2.0` for when a patent grant matters, `UNLICENSED` for a private
repository, and SHALL accept compound expressions. Its Decision SHALL fix
that the root manifest's licence field (`license` in `package.json`,
`[project] license` in `pyproject.toml`) holds the trait, and that a licence
file is committed at the root unless the value is `UNLICENSED`. It SHALL say
in prose that the copyright holder is the organisation owning the
repository, or else the ADR's `authors:`, and SHALL NOT make it a key. It
SHALL say why governance itself ships under MIT-0. It SHALL leave dependency
licence compliance to ADR-0019's exclusion. It SHALL ship with
`check: npx --no-install governance-check ADR-0023`, and its how-to-rule
block SHALL say that the check reads neither the licence text nor manifests
outside the root.

#### Scenario: One trait
- **WHEN** ADR-0023's frontmatter is read as shipped
- **THEN** it holds `license.spdx` with an empty value, `status: proposed` and `revision: 1`

#### Scenario: Agent creating a manifest
- **WHEN** an agent creates `package.json` in a repository that rules `license.spdx: MIT`
- **THEN** ADR-0023 tells it to write `"license": "MIT"` and a `LICENSE` file, which `npm init` leaves out

#### Scenario: Holder not a key
- **WHEN** ADR-0023's traits are listed
- **THEN** there is no key for the copyright holder, and the Decision names who holds it

#### Scenario: Original to governance
- **WHEN** ADR-0023's References are read
- **THEN** they say it is original to governance and hold the key table

# Spec Delta

## MODIFIED Requirements

### Requirement: Schema check
`adr/.mdschema.yml` SHALL check that a ruled ADR carries its verdict:
`status` is `accepted` or `rejected`, `date` is set, no trait key that is
present is empty, the sections above are present, and the sentence
`Everything below disappears when you rule` is gone. It checks the
consuming repository's ruled ADRs, through `ontrack-engineering-check ADR-0001`, so a
question ADR as governance ships it SHALL fail it; ADR-0001 SHALL pass it.

#### Scenario: Ruled file passes
- **WHEN** `mdschema check --schema adr/.mdschema.yml` runs on a ruled ADR with every trait filled
- **THEN** it reports no error

#### Scenario: Half-ruled file is named
- **WHEN** a consuming repository sets `status: accepted` but leaves a trait empty
- **THEN** the check reports that file and the empty key

#### Scenario: Shipped question fails
- **WHEN** the schema is applied to a question ADR straight from governance
- **THEN** it reports the `proposed` status and the empty traits

### Requirement: Check line
An ADR MAY carry, at column zero of its frontmatter, a `check:` key holding
one shell command that `ontrack check` runs once a repository has ruled the
ADR `accepted`. A `check:` line shipped by governance SHALL call
`npx --no-install ontrack-engineering-check <ADR number>`, so that no package is fetched
from a registry, and SHALL be verdict-independent: the command reads the
traits, and the ADR's text is not changed by the value a repository rules.
`adr/.mdschema.yml` SHALL accept an ADR that carries a `check:` key.

#### Scenario: Shipped check line
- **WHEN** ADR-0006's frontmatter is read straight from governance
- **THEN** it holds `check: npx --no-install ontrack-engineering-check ADR-0006`

#### Scenario: Schema accepts the key
- **WHEN** `mdschema check --schema adr/.mdschema.yml` runs on a ruled ADR-0006 that keeps its `check:` line
- **THEN** it reports no error about `check`


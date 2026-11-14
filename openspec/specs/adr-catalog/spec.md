# adr-catalog Specification

## Purpose
Lists the questions governance ships to consuming repositories, the
surdesrails question each one adapts, and the traits each one asks for.

## Requirements

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

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the fifteen files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted` with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`) in place of SDR-0001's `MADR`. Its Consequences SHALL state
that governance is an adaptation of surdesrails meant to be imported instead
of it, and that nothing detects when an SDR it adapts changes.

#### Scenario: Drift is written down
- **WHEN** the Consequences of ADR-0001 are read
- **THEN** they name surdesrails and state that drift from it is detected only by reading the References source lines

### Requirement: Traits carried over unchanged
ADR-0002, ADR-0005, ADR-0006, ADR-0007 and ADR-0009 SHALL ask the
same traits as their SDR, with the same keys and the same enum values
translated to English (for example `français` becomes `french`):

| ADR | traits |
|---|---|
| ADR-0002 | `localization.language.default`, `documentation`, `commits`, `code`, `comments` |
| ADR-0005 | `validation.boundary`, `validation.data_files` |
| ADR-0006 | `commits.scopes`, `commits.tool` |
| ADR-0007 | `tests.coverage_target` |
| ADR-0009 | `branching.model`, `branching.merge`, `branching.prefixes` |

#### Scenario: Same keys as the source
- **WHEN** the `traits:` block of ADR-0006 is compared with SDR-0006 revision 1
- **THEN** it has the same keys, `commits.scopes` and `commits.tool`

#### Scenario: Enum values in English
- **WHEN** the enum of `localization.language.default` in ADR-0002 is read
- **THEN** its values are `french` and `english`

### Requirement: Adapted traits
The remaining ADRs SHALL adapt their SDR's traits as follows:
- ADR-0003 SHALL ask `architecture.pattern` only, recommending `hexagonal`.
- ADR-0010 SHALL ask `architecture.document` (`arc42`, `elsewhere`, `none`),
  recommending `arc42` as a `docs/architecture/arc42/` directory with one
  file per section, and `architecture.model` (a named architecture-as-code
  tool or `none`), recommending `likec4` in `docs/architecture/model/`, and
  `architecture.diagrams` (`mermaid`, `plantuml`, `none`) for diagrams the
  model does not cover, recommending `mermaid`. It SHALL NOT point to a template, since governance ships none.
- ADR-0004 SHALL ask `languages.main.name`, recommending Python or
  TypeScript, without reasoning that relies on a team's existing skills.
- ADR-0008 SHALL ask `docs.tool`, `docs.root` and `docs.audience`,
  recommending `starlight` (with its `docs` collection pointed at `docs/`)
  and `public`, with a `docs.tool` enum of `starlight`, `docusaurus`,
  `mkdocs` and `none`, and an
  `audience` enum of `single-user`, `team` and `public`: SDR-0008's
  scale translated, without the enterprise-only steps `LS` and `groupe`.
- ADR-0011 SHALL assume GitHub as the forge, SHALL NOT ask `forge.vendor`,
  and SHALL ask `forge.gate`.
- ADR-0012 SHALL ask `delivery.target` (`container`, `platform`, `package`,
  `none`) in place of SDR-0011's `hosting.offer`, plus `delivery.environments`,
  `delivery.release_tool` (recommended `release-please`), `delivery.registry`
  and `deployment.manifests`.
- ADR-0013 SHALL ask `frontend.framework` as a free string, recommending
  `astro`, with no WCS theme trait.
- ADR-0014 SHALL ask `tracking.tool` (`github-issues`, `linear`, `jira`,
  `none`), recommending `github-issues`, and `tracking.project`, not a Jira
  project key.

#### Scenario: Architecture split in two
- **WHEN** the `traits:` blocks of ADR-0003 and ADR-0010 are read
- **THEN** ADR-0003 has only `architecture.pattern` and ADR-0010 has `architecture.document`, `architecture.model` and `architecture.diagrams`

#### Scenario: No enterprise vocabulary
- **WHEN** the shipped ADRs are searched for `gitlab`, `aresis`, `wcs`, `caas` or `paas` as trait keys or enum values
- **THEN** none is found

#### Scenario: GitHub assumed
- **WHEN** the `traits:` block of ADR-0011 is read
- **THEN** it contains `forge.gate` and no `forge.vendor`

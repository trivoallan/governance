# adr-format Specification

## Purpose
Defines the shape every ADR shipped by governance follows, so that a
consuming repository can rule on it and ontrack can compare its revision.

## Requirements

### Requirement: File naming and numbering
Every ADR SHALL live in `adr/` as `ADR-NNNN-slug.md`, where `NNNN` is a
four-digit number and `slug` is the kebab-case value of its `slug:` key.
Once every batch of the catalog is shipped, numbers SHALL form a gapless
sequence starting at `0001`. While batches are still landing, a number may be
missing; a shipped number SHALL NOT be reused or renumbered.

#### Scenario: Name matches frontmatter
- **WHEN** a file `adr/ADR-0006-commits.md` is read
- **THEN** its frontmatter has `adr: ADR-0006` and `slug: commits`

#### Scenario: No gap in numbering
- **WHEN** the files in `adr/` are listed by number after the last batch
- **THEN** every number from `0001` to the highest present appears exactly once

### Requirement: Frontmatter keys
Every ADR SHALL carry the keys `adr`, `slug`, `title`, `status`, `revision`,
`date`, `authors` and `supersedes`. A question ADR SHALL also carry a
`traits:` block. `revision` SHALL be a positive integer.

#### Scenario: Complete frontmatter
- **WHEN** an ADR's frontmatter is parsed
- **THEN** all eight keys are present and `revision` is an integer of 1 or more

### Requirement: Nygard sections in English
Every ADR body SHALL be written in English and SHALL contain, in this order,
the sections `## Status`, `## Context`, `## Decision`, `## Consequences`
(with `### Positive`, `### Negative` and `### Neutral`),
`## Alternatives Considered` and `## References`.

#### Scenario: Section order
- **WHEN** the headings of an ADR are listed
- **THEN** they match the order above, with no MADR heading such as `## Considered Options` or `## Decision Outcome`

### Requirement: Question ADRs ship proposed
Every ADR except ADR-0001 SHALL ship with `status: proposed`, an empty
`date:`, `authors: []`, and every key under `traits:` left without a value.
Its Decision section SHALL state the answer governance recommends for each
trait with its reasons, and SHALL say when governance has no answer to
recommend.

#### Scenario: Shipped unanswered
- **WHEN** a question ADR is read straight from governance
- **THEN** its status is `proposed` and no trait has a value

#### Scenario: Recommendation is reasoned
- **WHEN** the Decision section of a question ADR is read
- **THEN** each trait has either a recommended value with its reason or an explicit statement that governance recommends none

### Requirement: How-to-rule block
Every question ADR SHALL include, inside its Decision section, a block that
starts with the sentence `Everything below disappears when you rule` and
tells the consuming repository how to rule: fill each trait (or remove the
whole `traits:` block when ruling `rejected`), set `status`, `date` and
`authors`, write the verdict and its reasons, and delete the block itself.
ADR-0001 SHALL NOT contain this block.

#### Scenario: Block present on a shipped question
- **WHEN** a question ADR is read straight from governance
- **THEN** its Decision section contains the sentence `Everything below disappears when you rule`

#### Scenario: Block absent once ruled
- **WHEN** a consuming repository has ruled on a question ADR
- **THEN** the sentence `Everything below disappears when you rule` no longer appears in the file

### Requirement: Ruling lifecycle
A question ADR SHALL be ruled `accepted` or `rejected`. A `rejected` ADR
SHALL have no `traits:` block and SHALL say what stands in for the decision.
Once `accepted` or `rejected`, the body SHALL NOT change; only `status` may
change, and reopening the decision SHALL take a new ADR that lists it in
`supersedes:`.

#### Scenario: Rejected without traits
- **WHEN** a consuming repository rules an ADR `rejected`
- **THEN** the file has no `traits:` block and its Decision section names what stands in for the decision

#### Scenario: Superseded, not rewritten
- **WHEN** an accepted decision is reopened
- **THEN** a new ADR lists the old one in `supersedes:` and the old file's body is unchanged

### Requirement: Revision tracks the question
`revision` SHALL increase by one when, and only when, the question an ADR
asks changes: a trait is added, removed or renamed, an enum value changes,
or the recommended answer changes. Wording, typo and link fixes SHALL NOT
change `revision`.

#### Scenario: Typo fix
- **WHEN** a typo is fixed in a shipped ADR
- **THEN** its `revision` is unchanged and `ontrack plan` reports it `unchanged`

#### Scenario: New trait
- **WHEN** a trait is added to a shipped ADR
- **THEN** its `revision` goes up by one and `ontrack plan` reports it `revised`

### Requirement: Source line
Every ADR adapted from surdesrails SHALL name, in its References section,
the SDR it was adapted from and that SDR's revision.

#### Scenario: Source recorded
- **WHEN** the References section of ADR-0013 is read
- **THEN** it names SDR-0013 and the SDR revision it was adapted from

### Requirement: Schema check
`adr/.mdschema.yml` SHALL check that a ruled ADR carries its verdict:
`status` is `accepted` or `rejected`, `date` is set, no trait key that is
present is empty, the sections above are present, and the sentence
`Everything below disappears when you rule` is gone. It checks the
consuming repository's ruled ADRs, so a question ADR as governance ships it
SHALL fail it; ADR-0001 SHALL pass it.

#### Scenario: Ruled file passes
- **WHEN** `npx @jackchuka/mdschema@0.15.1 check '*.md'` runs on a ruled ADR with every trait filled
- **THEN** it reports no error

#### Scenario: Half-ruled file is named
- **WHEN** a consuming repository sets `status: accepted` but leaves a trait empty
- **THEN** the check reports that file and the empty key

#### Scenario: Shipped question fails
- **WHEN** the check runs on a question ADR straight from governance
- **THEN** it reports the `proposed` status and the empty traits

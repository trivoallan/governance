# adr-format Specification

## Purpose
Defines the shape every ADR shipped by ontrack-engineering follows, so that a
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
`date`, `authors` and `supersedes`. A convention SHALL also carry a
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

### Requirement: Conventions ship proposed
Every ADR except ADR-0001 SHALL ship with `status: proposed`, an empty
`date:`, `authors: []`, and every key under `traits:` left without a value.
Its Decision section SHALL state the value ontrack-engineering recommends for each
trait with its reasons, and SHALL say when ontrack-engineering has no value to
recommend.

#### Scenario: Shipped unruled
- **WHEN** a convention is read straight from ontrack-engineering
- **THEN** its status is `proposed` and no trait has a value

#### Scenario: Recommendation is reasoned
- **WHEN** the Decision section of a convention is read
- **THEN** each trait has either a recommended value with its reason or an explicit statement that ontrack-engineering recommends none

### Requirement: How-to-rule block
Every convention SHALL include, inside its Decision section, a block that
starts with the sentence `Everything below disappears when you rule` and
tells the consuming repository how to rule: fill each trait (or remove the
whole `traits:` block when ruling `rejected`), set `status`, `date` and
`authors`, write the ruling and its reasons, and delete the block itself.
ADR-0001 SHALL NOT contain this block.

#### Scenario: Block present on a shipped convention
- **WHEN** a convention is read straight from ontrack-engineering
- **THEN** its Decision section contains the sentence `Everything below disappears when you rule`

#### Scenario: Block absent once ruled
- **WHEN** a consuming repository has ruled on a convention
- **THEN** the sentence `Everything below disappears when you rule` no longer appears in the file

### Requirement: Ruling lifecycle
A convention SHALL be ruled `accepted` or `rejected`. A `rejected` ADR
SHALL have no `traits:` block and SHALL say what stands in for the decision.
Once a repository has ruled an ADR `accepted` or `rejected`, the body of
that repository's copy SHALL NOT change; only `status` and the `check:` line
may change, and reopening the decision SHALL take a new ADR that lists it in
`supersedes:`. This freeze applies to a repository's ruling. ontrack-engineering
SHALL change the ADRs it ships, ADR-0001 included, only through `revision`.

#### Scenario: Rejected without traits
- **WHEN** a consuming repository rules an ADR `rejected`
- **THEN** the file has no `traits:` block and its Decision section names what stands in for the decision

#### Scenario: Superseded, not rewritten
- **WHEN** an accepted decision is reopened
- **THEN** a new ADR lists the old one in `supersedes:` and the old file's body is unchanged

#### Scenario: ontrack-engineering revises a shipped accepted ADR
- **WHEN** ontrack-engineering changes what ADR-0001 says
- **THEN** ADR-0001's `revision` goes up by one and no superseding ADR is written

#### Scenario: Check line copied into a ruled ADR
- **WHEN** a repository that ruled ADR-0006 before ontrack-engineering added its `check:` line runs `ontrack apply`
- **THEN** `apply` reports ADR-0006 `synced`, its copy gains the `check:` line, nothing else in the file changes, and the ADR stays ruled

### Requirement: Revision tracks the convention
`revision` SHALL increase by one when, and only when, the convention an ADR
carries changes: a trait is added, removed or renamed, an enum value changes,
or the recommended value changes. Wording, typo and link fixes SHALL NOT
change `revision`, and neither SHALL adding, changing or removing a
`Suggested skills` line, adding, changing or removing a `check:` line, or
changing the scripts a `check:` line calls. Those scripts follow the version
of ontrack-engineering's package.

#### Scenario: Typo fix
- **WHEN** a typo is fixed in a shipped ADR
- **THEN** its `revision` is unchanged and `ontrack plan` reports it `unchanged`

#### Scenario: New trait
- **WHEN** a trait is added to a shipped ADR
- **THEN** its `revision` goes up by one and `ontrack plan` reports it `revised`

#### Scenario: Suggested skill renamed
- **WHEN** the plugin named in an ADR's `Suggested skills` line is renamed and the line is updated
- **THEN** that ADR's `revision` is unchanged and `ontrack plan` reports it `unchanged`

#### Scenario: Check line added
- **WHEN** ontrack-engineering adds a `check:` line to ADR-0006 and a repository whose copy is up to date runs `ontrack plan`
- **THEN** ADR-0006's `revision` is unchanged, `ontrack plan` reports it `check` and shows the line that would come, and `ontrack apply` writes that line

### Requirement: Schema check
`adr/.mdschema.yml` SHALL check that a ruled ADR carries its ruling:
`status` is `accepted` or `rejected`, `date` is set, no trait key that is
present is empty, the sections above are present, and the sentence
`Everything below disappears when you rule` is gone. It checks the
consuming repository's ruled ADRs, through `ontrack-engineering-check ADR-0001`, so a
convention as ontrack-engineering ships it SHALL fail it; ADR-0001 SHALL pass it.

#### Scenario: Ruled file passes
- **WHEN** `mdschema check --schema adr/.mdschema.yml` runs on a ruled ADR with every trait filled
- **THEN** it reports no error

#### Scenario: Half-ruled file is named
- **WHEN** a consuming repository sets `status: accepted` but leaves a trait empty
- **THEN** the check reports that file and the empty key

#### Scenario: Shipped convention fails
- **WHEN** the schema is applied to a convention straight from ontrack-engineering
- **THEN** it reports the `proposed` status and the empty traits

### Requirement: Suggested skills line
An ADR MAY name, in its References section, the Claude Code skills that help
carry out its decision, on one line that starts with `Suggested skills:` and
names each skill as `plugin@marketplace` with the skill's name. A line SHALL
name only skills whose plugin and marketplace exist; an ADR with no fitting
skill SHALL carry no such line. The line is advice, not a trait.

#### Scenario: Line names an existing plugin
- **WHEN** ADR-0010's References are read
- **THEN** its `Suggested skills` line names `arc42-toolkit@arc42-toolkit`

#### Scenario: No invented skill
- **WHEN** an ADR has no skill whose plugin and marketplace can be confirmed
- **THEN** its References carry no `Suggested skills` line

### Requirement: Check line
An ADR MAY carry, at column zero of its frontmatter, a `check:` key holding
one shell command that `ontrack check` runs once a repository has ruled the
ADR `accepted`. A `check:` line shipped by ontrack-engineering SHALL call
`npx --no-install ontrack-engineering-check <ADR number>`, so that no package is fetched
from a registry, and SHALL be ruling-independent: the command reads the
traits, and the ADR's text is not changed by the value a repository rules.
`adr/.mdschema.yml` SHALL accept an ADR that carries a `check:` key.

#### Scenario: Shipped check line
- **WHEN** ADR-0006's frontmatter is read straight from ontrack-engineering
- **THEN** it holds `check: npx --no-install ontrack-engineering-check ADR-0006`

#### Scenario: Schema accepts the key
- **WHEN** `mdschema check --schema adr/.mdschema.yml` runs on a ruled ADR-0006 that keeps its `check:` line
- **THEN** it reports no error about `check`

### Requirement: Revisions list
Every ADR ontrack-engineering ships with a `revision` above 1 SHALL end with a
paragraph that starts with `**Revisions.**`, followed by one list item per
revision from 2 up to the current one, in increasing order. Each item
SHALL start with `Revision N:`. It SHALL say what changed in the convention
and what a repository that already ruled must rule on again, or say that it
has nothing to rule on again. An ADR at revision 1 SHALL carry no such list.
The list SHALL sit after the References section's content, so a
repository's ruled copy keeps it. ADR-0001 SHALL say that a repository
reads this list when `ontrack plan` reports an ADR `revised`. `npm test`
SHALL fail when a shipped ADR's `revision` and its list disagree.

#### Scenario: Revision without its entry
- **WHEN** a shipped ADR has `revision: 3` and its Revisions list holds only `Revision 2:`
- **THEN** `npm test` fails and names that ADR and the missing revision 3

#### Scenario: Entry for a revision that does not exist
- **WHEN** a shipped ADR has `revision: 2` and its Revisions list holds `Revision 3:`
- **THEN** `npm test` fails and names that ADR

#### Scenario: First revision
- **WHEN** a shipped ADR has `revision: 1`
- **THEN** it carries no Revisions list and `npm test` passes

#### Scenario: Consumer reads what to rule on again
- **WHEN** `ontrack plan` reports ADR-0012 `revised` from revision 2 to 3
- **THEN** ADR-0012's `Revision 3:` entry names `delivery.release_notes` as the one key to rule on

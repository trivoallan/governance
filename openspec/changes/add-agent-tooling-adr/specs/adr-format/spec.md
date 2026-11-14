# Spec Delta

## MODIFIED Requirements

### Requirement: Ruling lifecycle
A question ADR SHALL be ruled `accepted` or `rejected`. A `rejected` ADR
SHALL have no `traits:` block and SHALL say what stands in for the decision.
Once a repository has ruled an ADR `accepted` or `rejected`, the body of
that repository's copy SHALL NOT change; only `status` may change, and
reopening the decision SHALL take a new ADR that lists it in `supersedes:`.
This freeze applies to a repository's verdict. governance SHALL change the
ADRs it ships, ADR-0001 included, only through `revision`.

#### Scenario: Rejected without traits
- **WHEN** a consuming repository rules an ADR `rejected`
- **THEN** the file has no `traits:` block and its Decision section names what stands in for the decision

#### Scenario: Superseded, not rewritten
- **WHEN** an accepted decision is reopened
- **THEN** a new ADR lists the old one in `supersedes:` and the old file's body is unchanged

#### Scenario: governance revises a shipped accepted ADR
- **WHEN** governance changes what ADR-0001 says
- **THEN** ADR-0001's `revision` goes up by one and no superseding ADR is written

### Requirement: Revision tracks the question
`revision` SHALL increase by one when, and only when, the question an ADR
asks changes: a trait is added, removed or renamed, an enum value changes,
or the recommended answer changes. Wording, typo and link fixes SHALL NOT
change `revision`, and neither SHALL adding, changing or removing a
`Suggested skills` line.

#### Scenario: Typo fix
- **WHEN** a typo is fixed in a shipped ADR
- **THEN** its `revision` is unchanged and `ontrack plan` reports it `unchanged`

#### Scenario: New trait
- **WHEN** a trait is added to a shipped ADR
- **THEN** its `revision` goes up by one and `ontrack plan` reports it `revised`

#### Scenario: Suggested skill renamed
- **WHEN** the plugin named in an ADR's `Suggested skills` line is renamed and the line is updated
- **THEN** that ADR's `revision` is unchanged and `ontrack plan` reports it `unchanged`

## ADDED Requirements

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

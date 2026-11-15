# Spec Delta

## ADDED Requirements

### Requirement: ADR-0011 asks who can accept a change
ADR-0011 SHALL ask `forge.review`, with the values `peer` (a person with
write access other than the author), `author` (the author's own review is
enough) and `agent` (the review of an agent that did not write the change
is enough), and SHALL recommend `peer`, saying `author` is tenable when one
person has write access. Adding the key SHALL raise ADR-0011 to revision 3,
with a `Revision 3:` entry naming `forge.review` as the one key to answer.
The sentence on who reviews a change proposed elsewhere SHALL remain
unchanged.

#### Scenario: Key shipped unanswered
- **WHEN** ADR-0011 is read straight from governance
- **THEN** its `traits:` block holds `forge.review` with no value, and its `revision` is 3

#### Scenario: Recommendation is reasoned
- **WHEN** ADR-0011's Decision section is read
- **THEN** it recommends `peer` and says `author` is tenable when one person has write access

#### Scenario: Consumer reads what to re-answer
- **WHEN** `ontrack plan` reports ADR-0011 `revised` from revision 2 to 3
- **THEN** ADR-0011's `Revision 3:` entry names `forge.review` as the one key to answer

#### Scenario: Schema accepts the key
- **WHEN** a ruled ADR-0011 holds `forge.review: author`
- **THEN** the schema in `adr/.mdschema.yml` accepts it, and refuses any value other than `peer`, `author` or `agent`

### Requirement: ADR-0011 states review beside the gate
ADR-0011 SHALL state what `forge.review: author` means with each value of
`forge.gate`: with `none`, no control at all; with `blocking`, the pipeline
is the control; with `informative`, the author alone decides on what the
pipeline reports. ADR-0011 SHALL NOT describe the behaviour of any tool that
reads the key.

#### Scenario: No control at all
- **WHEN** a repository rules `forge.gate: none` and `forge.review: author`
- **THEN** ADR-0011 says no control remains

#### Scenario: Pipeline is the control
- **WHEN** a repository rules `forge.gate: blocking` and `forge.review: author`
- **THEN** ADR-0011 says the pipeline is the control

#### Scenario: No tool behaviour
- **WHEN** ADR-0011 is read in full
- **THEN** it names no tool's apply gate

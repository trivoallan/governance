# Spec Delta

## ADDED Requirements

### Requirement: ADR-0012 asks what accompanies a version
ADR-0012 SHALL ask `delivery.release_notes`, with the values `changelog`,
`highlights` and `none`, and SHALL recommend `highlights`. `changelog` SHALL
mean the generated changelog alone. `highlights` SHALL mean the changelog
plus a short text for readers that heads the release's notes on the forge;
a release SHALL NOT be finished until that text is written. `none` SHALL
mean there are no versions, and SHALL be the answer when
`delivery.release_tool` is `none`. The highlights SHALL name every ADR the
release revises, where the repository ships ADRs. ADR-0012's References
SHALL name `deliver-release-notes` from `pm-skills@product-on-purpose` on
its Suggested skills line. Adding the key SHALL raise ADR-0012 to revision
3.

#### Scenario: Key shipped unanswered
- **WHEN** ADR-0012 is read straight from governance
- **THEN** its `traits:` block holds `delivery.release_notes` with no value, and its `revision` is 3

#### Scenario: Recommendation is reasoned
- **WHEN** ADR-0012's Decision section is read
- **THEN** it recommends `highlights` and says the changelog lists commits for whoever maintains the repository while the highlights tell a consumer what the release brings and what they must do

#### Scenario: No versions
- **WHEN** a repository rules `delivery.release_tool: none`
- **THEN** ADR-0012 tells it to rule `delivery.release_notes: none`

#### Scenario: Suggested skill
- **WHEN** ADR-0012's References are read
- **THEN** its Suggested skills line names `deliver-release-notes` from `pm-skills@product-on-purpose`

### Requirement: ADR-0012 states the definition of done of a change
ADR-0012 SHALL state, without a key, that the last tasks of any change are
that its pipeline passes on the pull request once a pipeline file exists, and
that the same pull request updates the documentation the change makes false.
It SHALL say that what a check can verify belongs in a check, and that
review covers the rest. It SHALL place no task at the release itself
except the highlights, when `delivery.release_notes` is `highlights`.
ADR-0012's Suggested skills line SHALL also name
`verification-before-completion` from `superpowers@superpowers-marketplace`.

#### Scenario: Behaviour change without documentation
- **WHEN** an agent finishes a change that alters what a page of the repository's documentation describes
- **THEN** ADR-0012 tells it to update that page in the same pull request, not in a later one or at release time

#### Scenario: Nothing to do at release with `changelog`
- **WHEN** a repository rules `delivery.release_notes: changelog`
- **THEN** ADR-0012 asks for no act when a release is made

#### Scenario: Skill for the definition of done
- **WHEN** ADR-0012's References are read
- **THEN** its Suggested skills line names `verification-before-completion` from `superpowers@superpowers-marketplace`

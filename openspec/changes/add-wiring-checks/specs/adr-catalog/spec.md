# Spec Delta

## ADDED Requirements

### Requirement: Wiring ADRs ship their check
ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018 and ADR-0021 SHALL
each ship with `check: npx --no-install governance-check <number>`, at their
current `revision`. Each how-to-rule block SHALL say that the line runs once
the ADR is `accepted`, which files the check looks for, that it checks
presence only, and that a value it has no row for passes with "nothing to
check". ADR-0011's SHALL add that the check does not verify the ruleset that
makes the pipeline required.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0018 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0018` and its `revision` is `1`

#### Scenario: How-to-rule names the files
- **WHEN** ADR-0018's how-to-rule block is read
- **THEN** it names `.github/dependabot.yml` for `dependabot` and says that `none` has nothing to check

#### Scenario: Gate ceiling stated
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it says the ruleset is not verified

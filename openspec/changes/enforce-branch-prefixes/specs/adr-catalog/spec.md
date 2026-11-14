# Spec Delta

## MODIFIED Requirements

### Requirement: ADR-0009, ADR-0015 and ADR-0016 ship their check
ADR-0009, ADR-0015 and ADR-0016 SHALL each ship with
`check: npx --no-install governance-check <number>`, at their current
`revision`. Each how-to-rule block SHALL say that the line runs once the ADR
is `accepted`, what the check runs for each value, which tool it needs
installed, and what it does not check: for ADR-0009, `branching.model` and
`branching.merge`, the branches of release and update tools
(`release-please--…`, `dependabot/…`, `renovate/…`), and that
`--branch <name>` may be appended; for ADR-0015, `secrets.storage`, that
`--from <ref>` may be appended, and that a local hook skipped with
`--no-verify` is what this check catches in CI; for ADR-0016, that it also
runs `openspec validate --all`.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0015 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0015` and its `revision` is `1`

#### Scenario: How-to-rule names the tool
- **WHEN** ADR-0015's how-to-rule block is read
- **THEN** it says the check runs `gitleaks` on the branch's commits and that `gitleaks` must be installed where it runs

#### Scenario: Unchecked keys named
- **WHEN** ADR-0009's how-to-rule block is read
- **THEN** it says `branching.model` and `branching.merge` are not checked

#### Scenario: Tool branches named
- **WHEN** ADR-0009's how-to-rule block is read
- **THEN** it says branches starting with `release-please--`, `dependabot/` or `renovate/` have nothing to check, and its `revision` is unchanged

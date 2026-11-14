## MODIFIED Requirements

### Requirement: ADR-0009 check
`governance-check ADR-0009` SHALL check one branch name. The name SHALL be
the value of `--branch <name>` when given, else `GITHUB_HEAD_REF` when it is
set and not empty, else the repository's current branch. When there is no
name, or the name is the default branch (the branch `origin/HEAD` points to,
or `main` or `master` when `origin/HEAD` is not set), the check SHALL print
that there is nothing to check and exit `0`. When the name starts with the prefix of a tool the repository's ADRs
rule, the check SHALL print that it is a tool branch with nothing to check and exit `0`.
A tool is ruled when ADR-0012 `delivery.release_tool` or ADR-0018
`dependencies.updater` names it, and its prefix is `release-please--` for
`release-please`, `releaser-pleaser--` for `releaser-pleaser`, `dependabot/`
for `dependabot` and `renovate/` for `renovate`. An ADR that is missing,
whose key is empty, or that names another tool, SHALL exempt nothing, and the
failure SHALL say why the branch is not exempt. Otherwise the
name SHALL be `<prefix>/<description>`, where `<prefix>` is one of
`branching.prefixes` and `<description>` is lower-case words of letters and
digits joined by single hyphens; the check SHALL exit `0` when it is, and
non-zero otherwise, naming the allowed prefixes and the form. When
`branching.prefixes` is absent, empty, or not a list, the check SHALL exit
non-zero and say it is not set. `branching.model` and `branching.merge`
SHALL NOT be checked.

#### Scenario: Conforming branch
- **WHEN** `branching.prefixes` is `[feat, fix, docs]` and the branch is `feat/schema-port`
- **THEN** the check exits `0`

#### Scenario: Prefix outside the list
- **WHEN** `branching.prefixes` is `[feat, fix, docs]` and the branch is `chore/bump`
- **THEN** the check exits non-zero and its output names `feat, fix, docs`

#### Scenario: Description not in kebab case
- **WHEN** the branch is `feat/Schema_Port`
- **THEN** the check exits non-zero

#### Scenario: Pull request in CI
- **WHEN** the checkout is detached and `GITHUB_HEAD_REF` is `fix/dead-link`
- **THEN** the check reads `fix/dead-link`

#### Scenario: Explicit branch
- **WHEN** the check runs with `--branch docs/readme`
- **THEN** it checks `docs/readme`, whatever the current branch

#### Scenario: Default branch
- **WHEN** `origin/HEAD` points to `origin/main` and the current branch is `main`
- **THEN** the check prints `ADR-0009: main is the default branch, nothing to check` and exits `0`

#### Scenario: Tool branch exempt when its tool is ruled
- **WHEN** ADR-0012 `delivery.release_tool` is `release-please` and the branch is `release-please--branches--main`
- **THEN** the check prints that it is a tool branch with nothing to check and exits `0`

#### Scenario: Release tool branch
- **WHEN** ADR-0012 `delivery.release_tool` is `release-please` and `GITHUB_HEAD_REF` is `release-please--branches--main--components--ontrack-governance`
- **THEN** the check prints that it is a tool branch with nothing to check and exits `0`

#### Scenario: Update tool branch
- **WHEN** ADR-0018 `dependencies.updater` is `dependabot` and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits `0`

#### Scenario: Tool branch refused without its ADR
- **WHEN** the repository has no ADR-0018 and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and says no ADR-0018 rules `dependencies.updater`

#### Scenario: Tool branch refused when another tool is ruled
- **WHEN** ADR-0018 `dependencies.updater` is `renovate` and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and says `dependencies.updater` is not `dependabot`

#### Scenario: Tool prefix needs its separator
- **WHEN** `branching.prefixes` is `[feat]` and the branch is `dependabot-tweaks`
- **THEN** the check exits non-zero

#### Scenario: Prefixes not set
- **WHEN** `branching.prefixes` has no value
- **THEN** the check exits non-zero and standard error says `branching.prefixes` is not set

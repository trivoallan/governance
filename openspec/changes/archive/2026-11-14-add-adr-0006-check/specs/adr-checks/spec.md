# Spec Delta

## Purpose

Defines `governance-check`, the command a governance ADR's `check:` line calls,
so that `ontrack check` can tell a consuming repository when its work departs
from a decision it ruled.

## ADDED Requirements

### Requirement: The governance-check command
governance's package SHALL expose a command `governance-check` that takes one
argument, an ADR number such as `ADR-0006`. It SHALL run from the consuming
repository's root and read that repository's copy of the ADR, the single file
matching `docs/adr/*/<number>-*.md`. When no file or more than one file
matches, or when governance ships no check for that number, it SHALL exit with
a non-zero code and say why on standard error. It MUST NOT create, modify or
delete any file in the repository.

#### Scenario: ADR found
- **WHEN** `governance-check ADR-0006` runs in a repository holding `docs/adr/trivoallan/ADR-0006-commits.md`
- **THEN** it reads the traits of that file

#### Scenario: ADR missing
- **WHEN** `governance-check ADR-0006` runs in a repository with no file matching `docs/adr/*/ADR-0006-*.md`
- **THEN** it exits non-zero and standard error names the pattern it looked for

#### Scenario: No check for that ADR
- **WHEN** `governance-check ADR-0003` runs
- **THEN** it exits non-zero and standard error says governance ships no check for ADR-0003

#### Scenario: Repository left untouched
- **WHEN** `governance-check ADR-0006` has run, whatever its result
- **THEN** `git status --porcelain` in the repository prints the same as before

### Requirement: ADR-0006 check with commitlint
When ADR-0006's `commits.tool` is `commitlint`, `governance-check ADR-0006`
SHALL run the repository's installed commitlint on the commits between
`origin/HEAD` and `HEAD`, or between `<ref>` and `HEAD` when called with
`--from <ref>`. It SHALL apply the Conventional Commits rules and the decided
scopes: when `commits.scopes` lists words, a scope outside the list is
refused; when it is `[]`, any scope is refused. It SHALL exit `0` when every
commit passes and non-zero otherwise, with commitlint's report on its output.

#### Scenario: Conforming commits
- **WHEN** `commits.scopes` is `[api, docs]` and the branch's commits are `feat(api): add x` and `docs: fix typo`
- **THEN** the check exits `0`

#### Scenario: Scope outside the list
- **WHEN** `commits.scopes` is `[api, docs]` and a branch commit is `fix(backend): y`
- **THEN** the check exits non-zero and its output names the scope rule

#### Scenario: No scope allowed
- **WHEN** `commits.scopes` is `[]` and a branch commit is `feat(api): x`
- **THEN** the check exits non-zero

#### Scenario: Other base
- **WHEN** the check runs with `--from develop`
- **THEN** only the commits between `develop` and `HEAD` are linted

#### Scenario: commitlint not installed
- **WHEN** `commits.tool` is `commitlint` and the repository has no `@commitlint/cli` or no `@commitlint/config-conventional`
- **THEN** the check exits non-zero and standard error names the missing package

### Requirement: ADR-0006 check without a tool to run
When ADR-0006's `commits.tool` is `hook` or `none`, `governance-check ADR-0006`
SHALL print one line saying that there is nothing to check and why, and exit
`0`. When `commits.tool` is absent or empty, it SHALL exit non-zero and say
that the ADR is not ruled.

#### Scenario: Tool is none
- **WHEN** `commits.tool` is `none`
- **THEN** the check prints `ADR-0006: commits.tool is none, nothing to check` and exits `0`

#### Scenario: Tool is hook
- **WHEN** `commits.tool` is `hook`
- **THEN** the check prints `ADR-0006: commits.tool is hook, nothing to check` and exits `0`

#### Scenario: Not ruled
- **WHEN** the repository's ADR-0006 has `tool:` with no value
- **THEN** the check exits non-zero and standard error says `commits.tool` is not set

# Spec Delta

## ADDED Requirements

### Requirement: Repository tools
When a check runs a tool other than commitlint, it SHALL look for it in the
repository's `node_modules/.bin` first, then on `PATH`. When the tool is
found in neither, the check SHALL exit non-zero and standard error SHALL
name the tool and the trait that asks for it. The tool's own report SHALL
reach the check's output, and the check SHALL fail when the tool exits
non-zero.

#### Scenario: Tool installed in the repository
- **WHEN** `secrets.guard` is `gitleaks` and the repository has `node_modules/.bin/gitleaks`
- **THEN** the check runs that binary

#### Scenario: Tool missing
- **WHEN** `secrets.guard` is `gitleaks` and no `gitleaks` is found
- **THEN** the check exits non-zero and standard error says `gitleaks` is not installed

### Requirement: ADR-0009 check
`governance-check ADR-0009` SHALL check one branch name. The name SHALL be
the value of `--branch <name>` when given, else `GITHUB_HEAD_REF` when it is
set and not empty, else the repository's current branch. When there is no
name, or the name is the default branch (the branch `origin/HEAD` points to,
or `main` or `master` when `origin/HEAD` is not set), the check SHALL print
that there is nothing to check and exit `0`. Otherwise the name SHALL be
`<prefix>/<description>`, where `<prefix>` is one of `branching.prefixes`
and `<description>` is lower-case words of letters and digits joined by
single hyphens; the check SHALL exit `0` when it is, and non-zero otherwise,
naming the allowed prefixes and the form. When `branching.prefixes` is
absent, empty, or not a list, the check SHALL exit non-zero and say it is not
set. `branching.model` and `branching.merge` SHALL NOT be checked.

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

#### Scenario: Prefixes not set
- **WHEN** `branching.prefixes` has no value
- **THEN** the check exits non-zero and standard error says `branching.prefixes` is not set

### Requirement: ADR-0015 check
When `secrets.guard` is `gitleaks`, `governance-check ADR-0015` SHALL run
`gitleaks git` on the commits between `origin/HEAD` and `HEAD`, or between
`<ref>` and `HEAD` with `--from <ref>`, with secrets redacted from its
report, and SHALL exit `0` when gitleaks finds no leak and non-zero
otherwise. When `secrets.guard` is `none` or another value, it SHALL print
that there is nothing to check and exit `0`. When `secrets.guard` is absent
or empty, it SHALL exit non-zero and say it is not set. `secrets.storage`
SHALL NOT be checked.

#### Scenario: No leak
- **WHEN** `secrets.guard` is `gitleaks` and the branch's commits hold no secret
- **THEN** the check exits `0`

#### Scenario: Leak in a branch commit
- **WHEN** `secrets.guard` is `gitleaks` and a commit after `origin/HEAD` adds a private key
- **THEN** the check exits non-zero and the key does not appear in its output

#### Scenario: Leak before the base
- **WHEN** the only secret is in a commit at or before `origin/HEAD`
- **THEN** the check exits `0`

#### Scenario: Guard none
- **WHEN** `secrets.guard` is `none`
- **THEN** the check prints `ADR-0015: secrets.guard is none, nothing to check` and exits `0`

### Requirement: ADR-0016 check
When `changes.framework` is `openspec`, `governance-check ADR-0016` SHALL
check three things, report each, and exit non-zero when any fails:
1. `openspec/config.yaml` (or `openspec/config.yml` when it is absent) has a
   `schema:` equal to `changes.schema`; a missing file or a different value
   fails and names both values;
2. `openspec schema validate <changes.schema>` exits `0`;
3. `openspec validate --all --no-interactive` exits `0`.

When `changes.schema` is absent or empty, the check SHALL exit non-zero and
say it is not set; when it is `none`, it SHALL exit non-zero and say that
`none` goes with `changes.framework: none`. When `changes.framework` is
`none` or another value, it SHALL print that there is nothing to check and
exit `0`. When it is absent or empty, it SHALL exit non-zero and say it is
not set.

#### Scenario: Ruled schema in use and valid
- **WHEN** `changes.schema` is `spec-driven`, `openspec/config.yaml` has `schema: spec-driven`, and both openspec commands exit `0`
- **THEN** the check exits `0`

#### Scenario: Config names another schema
- **WHEN** `changes.schema` is `spec-driven-with-adr` and `openspec/config.yaml` has `schema: spec-driven`
- **THEN** the check exits non-zero and its output names both schemas

#### Scenario: Invalid change
- **WHEN** `openspec validate --all --no-interactive` exits non-zero
- **THEN** the check exits non-zero with openspec's report in its output

#### Scenario: Framework none
- **WHEN** `changes.framework` is `none`
- **THEN** the check prints `ADR-0016: changes.framework is none, nothing to check` and exits `0`

#### Scenario: Schema none with openspec
- **WHEN** `changes.framework` is `openspec` and `changes.schema` is `none`
- **THEN** the check exits non-zero

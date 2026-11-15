# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: The governance-check command`
- TO: `### Requirement: The ontrack-engineering-check command`

## MODIFIED Requirements

### Requirement: The ontrack-engineering-check command
The package SHALL expose a command `ontrack-engineering-check` that takes one
argument, an ADR number such as `ADR-0006`. It SHALL run from the consuming
repository's root and read that repository's copy of the ADR, the single file
matching `docs/adr/*/<number>-*.md`. When no file or more than one file
matches, or when the package ships no check for that number, it SHALL exit
with a non-zero code and say why on standard error. It MUST NOT create,
modify or delete any file in the repository. Until a later change removes
it, the package SHALL also expose `governance-check` as a second name for the
same command, with the same arguments, output and exit code, so that a
`check:` line imported before the rename still runs. The other requirements
of this capability that name `governance-check` hold for both names.

#### Scenario: ADR found
- **WHEN** `ontrack-engineering-check ADR-0006` runs in a repository holding `docs/adr/trivoallan/ADR-0006-commits.md`
- **THEN** it reads the traits of that file

#### Scenario: ADR missing
- **WHEN** `ontrack-engineering-check ADR-0006` runs in a repository with no file matching `docs/adr/*/ADR-0006-*.md`
- **THEN** it exits non-zero and standard error names the pattern it looked for

#### Scenario: No check for that ADR
- **WHEN** `ontrack-engineering-check ADR-0003` runs
- **THEN** it exits non-zero and standard error says this package ships no check for ADR-0003

#### Scenario: Repository left untouched
- **WHEN** `ontrack-engineering-check ADR-0006` has run, whatever its result
- **THEN** `git status --porcelain` in the repository prints the same as before

#### Scenario: Usage names the command
- **WHEN** `ontrack-engineering-check` runs with no argument
- **THEN** it exits non-zero and standard error starts with `usage: ontrack-engineering-check <ADR number>`

#### Scenario: Old name still runs
- **WHEN** a repository's imported ADR-0009 holds `check: npx --no-install governance-check ADR-0009` and `ontrack check` runs it
- **THEN** the ADR-0009 check runs and exits as `ontrack-engineering-check ADR-0009` would

### Requirement: Shipped as JavaScript
The package SHALL ship `ontrack-engineering-check` as JavaScript that Node
22.18 or later runs from `node_modules` with no type stripping, loader or
build in the consuming repository. The installed package SHALL hold that
compiled script and no TypeScript source. It SHALL work installed from the
npm registry and installed from a git tag of the repository, with the same
behaviour as every other requirement of this capability.

#### Scenario: Installed from the npm registry
- **WHEN** the package as `npm pack` builds it is installed in a repository holding a ruled ADR-0006, and `npx --no-install ontrack-engineering-check ADR-0006` runs there
- **THEN** the check runs and reports on ADR-0006, and no `.ts` file is in the installed package

#### Scenario: Both names installed
- **WHEN** the package as `npm pack` builds it is installed
- **THEN** `node_modules/.bin/` holds `ontrack-engineering-check` and `governance-check`, both running the same script

#### Scenario: Installed from a git tag
- **WHEN** the package is installed with `npm i -D trivoallan@git+https://github.com/trivoallan/ontrack-engineering.git#<tag>` and `npx --no-install ontrack-engineering-check ADR-0006` runs
- **THEN** the check runs and reports on ADR-0006

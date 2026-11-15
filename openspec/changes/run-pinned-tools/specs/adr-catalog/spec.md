# Spec Delta

## MODIFIED Requirements

### Requirement: ADR-0025 asks where tools outside the package manager are pinned
ADR-0025 SHALL ask, through one trait `tools.manager` (`mise`, `aqua`,
`script`, `none`), how a tool outside the package manager is installed and
pinned. Its Decision SHALL fix, whatever the repository rules:
- one place holds each named tool's version and checksum;
- that place serves the workstation, the runner and an agent session;
- a tool manager is installed pinned, under ADR-0020;
- the ADR states what keeps the pins current.

It SHALL ship with `check: npx --no-install governance-check ADR-0025`, at
revision 1. Its how-to-rule block SHALL say what the check lists (the tools
that `secrets.guard` and `forge.audit` name in accepted, not superseded
ADRs), that with `mise` it fails on a tool governance knows that mise does
not find, and only notes an unforeseen one, and that with `script` or
`aqua` it lists without verifying. Its Neutral consequence SHALL say that a
tool named by a trait the check does not know, or whose binary has another
name than the value, is left to review.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0025 is read
- **THEN** it holds exactly `tools.manager`, empty, with `revision: 1`

#### Scenario: One tool
- **WHEN** a repository has a single tool outside the package manager
- **THEN** ADR-0025 says `script` can be the right answer and states its cost

#### Scenario: Same list everywhere
- **WHEN** a tool named by an accepted ADR is needed on a workstation, a runner and an agent session
- **THEN** ADR-0025's Decision requires all three to read the one place holding its version and checksum

#### Scenario: Original to governance
- **WHEN** ADR-0025's References are read
- **THEN** they say it is original to governance and hold the key table

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0025 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0025` and its `revision` is `1`

#### Scenario: Neutral consequence names what review keeps
- **WHEN** ADR-0025's Neutral consequences are read
- **THEN** they no longer say that no check verifies the pins, and they name what is left to review

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted`, at `revision: 4`, with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`) in place of SDR-0001's `MADR`, and with
`check: npx --no-install governance-check ADR-0001`. Its Consequences SHALL state
that governance is an adaptation of surdesrails meant to be imported instead
of it, and that nothing detects when an SDR it adapts changes. Its Decision
SHALL state that the freeze of a ruled body applies to a repository's
verdict, that governance revises the ADRs it ships through `revision`, and
that a `Suggested skills` line changes no `revision`. It SHALL also state that
an ADR may carry a `check:` line that `ontrack check` runs once the ADR is
`accepted`, that a `check:` line and the scripts it calls change no
`revision`, that those scripts follow governance's package version, and that
a `check:` line governance adds to an ADR a repository has already ruled
reaches that repository's copy through `ontrack plan`, which reports the ADR
`check`, and `ontrack apply`, which reports it `synced` and writes only that
line. Its rule 7 SHALL state that the schema governance ships is run by
ADR-0001's own check on every ruled copy, that it refuses a half-ruled ADR,
and that nothing is copied or installed by hand; it SHALL name no `npx`
command and no release binary. Its Revisions list SHALL hold a
`Revision 4:` entry saying rule 7 changed and that there is nothing to
re-answer.

#### Scenario: Drift is written down
- **WHEN** the Consequences of ADR-0001 are read
- **THEN** they name surdesrails and state that drift from it is detected only by reading the References source lines

#### Scenario: Revised once for the new rules
- **WHEN** a repository that imported ADR-0001 at revision 3 runs `ontrack plan` after this change
- **THEN** ADR-0001 is reported `revised` from revision 3 to 4

#### Scenario: Check rules stated
- **WHEN** ADR-0001's Decision is read
- **THEN** it names `ontrack check`, the `check:` key, says that `check:` lines and their scripts change no `revision`, and says that `ontrack apply` writes a `check:` line added after a repository ruled the ADR

#### Scenario: Rule 7 runs through the check
- **WHEN** ADR-0001's rule 7 is read
- **THEN** it says `governance-check ADR-0001` runs the schema and refuses a half-ruled ADR, and names neither `npx @jackchuka/mdschema` nor a copy of `.mdschema.yml`

## ADDED Requirements

### Requirement: ADR-0015 and ADR-0011 say where their tool comes from
The how-to-rule blocks of ADR-0015 (gitleaks) and ADR-0011 (zizmor) SHALL
say that the check never takes the tool from `node_modules/.bin`, that it
takes it from mise when ADR-0025 rules `tools.manager: mise`, and from
`PATH` otherwise, and SHALL link ADR-0025. They SHALL NOT recommend an
unpinned install (`brew`, `pipx`, `uvx` without a version). No `revision`
SHALL move.

#### Scenario: ADR-0015 points to ADR-0025
- **WHEN** ADR-0015's how-to-rule block is read
- **THEN** it says the check takes `gitleaks` from mise when ADR-0025 rules `mise`, from `PATH` otherwise, never from `node_modules/.bin`, and its `revision` is `1`

#### Scenario: ADR-0011 drops unpinned installs
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it names no `brew`, `pipx` or `uvx` install for zizmor and links ADR-0025

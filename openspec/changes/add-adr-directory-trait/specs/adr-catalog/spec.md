## MODIFIED Requirements

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted`, at `revision: 4`, with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`) in place of SDR-0001's `MADR`, and the trait
`record-architecture-decisions.directory` set to `docs/adr`. Its rule 2 SHALL
state that the ADRs a repository writes for itself live in the directory that
trait names, that governance ADRs are imported into `<directory>/trivoallan/`,
and that ontrack reads `docs/adr` until it reads the trait, so a repository
changes the value only once ontrack supports it. Its Consequences SHALL state
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
line.

#### Scenario: Drift is written down
- **WHEN** the Consequences of ADR-0001 are read
- **THEN** they name surdesrails and state that drift from it is detected only by reading the References source lines

#### Scenario: Revised once for the new rules
- **WHEN** a repository that imported ADR-0001 at revision 2 runs `ontrack plan` after this change
- **THEN** ADR-0001 is reported `revised` from revision 2 to 4

#### Scenario: Revised for the directory key
- **WHEN** a repository that imported ADR-0001 at revision 3 runs `ontrack plan` after this change
- **THEN** ADR-0001 is reported `revised` from revision 3 to 4
- **AND** its Revisions list says that the one key added ships as `docs/adr` and that there is nothing to re-answer unless the repository's ADRs live elsewhere

#### Scenario: The directory is machine-readable
- **WHEN** a workflow reads `record-architecture-decisions.directory` from a repository's `AGENTS.md` after it imported revision 4
- **THEN** it reads `docs/adr`

#### Scenario: Check rules stated
- **WHEN** ADR-0001's Decision is read
- **THEN** it names `ontrack check`, the `check:` key, says that `check:` lines and their scripts change no `revision`, and says that `ontrack apply` writes a `check:` line added after a repository ruled the ADR

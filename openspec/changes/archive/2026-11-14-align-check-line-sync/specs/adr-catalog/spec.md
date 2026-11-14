## MODIFIED Requirements

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted`, at `revision: 3`, with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`) in place of SDR-0001's `MADR`. Its Consequences SHALL state
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
- **THEN** ADR-0001 is reported `revised` from revision 2 to 3

#### Scenario: Check rules stated
- **WHEN** ADR-0001's Decision is read
- **THEN** it names `ontrack check`, the `check:` key, says that `check:` lines and their scripts change no `revision`, and says that `ontrack apply` writes a `check:` line added after a repository ruled the ADR

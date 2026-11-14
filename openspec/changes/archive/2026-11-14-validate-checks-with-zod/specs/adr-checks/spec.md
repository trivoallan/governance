# Spec Delta

## ADDED Requirements

### Requirement: Declared validation of arguments and traits
`governance-check` SHALL validate its command-line arguments, and the traits
each check reads from the ADR, against a schema declared for that boundary,
before the check acts on them. A missing ADR number, an option it does not
know, or an option given without its value SHALL make it exit non-zero, with
standard error naming the argument at fault or giving the usage line. A
trait that is absent, empty, or not of the shape the check reads (a list
where one value is expected, or one value where a list is expected) SHALL
make the check exit non-zero, with standard error naming the ADR number and
`<group>.<key>`; such a value MUST NOT be read as a default or converted to
another shape. Values that the other requirements of this capability let
pass, including unforeseen values of a wiring key, SHALL still pass.

#### Scenario: Option without its value
- **WHEN** `governance-check ADR-0006 --from` runs
- **THEN** it exits non-zero and standard error names `--from`

#### Scenario: Unknown option
- **WHEN** `governance-check ADR-0006 --form develop` runs
- **THEN** it exits non-zero and standard error names `--form`

#### Scenario: A list where one value is expected
- **WHEN** ADR-0015 has `guard: [gitleaks]` under `traits.secrets`
- **THEN** the check exits non-zero and standard error names `ADR-0015` and `secrets.guard`

#### Scenario: One value where a list is expected
- **WHEN** ADR-0006 has `scopes: api` under `traits.commits` and `tool: commitlint`
- **THEN** the check exits non-zero and standard error says `commits.scopes` is not a list

#### Scenario: Unforeseen wiring value still passes
- **WHEN** ADR-0018 has `updater: something-else` and `automerge: none`
- **THEN** the check prints that there is nothing to check for `dependencies.updater` and exits `0`

### Requirement: One runtime dependency
governance's package SHALL declare exactly one runtime dependency: the
library its own ADR-0005 rules as `validation.boundary`. Everything else the
check uses SHALL come from Node's standard library or from the consuming
repository (commitlint, gitleaks, openspec, as the other requirements say).

#### Scenario: Dependencies of the package
- **WHEN** governance's `package.json` is read after this change
- **THEN** `dependencies` holds exactly `zod`

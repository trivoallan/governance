# Spec Delta

## MODIFIED Requirements

### Requirement: Shipped ADRs
governance SHALL ship exactly these ADRs, each adapted from the named SDR
unless the table says it is original:

| ADR | slug | from | status as shipped |
|---|---|---|---|
| ADR-0001 | record-architecture-decisions | SDR-0001 | accepted |
| ADR-0002 | localization | SDR-0002 | proposed |
| ADR-0003 | architecture | SDR-0003 | proposed |
| ADR-0004 | languages | SDR-0004 | proposed |
| ADR-0005 | validation | SDR-0005 | proposed |
| ADR-0006 | commits | SDR-0006 | proposed |
| ADR-0007 | tests | SDR-0007 | proposed |
| ADR-0008 | documentation | SDR-0008 | proposed |
| ADR-0009 | branching | SDR-0009 | proposed |
| ADR-0010 | architecture-documentation | SDR-0003 (`architecture.document` only) | proposed |
| ADR-0011 | forge-and-ci | SDR-0010 | proposed |
| ADR-0012 | delivery | SDR-0011 | proposed |
| ADR-0013 | frontend | SDR-0013 | proposed |
| ADR-0014 | work-tracking | SDR-0014 | proposed |
| ADR-0015 | secrets | none (original to governance) | proposed |
| ADR-0016 | changes | none (original to governance) | proposed |
| ADR-0017 | agent-tooling | none (original to governance) | proposed |
| ADR-0018 | dependencies | none (original to governance) | proposed |
| ADR-0019 | adding-dependencies | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the nineteen files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

### Requirement: ADR-0019 asks who lets a new dependency in
ADR-0019 SHALL ask `admission.approver` (`person`, `agent`), recommending
`person`, and `admission.install_scripts` (`ignored`, `allowed`),
recommending `ignored`. Its Decision SHALL fix, whatever the repository
rules:
- the name of a new dependency comes from the package's own documentation
  or repository, and the registry entry matches that source;
- the version added was published at least three days earlier, as ADR-0018
  rule 2;
- the pull request that adds a dependency declares its name, its version,
  why it is needed, and why the standard library or a few lines of code do
  not cover it;
- that declaration states whether the package carries registry signatures
  or a provenance attestation, without requiring either;
- the lockfile is committed and CI installs from it.
It SHALL state that with `admission.approver: person` the agent asks before
installing, not at review, because installing already runs the package's
install code unless `admission.install_scripts` is `ignored`.
For each fixed rule and for `admission.install_scripts`, it SHALL give the
mechanism for npm and for Python. For Python it SHALL name uv's mechanism,
and pip's where it differs, and it SHALL state that a wheel runs no install
code while a source distribution does, and that neither uv nor pip offers
a documented exception for one package, so under `ignored` a Python
package with no wheel for the platform is not admitted. It SHALL state that in Python the
name installed is the distribution name, never the import name.

#### Scenario: Two traits
- **WHEN** the `traits:` block of ADR-0019 is read
- **THEN** it holds exactly `admission.approver` and `admission.install_scripts`

#### Scenario: Asking before installing
- **WHEN** an agent in a repository that ruled `admission.approver: person` needs a package not in its manifest
- **THEN** ADR-0019's Decision requires it to ask a person before running the install command

#### Scenario: Undeclared addition
- **WHEN** a pull request adds an entry to a dependency manifest without naming it, its version, its reason and why the standard library does not cover it
- **THEN** ADR-0019's Decision names that pull request as breaking a fixed rule

#### Scenario: Import name is not the distribution name
- **WHEN** a Python module does `import yaml` and the package is missing
- **THEN** ADR-0019's Decision requires the agent to install the distribution its documentation names, `PyYAML`, and not a package called `yaml`

#### Scenario: Install code off in a Python repository
- **WHEN** a Python repository rules `admission.install_scripts: ignored`
- **THEN** ADR-0019 shows how uv and pip refuse source distributions, and states that a package with no wheel for the platform is not admitted: the person picks another package, or the repository rules `allowed` and names the cost

#### Scenario: Provenance not required
- **WHEN** a package without a provenance attestation is admitted with its declaration
- **THEN** ADR-0019's Decision allows it

#### Scenario: Original to governance
- **WHEN** ADR-0019's References are read
- **THEN** they state that no surdesrails SDR asks this question

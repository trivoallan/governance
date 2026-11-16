## MODIFIED Requirements

### Requirement: Shipped ADRs
ontrack-engineering SHALL ship exactly these ADRs:

| ADR | slug | status as shipped |
|---|---|---|
| ADR-0001 | record-architecture-decisions | accepted |
| ADR-0002 | localization | proposed |
| ADR-0003 | architecture | proposed |
| ADR-0004 | languages | proposed |
| ADR-0005 | validation | proposed |
| ADR-0006 | commits | proposed |
| ADR-0007 | tests | proposed |
| ADR-0008 | documentation | proposed |
| ADR-0009 | branching | proposed |
| ADR-0010 | architecture-documentation | proposed |
| ADR-0011 | forge-and-ci | proposed |
| ADR-0012 | delivery | proposed |
| ADR-0013 | frontend | proposed |
| ADR-0014 | work-tracking | proposed |
| ADR-0015 | secrets | proposed |
| ADR-0016 | changes | proposed |
| ADR-0017 | agent-tooling | proposed |
| ADR-0018 | dependencies | proposed |
| ADR-0019 | vulnerabilities | proposed |
| ADR-0020 | adding-dependencies | proposed |
| ADR-0021 | build-provenance | proposed |
| ADR-0022 | review-and-merge | proposed |
| ADR-0023 | license | proposed |
| ADR-0024 | code-scanning | proposed |
| ADR-0025 | tools | proposed |
| ADR-0026 | agent-identity | proposed |

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-six files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for the name of the track these ADRs were first adapted from, or for one of its decision numbers
- **THEN** none is found

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted`, at `revision: 4`, with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`), and with
`check: npx --no-install ontrack-engineering-check ADR-0001`. Its Decision
SHALL state that the freeze of a ruled body applies to a repository's
ruling, that ontrack-engineering revises the ADRs it ships through `revision`, and
that a `Suggested skills` line changes no `revision`. It SHALL also state that
an ADR may carry a `check:` line that `ontrack check` runs once the ADR is
`accepted`, that a `check:` line and the scripts it calls change no
`revision`, that those scripts follow ontrack-engineering's package version, and that
a `check:` line ontrack-engineering adds to an ADR a repository has already ruled
reaches that repository's copy through `ontrack plan`, which reports the ADR
`check`, and `ontrack apply`, which reports it `synced` and writes only that
line. Its rule 7 SHALL state that the schema ontrack-engineering ships is run by
ADR-0001's own check on every ruled copy, that it refuses a half-ruled ADR,
and that nothing is copied or installed by hand; it SHALL name no `npx`
command and no release binary. Its Revisions list SHALL hold a
`Revision 4:` entry saying rule 7 changed and that there is nothing to
rule on again.

#### Scenario: Drift is written down
- **WHEN** the Consequences of ADR-0001 are read
- **THEN** they name no other track and no source line

#### Scenario: Revised once for the new rules
- **WHEN** a repository that imported ADR-0001 at revision 3 runs `ontrack plan` after this change
- **THEN** ADR-0001 is reported `revised` from revision 3 to 4

#### Scenario: Check rules stated
- **WHEN** ADR-0001's Decision is read
- **THEN** it names `ontrack check`, the `check:` key, says that `check:` lines and their scripts change no `revision`, and says that `ontrack apply` writes a `check:` line added after a repository ruled the ADR

#### Scenario: Rule 7 runs through the check
- **WHEN** ADR-0001's rule 7 is read
- **THEN** it says `ontrack-engineering-check ADR-0001` runs the schema and refuses a half-ruled ADR, and names neither `npx @jackchuka/mdschema` nor a copy of `.mdschema.yml`

### Requirement: Traits carried over unchanged
ADR-0002, ADR-0005, ADR-0006, ADR-0007 and ADR-0009 SHALL ask
these traits, with enum values in English:

| ADR | traits |
|---|---|
| ADR-0002 | `localization.language.default`, `documentation`, `commits`, `code`, `comments` |
| ADR-0005 | `validation.boundary`, `validation.data_files` |
| ADR-0006 | `commits.scopes`, `commits.tool` |
| ADR-0007 | `tests.coverage_target` |
| ADR-0009 | `branching.model`, `branching.merge`, `branching.prefixes` |

#### Scenario: Same keys as the source
- **WHEN** the `traits:` block of ADR-0006 is read
- **THEN** it has the keys `commits.scopes` and `commits.tool`

#### Scenario: Enum values in English
- **WHEN** the enum of `localization.language.default` in ADR-0002 is read
- **THEN** its values are `french` and `english`

### Requirement: Adapted traits
The remaining ADRs among ADR-0003 to ADR-0014 SHALL ask their traits as follows:
- ADR-0003 SHALL ask `architecture.pattern` only, recommending `hexagonal`.
- ADR-0010 SHALL ask `architecture.document` (`arc42`, `elsewhere`, `none`),
  recommending `arc42` as a `docs/architecture/arc42/` directory with one
  file per section, and `architecture.model` (a named architecture-as-code
  tool or `none`), recommending `likec4` in `docs/architecture/model/`, and
  `architecture.diagrams` (`mermaid`, `plantuml`, `none`) for diagrams the
  model does not cover, recommending `mermaid`. It SHALL NOT point to a template, since ontrack-engineering ships none.
- ADR-0004 SHALL ask `languages.main.name`, recommending Python or
  TypeScript, without reasoning that relies on a team's existing skills.
- ADR-0008 SHALL ask `docs.tool`, `docs.root` and `docs.audience`,
  recommending `starlight` (with its `docs` collection pointed at `docs/`)
  and `public`, with a `docs.tool` enum of `starlight`, `docusaurus`,
  `mkdocs` and `none`, and an
  `audience` enum of `single-user`, `team` and `public`.
- ADR-0011 SHALL assume GitHub as the forge, SHALL NOT ask `forge.vendor`,
  and SHALL ask `forge.gate` and, from revision 2, `forge.audit`.
- ADR-0012 SHALL ask `delivery.target` (`container`, `platform`, `package`,
  `none`), plus `delivery.environments`,
  `delivery.release_tool` (recommended `release-please`), `delivery.registry`
  and `deployment.manifests`.
- ADR-0013 SHALL ask `frontend.framework` as a free string, recommending
  `astro`, with no WCS theme trait.
- ADR-0014 SHALL ask `tracking.tool` (`github-issues`, `linear`, `jira`,
  `none`), recommending `github-issues`, and `tracking.project`, not a Jira
  project key, and SHALL place its `Issue served` line in the first
  artefact of a change as ADR-0016 defines it.
- ADR-0016 SHALL ask `changes.framework` (`openspec`, `none`), recommending
  `openspec`, and `changes.schema` (a name `openspec schema validate`
  accepts, or `none`), recommending `spec-driven-with-adr` copied and
  adjusted so that its ADRs follow ADR-0001.

#### Scenario: Architecture split in two
- **WHEN** the `traits:` blocks of ADR-0003 and ADR-0010 are read
- **THEN** ADR-0003 has only `architecture.pattern` and ADR-0010 has `architecture.document`, `architecture.model` and `architecture.diagrams`

#### Scenario: No enterprise vocabulary
- **WHEN** the shipped ADRs are searched for `gitlab`, `aresis`, `wcs`, `caas` or `paas` as trait keys or enum values
- **THEN** none is found

#### Scenario: GitHub assumed
- **WHEN** the `traits:` block of ADR-0011 is read
- **THEN** it contains `forge.gate` and `forge.audit`, and no `forge.vendor`

### Requirement: ADR-0018 asks what keeps dependencies current
ADR-0018 SHALL ask `dependencies.updater` (`dependabot`, `renovate`,
`none`), recommending `dependabot`, and `dependencies.automerge` (`none`,
`patch`, `minor`), recommending `patch`. Its Decision SHALL fix, whatever
the repository rules:
- automerge other than `none` requires `forge.gate: blocking` (ADR-0011);
- no update is proposed before a cooldown of at least three days after its
  release;
- updates to GitHub Actions are never merged automatically;
- major updates are always reviewed by a person;
- the ecosystems watched follow from tracked files, and an ecosystem no
  file justifies is not configured.
It SHALL state that Dependabot does not merge by itself, and that the
workflow that merges its pull requests obeys ADR-0011's rules.

#### Scenario: Two traits
- **WHEN** the `traits:` block of ADR-0018 is read
- **THEN** it holds exactly `dependencies.updater` and `dependencies.automerge`

#### Scenario: Automerge without a blocking gate
- **WHEN** a repository rules `dependencies.automerge: patch` while its ADR-0011 rules `forge.gate: informative`
- **THEN** ADR-0018's Decision names that combination as forbidden

#### Scenario: Actions excluded from automerge
- **WHEN** a repository that ruled `dependencies.automerge: patch` receives a patch update of a SHA-pinned action
- **THEN** ADR-0018's Decision requires a person to merge it

#### Scenario: Original to ontrack-engineering
- **WHEN** ADR-0018's References are read
- **THEN** they state that the ADR is original to ontrack-engineering

### Requirement: ADR-0019 asks what a release contains and what blocks on its vulnerabilities
ADR-0019 SHALL ask `vulnerabilities.sbom` (`cyclonedx`, `spdx`, `none`),
recommending `cyclonedx`, `vulnerabilities.scanner` (a tool name or
`none`), recommending `grype`, and `vulnerabilities.fail_on` (`critical`,
`high`, `medium`, `low`, `none`), recommending `critical`. Its Decision
SHALL fix, whatever the repository rules:
- `fail_on` other than `none` requires `forge.gate: blocking` (ADR-0011);
- the scan runs on every pull request and on a schedule, at least weekly;
- only a vulnerability with a fixed version fails the check;
- an agent never silences a finding by an ignore rule, a lower threshold or
  a removed job; an ignore rule it proposes is approved or merged by a
  person, as ADR-0022's `review.by` says;
- every ignore rule names one vulnerability and gives a reason;
- the SBOM is built by the release job from what is released and published
  with the release.
ADR-0011's stage table SHALL list a `scan` stage conditioned on
`vulnerabilities.scanner`, without a change to ADR-0011's `revision`.
ADR-0019's `revision` SHALL NOT change for the reference to `review.by`.

#### Scenario: Three traits
- **WHEN** the `traits:` block of ADR-0019 is read
- **THEN** it holds exactly `vulnerabilities.sbom`, `vulnerabilities.scanner` and `vulnerabilities.fail_on`

#### Scenario: Blocking scan without a blocking gate
- **WHEN** a repository rules `vulnerabilities.fail_on: critical` while its ADR-0011 rules `forge.gate: informative`
- **THEN** ADR-0019's Decision names that combination as forbidden

#### Scenario: Agent meets a red scan
- **WHEN** an agent's change fails the scan on a vulnerability with no fixed version
- **THEN** ADR-0019's Decision lets it only propose an ignore rule with a reason, for a person to approve or merge as ADR-0022's `review.by` says

#### Scenario: Scan stage exists
- **WHEN** ADR-0011's stage table is read
- **THEN** it has a `scan` row conditioned on `vulnerabilities.scanner` and its `revision` is `1`

#### Scenario: Original to ontrack-engineering
- **WHEN** ADR-0019's References are read
- **THEN** they state that the ADR is original to ontrack-engineering

### Requirement: ADR-0020 asks who lets a new dependency in
ADR-0020 SHALL ask `admission.approver` (`person`, `agent`), recommending
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
- **WHEN** the `traits:` block of ADR-0020 is read
- **THEN** it holds exactly `admission.approver` and `admission.install_scripts`

#### Scenario: Asking before installing
- **WHEN** an agent in a repository that ruled `admission.approver: person` needs a package not in its manifest
- **THEN** ADR-0020's Decision requires it to ask a person before running the install command

#### Scenario: Undeclared addition
- **WHEN** a pull request adds an entry to a dependency manifest without naming it, its version, its reason and why the standard library does not cover it
- **THEN** ADR-0020's Decision names that pull request as breaking a fixed rule

#### Scenario: Import name is not the distribution name
- **WHEN** a Python module does `import yaml` and the package is missing
- **THEN** ADR-0020's Decision requires the agent to install the distribution its documentation names, `PyYAML`, and not a package called `yaml`

#### Scenario: Install code off in a Python repository
- **WHEN** a Python repository rules `admission.install_scripts: ignored`
- **THEN** ADR-0020 shows how uv and pip refuse source distributions, and states that a package with no wheel for the platform is not admitted: the person picks another package, or the repository rules `allowed` and names the cost

#### Scenario: Provenance not required
- **WHEN** a package without a provenance attestation is admitted with its declaration
- **THEN** ADR-0020's Decision allows it

#### Scenario: Original to ontrack-engineering
- **WHEN** ADR-0020's References are read
- **THEN** they state that the ADR is original to ontrack-engineering

### Requirement: ADR-0021 asks what proves where an artifact was built
ADR-0021 SHALL ask `supply_chain.build_level` (`0`, `1`, `2`, `3`), the SLSA
v1.x Build track level of the repository's published artifacts,
recommending `2`: a provenance signed by the hosted build platform
(`actions/attest-build-provenance`, `npm publish --provenance`, or PyPI
Trusted Publishing with PEP 740 attestations). Its Decision SHALL fix,
whatever the repository rules:
- the key applies when ADR-0012's `delivery.target` is `package` or
  `container`, whatever `delivery.release_tool` says; otherwise the ADR is
  ruled `rejected`;
- a provenance is worth only its verification, and the ADR names the
  consumer-side commands (`npm audit signatures`, `gh attestation verify`,
  and `pypi-attestations verify pypi` as a manual step for Python, which no
  installer verifies) and ADR-0020's admission rule;
- the recommendation states level `2`'s precondition on a private
  repository (npm provenance needs a public source repository, GitHub
  attestations need GitHub Enterprise Cloud);
- the provenance is produced by the publishing workflow, under ADR-0011's
  rules, never on a workstation.
Its Alternatives Considered SHALL state the cost of level `3`.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0021 is read
- **THEN** it holds exactly `supply_chain.build_level`

#### Scenario: A repository that publishes nothing
- **WHEN** a repository's ADR-0012 rules `delivery.target: none`
- **THEN** ADR-0021's Decision tells it to rule ADR-0021 `rejected`

#### Scenario: A repository that publishes by hand
- **WHEN** a repository's ADR-0012 rules `delivery.target: package` and `delivery.release_tool: manual`
- **THEN** ADR-0021's Decision says the key applies to it

#### Scenario: Verification is named
- **WHEN** ADR-0021's Decision is read
- **THEN** it names `npm audit signatures`, `gh attestation verify`, `pypi-attestations verify pypi` and ADR-0020

#### Scenario: Private repository precondition
- **WHEN** ADR-0021's recommendation and Negative consequences are read
- **THEN** they state that npm provenance needs a public source repository and GitHub attestations on a private repository need GitHub Enterprise Cloud

#### Scenario: Level 3 has a cost
- **WHEN** ADR-0021's Alternatives Considered are read
- **THEN** level `3` is listed with an isolated builder and the cost it adds

#### Scenario: Original to ontrack-engineering
- **WHEN** ADR-0021's References are read
- **THEN** they state that the ADR is original to ontrack-engineering

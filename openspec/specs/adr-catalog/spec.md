# adr-catalog Specification

## Purpose
Lists the questions governance ships to consuming repositories, the
surdesrails question each one adapts, and the traits each one asks for.

## Requirements

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
| ADR-0019 | vulnerabilities | none (original to governance) | proposed |
| ADR-0020 | adding-dependencies | none (original to governance) | proposed |
| ADR-0021 | build-provenance | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-one files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

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

### Requirement: Traits carried over unchanged
ADR-0002, ADR-0005, ADR-0006, ADR-0007 and ADR-0009 SHALL ask the
same traits as their SDR, with the same keys and the same enum values
translated to English (for example `français` becomes `french`):

| ADR | traits |
|---|---|
| ADR-0002 | `localization.language.default`, `documentation`, `commits`, `code`, `comments` |
| ADR-0005 | `validation.boundary`, `validation.data_files` |
| ADR-0006 | `commits.scopes`, `commits.tool` |
| ADR-0007 | `tests.coverage_target` |
| ADR-0009 | `branching.model`, `branching.merge`, `branching.prefixes` |

#### Scenario: Same keys as the source
- **WHEN** the `traits:` block of ADR-0006 is compared with SDR-0006 revision 1
- **THEN** it has the same keys, `commits.scopes` and `commits.tool`

#### Scenario: Enum values in English
- **WHEN** the enum of `localization.language.default` in ADR-0002 is read
- **THEN** its values are `french` and `english`

### Requirement: Adapted traits
The remaining ADRs SHALL adapt their SDR's traits as follows:
- ADR-0003 SHALL ask `architecture.pattern` only, recommending `hexagonal`.
- ADR-0010 SHALL ask `architecture.document` (`arc42`, `elsewhere`, `none`),
  recommending `arc42` as a `docs/architecture/arc42/` directory with one
  file per section, and `architecture.model` (a named architecture-as-code
  tool or `none`), recommending `likec4` in `docs/architecture/model/`, and
  `architecture.diagrams` (`mermaid`, `plantuml`, `none`) for diagrams the
  model does not cover, recommending `mermaid`. It SHALL NOT point to a template, since governance ships none.
- ADR-0004 SHALL ask `languages.main.name`, recommending Python or
  TypeScript, without reasoning that relies on a team's existing skills.
- ADR-0008 SHALL ask `docs.tool`, `docs.root` and `docs.audience`,
  recommending `starlight` (with its `docs` collection pointed at `docs/`)
  and `public`, with a `docs.tool` enum of `starlight`, `docusaurus`,
  `mkdocs` and `none`, and an
  `audience` enum of `single-user`, `team` and `public`: SDR-0008's
  scale translated, without the enterprise-only steps `LS` and `groupe`.
- ADR-0011 SHALL assume GitHub as the forge, SHALL NOT ask `forge.vendor`,
  and SHALL ask `forge.gate`.
- ADR-0012 SHALL ask `delivery.target` (`container`, `platform`, `package`,
  `none`) in place of SDR-0011's `hosting.offer`, plus `delivery.environments`,
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
- **THEN** it contains `forge.gate` and no `forge.vendor`

### Requirement: ADR-0017 asks which agent host the repository uses
ADR-0017 SHALL ask `agent.host` (`claude-code`, `none`), recommending
`claude-code`. Its Decision SHALL fix, for every repository that rules
`claude-code`:
- skills arrive as plugins from the repository's own marketplace,
  `marketplace/.claude-plugin/marketplace.json`, named distinctly from any
  upstream marketplace, declared in `.claude/settings.json` through
  `extraKnownMarketplaces` (a `directory` source) and `enabledPlugins`;
- every entry of that marketplace pins its plugin to a full commit SHA in
  `sha`, and no third-party marketplace is enabled directly;
- a skill no marketplace publishes is copied into `.claude/skills/<name>/`
  at a tag, checked against a hash, and reviewed in the pull request,
  including its `allowed-tools`;
- an unpinned source, a `package.json` key and `npx -y` are forbidden;
- skills listed by an OpenSpec schema are installed only on explicit
  request, as ADR-0016 rule 3 says.
The list of plugins SHALL live in the repository's marketplace and
`.claude/settings.json`, not in a trait.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0017 is read
- **THEN** it holds only `agent.host`

#### Scenario: Pinned entries
- **WHEN** a repository has ruled ADR-0017 `accepted` with `agent.host: claude-code`
- **THEN** every plugin entry in its `marketplace/.claude-plugin/marketplace.json` has a `sha` of 40 lowercase hexadecimal characters, and every marketplace in `extraKnownMarketplaces` is a `directory` source inside the repository

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

#### Scenario: Original to governance
- **WHEN** ADR-0018's References are read
- **THEN** they state that no surdesrails SDR asks this question

### Requirement: ADR-0006 ships its check
ADR-0006 SHALL ship with a `check:` line calling `governance-check ADR-0006`,
at `revision: 1`. Its how-to-rule block SHALL say that the line runs once the
ADR is `accepted`, what it does for each `commits.tool` value, that
`commitlint` requires `@commitlint/cli` and `@commitlint/config-conventional`
in the repository, and that `--from <ref>` may be appended when the base is not
`origin/HEAD`.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0006 is read straight from governance after this change
- **THEN** it holds the `check:` line and its `revision` is `1`

#### Scenario: How-to-rule explains the check
- **WHEN** ADR-0006's how-to-rule block is read
- **THEN** it names what the check does for `commitlint`, `hook` and `none`

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
  a removed job; an ignore rule it proposes is merged by a person;
- every ignore rule names one vulnerability and gives a reason;
- the SBOM is built by the release job from what is released and published
  with the release.
ADR-0011's stage table SHALL list a `scan` stage conditioned on
`vulnerabilities.scanner`, without a change to ADR-0011's `revision`.

#### Scenario: Three traits
- **WHEN** the `traits:` block of ADR-0019 is read
- **THEN** it holds exactly `vulnerabilities.sbom`, `vulnerabilities.scanner` and `vulnerabilities.fail_on`

#### Scenario: Blocking scan without a blocking gate
- **WHEN** a repository rules `vulnerabilities.fail_on: critical` while its ADR-0011 rules `forge.gate: informative`
- **THEN** ADR-0019's Decision names that combination as forbidden

#### Scenario: Agent meets a red scan
- **WHEN** an agent's change fails the scan on a vulnerability with no fixed version
- **THEN** ADR-0019's Decision lets it only propose an ignore rule with a reason, for a person to merge

#### Scenario: Scan stage exists
- **WHEN** ADR-0011's stage table is read
- **THEN** it has a `scan` row conditioned on `vulnerabilities.scanner` and its `revision` is `1`

#### Scenario: Original to governance
- **WHEN** ADR-0019's References are read
- **THEN** they state that no surdesrails SDR asks this question

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

#### Scenario: Original to governance
- **WHEN** ADR-0020's References are read
- **THEN** they state that no surdesrails SDR asks this question

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

#### Scenario: Original to governance
- **WHEN** ADR-0021's References are read
- **THEN** they state that no surdesrails SDR asks this question

### Requirement: Wiring ADRs ship their check
ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018 and ADR-0021 SHALL
each ship with `check: npx --no-install governance-check <number>`, at their
current `revision`. Each how-to-rule block SHALL say that the line runs once
the ADR is `accepted`, which files the check looks for, that it checks
presence only, and that a value it has no row for passes with "nothing to
check". ADR-0011's SHALL add that the check does not verify the ruleset that
makes the pipeline required.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0018 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0018` and its `revision` is `1`

#### Scenario: How-to-rule names the files
- **WHEN** ADR-0018's how-to-rule block is read
- **THEN** it names `.github/dependabot.yml` for `dependabot` and says that `none` has nothing to check

#### Scenario: Gate ceiling stated
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it says the ruleset is not verified

### Requirement: ADR-0009, ADR-0015 and ADR-0016 ship their check
ADR-0009, ADR-0015 and ADR-0016 SHALL each ship with
`check: npx --no-install governance-check <number>`, at their current
`revision`. Each how-to-rule block SHALL say that the line runs once the ADR
is `accepted`, what the check runs for each value, which tool it needs
installed, and what it does not check: for ADR-0009, `branching.model` and
`branching.merge`, that a tool branch (`release-please--…`, `releaser-pleaser--…`,
`dependabot/…`, `renovate/…`) has nothing to check only when ADR-0012 or ADR-0018
names its tool, so ADR-0012 and ADR-0018 are to be ruled with or before it, and that
`--branch <name>` may be appended; for ADR-0015, `secrets.storage`, that
`--from <ref>` may be appended, and that a local hook skipped with
`--no-verify` is what this check catches in CI; for ADR-0016, that it also
runs `openspec validate --all`.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0015 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0015` and its `revision` is `1`

#### Scenario: How-to-rule names the tool
- **WHEN** ADR-0015's how-to-rule block is read
- **THEN** it says the check runs `gitleaks` on the branch's commits and that `gitleaks` must be installed where it runs

#### Scenario: Unchecked keys named
- **WHEN** ADR-0009's how-to-rule block is read
- **THEN** it says `branching.model` and `branching.merge` are not checked

#### Scenario: Tool branches named
- **WHEN** ADR-0009's how-to-rule block is read
- **THEN** it says a branch starting with `release-please--`, `releaser-pleaser--`, `dependabot/` or `renovate/` has nothing to check only when ADR-0012 `delivery.release_tool` or ADR-0018 `dependencies.updater` names that tool, tells the reader to rule those ADRs with or before it, and its `revision` is unchanged

### Requirement: ADR-0012 asks what accompanies a version
ADR-0012 SHALL ask `delivery.release_notes`, with the values `changelog`,
`highlights` and `none`, and SHALL recommend `highlights`. `changelog` SHALL
mean the generated changelog alone. `highlights` SHALL mean the changelog
plus a short text for readers that heads the release's notes on the forge;
a release SHALL NOT be finished until that text is written. `none` SHALL
mean there are no versions, and SHALL be the answer when
`delivery.release_tool` is `none`. The highlights SHALL name every ADR the
release revises, where the repository ships ADRs. ADR-0012's References
SHALL name `deliver-release-notes` from `pm-skills@product-on-purpose` on
its Suggested skills line. Adding the key SHALL raise ADR-0012 to revision
3.

#### Scenario: Key shipped unanswered
- **WHEN** ADR-0012 is read straight from governance
- **THEN** its `traits:` block holds `delivery.release_notes` with no value, and its `revision` is 3

#### Scenario: Recommendation is reasoned
- **WHEN** ADR-0012's Decision section is read
- **THEN** it recommends `highlights` and says the changelog lists commits for whoever maintains the repository while the highlights tell a consumer what the release brings and what they must do

#### Scenario: No versions
- **WHEN** a repository rules `delivery.release_tool: none`
- **THEN** ADR-0012 tells it to rule `delivery.release_notes: none`

#### Scenario: Suggested skill
- **WHEN** ADR-0012's References are read
- **THEN** its Suggested skills line names `deliver-release-notes` from `pm-skills@product-on-purpose`

### Requirement: ADR-0012 states the definition of done of a change
ADR-0012 SHALL state, without a key, that the last tasks of any change are
that its pipeline passes on the pull request once a pipeline file exists, and
that the same pull request updates the documentation the change makes false.
It SHALL say that what a check can verify belongs in a check, and that
review covers the rest. It SHALL place no task at the release itself
except the highlights, when `delivery.release_notes` is `highlights`.
ADR-0012's Suggested skills line SHALL also name
`verification-before-completion` from `superpowers@superpowers-marketplace`.

#### Scenario: Behaviour change without documentation
- **WHEN** an agent finishes a change that alters what a page of the repository's documentation describes
- **THEN** ADR-0012 tells it to update that page in the same pull request, not in a later one or at release time

#### Scenario: Nothing to do at release with `changelog`
- **WHEN** a repository rules `delivery.release_notes: changelog`
- **THEN** ADR-0012 asks for no act when a release is made

#### Scenario: Skill for the definition of done
- **WHEN** ADR-0012's References are read
- **THEN** its Suggested skills line names `verification-before-completion` from `superpowers@superpowers-marketplace`

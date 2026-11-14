# readme Specification

## Purpose

Makes governance's README a public showcase that tells a visitor what
importing the source gains them. It keeps every claim the README makes
about the shipped ADRs and their checks true, and leaves contributor setup
to CONTRIBUTING.md.

## Requirements

### Requirement: README opens with the pitch and its scope
`README.md` SHALL open, under its title, with this bold line: "Opinionated
ADRs you import, overrule where you disagree, and check in CI." The next
sentence SHALL limit the scope to Python or TypeScript repositories on
GitHub and state how many ADRs ship and how many come with a check. One
sentence SHALL then say that governance is an ontrack source, an npm package
of ADRs that a repository imports and rules on. The author SHALL speak in
the first person. The README SHALL NOT mention surdesrails.

#### Scenario: A visitor reads the first screen
- **WHEN** a visitor opens the README on GitHub or npm
- **THEN** the first lines hold the pitch, the Python or TypeScript and GitHub scope, the ADR and check counts, and what an ontrack source is

#### Scenario: No mention of surdesrails
- **WHEN** the README is searched for "surdesrails", in any case
- **THEN** there is no match

### Requirement: README says what each domain gains and what is verified
The README SHALL hold a table with one row for each of these domains:
Workflow, Delivery, Supply chain, Architecture, Code, Decisions & docs,
Agents. Each row SHALL say what a repository gains and what
`governance-check` verifies for that domain. It SHALL state as verified only
what `governance-check` actually checks, and SHALL say plainly when nothing
is checked. The Architecture row SHALL link to arc42, C4 and LikeC4. The
Agents row SHALL say that ontrack writes the accepted rules into a managed
block of `AGENTS.md`. After the table, the README SHALL state that checks
confirm the wiring is present but not that it is right, and that a
repository may reject any question that does not fit it.

#### Scenario: A domain with no check
- **WHEN** the Code row is read
- **THEN** it names no check, and says that nothing is verified

#### Scenario: A verified claim
- **WHEN** a row says `governance-check` verifies something
- **THEN** `governance-check` has a check, run against that domain's ADRs, that verifies it

### Requirement: Every shipped ADR is reachable from the README
The README SHALL link to every ADR file under `adr/`, each by its number and
title.

#### Scenario: All ADRs linked
- **WHEN** the README's links are compared to the files under `adr/`
- **THEN** every `adr/ADR-*.md` file has a link in the README, and every link it has to `adr/ADR-*.md` resolves to an existing file

### Requirement: README says what is not covered
The README SHALL have a "Not covered" section listing what governance decides
nothing about. Each item SHALL be either an exclusion that a shipped ADR
states, linked to that ADR, or a topic that no shipped ADR addresses. The
section SHALL NOT promise that a topic will be covered later.

#### Scenario: An item from an ADR's exclusion
- **WHEN** the section lists static analysis of your own code or licence compliance
- **THEN** the item links to ADR-0019, which states both as not concerned

#### Scenario: A topic an ADR covers
- **WHEN** a topic has a shipped ADR that decides it
- **THEN** the section does not list it

### Requirement: README shows one ADR excerpt
The README SHALL show a short excerpt of one shipped ADR: its question, its
recommended answer and its `traits:` block. The excerpt SHALL be taken from
an ADR whose recommendation names no programming language.

#### Scenario: A Python visitor reads the excerpt
- **WHEN** a visitor who works in Python reads the excerpt
- **THEN** it names no TypeScript-only or Python-only tool

### Requirement: Installation defers to ontrack's documentation
The README SHALL give only governance's own install command,
`npm i -D trivoallan@npm:@trivoallan/ontrack-governance`, and SHALL point to
`npm audit signatures` for checking how the package was built. It SHALL link
to ontrack's documentation for installing ontrack and for its lifecycle
(`plan`, `apply`, `revision`, `check`), and SHALL NOT restate that lifecycle
or ontrack's own install command.

#### Scenario: A visitor installs
- **WHEN** a visitor follows the install section
- **THEN** they find governance's command, `npm audit signatures`, and a link to ontrack's documentation, and no ontrack install command

### Requirement: README shows the source in use
The README SHALL point to ontrack as a repository that imports this source.
It SHALL link to its `docs/adr/trivoallan/` directory, to its `AGENTS.md`,
and to its `docs/architecture/` directory.

#### Scenario: A visitor wants a real example
- **WHEN** a visitor looks for a repository that uses governance
- **THEN** the README links to ontrack's imported ADRs, its `AGENTS.md` and its architecture documentation

### Requirement: Contributor setup lives in CONTRIBUTING.md
`CONTRIBUTING.md` SHALL hold how to work on governance: installing the
Claude Code plugins from the repository's marketplace, the departure for
`claude-security`, turning off upstream copies of a plugin, and the
gitleaks pre-commit hook with how it is installed and what a refused commit
means. The README SHALL link to `CONTRIBUTING.md` and SHALL NOT repeat any
of it.

#### Scenario: A contributor sets up a clone
- **WHEN** a contributor opens `CONTRIBUTING.md`
- **THEN** they find the plugin install commands and the secret guard instructions that the README used to hold

### Requirement: README counts and links are tested
`npm test` SHALL fail when the number of ADRs the README states, or the
number of checks it states, differs from the files under `adr/`. An ADR
counts as checked when it has a `check:` line in its frontmatter. `npm test`
SHALL also fail when an ADR file has no link from the README.

#### Scenario: A check line is added
- **WHEN** an ADR gains a `check:` line in its frontmatter and the README still states the old count
- **THEN** `npm test` exits non-zero and names both counts

#### Scenario: An example check line in a body
- **WHEN** an ADR has a `check:` line in its body but none in its frontmatter
- **THEN** that ADR does not count as checked

#### Scenario: An ADR is added
- **WHEN** a new `adr/ADR-*.md` file has no link from the README
- **THEN** `npm test` exits non-zero and names the file

### Requirement: Package keywords describe the source
`package.json` SHALL list these `keywords`: `ontrack-source`, `adr`,
`ontrack`, `supply-chain`, `slsa`, `ci`, `coding-agents`.

#### Scenario: Searching npm
- **WHEN** the published package's metadata is read
- **THEN** its keywords include `ontrack-source` and the six others

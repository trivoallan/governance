# Spec Delta

## MODIFIED Requirements

### Requirement: README opens with the pitch and its scope
`README.md` SHALL be titled with the package name,
`@trivoallan/ontrack-engineering`, and SHALL open, under its title, with
this bold line: "Stop copying your conventions from repo to repo." The next
paragraph SHALL limit the scope to Python or TypeScript repositories on
GitHub, state how many decisions ship and how many come with a check, and
say that a changed decision reaches every importing repository. One
sentence SHALL then say that governance is an ontrack track, an npm package
of ADRs that a repository imports and rules on. The README SHALL NOT
mention surdesrails.

#### Scenario: A visitor reads the first screen
- **WHEN** a visitor opens the README on GitHub or npm
- **THEN** the first lines hold the package name, the pitch, the Python or TypeScript and GitHub scope, the decision and check counts, and what an ontrack track is

#### Scenario: No mention of surdesrails
- **WHEN** the README is searched for "surdesrails", in any case
- **THEN** there is no match

### Requirement: README says what each domain gains and what is verified
The README SHALL hold a table with one row for each of these domains, in
this alphabetical order: Agents, Architecture, Code, Decisions & docs,
Delivery, Supply chain, Workflow. Each row SHALL say what a repository
gains and what `governance-check` verifies for that domain. It SHALL state
as verified only what `governance-check` actually checks, and SHALL say
plainly when nothing is checked. The Architecture row SHALL link to arc42,
C4 and LikeC4. The Agents row SHALL say that ontrack writes the accepted
rules into a managed block of `AGENTS.md`. After the table, the README
SHALL state that checks confirm the wiring is present but not that it is
right, and that a repository may reject any question that does not fit it.

#### Scenario: A domain with no check
- **WHEN** no ADR of a row's domain has a check
- **THEN** the row names no check, and says that nothing is verified

#### Scenario: Code row
- **WHEN** the Code row is read
- **THEN** it says that a scan workflow sending its SARIF to code scanning or to an artifact is verified, and that the threshold is not

#### Scenario: A verified claim
- **WHEN** a row says `governance-check` verifies something
- **THEN** `governance-check` has a check, run against that domain's ADRs, that verifies it

#### Scenario: Row order
- **WHEN** the table's rows are read from top to bottom
- **THEN** their domains are in alphabetical order

### Requirement: Installation defers to ontrack's documentation
The README SHALL give only governance's own install command,
`npm i -D trivoallan@npm:@trivoallan/ontrack-engineering`, and SHALL point
to `npm audit signatures` for checking how the package was built. It SHALL
link to ontrack's documentation for installing ontrack and for its
lifecycle (`plan`, `apply`, `revision`, `check`), and SHALL NOT restate
that lifecycle or ontrack's own install command.

#### Scenario: A visitor installs
- **WHEN** a visitor follows the install section
- **THEN** they find governance's command, `npm audit signatures`, and a link to ontrack's documentation, and no ontrack install command

### Requirement: README counts and links are tested
`npm test` SHALL fail when the number of decisions the README states, or
the number of checks it states, differs from the files under `adr/`. An ADR
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

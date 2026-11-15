# Spec Delta

## MODIFIED Requirements

### Requirement: ADR-0006 ships its check
ADR-0006 SHALL ship with a `check:` line calling `ontrack-engineering-check ADR-0006`,
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

### Requirement: Wiring ADRs ship their check
ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018, ADR-0021 and
ADR-0024 SHALL
each ship with `check: npx --no-install ontrack-engineering-check <number>`, at their
current `revision`. Each how-to-rule block SHALL say that the line runs once
the ADR is `accepted`, which files the check looks for, that it checks
presence only, and that a value it has no row for passes with "nothing to
check". ADR-0011's SHALL add that the check does not verify the ruleset that
makes the pipeline required, and, from revision 2, that with
`forge.audit: zizmor` the check also runs zizmor on the workflows, so for
that key it checks content, not presence.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0018 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install ontrack-engineering-check ADR-0018` and its `revision` is `1`

#### Scenario: How-to-rule names the files
- **WHEN** ADR-0018's how-to-rule block is read
- **THEN** it names `.github/dependabot.yml` for `dependabot` and says that `none` has nothing to check

#### Scenario: Gate ceiling stated
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it says the ruleset is not verified

### Requirement: ADR-0009, ADR-0015 and ADR-0016 ship their check
ADR-0009, ADR-0015 and ADR-0016 SHALL each ship with
`check: npx --no-install ontrack-engineering-check <number>`, at their current
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
- **THEN** it holds `check: npx --no-install ontrack-engineering-check ADR-0015` and its `revision` is `1`

#### Scenario: How-to-rule names the tool
- **WHEN** ADR-0015's how-to-rule block is read
- **THEN** it says the check runs `gitleaks` on the branch's commits and that `gitleaks` must be installed where it runs

#### Scenario: Unchecked keys named
- **WHEN** ADR-0009's how-to-rule block is read
- **THEN** it says `branching.model` and `branching.merge` are not checked

#### Scenario: Tool branches named
- **WHEN** ADR-0009's how-to-rule block is read
- **THEN** it says a branch starting with `release-please--`, `releaser-pleaser--`, `dependabot/` or `renovate/` has nothing to check only when ADR-0012 `delivery.release_tool` or ADR-0018 `dependencies.updater` names that tool, tells the reader to rule those ADRs with or before it, and its `revision` is unchanged

### Requirement: ADR-0022 asks who merges a pull request
ADR-0022 "Review and merge" SHALL ask who merges a pull request in a
repository kept by one person, through one trait, `review.merge_by`, with the
values `person` and `agent` and the recommended value `person`. It SHALL say
that `agent` is acceptable when the ADR's text gives the reason. When the
repository rules `person`, its Decision SHALL fix four rules:
1. the agent opens the pull request ready for review, says when its checks are green, and stops;
2. the agent merges nothing: not with `gh pr merge`, not with `--auto`, not through the API, not by pushing to the default branch;
3. a bot that a workflow runs under another ADR's ruling is not an agent session, and ADR-0018's automerge is that exception;
4. a review the agent runs on its own work is advice, and the person's merge is the review.

It SHALL describe the GitHub ruleset that backs these rules (pull request
required, zero approvals, no bypass) and SHALL say the check does not
verify it. It SHALL name required approvals and `CODEOWNERS` as outside its
question. It SHALL ship with `check: npx --no-install ontrack-engineering-check ADR-0022`,
and its how-to-rule block SHALL say that the check denies nothing itself, and
that `gh api` and a push to the default branch pass it. ADR-0018 SHALL state
that its automerge is the exception ADR-0022 allows, and ADR-0019's rule 4
SHALL link to ADR-0022. Neither SHALL change `revision:`.

#### Scenario: One trait
- **WHEN** ADR-0022's frontmatter is read as shipped
- **THEN** it holds `review.merge_by` with an empty value, `status: proposed` and `revision: 1`

#### Scenario: Agent at a green pull request
- **WHEN** an agent reads `review.merge_by: person` and its pull request's checks are green
- **THEN** ADR-0022 tells it to say so and stop, not to merge or enable auto-merge

#### Scenario: Dependabot automerge
- **WHEN** ADR-0018 rules `automerge: patch` and ADR-0022 rules `merge_by: person`
- **THEN** both ADRs say the Dependabot merge is the allowed exception, and neither contradicts the other

#### Scenario: Original to governance
- **WHEN** ADR-0022's References are read
- **THEN** they say it is original to governance and hold the key table

### Requirement: ADR-0023 asks under which licence others may use the repository
ADR-0023 "License" SHALL ask one trait, `license.spdx`, holding a free SPDX
license expression, with the recommended value `MIT`. It SHALL name
`Apache-2.0` for when a patent grant matters, `UNLICENSED` for a private
repository, and SHALL accept compound expressions. Its Decision SHALL fix
that the root manifest's licence field (`license` in `package.json`,
`[project] license` in `pyproject.toml`) holds the trait, and that a licence
file is committed at the root unless the value is `UNLICENSED`. It SHALL say
in prose that the copyright holder is the organisation owning the
repository, or else the ADR's `authors:`, and SHALL NOT make it a key. It
SHALL say why governance itself ships under MIT-0. It SHALL leave dependency
licence compliance to ADR-0019's exclusion. It SHALL ship with
`check: npx --no-install ontrack-engineering-check ADR-0023`, and its how-to-rule
block SHALL say that the check reads neither the licence text nor manifests
outside the root.

#### Scenario: One trait
- **WHEN** ADR-0023's frontmatter is read as shipped
- **THEN** it holds `license.spdx` with an empty value, `status: proposed` and `revision: 1`

#### Scenario: Agent creating a manifest
- **WHEN** an agent creates `package.json` in a repository that rules `license.spdx: MIT`
- **THEN** ADR-0023 tells it to write `"license": "MIT"` and a `LICENSE` file, which `npm init` leaves out

#### Scenario: Holder not a key
- **WHEN** ADR-0023's traits are listed
- **THEN** there is no key for the copyright holder, and the Decision names who holds it

#### Scenario: Original to governance
- **WHEN** ADR-0023's References are read

### Requirement: ADR-0024 asks what analyses the repository's own code
ADR-0024 "Code scanning" SHALL ask two traits:
- `code_scanning.tool`, a free string recommending `codeql`, answered by any tool that writes SARIF, naming `semgrep` for a private repository without GitHub Code Security, and accepting `none`;
- `code_scanning.fail_on` (`critical`, `high`, `medium`, `low`, `none`), recommending `high`.

It SHALL give the reason `high` differs from ADR-0019's `critical`: the
finding is in the repository's own code, and the agent that wrote it can fix
it at once. Its Decision SHALL fix, whatever the repository rules:
1. no blocking scan without `forge.gate: blocking`; blocking goes through the ruleset rule that requires code scanning results, which the check does not verify;
2. the scan runs in a workflow (CodeQL's advanced setup), with its actions pinned by SHA and, for CodeQL, `tools: linked` so that the bundle and its default queries follow the pinned action, on every pull request and every push to the default branch. Its results go to GitHub code scanning as SARIF, as ADR-0019's scanner's do, or stay a job artifact where the plan does not allow the upload. CodeQL blocks through the ruleset rule that requires code scanning results, with its security-alert threshold at `fail_on`. Any other tool blocks through its own exit code at `fail_on`. Default setup alone does not answer the ADR;
3. all code is scanned, tests included;
4. dismissing an alert, excluding a path (`paths-ignore`, `paths`, a tool's own ignore file) or removing a query or rule (`query-filters`, a narrower suite or ruleset) silences a finding: the agent may propose one with its reason, and a person merges or dismisses (ADR-0019 rule 4, ADR-0022);
5. workflows are `forge.audit`'s concern (ADR-0011), not this ADR's.

It SHALL state that pinning `github/codeql-action` by SHA does not pin the
CodeQL bundle on github.com unless `tools: linked` is set, and that with it
a scheduled scan adds nothing. It SHALL
ship with `check: npx --no-install ontrack-engineering-check ADR-0024`. ADR-0019's
"Not concerned" paragraph SHALL link to ADR-0024 for static analysis,
without changing ADR-0019's `revision:`.

#### Scenario: Two traits
- **WHEN** ADR-0024's frontmatter is read as shipped
- **THEN** it holds `code_scanning.tool` and `code_scanning.fail_on` with empty values, `status: proposed` and `revision: 1`

#### Scenario: Agent narrows the scan
- **WHEN** an agent meets a CodeQL alert in a test file
- **THEN** ADR-0024 tells it to fix the code or to propose a dismissal or exclusion with its reason, not to add `paths-ignore` and merge it

#### Scenario: Private repository
- **WHEN** a private repository without GitHub Code Security reads ADR-0024
- **THEN** it finds `semgrep` named as the answer, blocking through its exit code at `fail_on`, with `none` acceptable

#### Scenario: Another tool's threshold
- **WHEN** a public repository rules `code_scanning.tool: semgrep` and `fail_on: high`
- **THEN** ADR-0024 tells it to block on Semgrep's exit code for high findings and to upload its SARIF to code scanning, and says the ruleset's security-alert threshold is not relied on for Semgrep

#### Scenario: CodeQL bundle pinned
- **WHEN** an agent writes the CodeQL workflow
- **THEN** ADR-0024 tells it to pin the actions by SHA and set `tools: linked`

#### Scenario: Original to governance
- **WHEN** ADR-0024's References are read
- **THEN** they say it is original to governance and hold the key table

### Requirement: ADR-0025 asks where tools outside the package manager are pinned
ADR-0025 SHALL ask, through one trait `tools.manager` (`mise`, `aqua`,
`script`, `none`), how a tool outside the package manager is installed and
pinned. Its Decision SHALL fix, whatever the repository rules:
- one place holds each named tool's version and checksum;
- that place serves the workstation, the runner and an agent session;
- a tool manager is installed pinned, under ADR-0020;
- the ADR states what keeps the pins current.

It SHALL ship with `check: npx --no-install ontrack-engineering-check ADR-0025`, at
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
- **THEN** it holds `check: npx --no-install ontrack-engineering-check ADR-0025` and its `revision` is `1`

#### Scenario: Neutral consequence names what review keeps
- **WHEN** ADR-0025's Neutral consequences are read
- **THEN** they no longer say that no check verifies the pins, and they name what is left to review

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted`, at `revision: 4`, with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`) in place of SDR-0001's `MADR`, and with
`check: npx --no-install ontrack-engineering-check ADR-0001`. Its Consequences SHALL state
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
- **THEN** it says `ontrack-engineering-check ADR-0001` runs the schema and refuses a half-ruled ADR, and names neither `npx @jackchuka/mdschema` nor a copy of `.mdschema.yml`


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
| ADR-0019 | vulnerabilities | none (original to governance) | proposed |
| ADR-0020 | adding-dependencies | none (original to governance) | proposed |
| ADR-0021 | build-provenance | none (original to governance) | proposed |
| ADR-0022 | review-and-merge | none (original to governance) | proposed |
| ADR-0023 | license | none (original to governance) | proposed |
| ADR-0024 | code-scanning | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-four files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

### Requirement: Wiring ADRs ship their check
ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018, ADR-0021 and
ADR-0024 SHALL
each ship with `check: npx --no-install governance-check <number>`, at their
current `revision`. Each how-to-rule block SHALL say that the line runs once
the ADR is `accepted`, which files the check looks for, that it checks
presence only, and that a value it has no row for passes with "nothing to
check". ADR-0011's SHALL add that the check does not verify the ruleset that
makes the pipeline required, and, from revision 2, that with
`forge.audit: zizmor` the check also runs zizmor on the workflows, so for
that key it checks content, not presence.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0018 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0018` and its `revision` is `1`

#### Scenario: How-to-rule names the files
- **WHEN** ADR-0018's how-to-rule block is read
- **THEN** it names `.github/dependabot.yml` for `dependabot` and says that `none` has nothing to check

#### Scenario: Gate ceiling stated
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it says the ruleset is not verified

## ADDED Requirements

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
ship with `check: npx --no-install governance-check ADR-0024`. ADR-0019's
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

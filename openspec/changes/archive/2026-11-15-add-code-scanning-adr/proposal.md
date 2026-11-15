# Proposal

## Why

ADR-0019 excludes static analysis of a repository's own code without giving
a reason, and no other ADR asks the question. The question still matters to
the repositories that inherit governance, such as a service with HTTP
routes, SQL or user-supplied paths. While no key answers it, an agent writing
such code does not know whether a tool will analyse it. Facing an alert, it
does not know whether the alert blocks, or whether it may dismiss it or
exclude the file.

The measurement on governance itself found one alert from CodeQL's 87
JavaScript/TypeScript queries, a false positive in a test helper. It
calibrates the recommendation and gives governance its first case to rule.
It is not a reason to leave the question unasked.

## What Changes

- Add **ADR-0024 "Code scanning"**, a question ADR original to governance.
  Its question: *what analyses this repository's own code, and what
  blocks?* Two traits:
  - `code_scanning.tool`: a free string, recommending `codeql` (free on
    public repositories). Any tool that writes SARIF answers it: `semgrep`
    is named for a private repository without GitHub Code Security, and
    `none` is accepted;
  - `code_scanning.fail_on` (`critical`, `high`, `medium`, `low`, `none`),
    recommending `high`. Unlike ADR-0019's dependencies, the finding is in
    code the agent can fix at once.
- Its Decision fixes five rules:
  1. no blocking scan without `forge.gate: blocking`;
  2. **results go to GitHub code scanning as SARIF**, as Grype's already do
     under ADR-0019. Where the plan does not allow the upload (a private
     repository without GitHub Code Security), the SARIF stays a job
     artifact. The scan runs in a workflow, with its actions pinned by SHA
     and, for CodeQL, `tools: linked`. It runs on every pull request and
     every push to the default branch. CodeQL blocks through the ruleset
     rule that requires code scanning results, with its security-alert
     threshold at `fail_on`. Any other tool blocks through its own exit
     code at `fail_on`, because its SARIF is not documented to carry the
     severity that threshold reads;
  3. tests are scanned;
  4. dismissing an alert, excluding a path or removing a query is
     silencing. The agent proposes it, and a person dismisses or merges it.
     With SARIF, dismissals of SAST and Grype alerts happen in one place;
  5. workflows belong to `forge.audit` (ADR-0011 revision 2).
- ADR-0024 ships `check: npx --no-install governance-check ADR-0024`, with
  wiring rows:
  - `codeql` needs a workflow holding `github/codeql-action/analyze`, which
    uploads its own SARIF;
  - any other tool needs one workflow that holds the tool's name and
    either `github/codeql-action/upload-sarif` or `actions/upload-artifact`
    (the artifact covers the private case). Holding the tool's name is what
    tells it apart from Grype's upload.
- ADR-0019's "Not concerned" links to ADR-0024 for static analysis.
- Add the traits to `adr/.mdschema.yml`. README:
  - 24 questions, 14 with a check, ADR-0024 in the list;
  - the Code row: until now "nothing is verified", it now says what the
    check verifies;
  - "Not covered" keeps only licence compliance from ADR-0019's
    exclusions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0024 and its traits, and the wiring
  ADRs gain ADR-0024.
- `adr-checks`: wiring rows for ADR-0024, and a row kind that requires
  several strings in one file.
- `readme`: "Not covered" no longer lists static analysis.

## Impact

- `adr/ADR-0024-code-scanning.md`: new; consumers see it `new`.
- `adr/ADR-0019-vulnerabilities.md`: one link, `revision:` stays `1`.
- `adr/.mdschema.yml`: two traits.
- `checks/governance-check.ts` and its tests: the ADR-0024 wiring rows, and
  a `contains` row that can require all of several strings.
- `README.md`: counts, list, Code row, "Not covered".
- Order: after `add-review-merge-adr`, `add-license-adr` and
  `add-workflow-audit` are archived. This delta's catalog table and
  wiring-ADR list build on theirs.
- CodeQL default setup is on in governance's repository settings since the
  brainstorm. Ruling ADR-0024 for governance means moving to advanced setup.
  That happens after the release, not in this change.

# Design

## Context

- `WIRING` rows with `inWorkflow(...)` are how ADR-0012, ADR-0018 and
  ADR-0021 verify a workflow step. Two rows fit this ADR, and no tool run is
  needed: CodeQL and Semgrep run in CI, not on a laptop.
- On governance, with default setup, the GitHub API reported:
  - `javascript-typescript`: 87 rules and 1 result,
    `js/incomplete-sanitization` (high) in `checks/test-helpers.ts:12`;
  - `actions`: 17 rules and 0 results, on a `main` that still had the five
    issues zizmor found.
- Default setup is a repository setting. It is invisible to a check that
  reads tracked files, and it runs the CodeQL version GitHub picks.
- ADR-0019's scan already uploads Grype's SARIF to code scanning
  (`github/codeql-action/upload-sarif`, category per workflow).
- A `contains` row today matches a file holding **any** of its strings. No
  row kind requires several strings in the same file.
- Checked on 2026-11-15 (task 1.1):
  - on github.com, `github/codeql-action` uses the "recommended" CodeQL
    bundle, chosen at run time through feature flags, unless `tools:
    linked` is set, which uses the bundle the action release ships
    (`src/defaults.json`). A SHA pin alone does not freeze the queries;
  - the ruleset rule "Require code scanning results" takes, per tool, an
    alerts threshold (`none`, `errors`, `errors_and_warnings`, `all`) and a
    security-alerts threshold (`none`, `critical`, `high_or_higher`,
    `medium_or_higher`, `all`). The docs show CodeQL; a third-party tool
    name is not confirmed;
  - code scanning, SARIF upload included, is free on public repositories.
    Private ones need GitHub Code Security;
  - GitHub counts a result as a security alert only when its rule carries
    `security-severity`. Semgrep's documented SARIF fields do not include
    it;
  - `semgrep scan --error` exits 1 on findings, and `--severity` filters
    which rules report;
  - `paths`, `paths-ignore` and `query-filters` exist in CodeQL's config;
  - CodeQL supports Python and JavaScript/TypeScript, among others.

## Goals / Non-Goals

**Goals:**
- An agent knows what scans its code, what blocks, and that narrowing the
  scan is a person's call.
- A check that sees the scan exists in a pinned workflow.

**Non-Goals:**
- Verifying `fail_on`. It lives in the ruleset (required code scanning
  results) and in the workflow's severity settings, and the check reads
  neither.
- Choosing CodeQL query suites beyond `default`.
- Languages CodeQL does not support. `semgrep` or `none` answer them, and
  ADR-0004 allows such languages.
- Moving governance's own setup to advanced. That happens after the
  release, when governance rules ADR-0024.

## Decisions

- **A new ADR, not ADR-0019 revision 2.** ADR-0019 asks what a release
  contains (dependencies, SBOM). This ADR asks about the code the repository
  writes. Merging them would make the catch-all ADR the supply-chain
  brainstorm refused. ADR-0024 reuses ADR-0019's rules by linking to them.
- **`fail_on: high` over `critical`.** ADR-0019 picks `critical` because a
  dependency's fix depends on someone else's release. Here the agent that
  wrote the code can fix it in the same change.
- **Advanced setup is a fixed rule, not a key.** Only a workflow can be
  pinned (ADR-0011 rule 3) and seen by the check. A key `setup: default`
  would answer the ADR in a place nothing reads.
- **Tests are scanned.** governance cannot know what counts as test code in
  another repository. Test code can hold real flaws, such as a fixture that
  shells out. An exclusion is allowed, but it goes through rule 4 like any
  other.
- **SARIF to code scanning for every tool.** It is the path ADR-0019's
  scanner already takes: one view of every alert, and one place to dismiss
  one, which rule 4 governs.
- **Blocking: the ruleset for CodeQL, the exit code for the others.**
  CodeQL's SARIF carries `security-severity`, so the ruleset's
  security-alert threshold applies to it. For other tools, neither that
  property nor the ruleset's acceptance of the tool is documented, so their
  own exit code blocks at `fail_on`, for example `semgrep scan --error
  --severity ERROR` for `high`. (The user chose this over the ruleset's
  plain alerts threshold.)
- **`tools: linked` with the SHA pin.** It makes the bundle and its default
  queries follow the pinned action, as ADR-0011 rule 3 wants for any pin,
  and new queries then arrive through Dependabot's pull request, which is
  scanned. So no scheduled scan. (The user chose this over a weekly
  schedule.)
  - Alternative: block on each tool's exit code everywhere. Rejected: one
    severity scale per tool, alerts in CI logs that nobody dismisses
    traceably, and no common view with Grype's.
- **Wiring on `github/codeql-action/analyze` for CodeQL**, not on
  `codeql-action` alone: `init` and `upload-sarif` also appear in workflows
  that do not scan code. `analyze` uploads its own SARIF.
- **For any other tool, a new `contains all` row:** one workflow must hold
  the tool's name, and `upload-sarif` or `actions/upload-artifact`. Grype's
  workflow holds `upload-sarif` but not `semgrep`, so it no longer passes
  for a SAST tool. The row kind takes several lists of alternatives and
  requires one string from each list in the same file. It is about ten
  lines in `evaluate`, and no other ADR needs it yet.
  - Alternative: a dedicated check. Rejected: this is still presence in a
    tracked file, which is what wiring does.

## Risks / Trade-offs

- [`fail_on: high` makes every high false positive block] → rule 4 gives a
  path (a person dismisses with a reason). governance's own test-helper
  alert is the first case.
- [The `contains` row passes a workflow that holds the string but never
  runs] → the same ceiling as every wiring row, stated in the how-to-rule
  block.
- [A tool whose name appears in the workflow only in a comment passes] →
  the same ceiling, and review reads the workflow.
- [A private repository keeps the SARIF as an artifact and nobody reads it]
  → the exit code at `fail_on` still blocks there, and the artifact is for
  investigation only.
- [GitHub Code Security pricing changes] → the ADR states the plan
  condition with its source and date, as ADR-0021 does for attestations.

## Migration Plan

Ships `proposed`. Archive the three earlier changes first. Rollback: revert.
No existing ADR's `revision:` moves.

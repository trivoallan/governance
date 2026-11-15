# Tasks

## 1. Facts and schema

- [x] 1.1 Check the following against GitHub's and Semgrep's documentation, and record each in design.md's Context:
  - whether a pinned `github/codeql-action` pins the CodeQL bundle and its default queries;
  - CodeQL's supported languages;
  - which plans make code scanning free or paid for private repositories;
  - the ruleset rule that requires code scanning results, and its tool and security-alert threshold settings;
  - whether SARIF upload to a private repository needs GitHub Code Security;
  - `paths-ignore` and `query-filters`;
  - whether Semgrep's SARIF carries `security-severity`, and its CI command with an exit threshold.

  If the pinning fact is false, add the weekly schedule to rule 2 in proposal.md and the adr-catalog delta before writing the ADR. Verify each kept fact has a link in References
- [x] 1.2 Add `traits.code_scanning.tool` (string, optional) and `traits.code_scanning.fail_on` (enum `critical`, `high`, `medium`, `low`, `none`, optional) under `# ADR-0024` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty `fail_on` fails

## 2. ADR-0024 and ADR-0019

- [x] 2.1 Write `adr/ADR-0024-code-scanning.md` as a question ADR:
  - frontmatter: `proposed`, `revision: 1`, two empty traits, the `check:` line;
  - Decision: the five fixed rules, the `high` reason, the SARIF path and its exit-code fallback, and a workflow example pinned by SHA (CodeQL advanced setup, and Semgrep uploading SARIF);
  - how-to-rule block: the wiring rows, and that the check reads neither `fail_on` nor the ruleset;
  - References: the key table and "Original to governance".

  Verify the schema fails it only on `status`, `date`, the empty traits and the marker sentence
- [x] 2.2 Write its Alternatives Considered: default setup, `fail_on: critical`, `semgrep` as the default, the exit code everywhere instead of SARIF, excluding tests by default, a key in ADR-0019. Give each its cost, and verify each names who it serves
- [x] 2.3 Link ADR-0024 from ADR-0019's "Not concerned" paragraph; verify ADR-0019 keeps `revision: 1` and `npm test` passes

## 3. Check

- [x] 3.1 Write failing tests:
  - the `contains all` row kind: one file holding a string from each list passes, and strings split across two files fail;
  - the ADR-0024 rows: CodeQL advanced setup passes, CodeQL default setup only fails, `init` without `analyze` fails, Semgrep uploading SARIF passes, Semgrep keeping the SARIF as an artifact passes, Grype's upload alone fails for `semgrep`;
  - `none` has nothing to check, and `fail_on` has no row.

  Verify they fail
- [x] 3.2 Add the `contains all` row kind to `evaluate`, and the ADR-0024 entries to `WIRING` in `checks/governance-check.ts`; verify `npm test` passes with line coverage at or above 90 %

## 4. README and delivery

- [x] 4.1 Update `README.md`:
  - 24 questions, 14 with a check, ADR-0024 in the list;
  - the Code row: what is gained, and that a pinned scan workflow is verified;
  - "Not covered": static analysis removed, licence compliance kept with its link to ADR-0019.

  Verify `npm test` passes
- [x] 4.2 Run `openspec validate add-code-scanning-adr --strict`, then commit, push and open the pull request; verify its diff holds only the files in proposal.md's Impact and this change

# Tasks

## 1. Facts and schema

- [x] 1.1 Check the ADR's facts: `npm init`'s default licence (npm 12.2.2 and `uv init` write none, measured), npm's `UNLICENSED`, PEP 639's `license` and `license-files`, and GitHub's statement that a repository with no licence keeps all rights reserved. Drop any sentence ADR-0023 cannot source, and verify each kept fact has a link in References
- [x] 1.2 Add `traits.license.spdx` (string, optional) under `# ADR-0023` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty value fails

## 2. ADR-0023

- [x] 2.1 Write `adr/ADR-0023-license.md` as a question ADR. It has `proposed`, `revision: 1`, one empty trait and the `check:` line. Its Decision holds the three fixed rules, the MIT-0 note and the how-to-rule block with the check's ceiling. Its References hold the key table and "Original to governance". Verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 2.2 Write its Alternatives Considered: `Apache-2.0`, `MIT-0`, a copyleft licence (`GPL-3.0-or-later`), `UNLICENSED`, and a key in ADR-0012. Give each its cost, and verify each names who it serves

## 3. Check

- [x] 3.1 Write failing tests in `checks/governance-check.test.ts` for each scenario: ruled and wired, manifest disagrees, no licence file, private repository, value not set, `pyproject.toml` string and table forms, no manifest. Verify they fail
- [x] 3.2 Add the `ADR-0023` check to `checks/governance-check.ts`; verify `npm test` passes with line coverage at or above 90 %

## 4. README and delivery

- [x] 4.1 Update `README.md`: 23 questions, 13 with a check, ADR-0023 in the question list, and the Delivery row (what is gained, and that the licence file and manifest field are verified); verify `npm test` (README counts and links) passes
- [x] 4.2 Run `openspec validate add-license-adr --strict`, then commit, push and open the pull request; verify its diff holds only the files in proposal.md's Impact and this change

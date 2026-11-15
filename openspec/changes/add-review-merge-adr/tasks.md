# Tasks

## 1. Facts and schema

- [x] 1.1 Check design.md's Context against the Claude Code permissions documentation (deny precedence, the `Bash(...)` prefix syntaxes) and GitHub's documentation (no self-approval, ruleset bypass); drop any sentence ADR-0022 cannot source
- [x] 1.2 Add `traits.review.merge_by` (enum `person`, `agent`, optional) under `# ADR-0022` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty `merge_by` fails

## 2. ADR-0022

- [x] 2.1 Write `adr/ADR-0022-review-and-merge.md` as a question ADR: `proposed`, `revision: 1`, one empty trait, the `check:` line, the four fixed rules, the ruleset in prose, a how-to-rule block naming the deny entry and the check's ceiling, the key table in References, and "Original to governance". Verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 2.2 Write its Alternatives Considered (`agent`, one required approval, `CODEOWNERS`, draft pull request), each with its cost; verify each one names what it would cost a one-person repository

## 3. Check

- [x] 3.1 Write the failing tests in `checks/governance-check.test.ts` for each scenario of the ADR-0022 check (denied, only asked, host none, ADR-0017 missing, merge_by agent, merge_by empty, settings untracked, invalid JSON); verify they fail
- [x] 3.2 Add the `ADR-0022` check to `checks/governance-check.ts` using `traitsOf`, `toolAnswer` and `tracked`; verify `npm test` passes with line coverage at or above 90 %

## 4. Related ADRs and README

- [x] 4.1 Add to ADR-0018 the sentence that its automerge is the exception ADR-0022 allows, and link ADR-0022 from ADR-0019's rule 4; verify both keep `revision: 1` and `npm test` (ADR revisions test) passes
- [x] 4.2 Update `README.md`: the pitch counts (22 questions, 12 with a check), ADR-0022 in the question list, the Agents row (ADR-0017 and ADR-0022, and what the check verifies), and the code review item in "Not covered" reduced to approvals and `CODEOWNERS` with a link to ADR-0022; verify `npm test` (README counts and links) passes

## 5. Delivery

- [x] 5.1 Run `openspec validate add-review-merge-adr --strict` and `npx --no-install governance-check ADR-0022` on a scratch copy of a ruled ADR-0022; verify both pass
- [x] 5.2 Commit, push and open the pull request; verify its diff holds only the files listed in proposal.md's Impact and this change

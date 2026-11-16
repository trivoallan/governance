# Tasks

## 1. Shipped ADRs

- [ ] 1.1 Rewrite the block "What is this file?" in the 25 ADRs that carry it, with the text of the design
- [ ] 1.2 Reword ADR-0001, which explains the mechanics: convention, ruling, value; say once that an older copy says "question" for the same thing
- [ ] 1.3 Reword the Context, Decision and how-to-rule sections of the other ADRs, one file at a time, reading each after the edit
- [ ] 1.4 Verify that no `revision:` changed and that the sentence `Everything below disappears when you rule` is in every ADR that had it

## 2. Checks

- [ ] 2.1 Change the three messages in `checks/ontrack-engineering-check.ts` and the tests that match them
- [ ] 2.2 Rename the identifiers and test names that say "verdict" or "answer"
- [ ] 2.3 Run `npm test`

## 3. README and pages

- [ ] 3.1 Reword `README.md`: the first screen, "The conventions", the sentence before the excerpt; run its tests
- [ ] 3.2 Reword the pages of `docs/` outside `docs/adr/`, the workflows and the agent files that use the words

## 4. Specs

- [ ] 4.1 Reword in place the prose of `adr-catalog`
- [ ] 4.2 Once the change is archived, rename in `openspec/specs/` the scenario titles a delta cannot rename ("Shipped unanswered", "Block present on a shipped question", "Shipped question fails", "Consumer reads what to re-answer")

## 5. Verification

- [ ] 5.1 Search `adr/`, `checks/`, `README.md` and `openspec/specs/` for "question", "answer" and "verdict": every hit left is an everyday sense
- [ ] 5.2 In a repository that imported the track, run `npx ontrack plan` against this branch: every ADR is `unchanged`
- [ ] 5.3 After ontrack's release is installed here, run `npx ontrack apply`: `AGENTS.md` gets the heading `## Project instructions (ontrack)`

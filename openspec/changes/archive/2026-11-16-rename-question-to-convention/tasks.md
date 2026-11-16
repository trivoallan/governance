# Tasks

## 1. Shipped ADRs

- [x] 1.1 Rewrite the block "What is this file?" in the 25 ADRs that carry it, with the text of the design
- [x] 1.2 Reword ADR-0001, which explains the mechanics: convention, ruling, value; say once that an older copy says "question" for the same thing
- [x] 1.3 Reword the Context, Decision and how-to-rule sections of the other ADRs, one file at a time, reading each after the edit
- [x] 1.4 Verify that no `revision:` changed and that the sentence `Everything below disappears when you rule` is in every ADR that had it

## 2. Checks

- [x] 2.1 Change the three messages in `checks/ontrack-engineering-check.ts` and the tests that match them
- [x] 2.2 Rename the identifiers and test names that say "verdict" or "answer"
- [x] 2.3 Run `npm test`

## 3. README and pages

- [x] 3.1 Reword `README.md`: the first screen, "The conventions", the sentence before the excerpt; run its tests
- [x] 3.2 Reword the pages of `docs/` outside `docs/adr/`, the workflows and the agent files that use the words

## 4. Specs

- [x] 4.1 Reword in place the prose of `adr-catalog`
- [x] 4.2 Once the change is archived, rename in `openspec/specs/` the scenario titles a delta cannot rename ("Shipped unanswered", "Block present on a shipped question", "Shipped question fails", "Consumer reads what to re-answer"), and the three of `adr-catalog` whose content changed ("No service baseline", "Drift is written down", "Same keys as the source")

## 5. surdesrails

- [x] 5.1 Remove the `Adapted from surdesrails` lines from the References and write `Original to ontrack-engineering.` in the ADRs with no source
- [x] 5.2 Reword ADR-0001 and the Alternatives that name surdesrails, and the comment of `adr/.mdschema.yml`
- [x] 5.3 Add a test that fails when a file of `adr/` names surdesrails or an SDR
- [x] 5.4 Reword in place the Purpose of `adr-catalog`

## 6. Verification

- [x] 6.1 Search `adr/`, `checks/`, `README.md` and `openspec/specs/` for "question", "answer" and "verdict": every hit left is an everyday sense
- [x] 6.2 In a repository that imported the track, run `npx ontrack plan` against this branch: every ADR is `unchanged`
- [ ] 6.3 After ontrack's release is installed here, run `npx ontrack apply`: `AGENTS.md` gets the heading `## Project instructions (ontrack)`

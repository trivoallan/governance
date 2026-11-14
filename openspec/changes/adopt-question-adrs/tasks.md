# Tasks

Every ADR task below means: read the SDR, translate it, write it with
`/pm-skills:develop-adr`, then apply the section mapping and frontmatter
from design.md. Settle the recommended answer for each trait with the user
while writing. Each ADR is done when it matches the `adr-format` spec and
its row in the `adr-catalog` spec.

## 1. Batch 1: rules and schema (this branch, PR #1)

- [x] 1.1 Write `adr/.mdschema.yml` for ruled ADRs (core keys, English enterprise-free enums, Nygard headings, marker sentence forbidden in `## Decision`); verify a hand-filled ruled sample passes and the same sample with one empty trait is named by `npx @jackchuka/mdschema@0.15.1 check '*.md'`
- [x] 1.2 `git mv adr/ADR-0001.md adr/ADR-0001-record-architecture-decisions.md` and rewrite it from SDR-0001 (accepted, `format: nygard`, drift from surdesrails in Consequences, how ADRs are ruled); verify it passes the schema
- [x] 1.3 Check what ontrack does with the schema: install this branch in a scratch consumer and run `npx ontrack plan`; verify the ADRs are listed `new` and record whether `.mdschema.yml` is imported, ignored or `unreadable`. If it is not imported, add the copy step to ADR-0001
- [x] 1.4 Rewrite `README.md` to say governance ships questions to rule on, imported instead of surdesrails; verify it no longer says "the ADRs I apply"

## 2. Batch 1: first questions (this branch, PR #1)

- [x] 2.1 Write `adr/ADR-0002-localization.md` from SDR-0002; verify its five language traits are empty and use `french`/`english`
- [x] 2.2 Write `adr/ADR-0006-commits.md` from SDR-0006; verify `commits.scopes` and `commits.tool` are empty and the marker sentence is present
- [x] 2.3 Write `adr/ADR-0009-branching.md` from SDR-0009; verify its three traits are empty and the References name SDR-0009 revision 1
- [x] 2.4 Simulate ruling: copy ADR-0006 to a scratch directory, rule it `accepted`, remove the how-to-rule block, and verify the schema passes; rule a second copy `rejected` without `traits:` and verify it passes too
- [x] 2.5 Open the batch 1 PR (PR #1 was squash-merged before batch 1 landed, so batch 1 is rebased onto `main` and gets its own PR); verify the PR diff lists every batch 1 file and nothing from PR #1

## 3. Batch 2: questions carried over (new branch and PR)

- [x] 3.1 Write `adr/ADR-0003-architecture.md` from SDR-0003, recommending `hexagonal`; verify `architecture.pattern` is its only trait and is empty
- [x] 3.2 Write `adr/ADR-0004-languages.md` from SDR-0004 recommending Python or TypeScript, without team-skills reasoning; verify `grep -i skill` finds no such argument
- [x] 3.3 Write `adr/ADR-0005-validation.md` from SDR-0005; verify its two traits are empty
- [x] 3.4 Write `adr/ADR-0007-tests.md` from SDR-0007; verify `tests.coverage_target` is empty
- [x] 3.5 Write `adr/ADR-0008-documentation.md` from SDR-0008 with the `single-user` / `team` / `public` audience scale, recommending `public`; verify the schema enum matches
- [x] 3.6 Write `adr/ADR-0010-architecture-documentation.md` from the `architecture.document` part of SDR-0003, recommending `arc42` as one file per section and `likec4` for `architecture.model` and `mermaid` for `architecture.diagrams`, with no template link; verify those three are its only traits
- [x] 3.7 Open the batch 2 PR; verify the numbering has no gap from 0001 to 0010

## 4. Batch 3: adapted questions (new branch and PR)

- [ ] 4.1 Settle with the user what replaces `hosting.offer` in ADR-0012 and the enums for ADR-0013 and ADR-0014; record the answers in design.md
- [ ] 4.2 Write `adr/ADR-0011-forge-and-ci.md` from SDR-0010 revision 2, GitHub assumed; verify it has `forge.gate`, no `forge.vendor`, and no GitLab mention
- [ ] 4.3 Write `adr/ADR-0012-delivery.md` from SDR-0011 with the replacement settled in 4.1; verify no `caas` or `paas` remains
- [ ] 4.4 Write `adr/ADR-0013-frontend.md` from SDR-0013; verify no WCS theme trait and no Angular-only enum
- [ ] 4.5 Write `adr/ADR-0014-work-tracking.md` from SDR-0014; verify it asks for a tracker, not a Jira project
- [ ] 4.6 Update the schema enums for batch 3 and open the batch 3 PR; verify `grep -riE 'gitlab|aresis|wcs|caas|paas' adr/` finds no trait key or enum value and the fourteen files match the catalog

# Tasks

## 1. Revisions test

- [x] 1.1 Add a test under `checks/` that reads every `adr/ADR-*.md`, takes `revision: N` from the frontmatter and the `Revision K:` items after `**Revisions.**`, and fails unless K is exactly 2..N. Verify it fails on the current tree, naming ADR-0001, ADR-0008, ADR-0010, ADR-0012 and ADR-0016.

## 2. Backfill the Revisions lists

- [x] 2.1 For each of ADR-0001 (revisions 2, 3), ADR-0008 (2), ADR-0010 (2), ADR-0012 (2) and ADR-0016 (2), find the commit that raised the revision (`git log -S 'revision: N' -- adr/<file>`). Write a closing `**Revisions.**` list after the References content: per entry, what changed in the question and what a ruled repository must re-answer. Verify that the test from 1.1 passes for every ADR except ADR-0012, which has no revision 3 yet.
- [x] 2.2 Add one sentence to ADR-0001 saying that a repository reads the Revisions list when `ontrack plan` reports an ADR `revised`, and leave its `revision` unchanged. Verify `git diff` shows no change to its `revision:` lines.

## 3. ADR-0012 revision 3

- [x] 3.1 In `adr/ADR-0012-delivery.md`, raise `revision` to 3 in the frontmatter and in the filled example. Add `release_notes:` (empty) under `delivery:` in `traits:` and a value in the example, and add `traits.delivery.release_notes` with its enum to `adr/.mdschema.yml`. Verify the shipped file still fails `npx @jackchuka/mdschema@0.15.1 check` only on its proposed status and empty traits.
- [x] 3.2 Add the `delivery.release_notes` row to the recommendation table and the keys table, recommending `highlights` with its reason. Add the paragraph defining `changelog`, `highlights` and `none`: highlights head the forge's release notes after the tag, name every revised ADR, and a release is not finished without them; `none` goes with `release_tool: none`. Verify against the adr-catalog delta scenarios.
- [x] 3.3 Extend the "Once a pipeline file exists" paragraph into the per-change definition of done: the pipeline passes, the same pull request updates the documentation the change makes false, checks first and review for the rest, and no release-time task except the highlights. Verify against the definition-of-done scenarios.
- [x] 3.4 Add `deliver-release-notes` from `pm-skills@product-on-purpose` and `verification-before-completion` from `superpowers@superpowers-marketplace` to the Suggested skills line, and add `Revision 3:` to the Revisions list, naming `delivery.release_notes` as the one key to answer. Verify that the test from 1.1 passes for ADR-0012.

## 4. governance's own ruling

ontrack reads the ADRs from the `trivoallan` dependency, which points at `main`, so it sees revision 3 only after this change is merged and Dependabot bumps that dependency. Task 4.1 lands in that follow-up pull request, as the revisions of #73 did.

- [ ] 4.1 (follow-up pull request, after the `trivoallan` bump) Take ADR-0012 revision 3 into `docs/adr/trivoallan/ADR-0012-delivery.md` through ontrack and rule `delivery.release_notes: highlights`. Say in its decision that the highlights are written with `deliver-release-notes` and prepended with `gh release edit`. Verify `ontrack plan` reports ADR-0012 unchanged and `AGENTS.md` shows `release_notes: highlights`.
- [x] 4.2 Verify `npx --no-install governance-check ADR-0012` still passes.

## 5. Verification

- [x] 5.1 Run `npm test` (coverage at or above ADR-0007's target) and `openspec validate revise-delivery-release-notes --strict`, and verify both pass, then that CI passes on the pull request.
- [ ] 5.2 After the release that ships this change is tagged, write its highlights with `/pm-skills:deliver-release-notes`, prepend them to the GitHub release, and verify the release page shows them above the generated changelog.

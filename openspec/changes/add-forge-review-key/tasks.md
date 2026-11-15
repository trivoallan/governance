# Tasks

## 1. ADR-0011 revision 3

- [ ] 1.1 In `adr/ADR-0011-forge-and-ci.md`, raise `revision` to 3 in the frontmatter and in the filled example. Add `review:` (empty) under `forge:` in `traits:` and `review: peer` in the example. Verify `git diff` shows both revision lines changed.
- [ ] 1.2 Add `traits.forge.review` with enum `[peer, author]`, optional, to `adr/.mdschema.yml`. Verify the shipped ADR-0011 still fails `npx @jackchuka/mdschema@0.15.1 check` only on its proposed status and empty traits.
- [ ] 1.3 Add the `forge.review` row to the recommendation table (recommending `peer`, with `author` tenable for a sole writer) and to the keys table with its two values. Say that the key concerns this repository's own changes, and leave the sentence on a change proposed elsewhere as it is. Verify against the adr-catalog delta scenarios.
- [ ] 1.4 Add a paragraph stating `author` with each `forge.gate` value: `none` leaves no control, `blocking` makes the pipeline the control, `informative` leaves the author the only decider. Say nothing of any tool's apply gate. Verify against the scenarios.
- [ ] 1.5 Make the key an "empty is not an answer" key like the others (three required keys), add an Alternatives Considered entry for each value, and add `Revision 3:` to the Revisions list, naming `forge.review` as the one key to answer. Verify the Revisions test passes for ADR-0011.

## 2. governance's own ruling

- [ ] 2.1 (follow-up pull request, after the `trivoallan` dependency moves) Take ADR-0011 revision 3 into `docs/adr/trivoallan/ADR-0011-forge-and-ci.md` through ontrack and rule `forge.review`. Verify `ontrack plan` reports ADR-0011 unchanged.
- [ ] 2.2 Verify `npx --no-install governance-check ADR-0011` still passes.

## 3. Verification

- [ ] 3.1 Run `npm test` (coverage at or above ADR-0007's target) and `openspec validate add-forge-review-key --strict`, and verify both pass, then that CI passes on the pull request.
- [ ] 3.2 Verify `ontrack plan` reports ADR-0011 as `revised` in a repository that ruled revision 2.

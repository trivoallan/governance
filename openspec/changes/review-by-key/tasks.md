# Tasks

## 1. ADR text

- [ ] 1.1 Rewrite `adr/ADR-0022-review-and-merge.md`:
  - frontmatter: `traits.review.by` and `traits.review.approvals` empty, `revision: 2`;
  - Context: no team-size assumption;
  - Decision: key table with the recommendations and the reasons for `peer` and `agent`, the values `review.approvals` takes with each `review.by`, the six rules, the ruleset for each value, `maintainer` beside each `forge.gate` value, and the deny entries for `claude-code`;
  - how-to-rule block: what the check reads, that it verifies the ruleset in CI only, and that it cannot see the bypass list;
  - Alternatives: the two-key form, and the draft PR alternative kept;
  - `Revision 2:` entry with the value mapping.

  Verify by reading it against "ADR-0022 asks where the review happens".
- [ ] 1.2 Edit `adr/ADR-0011-forge-and-ci.md`:
  - remove `forge.review` from `traits:`, the key table, the "What `author` leaves" paragraph and the filled-frontmatter example;
  - add one sentence pointing to ADR-0022;
  - raise `revision` to 4 and add a `Revision 4:` entry.

  Verify that `grep forge.review adr/ADR-0011-forge-and-ci.md` finds only the Revisions list.
- [ ] 1.3 Add the `review.by: peer` Dependabot bypass sentence to `adr/ADR-0018-dependencies.md`, without changing `revision`. Verify by reading it against the scenario "Dependabot under peer".
- [ ] 1.4 Change ADR-0019 rule 4 so that a person approves or merges, as ADR-0022's `review.by` says, without changing `revision`.
- [ ] 1.5 Fix every other cross-reference that says "a person merges (ADR-0022)": ADR-0011 rule 2 on silencing zizmor, and ADR-0024's silencing rule. Make them follow `review.by`. Verify that `grep -rn "merge_by\|person merges" adr/` returns nothing stale.
- [ ] 1.6 In `adr/.mdschema.yml`, replace `traits.forge.review` and `traits.review.merge_by` with `traits.review.by` (enum `maintainer`, `peer`, `agent`) and `traits.review.approvals` (`type: number`). Verify with `cd adr && npx @jackchuka/mdschema@0.15.1 check '*.md'`, and check that a copy holding `merge_by` or `approvals: two` is refused.
- [ ] 1.7 Update the README "Not covered" item on review: it keeps `CODEOWNERS` only, linked to ADR-0022. Verify that `npm test` passes the readme tests.

## 2. Check

- [ ] 2.1 In `governance-check.ts`, make `forge()` fail on a present `forge.review` with the spec's message, while still reporting `forge.gate` and `forge.audit`. Add tests for "Leftover key" and "Key removed".
- [ ] 2.2 Replace the `Review` schema with `review.by`, and fail on a leftover `review.merge_by`. Keep `agent` as "nothing to check". Update the existing ADR-0022 tests to `review.by`, and add "Leftover merge_by".
- [ ] 2.3 Read `review.approvals` as a whole number of `0` or more, and fail when it does not match `review.by`. Add tests for:
  - "Peer with zero approvals";
  - "Maintainer with approvals";
  - "Approvals not a number";
  - `review.approvals` not set.
- [ ] 2.4 Deny part: require `Bash(gh pr review` for `maintainer` and `peer`, and `Bash(gh pr merge` for `maintainer` only. Add tests for:
  - "Merge denied", "Merge only asked";
  - "Maintainer without the review deny";
  - "Peer needs no merge deny";
  - "Review only asked";
  - "Agent merges";
  - "No agent host";
  - "Settings not committed".
- [ ] 2.5 Ruleset part. Outside GitHub Actions, print `ADR-0022: ruleset not read outside CI`. Inside GitHub Actions:
  - read the default branch and `rules/branches/{branch}` through `gh api`;
  - combine the `pull_request` rules as design.md says;
  - check them for each value;
  - print that the bypass list is not verified.

  Add tests that put a stub `gh` on `PATH` for:
  - "Peer ruleset complete in CI";
  - "Peer ruleset without last-push approval";
  - "No pull request rule in CI";
  - "Maintainer ruleset asks for an approval";
  - "Ruleset count differs from the ADR";
  - "Rules unreadable in CI".
- [ ] 2.6 Run `npm test`, then `npx tsc --noEmit`. Verify that both pass and that coverage stays at or above 90 % (ADR-0007).

## 3. Specs and governance's own repository

- [ ] 3.1 Run `openspec validate review-by-key --strict` and fix any finding.
- [ ] 3.2 In the pull request description, list what governance's own copies need after the release:
  - re-import;
  - `review.by: maintainer` and `review.approvals: 0`;
  - remove `forge.review`;
  - add the `Bash(gh pr review:*)` deny to `.claude/settings.json`.

  Do not change `docs/adr/trivoallan/` in this change.

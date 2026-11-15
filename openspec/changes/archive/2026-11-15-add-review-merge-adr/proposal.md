# Proposal

## Why

No ADR says whether a coding agent may merge its own pull request. ADR-0018
and ADR-0019 each settle one case ("merge without a person", "a person
merges it"), and nothing states the rule they are exceptions to. With the
maintainer's `gh` token, an agent's merge is recorded under the
maintainer's name, so it cannot be told apart afterwards. It can only be
prevented beforehand. The README's "Not covered" section lists code review
as a gap.

## What Changes

- Add **ADR-0022 "Review and merge"**, a question ADR original to governance,
  written for a repository kept by one person. Its question: *who merges a
  pull request?* One trait:
  - `review.merge_by` (`person`, `agent`), recommending `person`. `agent` is
    allowed when the ADR's own text says why (a demo or throwaway
    repository).
- Its Decision fixes, when the repository rules `person`:
  1. the agent opens the pull request ready for review, says when its
     checks are green, and stops;
  2. the agent merges nothing: no `gh pr merge`, no `--auto`, no merge
     through the API, no push to the default branch;
  3. a bot that a workflow runs under another ADR's ruling is not an agent
     session; ADR-0018's automerge is the exception this rule allows;
  4. a review the agent runs on its own work is advice, and the person's
     merge is the review.
- It states in prose the ruleset that backs the rule on GitHub (pull request
  required, zero approvals, no bypass) and says the check does not verify it.
- ADR-0022 ships `check: npx --no-install governance-check ADR-0022`.
  `governance-check ADR-0022` reads ADR-0017's `agent.host`. With
  `merge_by: person` and `host: claude-code`, the repository's tracked
  `.claude/settings.json` must deny `gh pr merge` in `permissions.deny`.
- ADR-0018 says that its automerge is the exception ADR-0022 allows.
  ADR-0019's rule 4 links to ADR-0022.
- Add the trait to `adr/.mdschema.yml`.
- README: ADR-0022 joins the question list and the Agents row. The counts
  become 22 questions, 12 of them with a check. The code review item in "Not
  covered" shrinks to approvals and ownership (`CODEOWNERS`).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0022 and its trait. The wiring and
  tool check list gains ADR-0022.
- `adr-checks`: a new ADR-0022 check.
- `readme`: the "Not covered" item about code review changes.

## Impact

- `adr/ADR-0022-review-and-merge.md`: new; consumers see it `new`.
- `adr/ADR-0018-dependencies.md`, `adr/ADR-0019-vulnerabilities.md`: one
  sentence or link each, no trait change, so `revision:` stays `1`
  (ADR-0001 rule 6).
- `adr/.mdschema.yml`: one trait.
- `checks/governance-check.ts` and its tests: one check.
- `README.md`: counts, list, Agents row, "Not covered".
- governance itself rules ADR-0022 only after a release ships it, as with
  ADR-0019.

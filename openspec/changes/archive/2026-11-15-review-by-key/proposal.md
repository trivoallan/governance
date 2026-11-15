# Proposal

## Why

Two ADRs answer the same question right now. ADR-0011's `forge.review`
says who accepts a change, and ADR-0022's `review.merge_by` says who
merges it. ADR-0022 is written for a repository kept by one person.
Governance ships ADRs to repositories of any size, and a team that
imports governance learns nothing from it it can act on:

- `forge.review: peer` fixes no rule and no check.
- `review.merge_by: person` forbids the agent to merge even after a peer's
  approval, the one case where that merge would be safe.

An agent in a team runs under a person's token and can approve a
colleague's pull request in that person's name. Neither ADR forbids that.

## What Changes

- **BREAKING** ADR-0022 asks one key, `review.by`, with the values
  `maintainer`, `peer` and `agent`, and recommends `maintainer`. The key
  says where the review a person does happens:
  - `maintainer`: the merge is the review;
  - `peer`: another account's approval of the latest push is the review;
  - `agent`: no person reviews.

  `review.merge_by` is removed. ADR-0022 moves to revision 2, drops "written
  for one person" from its Context, and fixes these rules:
  - whatever the value, the agent never approves a pull request;
  - with `maintainer`, it never merges;
  - with `peer`, it merges once GitHub allows it;
  - with `agent`, it merges on green.

  It describes the ruleset each value needs (with `peer`: the ruled number
  of approvals, dismiss stale reviews, approval of the most recent push).
  `CODEOWNERS` stays outside the question.
- ADR-0022 also asks `review.approvals`, the number of approvals the
  default branch's ruleset requires. It is `0` with `maintainer` and
  `agent`, and `1` or more with `peer`, recommending `1`. It changes nothing
  the agent does. It lets the check catch a ruleset that drifted from what
  the team ruled.
- **BREAKING** ADR-0011 removes `forge.review`, the text on what `author`
  leaves beside each `forge.gate` value, and the review recommendation,
  and moves to revision 4. The gate text moves to ADR-0022, rewritten for
  `review.by`.
- ADR-0018: with `review.by: peer`, Dependabot is the one actor named in
  the ruleset's bypass list, so its automerge passes the approval rule.
  Its `revision` stays.
- ADR-0019 rule 4: "a person merges" becomes "a person approves or merges,
  as ADR-0022's `review.by` says". Its `revision` stays.
- `governance-check ADR-0022` reads `review.by` and `review.approvals`:
  - it fails when `review.approvals` does not match `review.by` (`0`, or at least `1` with `peer`);
  - it requires a `Bash(gh pr review` deny for `maintainer` and `peer`, and
    also a `Bash(gh pr merge` deny for `maintainer`;
  - in CI, it reads the default branch's active rules through `gh api` and
    checks that the pull request rule requires exactly `review.approvals` approvals, plus the rest of what each value needs;
  - outside CI, it says it skipped the ruleset.

  A leftover `review.merge_by` fails and names `review.by`.
- `governance-check ADR-0011` fails on a leftover `forge.review` and names
  ADR-0022's `review.by`.
- `adr/.mdschema.yml` replaces `traits.forge.review` and
  `traits.review.merge_by` with `traits.review.by` and the number
  `traits.review.approvals`.
- The README's "Not covered" item on code review keeps `CODEOWNERS` only.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`:
  - ADR-0022 asks `review.by` and `review.approvals` instead of `review.merge_by`;
  - ADR-0011 no longer asks `forge.review` and no longer states review
    beside the gate;
  - ADR-0018 names Dependabot's bypass;
  - ADR-0019 rule 4 follows `review.by`.
- `adr-checks`:
  - the ADR-0022 check reads `review.by`, `review.approvals`, two deny
    entries and the branch rules;
  - the ADR-0011 check refuses `forge.review`.
- `readme`: the "Not covered" item on review lists `CODEOWNERS` only.

## Impact

- `adr/ADR-0011-forge-and-ci.md`, `adr/ADR-0018-dependencies.md`,
  `adr/ADR-0019-vulnerabilities.md`, `adr/ADR-0022-review-and-merge.md`,
  `adr/.mdschema.yml`, `README.md`.
- `checks/governance-check.ts` and its tests. The check calls `gh` in CI.
  Reading active branch rules needs read access only, but the bypass list
  is visible only to admins, so the check does not verify it.
- Repositories that inherit governance: those that ruled ADR-0011 at
  revision 3 or ADR-0022 at revision 1 must re-answer at the next
  `ontrack plan`, or their check fails. This includes governance's own
  copies under `docs/adr/trivoallan/`, where `forge.review: author` and
  `merge_by: person` become `review.by: maintainer` with
  `review.approvals: 0`.

# Proposal

## Why

ADR-0016 says delta specs reach `openspec/specs/` when a change is
archived, but not when to archive. Archiving is left to a later pull
request, which is forgotten: `add-agent-identity-adr` was merged in #130
with every task checked and is still in `openspec/changes/`. A release
tagged now would ship code that `openspec/specs/` does not describe, and
the next agent reads specs that are behind the code. Every repository that
rules `changes.framework: openspec` inherits the same gap.

## What Changes

- **BREAKING** ADR-0016 moves to revision 3 and adds one rule, with no new
  key: with `changes.framework: openspec`, a change is archived in the pull
  request that checks its last task. A change whose remaining tasks can
  only be done after the merge (a release, a waiting period, telling
  someone) stays in `openspec/changes/` until a later pull request checks
  them, and is archived there. It extends ADR-0012's "a change is done in
  its own pull request": ADR-0012's list of last tasks gains a sentence
  that points to it, and ADR-0012's revision does not move.
- `ontrack-engineering-check ADR-0016` gains a fourth step: it fails when a
  change outside `openspec/changes/archive/` has a `tasks.md` whose tasks
  are all checked, and names each such change. A change with an open task
  passes. A change without `tasks.md`, or whose `tasks.md` holds no task,
  is not checked, and the check says so. The step reads the files and runs
  nothing. It is breaking because a repository that already ruled
  `openspec` can fail it after the update without changing its answer.
- ADR-0016 states the hole it leaves: a change merged with a task that was
  done but left unchecked passes, because the check cannot tell it from a
  task that waits for the merge. It is seen in review.
- ADR-0016's Alternatives add and refuse:
  - archiving before each release, because it blocks the release pull
    request at the moment one wants to ship, cannot hold for a change whose
    tasks need the release, and means nothing without a release tool;
  - a `changes.archive` key with a `manual` value, because it would only
    keep specs behind the code.
- governance's `test` check runs the ADR-0016 check, which it does not do
  today, so the rule holds on governance's own pull requests.
- governance's CI change summary (#88) also shows the changes a pull
  request archives, so the reviewer still sees the proposal and the spec
  diff once the change has left `openspec/changes/`.
- This pull request archives `add-agent-identity-adr`, and archives itself
  as its last task, so the new step passes on governance.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0016 rules when a change is archived, states the
  hole, refuses the two alternatives, and moves to revision 3; ADR-0012's
  definition of done points to the rule.
- `adr-checks`: the ADR-0016 check fails on a complete change that is not
  archived.
- `ci`: the `test` check runs the ADR-0016 check, and the change summary
  covers the changes a pull request archives.

## Impact

- `adr/ADR-0016-changes.md`; one sentence in `adr/ADR-0012-delivery.md`.
- `checks/ontrack-engineering-check.ts` and its tests. No new dependency.
- `.github/workflows/ci.yml`: a new ADR-0016 step and the change summary
  step.
- `openspec/changes/add-agent-identity-adr/` moves to
  `openspec/changes/archive/`, and its deltas reach `openspec/specs/`.
- Inheriting repositories (tambouille, trivoallan/ontrack) see revision 3
  at the next `ontrack plan`. A complete change they have not archived
  fails their ADR-0016 check until they archive it.
- ontrack's apply routine should run `openspec archive` as the last step
  of a change it applies. That is ontrack's own change.

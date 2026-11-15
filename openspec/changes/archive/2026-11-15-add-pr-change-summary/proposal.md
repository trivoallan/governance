# Proposal

Issue served: trivoallan/governance#88

## Why

A reviewer of a pull request that carries an OpenSpec change sees each spec
delta as a list of `ADDED` and `MODIFIED` requirements, not the requirement
it replaces. To judge a `MODIFIED` requirement, they open
`openspec/specs/<capability>/spec.md` by hand and compare. `openspec show
<change> --diff` already prints that comparison, per requirement; nothing
puts it in front of the reviewer.

Opened on explicit request in the session (ADR-0016, revision 2), after a
brainstorm that weighed publishing a site for changes (spek, human-spec)
and kept the cheapest form that reaches the reviewer.

## What Changes

- The `test` job of `.github/workflows/ci.yml` gains a last step that writes,
  to the job summary (`$GITHUB_STEP_SUMMARY`), the output of `openspec show
  <change> --type change --diff --no-interactive` for each active change the
  pull request touches.
- A change is "touched" when a file under `openspec/changes/<name>/` differs
  between the base branch and the pull request's head, `archive/` excluded,
  and `openspec/changes/<name>/` still exists at the head.
- The step never fails the `test` check: it is information for the reviewer,
  not a gate.

Out of scope: a comment on the pull request (it needs `pull-requests: write`,
and ADR-0011 keeps the token read-only for forks and Dependabot); a published
site for changes; any new job, so the ruleset is unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ci`: the pull request pipeline also summarises, for the reviewer, the
  changes a pull request touches, without changing what makes `test` pass
  or fail.

## Impact

- Edited: `.github/workflows/ci.yml` (one step).
- New devDependency, admitted under ADR-0020: `@fission-ai/openspec`
  `1.13.1`, pinned exactly, so `npm ci` installs the CLI the step runs.
  Until now the CLI came from each contributor's `PATH`, and CI had none.
- `actions/checkout` already fetches the full history (`fetch-depth: 0`, for
  the ADR-0006 step), so the base branch is there to diff against.
- Pull requests that touch no change (Dependabot, release-please) get an
  empty summary from this step.

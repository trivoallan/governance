# Proposal

## Why

`governance-check ADR-0009` exempted `release-please--`, `releaser-pleaser--`,
`dependabot/` and `renovate/` branches unconditionally. A repository that runs
no such tool then had four prefixes through which any branch name passed.
ADR-0012 (`delivery.release_tool`) and ADR-0018 (`dependencies.updater`)
already say which tools a repository runs.

## What Changes

- The ADR-0009 check exempts a tool branch only when the repository's
  ADR-0012 `delivery.release_tool` or ADR-0018 `dependencies.updater` names
  that tool: `release-please` gives `release-please--`, `releaser-pleaser`
  gives `releaser-pleaser--`, `dependabot` gives `dependabot/`, `renovate`
  gives `renovate/`.
- An unanswered ADR (missing, empty key, another tool, `none`) exempts
  nothing; the failure says why the branch is not exempt.
- ADR-0009's how-to-rule note says so and tells the reader to rule ADR-0012
  and ADR-0018 with or before it.

Consumer impact: a repository that rules ADR-0009 but not ADR-0012 or
ADR-0018 now has its release and update bot pull requests refused until it
rules them.

## Capabilities

### Modified Capabilities

- `adr-checks`: the ADR-0009 check exempts a tool branch only when its tool is ruled.
- `adr-catalog`: ADR-0009's how-to-rule note names that condition.

## Impact

- `checks/governance-check.ts` and its tests.
- `adr/ADR-0009-branching.md`: one sentence, no `revision` change.

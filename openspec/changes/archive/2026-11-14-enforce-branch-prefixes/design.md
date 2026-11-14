# Design

## Context

- `governance-check ADR-0009` exists (archived `add-tool-checks`) and reads
  `GITHUB_HEAD_REF` on a pull request. It has no notion of bot branches.
- `docs/adr/trivoallan/ADR-0009-branching.md` predates that check and has
  no `check:` line; `adr/ADR-0009-branching.md` has one. The same holds for
  ADR-0015 and ADR-0016.
- No pull request workflow and no ruleset exist yet (`gh api …/rulesets`
  is `[]`). `add-ci-gate` (#35) plans `ci.yml` with one required job,
  `test`, and leaves the ADR-0009 step to this change.
- The repository is owned by a user account, public. The release pull
  request is opened with a personal token, so it is authored by
  `trivoallan`, not a bot.
- The Claude Code desktop app prefixes session branches with its
  `branch_prefix` account setting (currently `tritri`): one value for every
  session, in every repository.

## Goals / Non-Goals

**Goals:** a branch that breaks ADR-0009 cannot be merged; agents know to
rename before pushing; release and update pull requests are not blocked.

**Non-Goals:** blocking the push itself; renaming old branches; changing
anything in the user's account settings.

## Decisions

**Enforce in the pull request gate, not at push.** A step in the `test`
job of `add-ci-gate`'s `ci.yml` runs `node checks/governance-check.mjs
ADR-0009`; on `pull_request`, `GITHUB_HEAD_REF` is the head branch. The
script runs from the checkout, not through `npx`, for the reason
`add-ci-gate` gives for ADR-0006: `npx` would resolve the older pinned
self-dependency, without the tool-branch exemption. The ruleset already
requires `test`, so nothing changes on GitHub. *Alternative:* a branch ruleset with "Restrict creations" on
every branch except `feat/**`, `fix/**`, `docs/**`, `chore/**`. Rejected:
on a user-owned repository the only useful bypass actor is the owner, who
is also the one pushing `tritri/…`; and release-please, pushing with the
owner's token, would need the same bypass. A check on the pull request
catches the name where it matters (what lands on `main` is the squashed
merge; the branch name survives only in the pull request) at no new cost.

**Tool branches are exempt in the check, not in the workflow.** Every
consumer that follows ADR-0012 and ADR-0018 hits the same failure, and a
later `ontrack check` step could not skip one ADR with an `if:`. The
check therefore passes names starting with `release-please--`,
`dependabot/` or `renovate/`, the branch forms of the tools governance's
ADRs recommend or offer. *Alternative:* exempt by author (`user.type ==
'Bot'`). Rejected: the release pull request here is authored by a person.
*Alternative:* a configurable list in a trait. Rejected: the list follows
from other ADRs' answers, and a key would copy it.

**The repository copy gets its line from `ontrack apply`**, not by hand,
so `ontrack plan` stays clean. If apply also syncs ADR-0015 and ADR-0016
lines, they are kept: they are governance's own lines, and `add-gitleaks-hook`
and `add-ci-gate` rely on them.

**The rename instruction lives in `AGENTS.md`, after the ontrack block.**
It is the file this repository's sessions already load, and ontrack only
rewrites between its markers. The account setting stays the user's: setting
`branch_prefix` to one allowed prefix (say `feat`) would make every session
branch pass while mislabelling fix, docs and chore work, so the instruction
is to rename by commit type whatever the setting.

## Risks / Trade-offs

- [The step needs `add-ci-gate`'s `ci.yml`] → This change lands after it;
  the check, ADR and `AGENTS.md` tasks do not depend on it.
- [A pull request opened from a `tritri/…` branch fails after the fact] →
  Rename locally, push the new name, open a new pull request; the failure
  message names the form.
- [Another release tool uses another branch form] → It fails the check
  until governance adds its prefix; `releaser-pleaser` (ADR-0012) is to be
  verified during implementation.

## Open Questions

- Should the user also change the desktop `branch_prefix` setting (for
  example to `feat`)? It does not change what the repository enforces.

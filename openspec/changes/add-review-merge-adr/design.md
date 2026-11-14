# Design

## Context

- `checks/governance-check.ts` has two kinds of check. Wiring rows
  (`WIRING`) look for tracked files that hold a string. Dedicated functions
  (`CHECKS`: ADR-0006, 0009, 0015, 0016) cover the other cases.
- A wiring row sees only the traits of its own ADR. ADR-0009 already reads
  other ADRs' answers through `toolAnswer(root, adr, group, key)`.
- ADR-0017 ships one wiring row: `agent.host: claude-code` requires a
  tracked `.claude/settings.json`.
- Claude Code reads `permissions.deny`, `permissions.ask` and
  `permissions.allow` in `.claude/settings.json`, and deny wins. Bash rules
  match by command prefix: `Bash(gh pr merge:*)`, or the newer
  `Bash(gh pr merge *)`.
- ADR-0018's automerge runs `gh pr merge --auto` from a GitHub Actions
  workflow (`dependabot/fetch-metadata`). Claude Code's settings never apply
  to that run.
- GitHub forbids a pull request's author from approving it. A one-person
  repository that required an approval would be blocked, or bypassed by an
  admin on every merge.

## Goals / Non-Goals

**Goals:**
- One key, readable on its own in the `AGENTS.md` block, where ontrack
  copies only the traits.
- A check that verifies the one place where the rule can be enforced before
  the merge: the agent host's deny list.

**Non-Goals:**
- Team repositories: required approvals and `CODEOWNERS`. They go into a
  later revision that adds keys.
- Checking the GitHub ruleset, which needs the API and a token. No check
  calls GitHub today.
- Agent hosts other than Claude Code.
- Denying the GitHub MCP server's merge tool. Its rule name depends on the
  server's name in the user's configuration, so the ADR names it in prose
  and the check does not look for it.
- ADR-0020. Its `approver` decides before an install, not at a merge, so
  it gains no link. This corrects the brainstorm, which grouped it with
  ADR-0019.
- The rule that a key must read on its own, as a line in ADR-0001. That is
  a separate change.

## Decisions

- **Key `review.merge_by`, values `person` and `agent`.** `merger` reads as
  a noun with two meanings in English. `merge_by: person` reads on its own.
  A third value `none` (nobody merges) would mean a repository with no pull
  requests, and ADR-0009's `github-flow` already rules that out.
- **A dedicated check, not a wiring row.** A `contains` row would pass on
  any file that holds the string `gh pr merge`, including a settings file
  that lists it under `allow`. The point of the check is the deny side, so
  it parses the JSON. It is about 30 lines next to `secrets`, reusing
  `traitsOf`, `toolAnswer` and `tracked`.
  - Alternative: add a `json` row kind to the wiring table. Rejected, since
    no other row needs one.
- **Prefix match on `Bash(gh pr merge`.** This accepts both rule syntaxes
  and any suffix, such as `:*`, ` *` or ` --auto:*`. A rule written as an
  exact command matches only that command, so it is a weaker deny, but it
  passes. Its ceiling is stated as a code comment.
- **Read ADR-0017 through `toolAnswer`.** A missing ADR-0017, or an empty or
  `none` host, means nothing to check, with the reason printed, as ADR-0009
  does with unanswered tool ADRs. Failing instead would make ADR-0022 depend
  on ADR-0017 being ruled first.
- **Tracked file only**, as every wiring row does. A deny rule that was
  never committed protects one machine, not the repository.
  `settings.local.json` is personal and is not read.
- **The ADR text keeps to its question.** The Decision has the four fixed
  rules, the ruleset described in prose, the check's ceiling, and
  Alternatives:
  - `agent`;
  - one required approval (impossible for a single maintainer);
  - `CODEOWNERS` (team);
  - opening the pull request as a draft (a click with no review value).

## Risks / Trade-offs

- [`gh api repos/…/merge`, `/usr/bin/gh pr merge` or `git push` to the
  default branch bypass a prefix deny; Claude Code's documentation says deny
  rules are not a security boundary. A compound command does not bypass
  it: deny matches any subcommand] → the ADR says the deny
  protects against an agent's mistake, not against an agent working around
  it, and that the ruleset closes the rest. The how-to-rule block says it
  plainly.
- [A merge through the maintainer's token is recorded under their name] →
  stated in Context as the reason the rule is enforced before the merge,
  not audited after.
- [Ruling `person` while `agent.host` is unruled passes as "nothing to
  check"] → the message names ADR-0017, so the gap is visible in the
  output.

## Migration Plan

ADR-0022 ships `proposed` in the next release. Consumers see it `new` and
rule it. Nothing changes for repositories that leave it unruled. Rollback:
revert the commit. No ADR changes its `revision:`.

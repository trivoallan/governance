# Design

## Context

See proposal.md, Why, for the test results. On main, the check keeps a
`HOSTS` table in `checks/ontrack-engineering-check.ts`: each host names the
files ADR-0017 requires and the function ADR-0022's deny part calls
(`claudeDeny`, `opencodeDeny`). ADR-0017's enum is built from that table.

## Goals / Non-Goals

**Goals:**
- A repository can declare that contributors use Copilot CLI, and get the
  rules and the guard that hold for it.
- Nothing changes for a repository that does not declare `copilot`.

**Non-Goals:**
- Copilot's cloud coding agent (`copilot/` branches, its commit messages,
  Agent Merge) and Copilot in VS Code: not tested.
- Verifying the folder trust Copilot needs: it lives in
  `~/.copilot/config.json`, outside the repository.
- Running or parsing the hook. The check stays a wiring check.

## Decisions

**`copilot` is a host of its own, sharing Claude Code's files.** Copilot CLI
reads `.claude/settings.json`, the marketplace and `.claude/skills/`, so the
`claude-code` rules on plugins apply unchanged and no Copilot-only file is
introduced. What differs is the guard: Copilot ignores `permissions`. A row
in `HOSTS`, `copilot: { files: [SETTINGS], deny: copilotHook }`, carries
both facts.
*Alternative:* make `claude-code` cover Copilot by switching its guard to the
hook. Fewer values, but it breaks every repository ruled `[claude-code]`
that has only the deny entries, for contributors who may never use Copilot.

**One command hook per command, inline.** For `maintainer`:

```json
{
  "matcher": "Bash",
  "hooks": [
    { "type": "command", "command": "grep -q 'gh pr review' && { echo 'the agent never approves a pull request (ADR-0022)' >&2; exit 2; } || exit 0" },
    { "type": "command", "command": "grep -q 'gh pr merge' && { echo 'a person merges this pull request (ADR-0022)' >&2; exit 2; } || exit 0" }
  ]
}
```

With `peer`, only the first. Each reads the hook payload on standard input
and exits `2` with a message on standard error, which both hosts treat as a
block. Keeping the literal command in each hook lets the check find it by
substring. *Alternatives:* one `grep -qE` hook (the check would have to read
a regular expression); a script file under `.claude/hooks/` (one more file
every importer copies and keeps executable).

**Matchers are tested against `Bash`.** Absent, empty or `*` covers every
tool; any other value is tried as a regular expression against `Bash`, and
an invalid pattern counts as no match.

**The command test is a substring**, the same ceiling as `claudeDeny`'s
prefix match. Named in a `ponytail:` comment.

**ADR-0017 goes to revision 3; ADR-0022 stays at 3.** Adding an enum value
changes ADR-0017's question, and its own Negative consequence says a third
host is a revision. ADR-0022's keys and recommended answer do not change.
ADR-0026 has no `check:` line and no per-host requirement; its text gains a
`copilot` paragraph with no revision change.

**This change modifies a requirement another open change adds.**
`ADR-0017 check` exists only in `add-agent-hosts`. The delta is written
against that text, and `openspec validate` already says archive must wait
for `add-agent-hosts`.

## Risks / Trade-offs

- [Copilot changes which `.claude/settings.json` keys it reads] → ADR-0017
  names the version and date its statements come from.
- [A repository declares `copilot` without the hooks] → the ADR-0022 check
  fails and says Copilot CLI ignores `permissions.deny`.
- [The hooks also block a person typing the command in an agent session] →
  intended: the person approves and merges outside it.

## Migration Plan

Nothing to migrate. A repository whose contributors use Copilot CLI adds
`copilot` to `agent.hosts` and the hooks to `.claude/settings.json`.

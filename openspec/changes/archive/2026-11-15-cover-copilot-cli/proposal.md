# Proposal

## Why

ADR-0017 revision 2 lets a repository list the agent hosts its
contributors use (`claude-code`, `opencode`), and ADR-0022 revision 3
requires its denies on each one. A contributor who works with GitHub
Copilot CLI has no value to declare, so the repository cannot say what it
needs for them, and the `claude-code` denies do not protect their sessions.
Tests on 2026-11-15 with Copilot CLI 1.0.112, in a folder the user trusts:

- Copilot CLI reads `.claude/settings.json`: `extraKnownMarketplaces` with a
  `directory` source (`./marketplace`), `enabledPlugins`, and `hooks`. It
  installs an enabled plugin by itself, at the commit its marketplace entry
  pins in `sha`. It loads a skill vendored under `.claude/skills/`;
- `.github/copilot/settings.json` takes precedence over `.claude/` for the
  same plugin;
- Copilot ignores `permissions.deny`: with `--allow-all-tools`, a command
  matching `Bash(gh pr merge:*)` runs;
- a `PreToolUse` hook in `.claude/settings.json` holding one command hook
  per command, each exiting `2`, blocks `gh pr review` and `gh pr merge` in
  Copilot CLI and in Claude Code, and lets other commands run.

## What Changes

- ADR-0017 revision 3 adds `copilot` (GitHub Copilot CLI) to `agent.hosts`.
  Its rules: the Claude Code files and rules apply, since Copilot reads
  them; each contributor trusts the folder, and the plugins then install
  with nothing to run; a committed `.github/copilot/settings.json` holds
  neither `enabledPlugins` nor `extraKnownMarketplaces`; `permissions` is
  not read. Copilot's cloud coding agent and Copilot in VS Code are named as
  not covered. Its Revisions list says there is nothing to re-answer unless
  contributors use Copilot CLI.
- `ontrack-engineering-check ADR-0017` accepts `copilot` and requires a
  tracked `.claude/settings.json` for it.
- ADR-0022 shows, for `copilot`, the `PreToolUse` hook: one command hook for
  `gh pr review`, and with `maintainer` one for `gh pr merge`. Its check's
  deny part verifies that hook for `copilot`. `claude-code` and `opencode`
  are unchanged. ADR-0022's `revision` stays `3`: its keys and recommended
  answer do not change.
- ADR-0026 says what `copilot` means for keeping the maintainer's
  credentials apart: no sandbox governance has verified, so the agent runs
  where those credentials do not exist.
- The README's Agents row names Copilot CLI.
- No repository breaks: a value is added, nothing is removed or tightened.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0017 accepts and rules `copilot`; ADR-0022 shows its
  hook.
- `adr-checks`: the ADR-0017 check accepts `copilot`; the ADR-0022 check
  verifies its hook.

ADR-0026's requirement does not pin per-host text, and the `readme` spec
does not pin the Agents row, so neither needs a delta.

## Impact

- `adr/ADR-0017-agent-tooling.md`, `adr/ADR-0022-review-and-merge.md`,
  `adr/ADR-0026-agent-identity.md`, `README.md`.
- `checks/ontrack-engineering-check.ts` (the host table), its tests.
- Depends on the unarchived change `add-agent-hosts`: the `ADR-0017 check`
  requirement this change modifies is added there, so this change archives
  after it.

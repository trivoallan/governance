# Design

## Context

- ADR-0017 is checked through the wiring table. A row takes one scalar value
  (`one()` in `traitsOf`), so a list does not fit it.
- ADR-0022's `review()` uses `toolAnswer()` to read ADR-0017's `agent.host`.
  It checks only when the value is `claude-code`, and reads
  `.claude/settings.json` for a `deny` entry that starts with
  `Bash(gh pr merge`.
- List traits already exist (`commits.scopes`, `branching.prefixes`): `list()`
  in the check and `type: array` in `.mdschema.yml`.

Facts about opencode, from its documentation (read on 2026-11-15:
permissions, migrate-v1, config, plugins, skills, instructions):

- **Configuration files.** opencode reads `opencode.json` or `opencode.jsonc`,
  at the root or in `.opencode/`. A `.opencode/` file overrides the files at
  the root.
- **V2 permissions.** `permissions` is an ordered array of
  `{ action, resource, effect }`, and the last rule that matches wins.
  - `shell` is the action for commands.
  - In a resource, `*` matches any run of characters and `?` one character,
    and the pattern covers the whole command. A pattern ending in ` *` also
    matches the command alone.
  - The base policy starts with an allow-all rule. Without a deny, a command
    runs.
- **V1 format.** The V1 `permission` object is still accepted. opencode
  normalizes it in memory.
- **Plugins.** They are declared under `plugins`. An exact npm version or a
  full Git commit hash stays pinned; any other form is checked for updates
  at startup.
- **Skills.** Project skills are read from `.opencode/skills`, and also from
  `.claude/skills` and `.agents/skills`.
- **Instructions.** opencode reads `AGENTS.md` only, never `CLAUDE.md`.

## Goals / Non-Goals

**Goals:**

- One check per host for presence (ADR-0017) and for the merge deny
  (ADR-0022), with every host reported in one run.
- The opencode deny is evaluated the way opencode evaluates it, so a later
  `allow` is caught.

**Non-Goals:**

- Reading `plugins` or the marketplace to verify pins. Review catches an
  unpinned entry, as it does for Claude Code today.
- Reading `opencode.jsonc` (JSONC parser), the V1 `permission` object, or the
  `policies` layer.
- Global, system or managed opencode configuration. It lives outside the
  repository, as `strictKnownMarketplaces` does for Claude Code.
- Any host other than these two. A third one is one more entry in the
  per-host table.

## Decisions

- **A dedicated ADR-0017 check, not a wiring row.**
  - Option rejected: teaching `wiring()` to take lists widens a generic path
    for one ADR.
  - What we do: a small check, `agentTooling(root, file)`, parses with
    `z.object({ hosts: z.array(z.enum(['claude-code', 'opencode'])) })` via
    `traitsOf`. Before that, it looks for `readTraits(text, 'agent')?.host`:
    when that key is present, it throws the rename message. This rule wins
    over "not set", so a repository that has not re-ruled gets the useful
    message.
  - The ADR-0017 row leaves the `WIRING` table and the wiring-rows spec.
- **One table of hosts, shared by both checks.**
  `HOSTS = { 'claude-code': { files: ['.claude/settings.json'], deny }, opencode: { files: ['opencode.json', '.opencode/opencode.json'], deny } }`.
  - ADR-0017 requires at least one tracked file from `files`.
  - ADR-0022 calls `deny(root, files, commands)`, which returns one
    `{ ok, detail }` per command, or a single failure when the settings
    cannot be read. The commands are `gh pr review`, and with `maintainer`
    also `gh pr merge` (ADR-0022 revision 2).
  - The Claude Code `deny` is revision 2's code, moved: the entry it looks
    for is `Bash(` followed by the command.
- **opencode deny: simulate, don't search for text.**
  1. Read the tracked `opencode.json`, then `.opencode/opencode.json`, and
     join their `permissions` arrays in that order.
  2. Keep the rules whose `action`, read as a pattern, matches `shell`. That is `shell`, `*` or `sh*`: opencode matches the action with the same wildcard function.
  3. Turn each pattern into an anchored regex, the way opencode's
     `Wildcard.match` (`packages/core/src/util/wildcard.ts`) does: escape it,
     then `*` becomes `.*` and `?` becomes `.`. A trailing ` *` becomes
     `( .*)?`.
  4. For each command, take the last rule that matches the command alone,
     then the command followed by ` 1`. The command passes only if that rule
     is `deny` both times.
  - Option rejected: a substring search, as on the Claude Code side. It
    would pass a file where `{ action: "*", resource: "*", effect: "allow" }`
    follows the deny, and opencode would then allow the merge.
  - `ponytail:` two fixed probes. A deny written for one flag only (say
    `gh pr review * --approve`) matches neither probe, so it fails. A pattern that the probes do not exercise can still slip
    through.
- **Formats the check refuses, each with its fix.**
  - `opencode.jsonc` is refused: rename it to `opencode.json`, or move the
    rules there. This avoids adding a JSONC parser (ADR-0020 admission) for
    comments.
  - The V1 `permission` object is refused: convert it to `permissions`.
    opencode still accepts V1, but supporting it doubles the evaluator for a
    format opencode is leaving.
  - `policies` is not read. The docs show two shapes for a policy, and
    `permissions` is enough to stop a mistaken merge, which is this ADR's
    ceiling.
- **The rename fails in ADR-0022 too.**
  - When an accepted ADR-0017 still holds `agent.host`, `review()` fails
    with the same message.
  - Option rejected: treating it as "nothing to check". The guard would
    then turn off silently in every repository that has not re-ruled.
- **Revisions.**
  - ADR-0017 goes to revision 2, and the key changes: re-answer.
  - ADR-0022 goes to revision 3 (revision 2, `review.by`, landed first), and
    its keys do not change. The question widens to every declared host:
    nothing to re-answer, but an opencode repository adds the denies.
  - ADR-0026 is unreleased, so it changes at revision 1.
  - `adr-revisions.test.ts` already requires one Revisions entry per
    revision.

## Risks / Trade-offs

- **Every importer turns red at once.** Every repository that ruled
  ADR-0017 fails until it re-rules. → The message gives the exact line to
  write. The ADR-0017 revision 2 entry says the same. The CHANGELOG marks the change
  breaking (the package is still 0.x, so it is a minor bump under
  release-please).
- **Merge order of `opencode.json` and `.opencode/opencode.json`.** Checked
  in opencode's source (`anomalyco/opencode`, branch `dev`, read on
  2026-11-15):
  - `config.ts` orders the layers: `direct` (the root files) before
    `projectSupplementary` (`.opencode/`).
  - `config/plugin/agent.ts` joins each document's `permissions` in that
    order.
  - `permission.ts` `evaluate()` takes the last rule that matches
    (`findLast`), and falls back to `ask` when none does.
  - The check reproduces this order. → If opencode changes it, the Wildcard
    and order references in ADR-0022 date the reading.
- **Rules from another opencode layer.** An `allow` in global or agent-level
  opencode rules can defeat the committed deny. → The check reads only
  committed files, and ADR-0022 already says the deny is not a security
  boundary.
- **The docs drift.** The opencode docs are moving: V1 to V2, `plugin`
  became `plugins`. → The References record the reading date. The check
  depends only on `permissions`, `action`, `resource` and `effect`.

## Migration Plan

1. Ship ADR-0017 revision 2 and ADR-0022 revision 3 in `adr/`, with the
   checks and `.mdschema.yml`. ADR-0026 is edited at revision 1: it has not
   been released.
2. governance's own copies under `docs/adr/trivoallan/` stay as they are.
   Its `check:` lines run the published package, which knows only
   `agent.host`; re-ruling them before that package ships would fail
   `ontrack check` here. They move at the next import, as ADR-0022
   revision 2 did.
3. Rollback: revert the change. No data moves, only text and checks.

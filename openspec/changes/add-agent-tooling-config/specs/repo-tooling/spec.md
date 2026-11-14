# Spec Delta

## Purpose

Defines how this repository carries out the ADRs it rules for itself: the
checks, hooks, settings and instructions its contributors and agents work with.

## ADDED Requirements

### Requirement: Committed Claude Code project settings
The repository SHALL track `.claude/settings.json`. It SHALL declare exactly
one marketplace in `extraKnownMarketplaces`, the repository's own, as a
`directory` source with path `./marketplace`, and SHALL list in
`enabledPlugins` only `<plugin>@<that marketplace>` entries, one per plugin
of that marketplace.

#### Scenario: ADR-0017 check passes
- **WHEN** `npx --no-install governance-check ADR-0017` runs on the default branch
- **THEN** it exits `0` and reports `.claude/settings.json` found

#### Scenario: No third-party marketplace
- **WHEN** `.claude/settings.json` is read
- **THEN** every key of `extraKnownMarketplaces` is the name in `marketplace/.claude-plugin/marketplace.json`, and its source is `{ "source": "directory", "path": "./marketplace" }`

#### Scenario: Enabled plugins match the marketplace
- **WHEN** the plugin names in `enabledPlugins` and in the marketplace are compared
- **THEN** they are the same set

### Requirement: Repository marketplace pinned by commit
The repository SHALL track `marketplace/.claude-plugin/marketplace.json`.
Its `name` SHALL differ from every upstream marketplace name it draws from
and from Claude Code's reserved names. Every plugin entry's `source` SHALL be
a `github`, `url` or `git-subdir` source carrying a `sha` of 40 lowercase
hexadecimal characters.

#### Scenario: Pinned entries
- **WHEN** each entry of `plugins` is read
- **THEN** its `source.sha` matches `^[0-9a-f]{40}$`

#### Scenario: Valid marketplace
- **WHEN** `claude plugin validate marketplace` runs
- **THEN** it reports no error

### Requirement: Vendored OpenSpec skills committed
The OpenSpec skills under `.claude/skills/openspec-*/` and commands under
`.claude/commands/opsx/` SHALL be tracked, each carrying the OpenSpec
version that generated it, and SHALL be exactly what that version of the
OpenSpec CLI generates.

#### Scenario: Reproducible from the pinned CLI
- **WHEN** `openspec update` runs with the OpenSpec version named in their `generatedBy` field
- **THEN** `git status --porcelain .claude/` prints nothing

#### Scenario: Present in a new worktree
- **WHEN** a new worktree is created from the default branch
- **THEN** it holds `.claude/skills/openspec-propose/SKILL.md`

### Requirement: Local agent state stays untracked
The repository's `.gitignore` SHALL ignore `.claude/worktrees/` and
`.claude/settings.local.json`, whatever a contributor's own git
configuration.

#### Scenario: Ignored without personal excludes
- **WHEN** `git -c core.excludesFile=/dev/null check-ignore .claude/worktrees/x .claude/settings.local.json` runs in a clone with an empty `.git/info/exclude`
- **THEN** it prints both paths

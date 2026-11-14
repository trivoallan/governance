# repo-tooling Specification

## Purpose
Defines how this repository carries out the ADRs it rules for itself: the
checks, hooks, settings and instructions its contributors and agents work with.

## Requirements

### Requirement: Pre-commit secret guard
The repository SHALL version a git pre-commit hook at `.githooks/pre-commit`
that runs `gitleaks git --pre-commit --staged --redact` and lets the commit
proceed only when that command exits `0`. When `gitleaks` is not on `PATH`,
the hook SHALL refuse the commit and say that gitleaks must be installed.
Its output MUST NOT contain the value of a secret it finds.

#### Scenario: Clean commit
- **WHEN** the hook is installed and the staged changes hold no secret
- **THEN** `git commit` succeeds

#### Scenario: Staged secret refused
- **WHEN** the hook is installed and a staged file adds a private key
- **THEN** `git commit` exits non-zero, no commit is created, and the key does not appear in the output

#### Scenario: Secret already in history, not staged
- **WHEN** an earlier commit holds a secret and the staged changes hold none
- **THEN** `git commit` succeeds

#### Scenario: gitleaks missing
- **WHEN** the hook is installed and `gitleaks` is not on `PATH`
- **THEN** `git commit` exits non-zero and the output says gitleaks is not installed

### Requirement: Hook installed by npm install
Running `npm install` (or `npm ci`) in a clone SHALL set the clone's
`core.hooksPath` to `.githooks`, without adding a dependency. Outside a git
checkout, the step SHALL do nothing and SHALL NOT fail the install.

#### Scenario: Fresh clone
- **WHEN** a contributor clones the repository and runs `npm install`
- **THEN** `git config core.hooksPath` prints `.githooks`

#### Scenario: Worktree
- **WHEN** a commit is made in a worktree of a clone where `npm install` has run
- **THEN** that worktree's `.githooks/pre-commit` runs

#### Scenario: Not a git checkout
- **WHEN** the install runs in a directory that is not a git checkout
- **THEN** the install succeeds and nothing is configured

### Requirement: Branch names are checked against ADR-0009
This repository's copy of ADR-0009 SHALL carry
`check: npx --no-install governance-check ADR-0009`, so that `ontrack check`
runs it. The required `test` job of the pull request workflow (ADR-0011)
SHALL run the ADR-0009 check of the pull request's own checkout on the pull
request's head branch, so that a failing check blocks the merge.

#### Scenario: Check line present
- **WHEN** the frontmatter of `docs/adr/trivoallan/ADR-0009-branching.md` is read
- **THEN** it holds `check: npx --no-install governance-check ADR-0009`

#### Scenario: Tool-named branch refused
- **WHEN** a pull request's head branch is `tritri/fix-wiring-rows`
- **THEN** the gate fails and its output names the allowed prefixes `feat, fix, docs, chore`

#### Scenario: Conforming branch accepted
- **WHEN** a pull request's head branch is `fix/wiring-rows`
- **THEN** the ADR-0009 step of the gate passes

### Requirement: Agents rename tool-made branches before pushing
`AGENTS.md` SHALL tell an agent, outside the block ontrack manages, that a
branch whose name does not start with one of `branching.prefixes` is renamed
to `<prefix>/<description-in-kebab-case>` before its first push, with the
prefix chosen from the commit type of the work, and SHALL give the command
(`git branch -m <new-name>`).

#### Scenario: Instruction outside the managed block
- **WHEN** `AGENTS.md` is read
- **THEN** the rename instruction appears after `<!-- ontrack:end -->` and `ontrack apply` leaves it unchanged

### Requirement: Committed Claude Code project settings
The repository SHALL track `.claude/settings.json`. It SHALL declare exactly
one marketplace in `extraKnownMarketplaces`, the repository's own, as a
`directory` source with path `./marketplace`, and SHALL list in
`enabledPlugins` one `<plugin>@<that marketplace>` entry per plugin of that
marketplace, plus only the `claude-security@claude-plugins-official` entry
the departure in ADR-0017 declares.

#### Scenario: ADR-0017 check passes
- **WHEN** `npx --no-install governance-check ADR-0017` runs on the default branch
- **THEN** it exits `0` and reports `.claude/settings.json` found

#### Scenario: No third-party marketplace
- **WHEN** `.claude/settings.json` is read
- **THEN** every key of `extraKnownMarketplaces` is the name in `marketplace/.claude-plugin/marketplace.json`, and its source is `{ "source": "directory", "path": "./marketplace" }`

#### Scenario: Enabled plugins match the marketplace
- **WHEN** the plugin names of the `@ontrack-trivoallan-tools` entries in `enabledPlugins` and in the marketplace are compared
- **THEN** they are the same set

#### Scenario: Only the declared departure
- **WHEN** the `enabledPlugins` entries not ending in `@ontrack-trivoallan-tools` are listed
- **THEN** the list is exactly `claude-security@claude-plugins-official`, and ADR-0017 holds a `**Departure:` paragraph naming it

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

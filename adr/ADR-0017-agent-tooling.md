---
adr: ADR-0017
slug: agent-tooling
title: Agent tooling
status: proposed
revision: 2
date:
authors: []
supersedes: []
check: npx --no-install ontrack-engineering-check ADR-0017
traits:
  agent:
    hosts:
---

# Agent tooling

## Status

Proposed

> **What is this file?** A question governance asks your repository, with
> the answer it recommends. While it says `status: proposed`, you may edit
> it freely. `revision:` dates the question, not the file: you do not fill
> it, and it only moves when the question changes. `rejected` is a full
> answer: when the question does not apply here, rule `rejected`, remove
> the whole `traits:` block, and say what stands in for it.
> [ADR-0001](ADR-0001-record-architecture-decisions.md) explains the
> mechanics.

## Context

Once this repository rules an ADR, an agent knows *what* was decided, not
*how* to carry it out. ADR-0006 says `commitlint`; nothing says how to set
it up. Skills package that know-how: instructions, sometimes scripts, that
an agent loads when the task calls for them. Several governance ADRs name
the skills that fit them in a `Suggested skills` line in their References.

Skills are also a way in for content nobody reviewed. A skill fetched from
the network on each run can change between two sessions; a skill committed
to the repository can pre-approve tools through its `allowed-tools` field.
What reaches the repository, from where, and pinned how, is the question.

governance targets **Claude Code** first, and covers **opencode** too:
one repository can be worked on with both, by different contributors.
While this key is empty, an agent does not know which hosts' project
settings the repository expects, and installs skills however the last
guide it read suggested. Both hosts read `AGENTS.md`, where ontrack writes
the rules this repository accepted; opencode does not read `CLAUDE.md`.

## Decision

**What governance recommends, and why.**

| Key | Recommended value | Reason |
| --- | --- | --- |
| `agent.hosts` | `[claude-code]` | the agent governance's ADRs are written for, and the one whose project settings can declare and pin the skills a repository relies on |

List every host the repository's contributors work with: a team where
some use Claude Code and others opencode rules
`[claude-code, opencode]`, and the rules of both apply. `[]` says the
repository declares no agent tooling: the rules below do not apply, and
the `Suggested skills` lines are only reading material.

The list of plugins lives in each host's own files, not in a trait: the
host reads them, and a trait copying them would drift.

**What governance fixes when the list holds `claude-code`.**

1. **Plugins first, through the repository's own marketplace.** The
   repository keeps a marketplace in `marketplace/.claude-plugin/marketplace.json`,
   with a name of its own (not an upstream marketplace's name, nor a
   reserved one). Each plugin it uses gets an entry there, and
   `.claude/settings.json` points at that directory through
   `extraKnownMarketplaces` and turns each plugin on through
   `enabledPlugins`.
2. **Pin every entry to a commit.** Each entry's `source` carries a `sha`,
   the full 40-character commit of the plugin's own repository: `github`
   with `repo`, `url` with a git URL, or `git-subdir` with `url` and `path`
   for a plugin inside a larger repository. A third-party marketplace is
   never used directly, because its entries may not be pinned: pinning that
   marketplace's `ref` does not stop an unpinned entry from following its
   repository's head. Updating a plugin means changing a `sha` in a pull
   request.
3. **Vendor as a last resort.** A skill that no marketplace publishes is
   copied into `.claude/skills/<name>/`, fetched at a tag, checked against a
   hash, and committed. The pull request that adds it is reviewed like code,
   `allowed-tools` included. opencode reads `.claude/skills/` too, so a
   repository with both hosts keeps one copy.
4. **Forbidden:** an entry with no `sha`, a third-party marketplace enabled
   directly, a skill
   declared through a `package.json` key (it would reach every repository
   that installs the package), and a skill run through `npx -y` (it resolves
   a different version on every run).
5. **Skills an OpenSpec schema lists** are installed only on explicit
   request in the session, as [ADR-0016](ADR-0016-changes.md) rule 3 says.

**What each contributor still has to do.** `enabledPlugins` installs
nothing. After accepting the workspace trust dialog for the repository,
each contributor runs, once per plugin:

```bash
claude plugin install <plugin>@<marketplace> --scope project
```

Until then, `/plugin` reports the plugin as enabled in project settings but
not installed. If a contributor already has the same plugin from its
upstream marketplace, they turn that copy off in their untracked
`.claude/settings.local.json` (`"<plugin>@<upstream>": false`), since two
enabled plugins with one name conflict. The `marketplace/` path is resolved
against the repository's main checkout, so every worktree shares it.
Neither the marketplace nor vendored skills load in cloud sessions.

**What governance fixes when the list holds `opencode`.**

1. **The configuration is committed** as `opencode.json` at the root, and
   as `.opencode/opencode.json` only when the repository needs one.
   opencode also accepts `opencode.jsonc`, but the ADR-0022 check reads
   only `opencode.json`.
2. **Pin every plugin.** Each entry under `plugins` names an npm package
   at an exact version (`opencode-acme-plugin@1.2.0`), or a Git
   specification ending in a full 40-character commit hash. opencode
   checks any other form for updates at startup. A range, a tag or a bare
   name is forbidden. Updating a plugin means changing a version or a hash
   in a pull request.
3. **A local plugin** under `.opencode/plugins/` is committed, and the
   pull request that adds it is reviewed like code.
4. **Vendor as a last resort**, as for `claude-code`: a skill goes under
   `.claude/skills/<name>/`, which opencode reads. `.opencode/skills/` is
   for a skill only opencode uses.
5. **Skills an OpenSpec schema lists** are installed only on explicit
   request in the session, as [ADR-0016](ADR-0016-changes.md) rule 3 says.

`opencode.json` (the versions are examples; write the ones you reviewed):

```json
{
  "plugins": [
    "opencode-acme-plugin@1.2.0",
    "@acme/opencode-plugin@0.4.1"
  ]
}
```

opencode installs these plugins on startup: there is no per-contributor
install step.

**Departing from a rule** (vendoring everything to work offline, say) is
declared in your own ADR, with its reason.

**What the two Claude Code files look like** (the SHAs are examples; write
the commits you reviewed). `marketplace/.claude-plugin/marketplace.json`:

```json
{
  "name": "your-repo-tools",
  "owner": { "name": "Your Name" },
  "plugins": [
    {
      "name": "arc42-toolkit",
      "source": {
        "source": "github",
        "repo": "MSiccDev/arc42-toolkit",
        "sha": "0123456789abcdef0123456789abcdef01234567"
      }
    },
    {
      "name": "docs-hygiene",
      "source": {
        "source": "git-subdir",
        "url": "melodic-software/claude-code-plugins",
        "path": "plugins/docs-hygiene",
        "sha": "89abcdef0123456789abcdef0123456789abcdef"
      }
    }
  ]
}
```

`.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "your-repo-tools": {
      "source": { "source": "directory", "path": "./marketplace" }
    }
  },
  "enabledPlugins": {
    "arc42-toolkit@your-repo-tools": true,
    "docs-hygiene@your-repo-tools": true
  }
}
```

Everything below disappears when you rule, from this sentence up to the
Consequences heading, which stays.

**How to rule: five steps, all in this file.** Read all of them before
doing any, because the last one deletes the other four, and do them in one
commit.

1. **Write the value of each key** under `traits:` in the frontmatter, or,
   if you rule `rejected`, **remove the whole `traits:` block**.
2. **Change `status:`** from `proposed` to `accepted` or `rejected`.
3. **Fill `date:` and `authors:`**: `date:` as `YYYY-MM-DD`, the day you
   rule; `authors:`, the names of the people who decided, without email
   addresses.
4. **Rewrite the Positive, Negative and Neutral lists under Consequences**
   for your verdict: what it makes easier, and what it costs.
5. **Last, delete this block**, from its first sentence up to the
   Consequences heading, which stays. In its place, write the reason for
   your decision wherever you depart from the recommendation, or, if you
   adopt it as is, one line that says so.

The first step is the one people forget: a decision written only in prose
leaves an agent guessing. This is what the frontmatter looks like once
filled, and it is the one part of the file an agent reads without
interpreting it:

```yaml
---
adr: ADR-0017
slug: agent-tooling
title: Agent tooling
status: accepted
revision: 2
date: 2026-11-14
authors: [Your Name]
supersedes: []
check: npx --no-install ontrack-engineering-check ADR-0017
traits:
  agent:
    hosts: [claude-code]
---
```

**The `check:` line stays.** Once this ADR is `accepted`, `ontrack check`
runs it from your repository's root. It reads `agent.hosts` and checks
only that each host's settings file is committed, not what it says:

- `claude-code`: `.claude/settings.json`;
- `opencode`: `opencode.json` or `.opencode/opencode.json`.

It reads neither file: an entry with no `sha` or no exact version passes,
and review catches it. `[]` has nothing to check. A host it does not know
fails, and so does the revision 1 key `agent.host`, with the line to write
in its place.

The Alternatives Considered below were weighed by governance without
knowing your context. Weighing them against yours is still to do, and it is
what makes a decision different from an accepted default.

## Consequences

### Positive

- Every contributor and every agent gets the same skills, at the same
  commit, from a list kept in the repository, even when the upstream
  marketplace pins nothing.
- Updating a skill is a reviewed pull request that changes a SHA, never a
  silent change between two sessions.
- A vendored skill is read in review before it can pre-approve a tool.

### Negative

- `enabledPlugins` installs nothing: a contributor who skips
  `claude plugin install` works without the skills and may not notice.
- Pinned SHAs go stale; someone has to bump them, by hand or with a tool.
- The repository maintains a marketplace file of its own, one entry per
  plugin.
- The policy covers Claude Code and opencode only. A third host is a
  revision of this ADR.
- A repository with both hosts maintains two sets of settings, and the
  same plugin may not exist for both.

### Neutral

- Restricting which marketplaces may be used at all
  (`strictKnownMarketplaces`) is a managed setting, set by an administrator,
  outside any repository and outside this ADR.

## Alternatives Considered

### The repository's own marketplace, vendoring as a last resort

Recommended, for the reasons above.

### Upstream marketplaces, pinned by `ref`

Less to maintain: declare each upstream marketplace with a commit SHA as
its `ref`. But an upstream entry that points at another repository without
a `sha` still follows that repository's head, and the consuming repository
cannot fix someone else's marketplace file.

### One ADR per agent host

Keeps each host's rules apart, but `AGENTS.md` and `.claude/skills/` are
shared by both, and ADR-0022 would have to read one ADR per host to find
the deny.

### Vendor every skill

Everything under review and available offline, but each update is a manual
copy, and the repository carries the content of every skill it uses.

### A trait per ADR listing its skills

Puts the skill next to the decision, but copies what
`.claude/settings.json` already holds, and couples every ADR's answer to
plugin names that change.

### No policy

Each contributor installs what they like. Nothing to maintain, and no two
sessions are guaranteed the same tools.

## References

- Suggested skills: `plugin-structure` and `skill-development` from `plugin-dev@claude-plugins-official`; `check` from `skill-quality@melodic-software`, before vendoring a skill.
- Original to governance; no surdesrails SDR. The vendoring rule follows the
  one surdesrails SDR-0013 applies to its Angular skill.
- [ADR-0001](ADR-0001-record-architecture-decisions.md): how governance ADRs are ruled on, and why `Suggested skills` lines change no `revision`.
- [ADR-0016](ADR-0016-changes.md): skills listed by an OpenSpec schema.
- Claude Code documentation: [plugins for a team](https://code.claude.com/docs/en/plugins/org.md), [marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference.md) and [skills](https://code.claude.com/docs/en/skills.md), read on 2026-11-14.
- opencode documentation: [config](https://opencode.ai/docs/config/), [plugins](https://opencode.ai/docs/plugins/), [skills](https://opencode.ai/docs/skills/) and [instructions](https://opencode.ai/docs/instructions/), read on 2026-11-15.

**The key.**

| Key | What it holds | Allowed values |
| --- | --- | --- |
| `agent.hosts` | the agents whose project settings this repository uses | a list of `claude-code`, `opencode`; `[]` for none |

**What the check does not see.** It refuses an empty key, a value that is
not a list, and an unknown host. It reads neither the settings files nor the
marketplace file: an entry with no `sha` or no exact version passes it, and
review catches it.

**An empty key is not an answer**: this one is required. The value is
written in this file and nowhere else; whoever needs it links here. See
ADR-0001 for the check command.

**Revisions.** What changed in the question at each revision, and what
a repository that already ruled must re-answer.

- Revision 2: `agent.host` (one value) became `agent.hosts`, a list of `claude-code` and `opencode`, with rules for `opencode`. Re-answer: write your former value as a one-item list (`agent.hosts: [claude-code]`), or `agent.hosts: []` for `none`; add `opencode` if contributors use it.

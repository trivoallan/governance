# Design

## Context

`main` holds ADR-0001 to ADR-0016 (ADR-0015 secrets and ADR-0016 changes
landed after the `adopt-question-adrs` change), the schema
`adr/.mdschema.yml`, and the specs `adr-format` and `adr-catalog`.
ADR-0016's rule 3 already says an agent installs the skills an OpenSpec
schema lists only on explicit request. See proposal.md for why; the delta
specs say what each file must satisfy.

Facts this design relies on, from the Claude Code documentation
(`plugins/org`, `plugins/marketplace-reference`, `skills`), read on
2026-11-14:

- `.claude/settings.json` takes `extraKnownMarketplaces` (marketplace name
  to `{ source: {...} }`) and `enabledPlugins` (`plugin@marketplace` to
  `true`).
- Marketplace sources of type `github` or `git` take `ref`: a branch, a tag,
  or a full 40-character lowercase SHA, the SHA form needing Claude Code
  v2.1.324 or later. A pinned `ref` keeps refreshes and auto-updates on the
  reviewed commit. Plugin entries with their own remote source take `sha`.
- `enabledPlugins` installs nothing: each contributor runs
  `claude plugin install <plugin>@<marketplace> --scope project`, and
  project marketplaces register only after the workspace trust dialog.
- Project skills in `.claude/skills/<name>/SKILL.md` are committed and
  load in local sessions, not in cloud sessions; their `allowed-tools` can
  pre-approve tools.
- Restricting marketplaces (`strictKnownMarketplaces`) is a managed
  setting, out of a repository's reach.

## Goals / Non-Goals

**Goals:**
- One place that says how skills reach a repository, and one ADR revision
  that moves when that policy moves.
- Suggestions that help an agent carry out each decision without turning
  plugin names into answers a repository must keep in step.

**Non-Goals:**
- governance shipping its own skills or being a marketplace.
- Managed settings: what an administrator enforces is outside governance.
- Choosing skills for a repository: `.claude/settings.json` is the
  repository's list.

## Decisions

### One trait, `agent.host`; the list stays in `settings.json`

A trait per ADR (`skills: [...]`) would copy a fact Claude Code already
reads from `.claude/settings.json`, and the copy would drift; ADR-0009
already refuses traits that copy a checkable fact. A second trait choosing
between plugins and vendoring was weighed and dropped: the policy is the
same for every repository, and a repository that wants something else
departs in its own ADR.

### Plugins first, through the repository's own marketplace

Pinning an upstream marketplace's `ref` was the first design. It fails on
`superpowers@superpowers-marketplace`: that marketplace's entry points at
`obra/superpowers` with no `sha`, so the plugin follows that repository's
head whatever the marketplace's `ref` says, and a consuming repository
cannot fix someone else's marketplace file. The repository therefore keeps
its own marketplace in `marketplace/.claude-plugin/marketplace.json`
(required fields `name`, `owner.name`, `plugins`), with one entry per plugin
pinned by `sha` (`github`, `url`, or `git-subdir` with `path` for a plugin
in a monorepo such as `melodic-software/claude-code-plugins`), declared in
`.claude/settings.json` as a `directory` source with a relative path. Its
name must differ from upstream and reserved names; a contributor who also
has the upstream plugin turns that copy off in `.claude/settings.local.json`.
The path resolves against the main checkout, and cloud sessions register
no repository marketplace. Remote entries still need
`claude plugin install <plugin>@<marketplace> --scope project` per
contributor (plugins/org, plugins/loading).

Plugins pinned by SHA keep the repository small and updates explicit
(change the SHA). Vendoring puts the skill's content under review, which is
why it stays available for a skill no marketplace publishes, as surdesrails
SDR-0013 does for the Angular skill. Both forms are pinned; nothing
unpinned is allowed.

### ADR-0001 revised rather than superseded

ADR-0001's rule 4 freezes a ruled body. Read literally, changing ADR-0001
would need a superseding ADR. It is clarified instead: the freeze applies
to a repository's verdict, while governance revises what it ships through
`revision` (rule 6), which is what `ontrack plan` reports as `revised`.
ADR-0001 goes to `revision: 2` with that clarification and the rule that
`Suggested skills` lines change no `revision`. Consumers see one `revised`
line, once, because the rules really changed.

Alternative: put the suggestion rule in ADR-0017 and leave ADR-0001
untouched. Not chosen: the user preferred to keep every revision rule in
ADR-0001.

### Suggested skills, checked against real plugins

Checked against the plugins and marketplaces installed on the maintainer's
machine on 2026-11-14:

| ADR | Suggested skills | Plugin @ marketplace | Marketplace source |
|---|---|---|---|
| ADR-0001 | `develop-adr` | `pm-skills@product-on-purpose` | github `product-on-purpose/agent-plugins` |
| ADR-0007 | `test-driven-development` | `superpowers@superpowers-marketplace` | github `obra/superpowers-marketplace` |
| ADR-0008 | `write-for-humans` | `docs-hygiene@melodic-software` | github `melodic-software/claude-code-plugins` |
| ADR-0010 | `arc42-section-01` to `arc42-section-12`, `arc42-review` | `arc42-toolkit@arc42-toolkit` | github `MSiccDev/arc42-toolkit` |

Left out: `diataxis` (installed as a personal skill, with no marketplace
found), a LikeC4 skill (none known), and any skill for ADR-0002 to 0006,
0009, 0011 to 0016 (none confirmed). The rule is the spec's: no line
without a confirmed plugin.

### `agent.host` in the schema

`agent.host` gets an enum `[claude-code, none]`, optional like every trait
key, so a `rejected` ADR-0017 without `traits:` passes.

## Risks / Trade-offs

- [`enabledPlugins` installs nothing, so a contributor who skips
  `claude plugin install` silently runs without the skills] → ADR-0017
  states the install command and that `/plugin` reports "enabled in project
  settings but isn't installed here".
- [The repository maintains a marketplace file, one entry per plugin] →
  the cost of pinning plugins whose upstream marketplace does not; ADR-0017
  says so in its Negative consequences.
- [Plugin names in `Suggested skills` lines go stale] → they change no
  `revision`, so a stale line costs a fix, not a `revised` for consumers;
  review catches it.
- [Vendored skills can pre-approve tools through `allowed-tools`] → review
  reads that field in the pull request that vendors the skill.
- [ADR-0001's revision 2 is a body change to an `accepted` ADR] → the
  clarified rule 4 says why that is a revision, not a supersession.

## Migration Plan

One pull request: ADR-0017, ADR-0001 revision 2, the four `Suggested
skills` lines, the schema line, and this change. Rollback: revert the
pull request; consumers that imported revision 2 would then see ADR-0001
change revision again in `ontrack plan`.

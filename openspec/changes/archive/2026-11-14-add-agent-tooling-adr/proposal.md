# Proposal

## Why

Once a repository rules an ADR, an agent knows *what* was decided but not
*how* to carry it out: ADR-0006 says `commitlint`, nothing says how to set
it up. Claude Code skills package that know-how, and several already fit
governance's ADRs (`pm-skills:develop-adr`, `arc42-toolkit`, `diataxis`).
governance targets Claude Code first, and should say how skills reach a
repository without making them part of each ADR's answer.

## What Changes

- Add **ADR-0017 "Agent tooling"**, a question ADR with one trait,
  `agent.host` (`claude-code`, `none`). Its Decision fixes the policy, the
  same for every repository:
  - **Plugins first, through the repository's own marketplace.** Skills
    come as plugins listed in `marketplace/.claude-plugin/marketplace.json`,
    each entry pinned by `sha` to its plugin's repository, and declared in
    `.claude/settings.json` (`extraKnownMarketplaces`, `enabledPlugins`).
    Third-party marketplaces are not enabled directly, since their entries
    may be unpinned. The list lives in those files, not in a trait.
  - **Vendoring as a last resort.** A skill no marketplace publishes is
    copied into `.claude/skills/<name>/`, fetched at a tag, checked against
    a hash, committed and reviewed in the pull request, `allowed-tools`
    included.
  - **Forbidden:** an entry with no `sha`, a third-party marketplace enabled
    directly, a `package.json` key, `npx -y`.
  - **Stated facts:** `enabledPlugins` installs nothing, so each contributor runs
    `claude plugin install <plugin>@<marketplace> --scope project` after
    accepting the workspace trust dialog; vendored project skills do not
    load in cloud sessions.
  - Aligned with ADR-0016 rule 3: skills listed by an OpenSpec schema are
    still installed only on explicit request.
- **ADR-0001 moves to `revision: 2`**, with two additions:
  - rule 4 (the body freezes once ruled) applies to a repository's verdict;
    the ADRs governance ships evolve through `revision` (rule 6);
  - a `Suggested skills` line in an ADR's References is advice: changing it
    does not change that ADR's `revision`.
- Add a **`Suggested skills` line** to the References of each shipped ADR
  for which a skill really exists, with its plugin and marketplace names
  checked. ADRs with no fitting skill get no line.
- Add `agent.host` to `adr/.mdschema.yml`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-format`: the revision rule distinguishes a repository's frozen
  verdict from governance's revisions of the ADRs it ships, and exempts
  `Suggested skills` lines from revision bumps.
- `adr-catalog`: the catalog gains ADR-0017 and its `agent.host` trait.

## Impact

- `adr/ADR-0001-record-architecture-decisions.md`: body change, revision 1
  to 2. Consuming repositories see it once as `revised 1 → 2` in
  `ontrack plan`.
- `adr/ADR-0017-agent-tooling.md`: new.
- `adr/ADR-0002` to `ADR-0016`: a References line where a skill fits; no
  revision change.
- `adr/.mdschema.yml`: one trait added.
- Plugin names and marketplaces in the `Suggested skills` lines must be
  checked before writing; a name that cannot be confirmed is left out.

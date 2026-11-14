# Spec Delta

## MODIFIED Requirements

### Requirement: Shipped ADRs
governance SHALL ship exactly these ADRs, each adapted from the named SDR
unless the table says it is original:

| ADR | slug | from | status as shipped |
|---|---|---|---|
| ADR-0001 | record-architecture-decisions | SDR-0001 | accepted |
| ADR-0002 | localization | SDR-0002 | proposed |
| ADR-0003 | architecture | SDR-0003 | proposed |
| ADR-0004 | languages | SDR-0004 | proposed |
| ADR-0005 | validation | SDR-0005 | proposed |
| ADR-0006 | commits | SDR-0006 | proposed |
| ADR-0007 | tests | SDR-0007 | proposed |
| ADR-0008 | documentation | SDR-0008 | proposed |
| ADR-0009 | branching | SDR-0009 | proposed |
| ADR-0010 | architecture-documentation | SDR-0003 (`architecture.document` only) | proposed |
| ADR-0011 | forge-and-ci | SDR-0010 | proposed |
| ADR-0012 | delivery | SDR-0011 | proposed |
| ADR-0013 | frontend | SDR-0013 | proposed |
| ADR-0014 | work-tracking | SDR-0014 | proposed |
| ADR-0015 | secrets | none (original to governance) | proposed |
| ADR-0016 | changes | none (original to governance) | proposed |
| ADR-0017 | agent-tooling | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the seventeen files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

### Requirement: ADR-0001 describes the ruling mechanics
ADR-0001 SHALL ship `accepted`, at `revision: 2`, with the trait
`record-architecture-decisions.format` set to `nygard` (the template of
`/pm-skills:develop-adr`) in place of SDR-0001's `MADR`. Its Consequences SHALL state
that governance is an adaptation of surdesrails meant to be imported instead
of it, and that nothing detects when an SDR it adapts changes. Its Decision
SHALL state that the freeze of a ruled body applies to a repository's
verdict, that governance revises the ADRs it ships through `revision`, and
that a `Suggested skills` line changes no `revision`.

#### Scenario: Drift is written down
- **WHEN** the Consequences of ADR-0001 are read
- **THEN** they name surdesrails and state that drift from it is detected only by reading the References source lines

#### Scenario: Revised once for the new rules
- **WHEN** a repository that imported ADR-0001 at revision 1 runs `ontrack plan` after this change
- **THEN** ADR-0001 is reported `revised` from revision 1 to 2

## ADDED Requirements

### Requirement: ADR-0017 asks which agent host the repository uses
ADR-0017 SHALL ask `agent.host` (`claude-code`, `none`), recommending
`claude-code`. Its Decision SHALL fix, for every repository that rules
`claude-code`:
- skills arrive as plugins from the repository's own marketplace,
  `marketplace/.claude-plugin/marketplace.json`, named distinctly from any
  upstream marketplace, declared in `.claude/settings.json` through
  `extraKnownMarketplaces` (a `directory` source) and `enabledPlugins`;
- every entry of that marketplace pins its plugin to a full commit SHA in
  `sha`, and no third-party marketplace is enabled directly;
- a skill no marketplace publishes is copied into `.claude/skills/<name>/`
  at a tag, checked against a hash, and reviewed in the pull request,
  including its `allowed-tools`;
- an unpinned source, a `package.json` key and `npx -y` are forbidden;
- skills listed by an OpenSpec schema are installed only on explicit
  request, as ADR-0016 rule 3 says.
The list of plugins SHALL live in the repository's marketplace and
`.claude/settings.json`, not in a trait.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0017 is read
- **THEN** it holds only `agent.host`

#### Scenario: Pinned entries
- **WHEN** a repository has ruled ADR-0017 `accepted` with `agent.host: claude-code`
- **THEN** every plugin entry in its `marketplace/.claude-plugin/marketplace.json` has a `sha` of 40 lowercase hexadecimal characters, and every marketplace in `extraKnownMarketplaces` is a `directory` source inside the repository

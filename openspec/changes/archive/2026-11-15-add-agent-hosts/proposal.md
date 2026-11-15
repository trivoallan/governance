# Proposal

## Why

ADR-0017 asks for a single `agent.host`, and only `claude-code` is a real
answer. A team where one contributor works in Claude Code and another in
opencode cannot say so. The second contributor's repository rules `none`, or
`claude-code` while half the team works without its settings. ADR-0022's
guards (the agent never approves, and with `review.by: maintainer` never
merges) are then checked only in `.claude/settings.json`. The opencode session
can still run `gh pr review` or `gh pr merge`, and the check stays green.
The managed `AGENTS.md` block already reaches opencode, which reads `AGENTS.md`
natively. The gap is the host's own settings and the merge guard.

## What Changes

- **BREAKING** ADR-0017 revision 2 replaces `agent.host` (one value) with
  `agent.hosts`, a list of `claude-code` and `opencode`. `[]` replaces `none`.
  Every repository that ruled ADR-0017 re-answers it.
- ADR-0017's Decision gets one section of rules per host. The `claude-code`
  rules stay as they are. The `opencode` rules are new:
  - the configuration is committed as `opencode.json`;
  - every npm entry under `plugins` is pinned to an exact version, and every
    Git entry to a full commit hash;
  - local plugins are committed and reviewed;
  - vendored skills go under `.claude/skills/<name>/`, which opencode also
    reads, so one copy serves both hosts.
- The ADR-0017 check leaves the wiring table for a check of its own. It
  validates the list, requires each host's committed settings file, and refuses
  the old `agent.host` key. The refusal is a message naming the new key; there
  is no compatibility read.
- ADR-0022 revision 3, on top of revision 2 (`review.by`, `review.approvals`):
  for each host in `agent.hosts`, the committed settings must deny
  `gh pr review`, and with `maintainer` also `gh pr merge`. For opencode, the check reads the V2 `permissions`
  array and evaluates the rules in order, last match wins, the way opencode
  does. So a later `allow` defeats an earlier `deny`, and the check fails. A V1
  `permission` object fails with a message to convert it.
- ADR-0026 (agent identity, not yet released) reads `agent.hosts`, and says
  that opencode runs shell commands without a sandbox, so the maintainer's
  credentials are kept apart by running the agent where they do not exist.
- The catalog's `.mdschema.yml` and the README's Agents row follow.
- governance's own ruled copies under `docs/adr/trivoallan/` are not touched:
  as for every revision, they move when governance imports its next release.
  The managed `AGENTS.md` block follows that import.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0017 asks `agent.hosts`, with per-host rules for
  `claude-code` and `opencode`. ADR-0022 states the opencode deny.
- `adr-checks`:
  - the ADR-0017 row leaves the wiring table for a dedicated ADR-0017 check;
  - the ADR-0022 check loops over the declared hosts and reads opencode's V2
    permissions;
  - the "Trait not set" scenario moves to another ADR.

## Impact

- `adr/ADR-0017-agent-tooling.md`, `adr/ADR-0022-review-and-merge.md`,
  `adr/ADR-0026-agent-identity.md`, `adr/.mdschema.yml`.
- `checks/ontrack-engineering-check.ts` and
  `checks/ontrack-engineering-check.test.ts`.
- `README.md`: the Agents row names `opencode.json` next to `.claude/settings.json`, under the existing readme requirement that a verified claim has a check (no readme spec delta).
- Repositories that import governance and ruled ADR-0017:
  - the new revision asks them to re-rule;
  - until they do, the ADR-0017 check and the ADR-0022 check fail, with a
    message that names `agent.hosts`.
- No new dependency. JSON is parsed as it is today.

# Tasks

## 1. ADR-0017 check

- [x] 1.1 Add the `HOSTS` table to `checks/ontrack-engineering-check.ts`.
  - It gives each host its files and a deny function that takes the
    commands to check.
  - Move the Claude Code deny logic out of `denies()` into
    `HOSTS['claude-code'].deny`.
  - Verify: the existing ADR-0022 tests still pass with `npm test`.
- [x] 1.2 Add the dedicated ADR-0017 check: `agentTooling`.
  - It refuses `agent.host` with the rename message.
  - It validates `agent.hosts` as a list of `claude-code` and `opencode`.
  - `[]` has nothing to check.
  - It requires a tracked file per host.
  - Remove the ADR-0017 row from `WIRING`.
  - Verify: there is a test per ADR-0017 scenario in the adr-checks delta.
- [x] 1.3 Cover the trait parser's edges with tests: `hosts: []` reads as an
  empty list, and `hosts:` with no value reads as not set. Verify: the
  "No host" and "hosts not set" tests pass.
- [x] 1.4 Move the "Trait not set" wiring test from ADR-0017 to ADR-0018
  `updater:`, and drop the ADR-0017 entry from the per-ADR wiring table.
  Verify: `npm test` passes.

## 2. ADR-0022 deny across hosts

- [x] 2.1 Change `denies()` so that it reads `agent.hosts` through
  `toolAnswer`, fails on an accepted ADR-0017 that still holds `agent.host`,
  prints "no deny to check" for `[]` or an absent key, and otherwise checks
  `gh pr review` (and `gh pr merge` with `maintainer`) on each host. Verify:
  the "No agent host", "Revision 1 key in ADR-0017" and "One host of two
  fails" tests pass.
- [x] 2.2 Implement `HOSTS.opencode.deny`.
  - It refuses tracked `.jsonc` files and the V1 `permission` key.
  - It joins the `permissions` arrays from `opencode.json` and
    `.opencode/opencode.json`, in that order.
  - It matches `action` and `resource` as opencode's wildcard patterns.
  - It requires the last applicable rule to be `deny` for the command alone
    and with an argument, and names the rule that decides.
  - Verify: the opencode tests (deny, peer review only, `sh*` action, later
    allow, one-flag deny, no rule, `.opencode/` override, V1, jsonc,
    malformed, untracked) pass.
- [x] 2.3 Rewrite the existing ADR-0022 test fixtures to use
  `hosts: [claude-code]` and `hosts: []`. Verify: `npm test` is green, and
  the coverage is at or above 90% (ADR-0007).

## 3. Shipped ADRs

- [x] 3.1 Rewrite `adr/ADR-0017-agent-tooling.md` as revision 2: the
  `agent.hosts` key, the `opencode` rules and example, the how-to-rule check
  paragraph, the "One ADR per agent host" alternative, opencode References,
  and a Revisions entry. Verify: `adr-revisions.test.ts` passes.
- [x] 3.2 Update `adr/.mdschema.yml`: replace `traits.agent.host` with
  `{ name: "traits.agent.hosts", type: array, optional: true }`. Verify:
  the only new mdschema finding on the shipped ADRs is the empty proposed
  list, as for `commits.scopes` and `branching.prefixes`.
- [x] 3.3 Rewrite `adr/ADR-0022-review-and-merge.md` as revision 3, on top
  of revision 2: denies per host, with the opencode rules for
  `gh pr review *` and, with `maintainer`, `gh pr merge *`, placed last; the
  check paragraph per host; a `Revision 3:` entry. Verify:
  `adr-revisions.test.ts` passes.
- [x] 3.4 Edit `adr/ADR-0026-agent-identity.md` at revision 1 (unreleased):
  read `agent.hosts`, and say that opencode runs shell commands without a
  sandbox, so the maintainer's credentials are kept apart by running the
  agent where they do not exist. Verify: no `agent.host` left in `adr/`
  outside the revision notes.

## 4. Docs

- [x] 4.1 Leave governance's own copies under `docs/adr/trivoallan/` and the
  managed `AGENTS.md` block to the next import. Verify: `ontrack plan`
  reports nothing out of date.
- [x] 4.2 Update the README Agents row: both hosts read `AGENTS.md`; each
  declared host's settings exist and deny the commands. Verify:
  `readme.test.ts` passes.

## 5. Whole-change verification

- [x] 5.1 Run `npm test` and `openspec validate add-agent-hosts --strict`.
  Verify: both are green. The built check, run on governance's own copies
  (still revision 1), fails ADR-0017 with the line to write, as it already
  fails ADR-0022 on main: both clear at the next import.

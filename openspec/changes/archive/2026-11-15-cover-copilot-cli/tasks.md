# Tasks

## 1. Confirm Copilot CLI's behaviour

- [x] 1.1 In throwaway trusted repos, verify with Copilot CLI 1.0.112 that `.claude/settings.json`'s directory marketplace and `enabledPlugins` install plugins at their pinned `sha`, that `.claude/skills/` loads, that `permissions.deny` is ignored, and that the two-hook `Bash` entry from design.md blocks `gh pr review` and `gh pr merge` while a harmless command runs
- [x] 1.2 Run the same hook requests in Claude Code; verify the same outcome

## 2. Checks

- [x] 2.1 Add tests to `checks/ontrack-engineering-check.test.ts` for the `adr-checks` delta: ADR-0017 with `[copilot]`; ADR-0022 with `[copilot]` (both hooks, peer review only, deny entries only, hook on another tool, matchers absent, `*`, `.*`, `Bash|Edit`, invalid pattern, untracked, invalid JSON) and with `[claude-code, copilot]`; verify they fail against the current check
- [x] 2.2 Add `copilotHook` and the `copilot` row to `HOSTS` in `checks/ontrack-engineering-check.ts`, with the failure naming Copilot CLI and `permissions.deny` and a `ponytail:` comment on the substring ceiling; verify `npm test` passes with coverage at or above 90%

## 3. ADRs and README

- [x] 3.1 ADR-0017: `revision: 3`, `copilot` in the recommendation text, the key table and the check description, a `copilot` rules section (Copilot CLI 1.0.112, 2026-11-15, cloud agent and VS Code not covered), the Negative consequence about hosts, and a `Revision 3:` entry; verify the ADR revision tests pass
- [x] 3.2 ADR-0022: the `copilot` hook example and its check bullet, and `copilot` in the ceiling paragraph; verify `revision: 3` is unchanged
- [x] 3.3 ADR-0026: a `copilot` paragraph on credentials beside the `opencode` one; verify `revision` is unchanged
- [x] 3.4 README: name Copilot CLI in the Agents row; verify the readme tests pass

## 4. Verify

- [x] 4.1 Run `npm test`, every check governance runs on itself, and `openspec validate cover-copilot-cli`; verify all pass, except the checks that fail on main too because `docs/adr/trivoallan/` holds older revisions

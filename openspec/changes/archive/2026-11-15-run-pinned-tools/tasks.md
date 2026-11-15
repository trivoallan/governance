# Tasks

## 1. Answers that count

- [x] 1.1 Make `toolAnswer` count a copy only when it is `accepted` and no accepted ADR under `docs/adr/` supersedes it (plain, `<namespace>/` and `local/` references, by `adr:` value or file name), returning the reason otherwise; test the three "Another ADR read as an answer" scenarios, then `npm test`
- [x] 1.2 Add the `<namespace>/<number>` helper and use it where ADR-0009 and ADR-0022 name another ADR; update their messages to give the reason (not accepted, superseded by …); test "Tool branch refused when its ADR is superseded", "Agent host not ruled yet" and "Installed under an alias", then `npm test`

## 2. Pinned tools

- [x] 2.1 Add the `PINNED` table (ADR-0015 `secrets.guard`, ADR-0011 `forge.audit`) and split `runTool` by kind: pinned tools skip `node_modules/.bin`, use `mise -C <root> which` when ADR-0025 counts and rules `mise`, `PATH` otherwise; openspec unchanged. Test the six "Repository tools" scenarios with a stub `mise` and a decoy `node_modules/.bin/gitleaks`, then `npm test`
- [x] 2.2 Add `governance-check ADR-0025` per its requirement (mise, script, aqua, none; known vs unforeseen values; superseded ADRs); test its seven scenarios, then `npm test` and check coverage stays at or above 90%

## 3. ADR texts

- [x] 3.1 In `adr/ADR-0025-tools.md`, add `check: npx --no-install governance-check ADR-0025`, describe the check in the how-to-rule block, and rewrite the Neutral consequence on what review keeps; verify `revision: 1` is unchanged
- [x] 3.2 In `adr/ADR-0015-secrets.md` and `adr/ADR-0011-forge-and-ci.md`, say where the check takes its tool (mise under ADR-0025, else `PATH`, never `node_modules/.bin`), link ADR-0025, and drop `brew`, `pipx` and `uvx`; verify their `revision` values are unchanged and `npm test` (adr-revisions) passes

## 4. mdschema

- [x] 4.1 Add `@jackchuka/mdschema` at an exact version to `dependencies` with `npm install --save-exact --ignore-scripts`; verify `package-lock.json` holds it and its platform packages, and `npm pack --dry-run` lists `adr/.mdschema.yml`
- [x] 4.2 Add `governance-check ADR-0001` per its requirement (mdschema resolved from governance's package, schema passed with `--schema`, `proposed` copies skipped); test its five scenarios including the decoy `node_modules/.bin/mdschema`, then `npm test`
- [x] 4.3 In `adr/ADR-0001-record-architecture-decisions.md`, add the `check:` line, rewrite rule 7 (no `npx`, no copy, no release binary), raise `revision` to 4 and add the `Revision 4:` entry; verify `npm test` (adr-revisions) passes

## 5. zizmor job

- [x] 5.1 In `.github/workflows/zizmor.yml`, replace the `sed` step and `zizmor-action` with `jdx/mise-action` (pinned SHA, mise `2026.11.8`, `install_args: zizmor`) and `zizmor --no-config --format=github .github/workflows` with `GH_TOKEN`; keep the job name `zizmor`; verify `zizmor --offline` and `governance-check ADR-0011` pass on the workflow

## 6. Validate

- [x] 6.1 Run `node checks/governance-check.ts ADR-0025` in this repository (`tools.manager: mise`, after `mise trust && mise install --locked`); verify it lists gitleaks and zizmor with their mise paths and exits `0`
- [x] 6.2 Run `node checks/governance-check.ts ADR-0001` in this repository; verify it checks the ruled copies under `docs/adr/trivoallan/` and exits `0`
- [x] 6.3 Run `openspec validate run-pinned-tools --strict`; verify it passes

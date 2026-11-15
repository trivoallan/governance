# Tasks

## 1. Before starting

- [x] 1.1 Archive `run-pinned-tools` (design: archive order); verify `openspec list` no longer shows it and `openspec validate rename-check-command --strict` still passes

## 2. The command

- [x] 2.1 `git mv` `checks/governance-check.ts` and `checks/governance-check.test.ts` to `checks/ontrack-engineering-check.ts` and `checks/ontrack-engineering-check.test.ts`, and update the test's script and `dist/` paths; verify `git status` shows two renames
- [x] 2.2 In the script, change the header comment, `USAGE`, the `mkdtempSync` prefix and the "no check" message to the new name and "this package ships no check for …", and change "governance ships" / "governance's" comments about the package to "this package"; verify `npm test` passes once the test assertions on the usage line and "no check" message follow
- [x] 2.3 In `package.json`, set `files` to `dist/ontrack-engineering-check.js` and `bin` to both `ontrack-engineering-check` and `governance-check` pointing at it; verify `npm pack --dry-run` lists that one script and no `.ts`
- [x] 2.4 Add a test that `package.json` maps both names to the one shipped script, which npm links into `node_modules/.bin` (spec: Both names installed, Old name still runs); verify it passes and fails when the alias entry is removed. A packed-tarball install is left out: it fetches every dependency from the registry, under the cooldown

## 3. Shipped ADRs

- [x] 3.1 Rewrite every `check:` line and every quoted `governance-check` command in `adr/*.md` to `ontrack-engineering-check`, without touching `revision:`; verify `git grep governance-check adr/` prints nothing and `git diff adr/ | grep '^[-+]revision'` prints nothing
- [x] 3.2 Change "governance ships" in `adr/*.md` (ADR-0001, ADR-0010) and in `adr/.mdschema.yml`'s comments to "this package ships", leaving other mentions of governance (design: non-goals); verify `git grep -n "governance ships" adr/` prints nothing

## 4. Repository wiring

- [x] 4.1 Point `.github/workflows/ci.yml`, `.github/apply-session.md`, `checks/test-helpers.ts` and `.github/workflows/release.yml`'s comment at the new file names; verify `git grep -n "governance-check" -- ':!CHANGELOG.md' ':!openspec/' ':!docs/adr/' ':!package.json'` prints nothing
- [x] 4.2 Rename the README table header to `What \`ontrack-engineering-check\` verifies`; verify `npm test` passes its readme tests
- [x] 4.3 Run `npm run build`, `npm test`, `node checks/ontrack-engineering-check.ts ADR-0006 --from origin/main` and `node checks/ontrack-engineering-check.ts ADR-0009`; verify each exits 0
- [x] 4.4 Run `openspec validate rename-check-command --strict`; verify it passes

## 5. Alias removal (tracked, not done here)

- [x] 5.1 Once the person approves its text, open a GitHub issue to remove the `governance-check` alias in a later breaking change. It should list the specs still naming the old command (`adr-checks` siblings, `readme`, `repo-tooling`, `dependency-updates`) and the re-import of `docs/adr/trivoallan/`. Verify `gh issue view` shows it in `trivoallan/ontrack-engineering`

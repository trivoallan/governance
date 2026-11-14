# Tasks

## 1. Shared pieces

- [x] 1.1 In `checks/governance-check.mjs`, parse `--branch <name>` next to `--from <ref>` and pass `{ from, branch }` to every check; add `runTool(root, name, args, trait)` (repository `node_modules/.bin` first, then `PATH`, `stdio: 'inherit'`, `ENOENT` becomes a `CheckError` naming the tool and trait); verify in `checks/governance-check.test.mjs` the "Tool installed in the repository" and "Tool missing" scenarios with a stand-in binary, and that every existing test still passes

## 2. The three checks

- [x] 2.1 Add the ADR-0009 check (branch from `--branch`, `GITHUB_HEAD_REF`, then `git branch --show-current`; default branch from `origin/HEAD` with the `main`/`master` fallback; form regex built from `branching.prefixes`); verify the "Conforming branch", "Prefix outside the list", "Description not in kebab case", "Pull request in CI", "Explicit branch", "Default branch" and "Prefixes not set" scenarios
- [x] 2.2 Add the ADR-0015 check (`gitleaks git --log-opts=<from>..HEAD --redact --verbose --no-banner`, `none` and other values have nothing to check, empty is not set); verify with a stand-in the arguments and the exit status passed through, the "Guard none" scenario, and, when `gitleaks` is on `PATH`, the "No leak", "Leak in a branch commit" (the key absent from the output) and "Leak before the base" scenarios with the real tool
- [x] 2.3 Add the ADR-0016 check (config `schema:` equals `changes.schema`, then `openspec schema validate`, then `openspec validate --all --no-interactive`, all reported); verify with stand-ins the "Config names another schema", "Invalid change", "Framework none" and "Schema none with openspec" scenarios, and, when `openspec` is on `PATH`, the "Ruled schema in use and valid" scenario with the real tool
- [x] 2.4 Verify "Repository left untouched" for each of the three checks, then run `npm test`; verify every test passes

## 3. ADRs

- [x] 3.1 In ADR-0009, ADR-0015 and ADR-0016, add `check: npx --no-install governance-check <number>` after `supersedes:` and in the filled frontmatter example, and a how-to-rule note per the `adr-catalog` delta; keep each `revision`; verify with `git diff` that only lines are added and no `revision` changes
- [x] 3.2 Copy a ruled ADR-0015 (accepted, traits filled, how-to-rule block removed, `check:` kept) into a scratch directory with `adr/.mdschema.yml` and run `npx @jackchuka/mdschema@0.15.1 check '*.md'`; verify no violation

## 4. End to end

- [x] 4.1 In a scratch consumer with ontrack and this branch of governance, `npx ontrack apply`, rule ADR-0009 (`prefixes: [feat, fix]`) and ADR-0015 (`guard: gitleaks`) `accepted`, work on branch `chore/x` with a commit adding a private key, and run `npx ontrack check`; verify both are reported `fail`, then on a branch `feat/x` with no secret, both `pass`
- [x] 4.2 Run `openspec validate add-tool-checks --strict`; verify it passes

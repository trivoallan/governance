# Tasks

Every ADR edit below is written with `/pm-skills:develop-adr`, keeping the
Nygard sections and frontmatter of the `adr-format` spec.

## 1. Package

- [x] 1.1 In `package.json`, add `bin: { "governance-check": "checks/governance-check.mjs" }`, `files: ["adr/", "checks/governance-check.mjs"]`, `engines.node: ">=22.18"`, a `test` script `node --test checks/*.test.mjs`, and dev dependencies `@commitlint/cli` and `@commitlint/config-conventional` at `^21.2.4`; verify `npm install` succeeds and `npm pack --dry-run` lists `checks/governance-check.mjs` and no test file

## 2. The command

- [x] 2.1 Write `checks/governance-check.mjs` (shebang, Node built-ins only): argument parsing (`<number>`, optional `--from <ref>`), the table from ADR number to check, the single-match lookup of `docs/adr/*/<number>-*.md`, and the line-by-line read of `traits.commits.scopes` (flow and block lists) and `traits.commits.tool`; verify in `checks/governance-check.test.mjs` the "ADR missing", "No check for that ADR" and "Not ruled" scenarios of the `adr-checks` spec
- [x] 2.2 Add the `hook` and `none` branch; verify the "Tool is none" and "Tool is hook" scenarios, exact output line and exit `0`
- [x] 2.3 Add the `commitlint` branch: resolve both packages from the repository root, write the temporary config outside the repository, run the CLI with `--from` (default `origin/HEAD`) and `--to HEAD`, pass its status through, remove the temporary directory; verify the "Conforming commits", "Scope outside the list", "No scope allowed", "Other base" and "commitlint not installed" scenarios in throwaway git repositories, and the "Repository left untouched" scenario by comparing `git status --porcelain` before and after
- [x] 2.4 Run `npm test`; verify every test passes

## 3. ADRs

- [x] 3.1 In `adr/ADR-0006-commits.md`, add `check: npx --no-install governance-check ADR-0006` after `supersedes:`, and in the how-to-rule block say what the check does for each `commits.tool` value, that `commitlint` needs `@commitlint/cli` and `@commitlint/config-conventional` installed, and that `--from <ref>` may be appended; keep `revision: 1`; verify with `git diff` that the frontmatter change is that one line and that the filled frontmatter example in the block shows the line too
- [x] 3.2 In `adr/ADR-0001-record-architecture-decisions.md`, add to the Decision that an ADR may carry a `check:` line run by `ontrack check` once `accepted`, that `check:` lines and their scripts change no `revision` and follow the package version, and that a repository that ruled an ADR before its `check:` line existed adds it by hand; extend rule 6 accordingly, add an `ontrack check` reference, set `revision: 3`; verify the Negative about `mdschema` is still there
- [x] 3.3 Copy a ruled ADR-0006 (status `accepted`, traits filled, how-to-rule block removed, `check:` kept) and ADR-0001 into a scratch directory with `adr/.mdschema.yml` and run `npx @jackchuka/mdschema@0.15.1 check '*.md'`; verify no violation

## 4. End to end

- [x] 4.1 In a scratch consumer, install ontrack and this branch of governance, `npx ontrack apply`, rule ADR-0006 `accepted` with `tool: commitlint` and `scopes: [api]`, install commitlint, commit `fix(backend): x` on a branch, and run `npx ontrack check`; verify ADR-0006 is reported `fail` with commitlint's report and exit `2`, then after amending to `fix(api): x`, `pass` and exit `0`
- [x] 4.2 In the same consumer, run `npx ontrack plan` against `main` then this branch; verify ADR-0001 is reported `revised` from 2 to 3 and ADR-0006 `unchanged`
- [x] 4.3 Run `openspec validate add-adr-0006-check --strict`; verify it passes

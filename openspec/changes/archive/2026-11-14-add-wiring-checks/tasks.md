# Tasks

Every ADR edit below is written with `/pm-skills:develop-adr`, keeping the
Nygard sections and frontmatter of the `adr-format` spec.

## 1. The wiring check

- [x] 1.1 In `checks/governance-check.mjs`, add the tracked-file list (one `git ls-files -z` from the repository root) and the pattern helper (`*` within a segment, leading `**/` for any directory); verify in `checks/governance-check.test.mjs` the "Untracked file does not count" scenario of the `adr-checks` spec
- [x] 1.2 Add the three row kinds (`exists` with entries of alternatives, `contains`, `path`), the per-trait output lines, the "nothing to check" rule for values with no row, the "not set" error for an empty key, and the dispatch (dedicated check, then `WIRING`, then "no check"); verify the "Row passes", "Row fails", "Every entry must match", "Value none", "Unforeseen value" and "Trait not set" scenarios, and that the existing "No check for that ADR" test still passes for ADR-0003
- [x] 1.3 Add the `WIRING` rows of the `adr-checks` spec's "Wiring rows" requirement, the arc42 row reading `docs.root` from ADR-0008 with the `docs/` fallback, the automerge row conditioned on `dependencies.updater: dependabot`, the URL rule for `deployment.manifests`, and the ruleset note on ADR-0011's line; verify the "arc42 under another root", "Gate states its ceiling", "Manifests elsewhere", "Provenance step present" and "Several traits in one ADR" scenarios, plus one passing test per remaining row
- [x] 1.4 Verify the "Repository left untouched" scenario for a wiring check by comparing `git status --porcelain` before and after, then run `npm test`; verify every test passes, ADR-0006's included, and `npm pack --dry-run` still lists only `adr/` and `checks/governance-check.mjs` from `checks/`

## 2. ADRs

- [x] 2.1 In ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018 and ADR-0021, add `check: npx --no-install governance-check <number>` after `supersedes:` and to the filled frontmatter example of the how-to-rule block, and say in that block that the line runs once the ADR is `accepted`, which files it looks for per value, that it checks presence only, and that a value with no row passes with "nothing to check"; in ADR-0011, add that the ruleset is not verified; keep each `revision`; verify with `git diff` that each frontmatter change is that one line and each `revision` is unchanged
- [x] 2.2 Copy a ruled ADR-0018 (status `accepted`, traits filled, how-to-rule block removed, `check:` kept) into a scratch directory with `adr/.mdschema.yml` and run `npx @jackchuka/mdschema@0.15.1 check '*.md'`; verify no violation

## 3. End to end

- [x] 3.1 In a scratch consumer, install ontrack and this branch of governance, `npx ontrack apply`, rule ADR-0018 `accepted` with `updater: dependabot` and `automerge: patch`, commit no `.github/dependabot.yml`, and run `npx ontrack check`; verify ADR-0018 is reported `fail` and the output names `.github/dependabot.yml`, then after committing it and an automerge workflow using `dependabot/fetch-metadata`, `pass`
- [x] 3.2 In the same consumer, run `npx ontrack plan` against `main` then this branch; verify the seven ADRs are reported `check` (ontrack's category for an up-to-date ADR whose source `check:` line differs) with only the `+ check:` line, no `revised`, and that `npx ontrack apply` reports them `synced` and writes only that line
- [x] 3.3 Run `openspec validate add-wiring-checks --strict`; verify it passes

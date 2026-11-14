# Tasks

> Coordination: if `migrate-checks-to-typescript` has landed, `checks/governance-check.mjs` is `checks/governance-check.ts` (run with `node`, which strips types) and its test is `checks/governance-check.test.ts`.

## 1. Check

- [x] 1.1 In the ADR-0009 check of `checks/governance-check.mjs`, pass names starting with `release-please--`, `dependabot/` or `renovate/` with a "tool branch, nothing to check" message, after the default-branch test; add tests in `checks/governance-check.test.mjs` for the "Release tool branch", "Update tool branch" and "Tool prefix needs its separator" scenarios, then run `npm test`; verify every test passes
- [x] 1.2 Check the branch form `releaser-pleaser` (ADR-0012) opens; if it is fixed and not covered, add it to the list and to both spec deltas; verify the decision is noted in the pull request

## 2. ADRs

- [x] 2.1 In `adr/ADR-0009-branching.md`, add one sentence to the how-to-rule note saying tool branches (`release-please--…`, `dependabot/…`, `renovate/…`) have nothing to check; verify with `git diff` that `revision` is unchanged
- [x] 2.2 Run `npx ontrack plan` then `npx ontrack apply`; verify `docs/adr/trivoallan/ADR-0009-branching.md` now holds `check: npx --no-install governance-check ADR-0009`, and `npx ontrack plan` reports nothing left for ADR-0009

## 3. Agent instruction

- [x] 3.1 Add a short "Branches" section to `AGENTS.md` after `<!-- ontrack:end -->`: rename a branch not starting with an allowed prefix to `<prefix>/<description-in-kebab-case>` with `git branch -m` before its first push, prefix taken from the commit type; verify `npx ontrack apply` leaves it untouched

## 4. End to end

- [x] 4.1 Run `npx governance-check ADR-0009 --branch tritri/x`, `--branch fix/x` and `--branch release-please--branches--main--components--ontrack-governance`; verify exit codes `1`, `0`, `0`
- [ ] 4.2 With `add-ci-gate` merged, add to the `test` job of `.github/workflows/ci.yml` a step `node checks/governance-check.mjs ADR-0009` with a comment citing ADR-0009; verify `actionlint` reports no error, the step passes on this change's own pull request (branch `feat/enforce-branch-prefixes`), and fails on a throwaway pull request from a `tritri/…` branch, which is then closed and deleted
- [x] 4.3 Run `openspec validate enforce-branch-prefixes --strict`; verify it passes

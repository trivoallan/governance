# Tasks

> Coordination: if `migrate-checks-to-typescript` has landed, `checks/governance-check.mjs` is `checks/governance-check.ts` (run with `node`, which strips types) and its test is `checks/governance-check.test.ts`.

## 1. Prerequisites

- [ ] 1.1 Check that `add-ci-gate` is merged: `.github/workflows/ci.yml` exists on `main` and `gh api repos/trivoallan/governance/rulesets` lists `main requires test` with `enforcement: active`; stop here if not (ADR-0018 rule 1)
- [ ] 1.2 Read `gh api repos/trivoallan/governance --jq .allow_auto_merge`; verify it prints `true`, and only if it prints `false`, set it with `gh api --method PATCH repos/trivoallan/governance -F allow_auto_merge=true` and read it again

## 2. Configuration

- [ ] 2.1 Write `.github/dependabot.yml`: `version: 2`, one `npm` entry and one `github-actions` entry, both `directory: /`, `schedule.interval: weekly`, `cooldown.default-days: 3` and `commit-message.prefix: chore`, each with a comment naming the ADR-0018 rule it serves; verify the file parses with `node -e` and a YAML reader already in `node_modules` (`js-yaml`), and that it lists exactly those two ecosystems
- [ ] 2.2 Write `.github/workflows/dependabot-automerge.yml` per design.md (author `dependabot[bot]`, `permissions: {}` then `contents: write` and `pull-requests: write` on the job, `dependabot/fetch-metadata@25dd0e34f4fe68f24cc83900b1fe3fe149efef98 # v3.1.0`, `gh pr merge --auto --squash` only for `npm_and_yarn` and `version-update:semver-patch`, the URL through `env:`); verify `actionlint` reports no error and `grep -c pull_request_target` prints `0`
- [ ] 2.3 In `.github/workflows/ci.yml`, add `if: github.event.pull_request.user.login != 'dependabot[bot]'` to the ADR-0006 step only, with a comment giving the reason; verify `actionlint` and `act -l` still list the single job `test`
- [ ] 2.4 In `docs/adr/trivoallan/ADR-0006-commits.md`, add a "Departure" paragraph to the Decision saying the CI step is skipped on Dependabot's pull requests and why; verify with `git diff` that no trait, `check:` line or `revision` changed, and that `node checks/governance-check.mjs ADR-0006` still runs

## 3. Verify

- [ ] 3.1 Run `node checks/governance-check.mjs ADR-0018` with both files committed on the branch; verify it exits `0` and names `.github/dependabot.yml` and `dependabot-automerge.yml`
- [ ] 3.2 Open the pull request (`ci:` type); verify `test` passes and the ADR-0006 step ran on it
- [ ] 3.3 After the merge, on the first Dependabot pull requests: verify the title starts with `chore: bump `, the ADR-0006 step is skipped and `test` passes, an npm patch gets auto-merge enabled and merges after `test`, and an action update or an npm minor does not
- [ ] 3.4 Run `openspec validate configure-dependabot --strict`; verify it passes

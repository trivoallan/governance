# Tasks

> Coordination: if `migrate-checks-to-typescript` has landed, `checks/governance-check.mjs` is `checks/governance-check.ts` (run with `node`, which strips types) and its test is `checks/governance-check.test.ts`.

## 1. Workflow

- [x] 1.1 Write `.github/workflows/ci.yml`: `on: pull_request`, workflow-level `permissions: contents: read`, one job `test` on `ubuntu-latest` with `actions/checkout` (`fetch-depth: 0`) and `actions/setup-node` (Node 24) pinned to the SHAs `release.yml` uses, then `npm ci`, `npm test`, and `node checks/governance-check.mjs ADR-0006 --from origin/${{ github.base_ref }}`, each with a comment citing the ADR or file it comes from; verify `actionlint` reports no error and `grep -E 'uses: [^@]+@[0-9a-f]{40} # v' .github/workflows/ci.yml` matches every `uses:` line
- [x] 1.2 Run `act -l`; verify it lists the job `test` and no other
- [x] 1.3 Locally, on a scratch branch with a commit `fix(backend): y`, run `node checks/governance-check.mjs ADR-0006 --from origin/main`; verify it exits non-zero with `scope-enum`, then drop the commit

## 2. Ruleset file

- [x] 2.1 Write `.github/rulesets/main.json` (name `main requires test`, `target: branch`, `enforcement: active`, `conditions.ref_name.include: ["~DEFAULT_BRANCH"]`, `exclude: []`, `bypass_actors: []`, one `required_status_checks` rule with context `test`, `integration_id: 15368`, `strict_required_status_checks_policy: false`); verify `node -e 'JSON.parse(require("fs").readFileSync(".github/rulesets/main.json","utf8"))'` succeeds

## 3. Land and gate

- [x] 3.1 Open the pull request with 1.1 and 2.1 (`ci:` type, no scope); verify the `test` check runs on it and succeeds, and that its name on the pull request is exactly `test`
- [ ] 3.2 After the merge, create the ruleset with `gh api --method POST repos/trivoallan/governance/rulesets --input .github/rulesets/main.json`; verify `gh api repos/trivoallan/governance/rulesets` lists one active ruleset and `gh api repos/trivoallan/governance/rulesets/<id>` matches the file
- [ ] 3.3 Open a throwaway pull request with a commit `fix(backend): y`; verify `test` fails and `gh pr merge --squash` is refused, then close it and delete its branch
- [x] 3.4 Run `openspec validate add-ci-gate --strict`; verify it passes

# Tasks

## 1. Workflow

- [x] 1.1 Add the summary step as the last step of the `test` job in `.github/workflows/ci.yml`, with `if: always()`, `continue-on-error: true` and a comment naming this change, and verify `actionlint` (or `gh workflow view ci`) reports no syntax error
- [x] 1.2 Run the step's script locally against `origin/main` on a branch that edits a change, write `$GITHUB_STEP_SUMMARY` to a temporary file, and verify it holds that change's diff and nothing for archived changes

## 2. Verification on GitHub

- [x] 2.1 Open the pull request for this change and verify the `test` check's summary shows `add-pr-change-summary` with its `ci` delta (verified on #100's run 43664867904 instead: the `test` summary shows `adopt-npm-12-cooldown` with its proposal and its `dependency-installs` delta as a diff; this change's own PR #90 ran before #99 installed the CLI)
- [x] 2.2 Verify on a pull request that touches no change (a Dependabot or release-please one, or this one's check log for an empty branch) that the step writes nothing and `test` keeps its result (verified on #101's run 43665401794, which touches only `openspec/changes/archive/`: no summary written, `test` passed)

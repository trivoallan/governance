# Design

## Context

After `add-ci-gate`, `ci.yml` runs one required check `test` (`npm ci`,
`npm test`, the ADR-0006 commit check) and the ruleset `main requires test`
requires it on `main`. Settings read with `gh api` on 2026-11-14: squash
merge only, `allow_auto_merge: true`, workflow token read-only by default.
`governance-check ADR-0018` looks for `.github/dependabot.yml` and for a
workflow that mentions `dependabot/fetch-metadata`. ontrack already runs
this setup (`.github/dependabot.yml`, `dependabot-automerge.yml`), and this
design follows it where nothing here differs.

The ADR-0006 check lints every commit from the base branch with
`@commitlint/config-conventional`, whose `body-max-line-length` is an error
at 100. Dependabot's bodies start with
`Bumps [<name>](<repository URL>) from <a> to <b>.`, which passes 100
characters for most packages (`@commitlint/cli`'s URL alone is 80).

## Goals / Non-Goals

**Goals:**
- Dependabot pull requests that pass the `test` check without a person
  touching them, and npm patches among them that merge on their own.

**Non-Goals:**
- Security updates and alerts (ADR-0019, `scan-and-attach-sbom`).
- Updating the npm version written in `ci.yml` by `adopt-npm-12-cooldown`:
  Dependabot does not read `run:` lines.
- Grouping updates, or changing `open-pull-requests-limit` from its default.

## Decisions

**`chore` as the commit prefix for both ecosystems, no `include: scope`.**
Dependabot then writes `chore: bump <name> from <a> to <b>`: a type of the
eleven, no scope (ADR-0006's `scope-enum` allows none), lower case. release-
please files `chore` under no section and cuts no release for it. Same as
ontrack. *Alternative:* `build` for npm and `ci` for actions. More precise,
but neither moves the version either, and it differs from ontrack for no
gain.

**The automerge workflow is ontrack's, unchanged in substance.**
`on: pull_request` (`opened`, `reopened`, `synchronize`), `permissions: {}`
at the top and `contents: write`, `pull-requests: write` on the job, `if:`
on `github.event.pull_request.user.login == 'dependabot[bot]'` (the author,
not the actor, so a person pushing to the branch does not arm it),
`dependabot/fetch-metadata@25dd0e34f4fe68f24cc83900b1fe3fe149efef98 # v3.1.0`,
then `gh pr merge --auto --squash "$PR_URL"` with the URL through `env:`.
The condition is an allow-list:
`package-ecosystem == 'npm_and_yarn'` (Dependabot's name for npm) and
`update-type == 'version-update:semver-patch'`, so an ecosystem added later
is not merged before someone decides it. No checkout, no secret.
`--squash` is ADR-0009's merge method.

**The ADR-0006 step is skipped on Dependabot's pull requests.** `if:
github.event.pull_request.user.login != 'dependabot[bot]'` on that step
only, so `test` still installs, tests and reports, and the required check
is met. The title, which a single-commit squash keeps, is conformant by the
prefix above; only the body breaks the line limit. The departure is
written as a paragraph in ADR-0006's Decision, as ADR-0009 declares its
own, and in a comment on the step. *Alternatives:* (a) relax
`body-max-line-length` in `governance-check`: changes the check every
consuming repository runs, for this repository's bot; (b) let it fail and
merge by hand: automerge never happens and ADR-0018's `patch` is void;
(c) lint the pull request title instead of the commits, as ontrack does:
a wider change to the ADR-0006 step, left to its own change.

**"Allow auto-merge" is verified, not set.** It is already on. The task
reads it with `gh api` and, only if it reads `false`, sets it with
`gh api --method PATCH repos/trivoallan/governance -F allow_auto_merge=true`.

## Risks / Trade-offs

- [A person pushes an off-format commit to a Dependabot branch] → The
  step is still skipped (the author is unchanged). Review catches it; the
  automerge only arms on Dependabot's own patch pull requests, which a
  person rarely touches.
- [The merge is made with `GITHUB_TOKEN`, so it starts no workflow on
  `main`] → release-please updates its pull request on the next push by a
  person. `chore` commits release nothing, so the delay costs nothing.
- [A compromised patch passes the tests] → The three-day cooldown is the
  only defence, as ADR-0018 says; it is in the configuration, not assumed.
- [Git dependencies (`ontrack`, `trivoallan`) are not proposed like
  registry versions] → Already a Negative in ADR-0018; out of scope.

## Migration Plan

1. Confirm `add-ci-gate` is merged and `gh api repos/trivoallan/governance/rulesets`
   lists `main requires test` active. Stop otherwise.
2. Merge this change. Dependabot reads `.github/dependabot.yml` on `main`
   and opens its first pull requests within its schedule.

Rollback: delete `dependabot-automerge.yml` to stop automerge and keep the
proposals; delete `dependabot.yml` to stop the proposals.

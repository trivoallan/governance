# Design

## Context

`.github/workflows/release.yml` is the only workflow and sets the house
style: actions pinned by SHA with the tag in a comment, comments explaining
each non-obvious choice, Node 24 through `actions/setup-node`. `npm test` is
`node --test checks/*.test.mjs`; the tests spawn commitlint, so the
devDependencies must be installed. The ADR-0006 check defaults to
`--from origin/HEAD` and needs the history down to the base branch.

Repository settings read with `gh api` on 2026-11-14: no ruleset, `main` not
protected, squash merge only, `allow_auto_merge: true`, default workflow
token read-only. ADR-0011's wiring check (`exists` a workflow) already
passes through `release.yml` and does not see the ruleset.

## Goals / Non-Goals

**Goals:**
- One required check, `test`, that a person or a bot cannot merge past.
- A ruleset whose content is reviewed in a pull request like code.

**Non-Goals:**
- Running every `check:` line of `docs/adr/` in CI (`ontrack check`). Most
  are wiring checks of files that do not change per pull request, ADR-0018's
  fails until `configure-dependabot`, and ADR-0015/ADR-0016 need `gitleaks`
  and `openspec` installed. Each can join the `test` job in its own change.
- A drift check between the versioned ruleset and GitHub.

## Decisions

**One job, three steps, one required context.** `npm ci`, `npm test`, then
the ADR-0006 check, in a job `test`. The ruleset names a single context, so
adding a step later (coverage in #33) changes no GitHub setting.
*Alternative:* one job per stage (`test`, `commits`). Rejected for now: each
new job is a new context to add to the ruleset, and there is one stage of
each kind.

**The ADR-0006 step runs `node checks/governance-check.mjs ADR-0006 --from origin/${{ github.base_ref }}`.**
The ADR's `check:` line calls `npx --no-install governance-check`, which
resolves the self-dependency `trivoallan` pinned in `package-lock.json`, an
older commit of this repository. Running the script from the checkout
checks the pull request's commits with the pull request's own check, which
is the one under review. `actions/checkout` gets `fetch-depth: 0` so that
`origin/<base>` and every commit after it are present. The merge commit
GitHub creates for the pull request (`Merge <sha> into <sha>`) is ignored by
commitlint's default ignores.

**`pull_request` only, never `pull_request_target`** (ADR-0011 rule 5), no
`push` trigger: the ruleset makes every commit on `main` arrive through a
pull request that already ran the check. `permissions: contents: read` at
the workflow level, no secret, so forks and Dependabot run it unchanged.

**`npm ci`, here.** The tests need the devDependencies, and ADR-0020 rule 5
asks CI to install from the lockfile. This change owns the line;
`adopt-npm-12-cooldown` switches the npm that runs it and adds
`--strict-allow-scripts`. Node 24, as in `release.yml`; setup-node's
default cache is kept, since this job publishes nothing.

**The ruleset is versioned, then applied with `gh api`.**
`.github/rulesets/main.json` holds the body of
`POST /repos/{owner}/{repo}/rulesets`: name `main requires test`,
`target: branch`,
`enforcement: active`, `conditions.ref_name.include: ["~DEFAULT_BRANCH"]`,
`bypass_actors: []`, and one `required_status_checks` rule with
`{ "context": "test", "integration_id": 15368 }` (GitHub Actions) and
`strict_required_status_checks_policy: false`. Created with
`gh api --method POST repos/trivoallan/governance/rulesets --input .github/rulesets/main.json`,
updated later with `PUT .../rulesets/<id>` and the same file.
This is the shape of ontrack's ruleset `main requires test`, read with
`gh api repos/trivoallan/ontrack/rulesets/27253716`.
*Alternative:* settings only on GitHub, as ADR-0011 describes. Rejected: the
file costs nothing and makes the setting reviewable. *Alternative:* a
bypass for the owner. Rejected: a gate the owner can walk past is
`informative` for the owner; editing the ruleset remains possible.

**No strict "up to date" policy.** Requiring the branch to be current with
`main` would force a rebase of every open pull request (Dependabot's
included) after each merge, for a repository with one contributor.

## Risks / Trade-offs

- [The ruleset is created before the workflow has run once] → GitHub then
  waits for a `test` context that never reports and blocks every merge,
  this change's own included. Order: merge `ci.yml` first, check the
  context name on a run, then create the ruleset.
- [`npm ci` cannot fetch the Git dependencies (`ontrack`, `trivoallan`),
  recorded as `git+ssh://` in the lockfile] → npm fetches hosted GitHub
  repositories over HTTPS; the first run on the pull request shows it. If
  it fails, the fix is in the lockfile, not a credential in the workflow.
- [A multi-commit pull request is squashed under its title, which no step
  lints] → Accepted for now; the commits are linted, and the title is set by
  the same person. A later change can lint the title.
- [Pushes made with `GITHUB_TOKEN` do not trigger workflows] → No job here
  pushes; release-please opens its pull requests with `RELEASE_PLEASE_TOKEN`
  and they run the check.
- [The ruleset drifts from the file after a manual edit on GitHub] → Not
  detected; the scenario "Versioned copy matches GitHub" is verified by
  hand when the file changes.

## Migration Plan

1. Merge the pull request adding `ci.yml` and `.github/rulesets/main.json`
   (no ruleset yet, so nothing blocks it).
2. Create the ruleset with `gh api`, then open a throwaway pull request with
   an off-format commit and confirm the merge button is blocked.

Rollback: `gh api --method DELETE repos/trivoallan/governance/rulesets/<id>`
removes the gate; the workflow keeps reporting.

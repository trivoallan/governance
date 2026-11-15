# Design

## Context

- ADR-0011 is a `WIRING` entry with one row: `forge.gate: blocking` or
  `informative` needs a tracked workflow.
- `runTool(root, name, args, trait)` runs a tool from the repository's
  `node_modules/.bin`, or else from `PATH`, and names it when it is missing.
  ADR-0015 uses it for gitleaks.
- zizmor ships no npm package. It installs through `uvx`, `pipx`, `brew` or
  `cargo`, so the check finds it on `PATH`, as with gitleaks.
- Measured with zizmor 1.32.0 on 2026-11-15, offline, regular persona:
  - without configuration (`--no-config`), `unpinned-uses` flags
    `actions/checkout@v4` and `some/action@v1` alike ("required by blanket
    policy"): the default already requires hash pins everywhere;
  - a repository `zizmor.yml` that disables `unpinned-uses` is discovered
    and honoured when no `--no-config` is given;
  - an inline `# zizmor: ignore[template-injection]` is honoured with
    `--no-config`;
  - flagged: `pull_request_target` (`dangerous-triggers`),
    `${{ github.event.pull_request.title }}` in `run:`
    (`template-injection`), a checkout without `persist-credentials: false`
    (`artipacked`, warning), and workflow-level `contents: write` in a
    workflow with two jobs (`excessive-permissions`);
  - not flagged: `echo ${{ secrets.TOKEN }}`, and workflow-level
    `contents: write` in a single-job workflow;
  - exit code 14 with findings, 0 with none.

## Goals / Non-Goals

**Goals:**
- Turn ADR-0011 rule 3, rule 5 and ADR-0021's permissions rule into a check
  that fails.
- Make loosening those rules visible: only inline ignores, next to the code,
  in the diff.

**Non-Goals:**
- Rules 1 and 4: no zizmor audit covers them. The ADR says so.
- Online audits in the check (`impostor-commit`,
  `known-vulnerable-actions`): they need a token, and the check runs
  offline. CI runs them.
- Making governance's own CI run zizmor. That follows from governance
  re-ruling ADR-0011 after the release.
- Scanning composite actions outside `.github/`.

## Decisions

- **A new key and revision 2, not a rule with no key.** A fixed rule added
  to an ADR that repositories have already accepted would oblige them
  without moving `revision:`, which is the silent drift ADR-0001 rule 6
  exists to prevent.
- **An open value**, as `secrets.guard`: `zizmor` is checked, and any other
  value passes with "nothing to check".
- **The check loads no config (`--no-config`).** zizmor's defaults already
  require hash pins, so governance ships no config file. A repository's
  `zizmor.yml` cannot loosen what the check verifies. Inline ignores still
  apply.
  - Alternative: ship a governance config and pass it with `--config`.
    Rejected after measuring: the defaults already do what it would say.
    Revisit if a zizmor release relaxes them.
  - Alternative: honour the repository's config. Rejected: a `zizmor.yml`
    could turn everything off while the check still passed.
- **ADR-0011 leaves `WIRING` for a dedicated check** that reuses
  `wiring('ADR-0011', entries)` for `forge.gate`, then runs zizmor. Both
  results are reported, and the exit code is non-zero if either fails.
- **Workflows passed explicitly.** The check passes the tracked
  `.github/workflows/*.yml` and `*.yaml` files to zizmor, not `.`. Untracked
  files and `node_modules` are never audited.
- **The check prints the version.** `zizmor --version` is printed and not
  pinned. CI pins the action, and Dependabot's `github-actions` ecosystem
  updates it.

## Risks / Trade-offs

- [A new zizmor release adds an audit that fails existing workflows
  locally] → the version line in the output explains the difference
  between machines. CI's pinned action is the reference.
- [A zizmor release relaxes its default pinning policy] → the check's
  tests pin a tag-pinned action as a failure, so a CI run on a newer zizmor
  shows the change. The fix is then to ship a config.
- [Consumers must re-answer ADR-0011] → one key, stated in the Revisions
  list. ADR-0012's revision 3 set the precedent.

## Migration Plan

Ships in the next release. Consumers' `ontrack plan` reports ADR-0011
revised, and they answer `forge.audit`. Rollback: revert, then ship a
revision 3 that drops the key, since a revision never goes back.

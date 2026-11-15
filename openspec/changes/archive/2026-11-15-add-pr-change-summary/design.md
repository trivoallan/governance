# Design

## Context

`ci.yml` has one job, `test`, that the ruleset in `.github/rulesets/main.json`
requires on `main`. It runs on `pull_request` only, with `contents: read`,
and checks out the full history (`fetch-depth: 0`) for the ADR-0006 step.
`openspec show <change> --diff` prints the proposal and a per-requirement
diff of each delta against the current spec. The CLI was not a dependency:
contributors ran it from their `PATH`, and CI had none, so the first run of
this step wrote an empty summary. See proposal.md for why.

## Dependency

Admitted by a person under ADR-0020, in the session that applied this
change:

- **`@fission-ai/openspec@1.13.1`**, published 2026-09-17. Source:
  <https://github.com/Fission-AI/OpenSpec>, which the registry page points
  back to.
- **Why:** run `openspec show --diff` in CI.
- **Not covered by:** anything short of re-implementing OpenSpec's delta
  parsing.
- **Provenance:** attested (SLSA v1). No install script.
- **Version:** pinned exactly to 1.13.1, the version contributors run
  locally and the one this step was tested with; 2.0.0 (2026-11-11) is
  untested here.
- **Age:** the 67 packages it adds to the lockfile were all published at
  least three days before admission (newest: 2026-11-10).

## Goals / Non-Goals

**Goals:**
- The diff reaches the reviewer from the pull request's checks, with no new
  permission, secret, job or dependency.

**Non-Goals:**
- Rendering beyond what `openspec show` prints. The summary is Markdown, and
  GitHub renders it as is.
- Summarising changes the pull request does not touch.

## Decisions

**Job summary, not a pull request comment.** A comment is one click closer,
but it needs `pull-requests: write`. On `pull_request` from a fork the token
cannot have it, and the alternative trigger, `pull_request_target`, is the
one ADR-0011 forbids. The summary works for every pull request.
Alternative considered: a separate `workflow_run` workflow that comments
with a write token; rejected, it adds a privileged workflow to keep safe for
a convenience.

**A step in `test`, not a new job.** A new job would be a new check to keep
out of, or add to, the ruleset. A step changes no GitHub setting, as the
header of `ci.yml` says.

**The step cannot fail the check.** It runs with `continue-on-error: true`
and `if: always()`, so it reports even when tests fail, and a broken summary
never blocks a merge. Whether changes validate is decided by the ADR-0016
check, not by this step.

**Touched changes from `git diff --name-only origin/<base>...HEAD`.** The
three-dot form compares with the merge base, so changes merged on `main`
since the branch started are not listed. The name is the third path segment
under `openspec/changes/`; `archive` is dropped, and a name whose directory
is gone at the head (archived or deleted by the pull request) is skipped.

**Each change under its own heading, its diff fenced.** The summary is
rendered as Markdown. The proposal `openspec show` prints first is
Markdown and renders as is; the diff that follows its `Specifications
Changed` line is indented text that would merge into the paragraph above
it, so it goes in a `diff` code block. Under `MODIFIED` requirements the
lines lose the four spaces `openspec` indents them by, so GitHub colours
the hunk; `ADDED` text keeps them, or its `- **WHEN**` lines would show as
removals.

**`--type change --no-interactive`.** A change and a spec may share a name;
`--type` removes the ambiguity, and `--no-interactive` keeps CI from waiting
on a prompt.

## Risks / Trade-offs

- [The reviewer has to open the `test` check to read the summary] →
  accepted for now; the comment alternative above is the upgrade path if it
  proves a real obstacle.
- [GitHub caps a step's summary at 1 MiB] → a normal change prints a few
  KiB (`adopt-npm-12-cooldown`: 4.7 KiB); a pull request near the cap would
  have its summary truncated, not its check failed.
- [The output format of `openspec show --diff` may change with OpenSpec] →
  it is only read by a person; a format change needs no code change here.

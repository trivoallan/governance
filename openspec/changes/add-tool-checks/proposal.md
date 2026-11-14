# Proposal

## Why

The wiring checks (#25) say whether a decided tool is set up; they cannot say
whether the work on a branch obeys it. Three ADRs decide something a command
can test on the branch itself, as ADR-0006 does with commitlint: ADR-0009
the form of the branch name, ADR-0015 that no secret enters the history,
ADR-0016 that the OpenSpec schema in use is the one ruled and is valid. They
are the remaining checks the brainstorm put in the "run the tool" family.

## What Changes

- `governance-check ADR-0009` checks the branch name against
  `branching.prefixes` and the form `prefix/kebab-case-description`. The
  branch is `--branch <name>`, else `GITHUB_HEAD_REF` (a pull request in
  GitHub Actions, where the checkout is detached), else the current branch.
  The default branch and a detached checkout with no name have nothing to
  check. `branching.model` and `branching.merge` are not checked: they live
  in the forge's settings.
- `governance-check ADR-0015` runs `gitleaks` on the branch's commits
  (`origin/HEAD..HEAD`, or `--from <ref>`) when `secrets.guard` is
  `gitleaks`. `none` or another tool has nothing to check. `secrets.storage`
  is not checked.
- `governance-check ADR-0016`, with `changes.framework: openspec`, checks
  the ADR's rules 1 and 2 and the changes themselves: `openspec/config.yaml`
  names the ruled `changes.schema`, `openspec schema validate <schema>`
  passes, and `openspec validate --all` passes. `framework: none` has nothing
  to check.
- A tool these checks run is looked up in the repository's
  `node_modules/.bin` first, then on `PATH`. A missing tool fails the check
  and is named.
- ADR-0009, ADR-0015 and ADR-0016 ship a `check:` line and a how-to-rule
  note, at their current `revision`.

Out of scope: ADR-0001's format (governance's `.mdschema.yml` already covers
it, and running it needs a registry fetch); GitHub settings (merge method,
push protection); `secrets.storage`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-checks`: the ADR-0009, ADR-0015 and ADR-0016 checks, the `--branch`
  option, and where a check finds the tool it runs.
- `adr-catalog`: ADR-0009, ADR-0015 and ADR-0016 ship their `check:` line.

## Impact

- `checks/governance-check.mjs`: three dedicated checks and a shared way to
  run a repository tool. Still one file, no new dependency.
- `checks/governance-check.test.mjs`: tests in throwaway repositories, with
  stand-in `gitleaks` and `openspec` binaries, plus one run of each real tool
  when it is installed.
- Three ADR files: one frontmatter line and a how-to-rule note each.
  `ontrack plan` reports them `check`; `ontrack apply` syncs the line.
- A consuming repository that rules `gitleaks` or `openspec` needs the tool
  installed where the check runs, CI included. `gitleaks` is not an npm
  package: CI installs it from its GitHub release.

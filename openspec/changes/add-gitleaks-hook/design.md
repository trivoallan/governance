# Design

## Context

- No hook manager is installed; `.git/hooks` holds only samples, and
  `core.hooksPath` is unset.
- gitleaks 8.30.1 is installed through Homebrew. `gitleaks git
  --pre-commit --staged` needs gitleaks 8.19 or later (the `git`
  subcommand).
- ADR-0020 rules `approver: person` for any new package; the existing
  scripts are stdlib-only Node.
- This repository is worked on through several git worktrees under
  `.claude/worktrees/`, which share one git config.

## Goals / Non-Goals

**Goals:** the hook ADR-0015 names, versioned, installed without a manual
step, with no new dependency.

**Non-Goals:** installing gitleaks itself; scanning in CI; a hook manager
for future hooks.

## Decisions

**`core.hooksPath` and a versioned `.githooks/`, set by a `prepare`
script.** `prepare` runs on `npm install` and `npm ci` in the root project,
so a clone set up the usual way gets the hook. The script is
`git rev-parse --git-dir >/dev/null 2>&1 && git config core.hooksPath .githooks || true`,
which does nothing outside a checkout (`npm publish` also runs `prepare`;
in the release job the checkout exists, and setting a hook path there is
harmless). The relative path resolves against each worktree's root, so
every worktree runs its own copy of the hook while sharing the setting.
*Alternative:* husky. It does the same `core.hooksPath` trick, plus a
dependency to admit under ADR-0020 and to keep current. *Alternative:* the
`pre-commit` framework. A Python tool and a YAML config for one command.
*Alternative:* no script, a documented `git config` line. Lighter, but
ADR-0015's first negative consequence (the hook has to be installed on every
clone) stays as it is.

**The hook fails closed when gitleaks is missing.** A hook that passes
silently without its tool is a guard nobody notices is gone. The refusal
says to install gitleaks (`brew install gitleaks`, or a release binary);
the README says that `--no-verify` is not the answer, as ADR-0015 warns.
*Alternative:* warn and pass. Rejected for that reason.

**The hook is the one command, nothing more.** `exec gitleaks git
--pre-commit --staged --redact`, after the `command -v` test. No config
file: gitleaks' default rules are what ADR-0015 assumes, and an allowlist
added later is a reviewed `.gitleaks.toml`.

**The test lives in `checks/`, run by `npm test`.** It creates a throwaway
repository, sets `core.hooksPath` to this repository's `.githooks`, and
reuses the random private key helper of `governance-check.test.mjs`
(nothing secret-shaped is written in the test file itself). The gitleaks
scenarios run only when gitleaks is on `PATH`, as the existing real-tool
tests do; "gitleaks missing" runs with a bare `PATH`.

## Adaptations at implementation

Main moved after this design was written: the check became
`checks/governance-check.ts`, built by `tsc` to `dist/`, and `package.json`
already had `"prepare": "npm run build"`.

- **Test file name.** `npm test` runs `node --test checks/*.test.ts`, so the
  test is `checks/pre-commit-hook.test.ts`, not `.test.mjs`.
- **One `prepare`.** The hook command is its own script, `hooks`, and
  `prepare` is `npm run build && npm run hooks`: the build still runs in
  CI, in `npm publish` and in a git install.
- **The guard compares the git top level with the package directory**
  instead of only asking whether a git directory exists:
  `[ "$(git rev-parse --show-toplevel 2>/dev/null)" = "$(pwd -P)" ] && git config core.hooksPath .githooks || true`.
  `git rev-parse --git-dir` also succeeds in a directory nested inside some
  other repository (an unpacked tarball, a vendored copy), and would then set
  that enclosing repository's `core.hooksPath`. A worktree's top level is the
  worktree itself, so worktrees still match.
- **The key helper is shared.** `privateKey` (and `onPath`, `barePath`)
  moved from `governance-check.test.ts` to `checks/test-helpers.ts`, imported
  by both tests; `tsconfig.json` gains `rewriteRelativeImportExtensions` so
  the `./test-helpers.ts` import compiles. The helper lands in `dist/` but
  not in the package (`files` lists `dist/governance-check.js` only).

## Risks / Trade-offs

- [`git commit --no-verify` skips it] → The ADR-0015 check in the
  `add-ci-gate` workflow scans the branch's commits; until then the hook
  is the only guard.
- [A contributor never runs `npm install`] → The README gives the one
  `git config` line.
- [A user-level `core.hooksPath` is overridden by the local one] → Noted in
  the README; the local setting is what this repository needs.
- [The self-dependency `trivoallan: github:trivoallan/governance` runs
  this `prepare` when npm installs it from git] → It only sets a hook path
  in npm's temporary clone; under npm 12 it is blocked as a dependency
  script, which is fine.

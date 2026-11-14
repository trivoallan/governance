# Proposal

## Why

ADR-0015 rules `guard: gitleaks`, as a pre-commit hook running
`gitleaks git --pre-commit --staged --redact`. gitleaks is installed on the
maintainer's machine, but no hook runs it (#39): a commit carrying a secret
is made, and only revocation (ADR-0015 rule 2) can follow once it is pushed.

## What Changes

- A versioned hook, `.githooks/pre-commit`, a POSIX shell script that runs
  `gitleaks git --pre-commit --staged --redact` and refuses the commit when
  gitleaks reports a leak or is not installed.
- `npm install` points git at it: a `prepare` script sets
  `core.hooksPath` to `.githooks`. No new dependency.
- The README says how the hook is installed, that it needs gitleaks on
  `PATH`, and that `--no-verify` is not the way past a refusal.
- A test drives the hook in a throwaway repository.

Out of scope: the CI scan that catches a skipped hook (`governance-check
ADR-0015` in the gate of `add-ci-gate`); GitHub push protection; a
`commit-msg` hook for commitlint (ADR-0006), which `.githooks/` would make
a one-file addition later.

## Capabilities

### New Capabilities

- `repo-tooling`: how this repository carries out the ADRs it rules for
  itself; here, the pre-commit secret guard.

### Modified Capabilities

None.

## Impact

- New `.githooks/pre-commit` (executable) and a test under `checks/`.
- `package.json`: one `prepare` script. It is the root project's own
  script, not a dependency's, so ADR-0020's `install_scripts: ignored`
  does not concern it; it does not ship in the npm package (`files`).
- `README.md`: a short contributing note.
- Each existing clone runs `npm install` (or the one `git config` line)
  once; worktrees share the setting through the common git config.

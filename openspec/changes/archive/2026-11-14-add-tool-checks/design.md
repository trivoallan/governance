# Design

## Context

`checks/governance-check.mjs` dispatches through `CHECKS`: a dedicated
function for ADR-0006, generated wiring functions for seven others. Argument
parsing knows `--from <ref>` only. ADR-0006 resolves commitlint through
`createRequire` from the repository, because ADR-0006 asks for it as a dev
dependency. The requirements are in `specs/adr-checks/spec.md`.

## Goals / Non-Goals

**Goals:**
- Three dedicated checks in the existing file, sharing one helper to run a
  repository tool.
- Tests that do not depend on what is installed on the machine, plus one real
  run of each tool when it is present.

**Non-Goals:**
- Installing a tool, or fetching one with `npx`.
- Changing the ADR-0006 check or the wiring checks.

## Decisions

**One `runTool(root, name, args, trait)` helper.** It spawns `name` with
`PATH` set to `<root>/node_modules/.bin` followed by the inherited `PATH`,
from the repository root, with `stdio: 'inherit'`, and returns the exit
status. A spawn error `ENOENT` becomes a `CheckError` naming the tool and the
trait. *Alternative:* resolve each package with `createRequire`, as for
commitlint. Rejected: `gitleaks` is a Go binary, and OpenSpec is often
installed globally, so `PATH` is where they live; the repository's
`node_modules/.bin` first keeps a pinned dev dependency ahead of a global one.

**Options are parsed once.** `main` accepts `--from <ref>` and
`--branch <name>` and passes `{ from, branch }` to every check. A check
ignores options it has no use for, so `--branch` on ADR-0006 is accepted and
does nothing, as `--from` on a wiring check does today.

**ADR-0009 reads the default branch from git.**
`git symbolic-ref --short refs/remotes/origin/HEAD` gives `origin/main`; the
part after the first `/` is the default branch. When the ref is missing, the
check falls back to `main` and `master`.
`git branch --show-current` gives the current branch, empty when detached.
The form is one regular expression built from the prefixes:
`^(feat|fix|docs)/[a-z0-9]+(-[a-z0-9]+)*$`, with each prefix escaped.

**ADR-0015 runs `gitleaks git --log-opts=<from>..HEAD --redact --verbose --no-banner`.**
`--log-opts` limits the scan to the branch's commits, which is what
"before it is made" fails to guarantee when a hook is skipped. `--redact`
keeps the found secret out of CI logs, and `--verbose` names the file and commit of each finding (without it, gitleaks only prints a count). gitleaks' default exit code on a leak
(1) is passed through. The default `--from` is `origin/HEAD`, as in ADR-0006.

**ADR-0016 runs its three steps in order and reports all of them.** The
config file's `schema:` line is read with the same `scalar` rule as traits.
Both openspec commands run even when the config check fails, so one run
shows every problem. `openspec validate --all` is not run with `--strict`:
strict mode turns advisory findings into failures, which the ADR does not
ask for.

**Unknown values pass, as in the wiring checks.** `secrets.guard: trufflehog`
or `changes.framework: something-else` print "nothing to check". Empty keys
fail as "not set". `changes.schema: none` with `framework: openspec` fails,
because the ADR's allowed values forbid that pair.

**Tests use stand-in binaries.** Each test repository can get
`node_modules/.bin/gitleaks` or `node_modules/.bin/openspec`, a shell script
that appends its arguments to a log file and exits with a status set by the
test. That checks the arguments, the exit status passed through, and the
`node_modules/.bin` lookup. Two more tests run the real `gitleaks` (a planted
private key after `origin/HEAD`, then before it) and the real `openspec`
(`spec-driven`), each skipped when the binary is not on `PATH`.

## Risks / Trade-offs

- [`GITHUB_HEAD_REF` set in a local shell by accident] → `--branch` wins
  over it, and the output names the branch it checked.
- [A repository renames its default branch without updating `origin/HEAD`]
  → The check then sees the default branch as an ordinary branch and fails
  on its name; `git remote set-head origin -a` fixes it, and the message
  names the branch.
- [gitleaks' CLI changes] → The arguments are the documented v8 `git`
  subcommand; a stand-in test fixes them, and the real-run test catches a
  break where gitleaks is installed.
- [`openspec validate --all` fails on a change in progress] → Intended: a
  change on the branch that does not validate is a departure from ADR-0016.

## Migration Plan

None in governance. Consuming repositories get the code with their next
update of the governance package, and `ontrack apply` syncs the three
`check:` lines.

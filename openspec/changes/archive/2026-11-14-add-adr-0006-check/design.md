# Design

## Context

governance ships only `adr/` today: `package.json` is `private`, lists
`files: ["adr/"]`, and has no code, no dependency and no test script. A
consuming repository installs it with
`npm i -D <alias>@git+https://github.com/trivoallan/governance.git`, so its
directory under `node_modules/` is named after the alias, which governance
does not know. ontrack#41 runs a `check:` line through the shell, from the
repository root, with the caller's environment, and passes nothing else: no
ADR path, no namespace. ontrack reads frontmatter line by line, without a YAML
parser. `mdschema@0.15.1` accepts an extra top-level `check:` key (checked on
a copy of ADR-0001 before writing this change). Node on the maintainer's
machine is 22.23; ontrack requires 22.18 or later.

## Goals / Non-Goals

**Goals:**
- One check that a coding agent can run before opening a pull request and a
  CI job can run unchanged, and that fails with commitlint's own report.
- A `check:` line governance can ship in a question ADR without ruling it.

**Non-Goals:**
- Checks for any ADR other than ADR-0006.
- Wiring `mdschema` to ADR-0001's `check:`.
- Changes to ontrack (an exit code for "nothing to check", an `ONTRACK_ADR`
  variable). They are better asked for once this check has been used.

## Decisions

**A package `bin` called `governance-check`, called through
`npx --no-install`.** npm links a dependency's bins under their own name,
whatever alias the package was installed under, so the line does not depend
on the alias. `--no-install` makes `npx` fail instead of fetching an unrelated
`governance-check` from the registry when governance is not installed.
Alternatives: `node node_modules/<alias>/checks/…` (rejected: the alias is
the repository's choice); a bin named after the namespace, `trivoallan-check`
(rejected: the package is `governance`, and the namespace is only a default).

**One file, `checks/governance-check.mjs`, with a table from ADR number to
check function.** Only one check exists; a directory of one module per ADR
waits for the second. Node built-ins only (`node:fs`, `node:path`,
`node:os`, `node:module`, `node:child_process`), plain ESM so that no build
step is needed, unlike ontrack's TypeScript.

**Finding the ADR: the single match of `docs/adr/*/<number>-*.md`.** Only
namespace directories are searched; a local ADR in `docs/adr/` that supersedes
ADR-0006 has its own check, and ontrack already silences a superseded one.
Two matches (two sources shipping the same number) is an error rather than a
guess.

**Reading traits line by line, like ontrack.** Inside the frontmatter, the
`commits:` block under `traits:` is read for `scopes:` and `tool:`. `scopes`
accepts a flow list (`[api, docs]`, `[]`) and a block list (`- api` lines).
A trailing ` # comment` and surrounding quotes are removed, as ontrack does.
Alternative: a YAML parser (rejected: governance's first runtime dependency,
for two keys).

**Running the repository's commitlint, with a generated config.**
commitlint takes no rule on its command line, so the check writes a config
file to a fresh directory under `os.tmpdir()`, outside the repository, and
removes it afterwards:

```js
export default {
  extends: ['<absolute path of @commitlint/config-conventional>'],
  rules: { 'scope-enum': [2, 'always', ['api', 'docs']] }, // or 'scope-empty': [2, 'always'] for []
}
```

Both `@commitlint/config-conventional` and `@commitlint/cli` are resolved
from the repository root with `createRequire(<root>/package.json)`; a failed
resolution names the missing package and exits `1`. The CLI runs as
`process.execPath <cli> --config <tmp> --from <ref> --to HEAD`, from the
root, with its output passed through; its exit status becomes the check's.
`config-conventional`'s type list is the eleven types ADR-0006 fixes.
Alternatives: checking headers with a regular expression (rejected by the
maintainer: ADR-0006's tool is commitlint, and the check should run it);
requiring a `commitlint.config.*` in the repository (rejected: the scope list
would then live in two places, the trait and the config).

**Base `origin/HEAD`, `--from <ref>` to override.** It is the default branch
of a normal clone. A repository whose CI checkout has no `origin/HEAD`
appends `--from origin/main` to its `check:` line when it rules.

**`hook` and `none` exit `0` with one line.** ontrack has no status for
"nothing to check", and `fail` would be a lie. The line keeps the reason
visible in the agent's log when run by hand; ontrack prints nothing for a
pass.

**Tests with `node --test`, real git repositories, real commitlint.**
`@commitlint/cli` and `@commitlint/config-conventional` become dev
dependencies of governance (21.2.4 at the time of writing). Each test builds a
throwaway repository under `os.tmpdir()` with `git init`, an ADR-0006 copy in
`docs/adr/trivoallan/`, commits, and a symlink to governance's
`node_modules` when commitlint must be found.

**ADR-0006 keeps `revision: 1`; ADR-0001 goes to 3.** The question ADR-0006
asks does not change. ADR-0001 states the rules, and changing what it says is
what its `revision` tracks.

## Risks / Trade-offs

- [A `check:` line runs governance's code in the consuming repository] →
  The line runs only once the repository rules the ADR `accepted`, in a commit
  it reviews. The ontrack README already asks to read an imported `check:` line
  like an npm install script. ADR-0001 says the scripts follow the package
  version.
- [`npm update` can change what a check does without `ontrack plan` saying
  so] → Accepted: it is the trust given to any dev dependency. Written in
  ADR-0001.
- [`hook` and `none` show as `pass` in `ontrack check`] → The pass count
  includes checks that tested nothing, until ontrack has a status for it.
- [Repositories that ruled ADR-0006 before this change get no `check:` line]
  → Their body is frozen and `revision` does not move. ADR-0001 revision 3 is
  reported `revised` and tells them to add the line by hand.
- [`origin/HEAD` missing in shallow CI clones] → The check fails with git's
  message; the how-to-rule block says to append `--from`.
- [governance becomes a code repository with dev dependencies] → One file,
  one test file, no runtime dependency.

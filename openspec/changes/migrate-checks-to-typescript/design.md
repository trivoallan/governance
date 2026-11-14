# Design

## Context

`checks/governance-check.mjs` (one file, stdlib only, no build) is the
package's `bin` and its only script in `files`. Its test spawns the script
with `process.execPath` in throwaway repositories. `engines.node` is
`>=22.18`, the first 22.x that strips types without a flag, but only outside
`node_modules`. The release workflow's publish job checks out and runs
`npm publish` with no install. README documents two installs: the npm alias
and a git tag. See proposal.md for motivation.

**Order of the three changes:** this one lands first. `validate-checks-with-zod`
(#32) writes its schemas in the `.ts` file and derives the types this change
writes by hand; `enforce-test-coverage` (#33) measures the `.ts` source and
extends the `test` script set here.

## Goals / Non-Goals

**Goals:**
- Same behaviour, same messages, same tests, in TypeScript.
- The shipped `bin` is plain JavaScript, whatever the install path.

**Non-Goals:**
- Splitting the check into modules, a bundler, or a second build target.
- Changing any requirement other than how the command ships.

## Decisions

**`tsc`, emitting to `dist/`.** One `tsconfig.json`: `rootDir: checks`,
`outDir: dist`, `module`/`moduleResolution: nodenext`, a target Node 22 runs,
`strict`, and `erasableSyntaxOnly` so the source stays runnable by Node's
type stripping (no `enum`, no parameter properties, no `namespace`). `tsc`
keeps the `#!/usr/bin/env node` line. It also emits the compiled test, which
`files` does not ship. *Alternatives:* esbuild or tsup, one more dependency
for a single file and no bundling need; shipping `.ts` with a loader such as
`tsx`, a runtime dependency to avoid a build step.

**Tests run the source, not `dist/`.** The test spawns
`checks/governance-check.ts` with `process.execPath`; Node strips the types,
line numbers are kept, so failures and coverage (#33) point at the source.
`npm test` is `tsc --noEmit && node --test checks/*.test.ts`, so a type error
fails the suite. The shipped file is checked once, by the two scenarios of
the spec delta, from a scratch consumer. *Alternative:* test `dist/` after a
build, which needs source maps for coverage and a build before every run.

**`prepare` builds.** `"prepare": "npm run build"` runs on `npm ci` and
`npm install` here, before `npm pack` and `npm publish`, and when npm
installs governance as a git dependency (npm installs its dev dependencies
for that). *Alternatives:* `prepack`, which leaves a local checkout without
`dist/` after `npm ci`, while `prepare` is the hook npm documents for git
dependencies; committing `dist/`, which lets source and output drift.

**Publish job installs with `npm ci`.** The build needs `typescript`, so the
job runs `npm ci` (ADR-0020 rule 5: install from the lockfile) and then
`npm publish`, whose `prepare` builds. No cache, as today. The comment
explaining why there was no install is replaced by one saying what the
install is for.

**Two dev dependencies, each declared.** `typescript` and `@types/node`
(major 22, the `engines` floor), each at a version at least three days old,
asked for before `npm install` and declared in the pull request in
ADR-0020's form. Neither has an install script.

**Hand-written types for traits for now.** `readTraits` returns
`Record<string, string | string[]>`; the wiring table and `CHECKS` get
explicit types. #32 replaces the trait types with ones derived from schemas.

## Risks / Trade-offs

- [A git-tag install runs governance's `prepare`, which ADR-0020's
  `install_scripts: ignored` blocks once consumers are on npm 12] → The npm
  alias, which needs no build, stays README's first install. Decided with
  #42: dependencies come from the npm registry, whose tarball ships
  `dist/` built, so consumers use that; a git-tag install is documented as
  needing the consumer's own `allowScripts` entry.
- [Type stripping rejects syntax `tsc` accepts] → `erasableSyntaxOnly`
  makes `tsc` refuse it first.
- [The self dev dependency `trivoallan` (`github:trivoallan/governance`) now
  builds on install once its lock entry moves past this change] → It then
  needs `typescript` like any git install; `npm ci` installs it.
- [`dist/` stale locally] → Nothing reads `dist/` except the packed package,
  which `prepare` rebuilds.

## Migration Plan

None for consumers: the `bin` name and the `check:` lines are unchanged.
Rollback is a revert; the next release ships `checks/governance-check.mjs`
again.

# Design

## Context

See proposal.md, Why. In `checks/governance-check.ts` today:

- `runTool` prepends `<root>/node_modules/.bin` to `PATH` for every tool.
  npm links the bins of hoisted transitive dependencies there too (checked
  with a packed source depending on `@jackchuka/mdschema`).
- `toolAnswer(root, adr, group, key)` returns the raw trait of the copy
  `findAdr` finds, whatever its `status:` and whether another ADR
  supersedes it. ADR-0009 (via `TOOLS`) and ADR-0022 call it.
- `NAMESPACE` is already derived from the script's own path
  (`node_modules/<alias>/dist/`), empty outside `node_modules`.
- The pre-commit hook already resolves gitleaks with
  `mise -C "$root" which gitleaks` and never uses `PATH`.

## Goals / Non-Goals

**Goals:**
- One table says which traits name a pinned tool; `runTool`, the ADR-0015
  and ADR-0011 checks, and the ADR-0025 check all read it.
- `toolAnswer` follows ontrack's notion of an answer that counts.

**Non-Goals:**
- No `aqua which` resolution: no repository rules `aqua`.
- No new trait for a tool's binary name.
- No change to how commitlint is resolved (`createRequire`).

## Decisions

### A table keyed by trait, the value is the binary

```ts
// Traits that name a tool outside the package manager (ADR-0025).
// The value is the binary; `none` names nothing.
const PINNED: [adr: string, group: string, key: string, known: string[]][] = [
  ['ADR-0015', 'secrets', 'guard', ['gitleaks']],
  ['ADR-0011', 'forge', 'audit', ['zizmor']],
];
```

`known` holds the values governance's own checks run; an unknown value is
still listed and looked up, but only noted when missing. Keyed by value
instead, an heir choosing `trufflehog` would fall out of the list
entirely. A trait in ADR-0025 listing binaries was rejected: the list
follows from other answers, as with `TOOLS` (ADR-0009).

### `runTool` takes the kind of tool

`runTool(root, name, args, trait, { pinned })`:
- `pinned: false` (openspec): unchanged, `node_modules/.bin` then `PATH`.
- `pinned: true`: `PATH` without `node_modules/.bin`; when
  `toolAnswer(root, 'ADR-0025', 'tools', 'manager')` counts and is `mise`,
  resolve with `spawnSync('mise', ['-C', root, 'which', name])` and spawn
  the printed path directly. mise's stderr is passed through, followed by
  the hint `mise trust && mise install --locked`, the hook's wording.

A `mise exec -- <name>` alternative was rejected: mise exec falls back to
`PATH` for a tool mise does not manage, which is the hole being closed.
`mise which` also refuses an untrusted `mise.toml`, so it fails closed.

### `toolAnswer` reads status and supersession

It returns `{ found, value?, reason? }` where `reason` is `missing`,
`not accepted` or `superseded by <ref>`, and `value` is only set when the
answer counts. Supersession: scan every `docs/adr/**/*.md` frontmatter with
`status: accepted`, read its `supersedes:` (flow or block list, as
`readTraits` reads lists), and match an entry against the target copy:
plain `<name>` within the same directory, `<dir>/<name>` otherwise, where
`<name>` is the `adr:` value or the file name with or without `.md`. The
existing line reader is reused; no YAML parser (one runtime dependency).

Callers keep their messages, adding the reason: ADR-0009's hint
`(not exempt: ...)` and ADR-0022's `nothing to check` line.

### Namespace in cross-references

A helper `ref(number)` returns `${NAMESPACE}/${number}` when `NAMESPACE`
is set, else `number`. It is used where a message names another ADR
(ADR-0009 hints, ADR-0022, ADR-0025 lines). The checked ADR's own prefix
(`ADR-0015: ...`) is unchanged, so existing messages and their spec
scenarios stay as they are.

### ADR-0025 check

Reads `tools.manager` with `traitsOf`, enum `mise | aqua | script | none`.
For each `PINNED` row, `toolAnswer` gives the value or the reason; then per
manager as the spec states. `mise` missing entirely (ENOENT on
`mise which`) fails once, not per tool.

### mdschema: a governance dependency, resolved from its own package

`@jackchuka/mdschema` follows esbuild's layout: a `postinstall`, plus one
optional package per platform holding the Go binary. Installed with
`--ignore-scripts`, the binary still runs (checked in a scratch project),
so ADR-0020's `install_scripts: ignored` does not break it. A consumer
always has a `package.json`, since ontrack installs with `npm i -D` and a
source is an npm dependency, so npm beats mise here: `package-lock.json`
holds integrity hashes, Dependabot moves the version, and ADR-0025 does not
apply to manifest dependencies.

The ADR-0001 check resolves it the way the ADR-0006 check resolves
commitlint, but from governance's own location:
`createRequire(import.meta.url).resolve('@jackchuka/mdschema/package.json')`,
then its `bin` entry, spawned with `process.execPath`. Not through
`runTool`: a hoisting conflict could nest mdschema away from the root
`.bin`, and the root `.bin` is what a decoy could take. Schema:
`<package>/adr/.mdschema.yml`, passed with `mdschema check --schema`, which
removes the copy rule 7 asked for. Files: the copies `findAdr`'s directory
rule selects, filtered on `status:` read from the frontmatter, passed as
explicit paths.

mdschema as an ontrack dependency was rejected: the schema checks
governance's format (Nygard sections, how-to-rule block), and ontrack is
format-agnostic, with `check:` as its extension point.

### ADR-0001 at revision 4

adr-format requires that governance changes a shipped ADR, ADR-0001
included, only through `revision`. Rule 7 changes meaning (from "attests"
to a check that refuses), so ADR-0001 moves to revision 4 with
"nothing to re-answer". The `check:` line alone would not need it.

### zizmor job through mise

`jdx/mise-action` at the SHA ci.yml already pins, `version: 2026.11.8`,
`install_args: zizmor` so only zizmor is fetched, then
`zizmor --no-config --format=github .github/workflows` with
`GH_TOKEN: ${{ github.token }}` for the online audits. `--no-config` matches
the ADR-0011 check and the job's own rule that findings are silenced only
inline. The `sed` step reading the version goes away. Replacing the job
with `governance-check ADR-0011` in CI was rejected: that check runs
`--offline`, and the job exists for the online audits.

## Risks / Trade-offs

- [A consuming repository ruling `mise` but installing zizmor with `pipx`
  breaks] → release notes name the remedy; the failure message gives the
  command.
- [Tests need mise] → a stub `mise` script on the test `PATH` prints the
  path of a stub binary; the real-gitleaks tests run in repositories that
  rule no ADR-0025, so they keep using `PATH`.
- [Supersession matching drifts from ontrack's] → the rules are copied from
  ontrack's README; scenarios cover the three forms of a reference.
- [An unknown tool whose binary has another name is only noted] → stated in
  ADR-0025's Neutral consequence as left to review.
- [Every consumer downloads mdschema, a few MB, used or not] → accepted:
  ADR-0001 ships `accepted`, so its check runs in every consumer.
- [The ADR-0001 check fails consumers that ruled sloppily before] → the
  revision 4 entry and the release notes say so; the failure names the file
  and key.
- [`npm` publishing drops `adr/.mdschema.yml` as a dotfile] → a task checks
  `npm pack --dry-run` lists it.

## Migration Plan

Ship in the next minor release. Release notes: a repository that rules
`tools.manager: mise` needs mise in the job running `ontrack check`, with
`mise install --locked`; `ontrack plan` reports ADR-0001 revised, and
`ontrack check` now runs mdschema on every ruled ADR. Rollback is reverting
the package version.

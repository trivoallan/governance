# Proposal

## Why

`governance-check` runs gitleaks (ADR-0015) and zizmor (ADR-0011) from the
repository's `node_modules/.bin` first, then from `PATH`. npm links the bins
of transitive dependencies into `node_modules/.bin` too, so any package in
the tree that declares a `gitleaks` or `zizmor` bin runs in place of the real
tool, and a check that always exits `0` passes. The `PATH` fallback also
breaks ADR-0025 rule 2 ("none falls back to whatever is on the `PATH`")
in a repository that rules `tools.manager: mise`, which the pre-commit hook
already respects with `mise which`. And nothing tells a repository which
tools its own answers ask it to pin: it finds out one failing check at a
time.

Two tools escape the one place ADR-0025 asks for. ADR-0001 rule 7 has a
repository run `npx @jackchuka/mdschema@0.15.1` by hand after copying
`.mdschema.yml`, with no lockfile, and falls back to a release binary
downloaded unchecked. governance's own zizmor job reads zizmor's version
from `mise.toml` but lets `zizmor-action` install it, outside `mise.lock`'s
checksum.

## What Changes

- A tool that a trait names and that sits outside the package manager
  (today `secrets.guard` and `forge.audit`) is never looked up in
  `node_modules/.bin`. With `tools.manager: mise` ruled, it is resolved by
  `mise which <tool>`, and a failure names the remedy; otherwise it is
  looked up on `PATH`. An npm tool (openspec) keeps
  `node_modules/.bin`, then `PATH`. **BREAKING** for a repository that ruled
  `tools.manager: mise` and installs gitleaks or zizmor outside mise: the
  check now fails until mise provides it.
- New `governance-check ADR-0025`: for each trait that names such a tool,
  in an ADR that is accepted and not superseded, it reports the tool and
  whether `mise which` finds it. A tool governance knows (gitleaks, zizmor)
  fails when missing; an unforeseen value is reported as a note. With
  `script` or `none` it lists the tools and has nothing to check.
- Reading another ADR's answer (ADR-0009 reads ADR-0012 and ADR-0018,
  ADR-0022 reads ADR-0017, ADR-0025 reads ADR-0015 and ADR-0011) counts only
  a copy that is `accepted` and that no accepted ADR supersedes. A
  superseded ADR is named with the ADR that supersedes it.
- Messages name an ADR of this package as `<namespace>/ADR-NNNN`, the
  namespace being the alias governance is installed under.
- ADR-0025 ships `check: npx --no-install governance-check ADR-0025`, and its
  Neutral consequence says what the check covers and what review still
  covers. ADR-0015 and ADR-0011 say where their tool is taken from. No
  `revision` moves: no question changes.
- `@jackchuka/mdschema` becomes a runtime dependency of governance, at an
  exact version, locked by npm and updated by Dependabot. Its binary comes
  from a per-platform package, so it installs with install scripts ignored
  (ADR-0020).
- New `governance-check ADR-0001`: it runs that mdschema, with the
  `.mdschema.yml` governance ships, on the repository's ruled copies of
  governance's ADRs (any status but `proposed`), and fails on what the
  schema refuses. Nothing is copied into the repository.
- ADR-0001 ships `check: npx --no-install governance-check ADR-0001`, and
  rule 7 says the check refuses a half-ruled ADR instead of attesting. This
  changes what an accepted, shipped ADR says, so ADR-0001 goes to
  revision 4 with "nothing to re-answer".
- The `zizmor` workflow installs zizmor with `jdx/mise-action` from
  `mise.toml` and `mise.lock` and runs it with its online audits, in place
  of `zizmor-action`. The job keeps the name the ruleset requires.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-checks`: repository tools are resolved by kind; the ADR-0025 check;
  an ADR read for its answer must be accepted and not superseded; messages
  carry the namespace; the ADR-0001 check; two runtime dependencies.
- `adr-catalog`: ADR-0025 ships its check line; ADR-0015, ADR-0011 and
  ADR-0025 describe where a tool is taken from; ADR-0001 at revision 4.
- `adr-format`: the schema is run through `governance-check ADR-0001`.
- `ci`: the workflow audit job takes zizmor from mise.

## Impact

- `checks/governance-check.ts` and `checks/governance-check.test.ts`.
- `package.json`, `package-lock.json`: `@jackchuka/mdschema` added to
  `dependencies` (ADR-0020: admitted by the person approving this change).
- `adr/ADR-0025-tools.md`, `adr/ADR-0015-secrets.md`,
  `adr/ADR-0011-forge-and-ci.md`: text only, no `revision` change.
  `adr/ADR-0001-record-architecture-decisions.md`: revision 4.
- `.github/workflows/zizmor.yml`.
- `README.md`: the check count and the Supply chain and Decisions rows.
- Consuming repositories: those that rule `tools.manager: mise` need mise in
  the job that runs `ontrack check`; `ontrack plan` reports ADR-0001
  `revised`; every repository's `ontrack check` now runs mdschema on its
  ruled ADRs; a repository that installs with `npm ci --strict-allow-scripts`
  (ADR-0020) must deny mdschema's `postinstall`, as governance does in its
  `allowScripts`. Release notes say all four.

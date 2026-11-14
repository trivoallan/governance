# Proposal

## Why

ADR-0018 governs how a dependency that is already there **moves forward**.
No ADR governs how a new one **comes in**. An agent that needs a library
runs `npm install <name>`. The name may be one it invented (slopsquatting),
a typosquat, or an abandoned package, and the install has already run the
package's scripts, with the session's rights, before any review sees the
diff. governance's own README shows the failure: without ontrack
installed, `npx ontrack` fetches and runs an unrelated package of the same
name.

## What Changes

- Add **ADR-0020 "Adding a dependency"**, a question ADR original to
  governance (no surdesrails SDR asks it). Its question: *who lets a new
  dependency in, and what may it run when it arrives?* It has two traits:
  - `admission.approver` (`person`, `agent`), recommending `person`: the
    agent asks **before** installing, because review comes after the
    install, and by then the install scripts have already run.
  - `admission.install_scripts` (`ignored`, `allowed`), recommending
    `ignored`: code a package runs at install time is off, and a package
    that needs it is allowed by name. For npm that code is the lifecycle
    scripts. npm 12 already blocks them, so the decision is who adds a
    name to `allowScripts`, and each entry is an admission. For Python it
    is building a source distribution, switched off by refusing sdists
    (wheels only). Neither uv nor pip documents an exception for one
    package, so a Python package with no wheel for the platform is not
    admitted under `ignored`.
- ADR-0004 recommends Python or TypeScript, so ADR-0020 gives **npm and
  Python side by side** for each rule. Each rule names the npm mechanism,
  the uv mechanism (the default Python tool), and the pip mechanism where
  it differs. Python has one trap npm does not: the **import name is not
  the distribution name** (`import yaml` comes from `PyYAML`, `sklearn`
  from `scikit-learn`). An agent that installs what it imports is how
  squatted names get installed.
- Its Decision fixes, whatever the repository rules:
  1. **The name comes from a source, not from memory**: the package's own
     documentation or repository, and the registry page matches that
     source. In Python, the name installed is the distribution name, never
     the import name.
  2. **The version is at least three days old**, the same cooldown as
     ADR-0018 rule 2, for the same reason. npm: `min-release-age=3`.
     pnpm: `minimumReleaseAge: 4320` (minutes). uv:
     `exclude-newer = "3 days"`. pip: `--uploaded-prior-to P3D`.
  3. **Every addition is declared** in the pull request that brings it: its
     name, its version, why it is needed, and why a few lines of code or the
     standard library do not cover it.
  4. **Provenance is reported, not required**: whether the package carries
     registry signatures or a provenance attestation (`npm audit
     signatures` for npm, PEP 740 attestations on PyPI, which no Python
     installer verifies yet) is stated in the declaration. Requiring it
     would exclude most of either registry today.
  5. **The lockfile is committed, and CI installs from it** (`npm ci`;
     `uv sync --locked`, or pip with `--require-hashes`), so what was
     admitted is what runs.
- ADR-0018's "Not concerned" paragraph gains one line pointing new
  dependencies to ADR-0020. This is a wording change, so ADR-0018's
  `revision` stays 1.
- Add the two traits to `adr/.mdschema.yml`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0020 and its two traits.

## Impact

- `adr/ADR-0020-adding-dependencies.md`: new. Consumers see it `new` in
  `ontrack plan`.
- `adr/ADR-0018-dependencies.md`: one line under Context, no revision
  change.
- `adr/.mdschema.yml`: two traits added.
- ADR-0020 ships `proposed`. governance has two devDependencies
  (commitlint) but does not rule its own ADRs in this change.
- Not in this change: ADR-0021 (build provenance, SLSA L2) and publishing
  governance to npm, which were discussed together and are proposed
  separately.

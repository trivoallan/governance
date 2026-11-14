# Proposal

## Why

ADR-0019 is ruled (`sbom: cyclonedx`, `scanner: grype`, `fail_on: critical`)
but nothing in the repository carries it out: no workflow scans, and the
release job publishes to npm without an SBOM. Its own Consequences say so,
and trivoallan/governance#41 tracks the gap. Until it is closed, nobody can
say what a published version contained, and a critical CVE with a fix
reaches `main` unseen.

## What Changes

- A new workflow, `.github/workflows/scan.yml`, runs Grype on the
  repository on every pull request to `main`, weekly on `main`, and on
  demand. It fails on a critical vulnerability that has a fixed version
  (`--only-fixed`), reports every finding to code scanning as SARIF, and
  needs no secret.
- `.github/workflows/release.yml` gains an `sbom` job: on the push that
  creates a release, Syft writes a CycloneDX JSON SBOM of the tagged commit
  and the job attaches it to the GitHub release that release-please just
  created.
- The npm publish job is unchanged: no new permission, no new step.

Out of scope: a `governance-check` wiring row for ADR-0019 (today the check
has none; adding one changes the `adr-checks` spec, the `adr-catalog` spec
and ADR-0019's `check:` line, and belongs in its own change); a
`.grype.yaml` (no ignore rule is needed yet); attesting the SBOM
(`actions/attest`), which ADR-0019 asks only for an image; scanning the
release's SBOM at release time.

## Capabilities

### New Capabilities

- `vulnerabilities`: how this repository scans its dependencies (when,
  what fails, what is reported) and the SBOM each release publishes, as
  ruled in ADR-0019.

### Modified Capabilities

None.

## Impact

- New `.github/workflows/scan.yml`; one new job in
  `.github/workflows/release.yml`. Actions pinned by SHA with the version
  in a comment (ADR-0011 rule 3): `anchore/scan-action`,
  `anchore/sbom-action`, `github/codeql-action/upload-sarif`, plus the
  existing `actions/checkout`.
- No change to `package.json`, its dependencies, `checks/` or any ADR.
- The weekly run can turn `main` red without a change (ADR-0019,
  Negative consequences).
- Relation to `add-ci-gate` (#35): independent files (`ci.yml` there,
  `scan.yml` here), either can land first. The scan blocks a merge only
  once the ruleset `add-ci-gate` versions in `.github/rulesets/main.json`
  requires the `scan` check next to `test` (ADR-0019 rule 1 with
  ADR-0011's `forge.gate: blocking`); whichever change lands second makes
  sure it does.

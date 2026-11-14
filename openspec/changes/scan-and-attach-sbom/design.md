# Design

## Context

`.github/workflows/release.yml` is the only workflow: a `release-please`
job (its `release_created` output gates the rest), then a `publish` job in
environment `npm` that publishes by trusted publishing with
`contents: read` and `id-token: write`. Nothing is installed or built: the
package ships `adr/` and a stdlib-only script. `package.json` has
devDependencies only (commitlint, ontrack and governance itself from Git),
so `package-lock.json` records no runtime dependency.
`checks/governance-check.mjs` has no row for ADR-0019. A separate change,
`add-ci-gate` (#35), plans the pull request workflow and the ruleset. See
proposal.md for why.

## Goals / Non-Goals

**Goals:**
- Follow ADR-0019's own example as closely as possible, so the
  repository that ships the ADR shows what it asks.
- Keep the npm publish job exactly as narrow as it is.

**Non-Goals:**
- Caching the Grype database (`cache-db`): one download per run is cheap
  at this size, and a fresh database is the point.
- Making the scan required: that is the ruleset's job (`add-ci-gate`).

## Decisions

**1. A workflow of its own, `scan.yml`, not a job in `add-ci-gate`'s
workflow.** Its triggers differ (pull request, `schedule`,
`workflow_dispatch`) and its permissions differ (`security-events: write`),
so sharing a file would widen the CI job's token and couple two changes
planned in parallel. The only contract between them is the check name:
the job is named `scan`, and the ruleset lists `scan` as required. No
`paths:` filter: a required check that a pull request never triggers
stays pending and blocks it. Alternative: one `ci.yml` with a `scan` job
and the schedule; rejected, a scheduled run would then rerun lint and
test for nothing.

**2. `anchore/scan-action` on `path: .`**, with `severity-cutoff: critical`,
`only-fixed: true`, `fail-build: true`, `output-format: sarif`, as in
ADR-0019. Grype reads `package-lock.json` without `npm ci`, so the job
needs no Node and runs no install script (ADR-0020). It scans
devDependencies too: they run in CI and on contributors' machines, so a
fixable critical in commitlint should block as well. Schedule: Monday
06:00 UTC (`0 6 * * 1`), plus `workflow_dispatch`.

Amended at implementation: the action runs twice in the job. `only-fixed`
drops a finding with no fix from the output altogether, so a single run
cannot both gate on fixable criticals and report unfixable ones, as the
spec requires ("the finding is still reported"). A first run, `report`,
has `fail-build: false` and no `only-fixed`, and writes the SARIF; a
second run, the gate, has the settings above with `output-format: table`,
so its findings show in the job log (the only place a fork's pull request
shows them).

**3. SARIF to code scanning with `github/codeql-action/upload-sarif`,
`if: always()`, skipped on pull requests from forks.** ADR-0019 sends
findings below the threshold there. The repository is public, so code
scanning is free. A fork's token is read-only, so the upload would fail
the job for a reason that has nothing to do with the change; the
condition is `github.event_name != 'pull_request' ||
github.event.pull_request.head.repo.full_name == github.repository`.

**4. The SBOM is written by Syft (`anchore/sbom-action`), not
`npm sbom`.** `npm sbom --sbom-format cyclonedx --omit dev` is built in
and would be leaner, but ADR-0019's ruling for this repository says
"written by Syft"; using npm would mean amending that ruled reason first.
Syft runs on the checked-out tagged commit with `format: cyclonedx-json`,
`output-file: sbom.cdx.json`, `upload-artifact: false`. Recent Syft
releases leave dev dependencies out of an npm lockfile by default, so the
SBOM holds the package itself and no dependency, which is what the
tarball contains. Task 2.1 verifies this; if it does not hold, set
`javascript.include-dev-dependencies: false` in a `.syft.yaml` rather
than switch tools. Alternative: Syft on the unpacked `npm pack` tarball;
rejected, the unpacked tarball has no lockfile for Syft's directory scan
to read, and the tagged commit is what `npm publish` packs anyway.

**5. A separate `sbom` job in `release.yml`, not a step in `publish`.**
Attaching an asset needs `contents: write`; the publish job holds
`id-token: write` and the npm environment, and should not gain write
access to the repository. The `sbom` job has the same `needs` and `if` as
`publish`, `permissions: contents: write` only, checks out the tag
(`ref: ${{ needs.release-please.outputs.tag_name }}`, a new output of the
`release-please` job), and runs
`gh release upload "$TAG" sbom.cdx.json --clobber` with `GH_TOKEN` set to
`github.token`. `sbom-action`'s own release upload is not used: it only
fires on a `release` event, and this workflow runs on `push`. `--clobber`
makes a rerun of the job idempotent.

## Risks / Trade-offs

- [The weekly run turns `main` red with no change] → Accepted by
  ADR-0019. The fix is a dependency update through Dependabot (ADR-0018),
  or an ignore rule in `.grype.yaml` that a person merges, never a lower
  threshold.
- [A transitive critical in a devDependency blocks all merges until
  upstream ships] → Only fixable findings fail, so a fix exists;
  Dependabot or an `overrides` entry applies it.
- [The SBOM lists almost nothing] → True to the release: the package has
  no runtime dependency. Its value is the record and the habit, and it
  grows if a runtime dependency is ever admitted.
- [Until `add-ci-gate`'s ruleset requires `scan`, a red scan blocks
  nothing] → ADR-0019 rule 1 holds once both land; until then the check
  is visible on every pull request.

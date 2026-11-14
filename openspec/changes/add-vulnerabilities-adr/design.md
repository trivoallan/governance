# Design

## Context

`main` holds ADR-0001 to ADR-0018. ADR-0018 leaves vulnerability alerts out
of scope; ADR-0011 lists the pipeline stages exhaustively ("an absent stage
is a full answer"); ADR-0012 owns the release job. See proposal.md for why.

Facts this design relies on, checked on 2026-11-14 against the Anchore,
GitHub and `actions/attest` documentation:

- `grype sbom:./sbom.json` scans an SBOM; `--fail-on <severity>`
  (negligible…critical) sets a non-zero exit code; `--only-fixed` ignores
  unfixed vulnerabilities.
- `.grype.yaml` `ignore:` rules take `vulnerability`, `reason`, `fix-state`,
  `package` and others; there is no expiry field.
- Grype validates its database age, default `db.max-allowed-built-age`
  120h.
- `syft <dir> -o cyclonedx-json=<file>` (also `spdx-json`).
- `anchore/scan-action` inputs `path`/`image`/`sbom`, `severity-cutoff`
  (default `medium`), `fail-build` (default `true`), `only-fixed`,
  `output-format` (default `sarif`), `cache-db`.
- `anchore/sbom-action` `format` (default `spdx-json`) uploads the SBOM as
  a release asset when run during a release (`upload-release-assets`).
- `actions/attest-sbom` is deprecated for `actions/attest` (`sbom-path`),
  which needs `id-token`, `attestations` and `artifact-metadata: write`.
- GitHub's dependency graph exports an SPDX SBOM of the repository.

## Goals / Non-Goals

**Goals:**
- One answer to "this scan is red, what may I do?" an agent reads without
  interpreting, closing the shortcut of silencing the finding.
- Each release states what it contains.

**Non-Goals:** SAST, licence compliance, secrets (ADR-0015), shipping a
workflow template.

## Decisions

### One ADR, not two

The SBOM is the inventory the scan reads; ruled apart, a repository could
publish an SBOM nobody scans or scan something other than what it released.
The user chose one ADR.

### `fail_on: critical` recommended

The user's choice. Combined with fixed rule 3 (fixable only), the gate stops
merges rarely enough that it is not switched off. `high` stays an
alternative with its cost stated.

### `grype` recommended, as a free string

The user's choice over Trivy and GitHub-only. A free string like
`secrets.guard`, because `github` (alerts + dependency-review) and `trivy`
are legitimate values and the list would date.

### ADR-0011 table amended without a revision

Without a `scan` row, ADR-0011 forbids the job ADR-0019 asks for. Adding a
row adds no trait and changes no recommendation, so ADR-0001 rule 6 keeps
`revision: 1`. The row is conditioned on ADR-0019's key, so a repository
that has not ruled ADR-0019 gets no new stage.

## Risks / Trade-offs

- [The scheduled scan reds an untouched default branch] → stated as a
  Negative consequence; that is its purpose.
- [`--only-fixed` hides an unfixable critical from the gate] → it is still
  reported (SARIF); stated as a Negative.
- [Ignore rules never expire] → rule 5 requires a reason; stated as a
  Negative.
- [Action and flag names drift] → the ADR names features and links the
  references with a read date.

## Migration Plan

One pull request: ADR-0019, schema lines, ADR-0011 rows, ADR-0018 link,
this change. Rollback: revert it.

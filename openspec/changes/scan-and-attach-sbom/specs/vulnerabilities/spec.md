# Spec Delta

## Purpose

Carries out ADR-0019 in this repository: a vulnerability scan that gates
pull requests and reruns weekly, and a CycloneDX SBOM attached to every
GitHub release.

## ADDED Requirements

### Requirement: The scan runs on pull requests, weekly and on demand
The repository SHALL run a vulnerability scan with Grype, in a job named
`scan`, on every pull request targeting `main` whatever files it changes,
at least once a week on `main`, and when started by hand. The scan SHALL
read the dependencies the repository's lockfile records.

#### Scenario: Pull request
- **WHEN** a pull request targeting `main` is opened or updated, including one that changes only documentation
- **THEN** a `scan` check runs on its head commit

#### Scenario: Weekly run
- **WHEN** a week passes with no pull request
- **THEN** the scan has run at least once on `main` during that week

### Requirement: Only a fixable critical vulnerability fails the scan
The `scan` check SHALL fail when Grype finds a vulnerability of severity
`critical` for which a fixed version exists, and SHALL pass otherwise. A
vulnerability below `critical`, or with no fixed version, SHALL NOT fail
the check. The scan SHALL use a vulnerability database no older than
Grype's default maximum age.

#### Scenario: Critical with a fix
- **WHEN** the lockfile records a package version affected by a critical vulnerability that a later version fixes
- **THEN** the `scan` check fails

#### Scenario: Critical without a fix
- **WHEN** the only finding is a critical vulnerability with no fixed version
- **THEN** the `scan` check passes and the finding is still reported

#### Scenario: High with a fix
- **WHEN** the only finding is a high vulnerability with a fixed version
- **THEN** the `scan` check passes and the finding is still reported

### Requirement: Every finding is reported to code scanning
Each scan run on `main`, scheduled or by hand, and on a pull request from
this repository SHALL upload its findings as SARIF to GitHub code
scanning, whether the check passes or fails. A pull request from a fork
SHALL still be scanned and gated; its findings appear in the job log only.

#### Scenario: Findings below the threshold
- **WHEN** a scheduled scan finds only high vulnerabilities
- **THEN** the check passes and the findings are visible in the repository's code scanning alerts

#### Scenario: Pull request from a fork
- **WHEN** a pull request from a fork is scanned
- **THEN** the `scan` check runs and passes or fails by the same rule, and no upload is attempted

### Requirement: The scan holds no secret and the least permissions
The scan workflow SHALL use no repository or environment secret, SHALL
declare its `permissions:` explicitly with nothing beyond reading the
contents and writing code scanning results, and SHALL pin every action by
commit SHA with its version in a comment.

#### Scenario: Workflow read
- **WHEN** the scan workflow file is read
- **THEN** it references no `secrets.` value, its permissions are `contents: read` and `security-events: write`, and every `uses:` names a 40-character SHA followed by a version comment

### Requirement: Each release carries a CycloneDX SBOM
When the release workflow creates a GitHub release, it SHALL write a
CycloneDX JSON SBOM of the tagged commit with Syft, in the same run, and
attach it to that release as an asset named `sbom.cdx.json`. The SBOM
SHALL describe the package as released: its runtime dependencies, and
none of its development dependencies. A push that creates no release
SHALL produce no SBOM. The npm publish job SHALL keep its permissions.

#### Scenario: Release created
- **WHEN** the release pull request is merged and release-please creates `vX.Y.Z`
- **THEN** the GitHub release `vX.Y.Z` has an asset `sbom.cdx.json` in CycloneDX JSON, built from the commit `vX.Y.Z` points to

#### Scenario: No release
- **WHEN** a commit that is not a release is pushed to `main`
- **THEN** no SBOM is built and no release asset changes

#### Scenario: Development dependencies left out
- **WHEN** the SBOM of a release is read
- **THEN** it lists no package that appears only under `devDependencies`, such as `@commitlint/cli`

#### Scenario: Grype reads the SBOM
- **WHEN** `grype sbom:./sbom.cdx.json` runs on the downloaded asset
- **THEN** it scans it without error

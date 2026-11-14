# Tasks

## 1. Scan workflow

- [x] 1.1 Look up the latest release and its commit SHA of `anchore/scan-action` and `github/codeql-action` (`gh api repos/<owner>/<repo>/releases/latest`, then the tag's commit); verify each SHA resolves to that tag with `gh api repos/<owner>/<repo>/commits/<tag> --jq .sha`
- [x] 1.2 Write `.github/workflows/scan.yml` per design decisions 1 to 3 (job `scan`, triggers `pull_request` on `main` with no `paths:`, `schedule: '0 6 * * 1'`, `workflow_dispatch`; `permissions: contents: read, security-events: write`; checkout, scan-action, upload-sarif with the fork condition), with a header comment naming ADR-0019 and comments in the style of `release.yml`; verify with `grep -E 'uses: [^@]+@[0-9a-f]{40} # v' .github/workflows/scan.yml` that every `uses:` line is pinned and that the file contains no `secrets.`
- [x] 1.3 Check the threshold locally: in a scratch directory, a `package-lock.json` pinning `lodash@4.17.4` (critical CVE-2019-10744, fixed in 4.17.12); run `grype dir:. --fail-on critical --only-fixed`; verify it exits non-zero, and exits zero with `lodash@4.17.21`
- [x] 1.4 Open the pull request; verify the `scan` check runs and passes on it, and that its SARIF upload appears under the repository's code scanning tool `grype`; then run the workflow by hand on `main` (`gh workflow run scan.yml`) once merged and verify it passes

## 2. SBOM in the release

- [x] 2.1 Look up the latest `anchore/sbom-action` release and SHA as in 1.1; locally, at the repository root, run that release's Syft version with `syft dir:. -o cyclonedx-json=sbom.cdx.json`; verify the SBOM lists no `@commitlint/*` component and `grype sbom:./sbom.cdx.json` reads it without error (if dev dependencies appear, add the `.syft.yaml` of design decision 4 and rerun)
- [x] 2.2 In `.github/workflows/release.yml`, expose `tag_name` from the `release-please` job and add the `sbom` job of design decision 5 (same `needs`/`if` as `publish`, `permissions: contents: write`, checkout at the tag, `anchore/sbom-action` pinned by SHA, `gh release upload "$TAG" sbom.cdx.json --clobber`), with explanatory comments; verify with `git diff` that this change leaves the `publish` job untouched (`migrate-checks-to-typescript` may add `npm ci` to it) and that `grep -c -- '--provenance' .github/workflows/release.yml` is still 1
- [ ] 2.3 After the next release is cut, run `gh release view vX.Y.Z --json assets --jq '.assets[].name'`; verify it lists `sbom.cdx.json`, and that the downloaded file passes `grype sbom:./sbom.cdx.json`

## 3. Gate

- [x] 3.1 If `add-ci-gate` has landed, add `scan` next to `test` in the required status checks of `.github/rulesets/main.json` and re-apply the ruleset with `gh api` as that change does; otherwise leave a comment on #35 that its ruleset must require `scan` as well; once both have landed, verify with `gh api repos/trivoallan/governance/rules/branches/main` that `scan` is required
- [x] 3.2 Run `npx --no-install governance-check ADR-0012` and `ADR-0021`; verify both still pass, then run `openspec validate scan-and-attach-sbom --strict` and verify it passes

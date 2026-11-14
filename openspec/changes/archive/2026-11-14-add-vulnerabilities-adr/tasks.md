# Tasks

## 1. Facts and schema

- [x] 1.1 Check each fact in design.md's Context against the Grype, Syft, scan-action, sbom-action, actions/attest and GitHub SBOM documentation; drop any sentence ADR-0019 cannot source
- [x] 1.2 Add `traits.vulnerabilities.sbom` (enum `cyclonedx`, `spdx`, `none`), `traits.vulnerabilities.scanner` (string) and `traits.vulnerabilities.fail_on` (enum `critical`, `high`, `medium`, `low`, `none`), optional, under `# ADR-0019` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty `fail_on` fails

## 2. ADR-0019

- [x] 2.1 Write `adr/ADR-0019-vulnerabilities.md` as a question ADR (`proposed`, `revision: 1`, three empty traits, the seven fixed rules, how-to-rule block, key table in References, "Original to governance"); verify the schema fails it only on `status`, `date`, the empty traits and the marker sentence
- [x] 2.2 Write its Alternatives Considered (`grype`, `trivy`, GitHub only, `fail_on: high`, `fail_on: none`, `sbom: spdx`, `sbom: none`), each with its cost

## 3. ADR-0011, ADR-0018 and catalog

- [x] 3.1 Add the `scan` row and the SBOM mention to ADR-0011's stage table; verify `revision:` stays `1`
- [x] 3.2 Link ADR-0019 from ADR-0018's "Not concerned" paragraph; verify `revision:` stays `1`
- [x] 3.3 Run `openspec validate add-vulnerabilities-adr --strict`; verify it passes

## 4. Delivery

- [x] 4.1 Commit, push and open the pull request; verify its diff holds only the files listed in proposal.md's Impact and this change

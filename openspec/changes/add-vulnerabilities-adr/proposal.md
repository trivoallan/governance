# Proposal

## Why

ADR-0018 keeps dependencies current and explicitly leaves out security
alerts. No ADR says whether a release carries a known vulnerability, what
it contained, or what an agent does when a vulnerability scan turns red:
it either silences the finding or stops every change.

## What Changes

- Add **ADR-0019 "Vulnerabilities"**, a question ADR original to governance.
  Its question: *what does each release contain, and what tells you, and
  blocks, when part of it is vulnerable?* Three traits:
  - `vulnerabilities.sbom` (`cyclonedx`, `spdx`, `none`), recommending
    `cyclonedx`;
  - `vulnerabilities.scanner` (free string, `none`), recommending `grype`
    (with Syft for the SBOM);
  - `vulnerabilities.fail_on` (`critical`, `high`, `medium`, `low`,
    `none`), recommending `critical`.
- Its Decision fixes, whatever the repository rules:
  1. no blocking scan without `forge.gate: blocking` (ADR-0011);
  2. the scan runs on every pull request and on a schedule, at least weekly;
  3. only a fixable vulnerability fails the check;
  4. an agent never silences a finding (ignore rule, lower threshold,
     removed job); it updates the dependency, or proposes an ignore rule a
     person merges;
  5. every ignore rule names one vulnerability and gives a reason;
  6. the SBOM is built by the release job from what is released, attached
     to the release, attested to the digest for an image;
  7. the scanner's actions obey ADR-0011.
- ADR-0011's stage table gains a `scan` row, and its `release` row names the
  SBOM. ADR-0018's "Not concerned" paragraph links to ADR-0019.
- Add the three traits to `adr/.mdschema.yml`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0019 and its three traits.

## Impact

- `adr/ADR-0019-vulnerabilities.md`: new; consumers see it `new`.
- `adr/ADR-0011-forge-and-ci.md`: one table row added, one amended; no trait
  changes, so `revision:` stays `1` (ADR-0001 rule 6).
- `adr/ADR-0018-dependencies.md`: one link, no revision change.
- `adr/.mdschema.yml`: three traits.
- governance itself releases nothing and has no workflow; ADR-0019 ships
  `proposed`.

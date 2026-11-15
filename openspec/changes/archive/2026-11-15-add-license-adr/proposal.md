# Proposal

## Why

No ADR asks which licence a repository is published under. An agent
creating a manifest gets no licence field from `npm init` (npm 12.2.2) or
`uv init`: measured on 2026-11-15, both leave it out. The agent writes MIT
out of habit, or leaves the field empty. A public repository
with no licence is all rights reserved, so nobody may reuse it, whether or
not it publishes a package. governance itself shipped that way until
trivoallan/governance#86.

## What Changes

- Add **ADR-0023 "License"**, a question ADR original to governance. Its
  question: *under which licence may others use this repository?* One trait:
  - `license.spdx`: a free SPDX license expression, recommending `MIT`.
    `Apache-2.0` is named for when a patent grant matters, `UNLICENSED`
    for a private repository, and compound expressions (`MIT OR
    Apache-2.0`) are valid.
- Its Decision fixes:
  1. the root manifest's licence field holds the trait: `license` in
     `package.json`, `[project] license` in `pyproject.toml` (an SPDX
     expression, PEP 639);
  2. a licence file is committed at the root (`LICENSE`, `LICENSE.md`,
     `LICENSE.txt` or `COPYING`), except with `UNLICENSED`;
  3. the copyright holder is the organisation that owns the repository, or
     else the ADR's `authors:`. It is prose, not a key: the holder is read
     from the licence file once written.
- It says why governance ships under MIT-0 while it recommends MIT: its ADRs
  are copied and rewritten in other repositories, while a package is
  installed. Dependency licence compliance stays out (ADR-0019).
- ADR-0023 ships `check: npx --no-install governance-check ADR-0023`.
- Add the trait to `adr/.mdschema.yml`. README: 23 questions, 13 with a
  check, ADR-0023 in the list and the Delivery row.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0023 and its trait.
- `adr-checks`: a new ADR-0023 check.

## Impact

- `adr/ADR-0023-license.md`: new; consumers see it `new`.
- `adr/.mdschema.yml`: one trait.
- `checks/governance-check.ts` and its tests: one check.
- `README.md`: counts, list, Delivery row.
- Assumes `add-review-merge-adr` is archived first (its delta adds ADR-0022
  to the same catalog table).

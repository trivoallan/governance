# Design

## Context

- governance ships under MIT-0 since trivoallan/governance#86 (`LICENSE`,
  `"license": "MIT-0"` in `package.json`).
- `checks/governance-check.ts` has wiring rows (`exists`, `contains`,
  `path`) and dedicated checks. No row compares a manifest field with a
  trait.
- `tracked(root)` lists committed files. `readTraits` and `traitsOf` read
  and validate a trait.
- PEP 639 makes `[project] license` an SPDX expression string. The older
  form `license = { text = "..." }` still exists in the wild.

## Goals / Non-Goals

**Goals:**
- One key that an agent reads before it writes a manifest or a licence file.
- A check that catches the two drifts actually seen: a missing licence file,
  and a manifest with no licence field, or one
  that disagrees with the ruling.

**Non-Goals:**
- Validating the expression against the SPDX list. A free string, like
  `vulnerabilities.scanner`: the schema checks a value is written.
- Recognising the licence text in the file.
- Manifests in subfolders (monorepos), and `Cargo.toml` or `go.mod`.
- Dependency licence compliance (stays excluded by ADR-0019).
- SPDX headers in source files.

## Decisions

- **Its own ADR, not a key in ADR-0012.** A public repository with no
  licence has the problem even when it publishes nothing, so the answer
  does not depend on `delivery.target`. A key there would also bump ADR-0012
  to revision 4 for a question that is not its own.
- **Key `license.spdx`.** `spdx` says what format the value takes, and the
  key reads on its own in `AGENTS.md`. The spelling is `license`, as the
  manifests write it.
- **The holder is prose, not a key.** The holder is needed once, to write
  the file, and is then read from it. A key would duplicate it and drift.
  This is the same argument ADR-0017 makes against listing plugins in a
  trait.
- **A dedicated check.** It compares a field's value with the trait, which
  no wiring row does. It parses `package.json` as JSON, and finds
  `pyproject.toml`'s `license` with a line match under `[project]`, with no
  TOML dependency (ADR-0020: one runtime dependency).
  - Alternative: a `contains` row looking for `"license": "MIT"`. Rejected:
    spacing variants fail it, and `"MIT-0"` would contain `"MIT`.
- **`UNLICENSED` needs no file**: it is npm's value for a package nobody
  may reuse.

## Risks / Trade-offs

- [The line match on `pyproject.toml` misreads an unusual layout, such as a
  multiline inline table] → it reports "no licence field" naming the file,
  and the user can see the case. `ponytail:` comment with the upgrade path:
  a TOML parser.
- [Recommending MIT while governance uses MIT-0 looks inconsistent] → the
  ADR states the reason in its Decision.

## Migration Plan

Ships `proposed`. Archive `add-review-merge-adr` first: both deltas modify
the catalog table, and this one assumes the 22 rows that change lists.

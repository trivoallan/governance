# Proposal

## Why

The first run of the wiring checks on a real consuming repository, ontrack
(17 governance ADRs `accepted`), failed two ADRs that ontrack does follow.
Both are mistakes in governance's rows, not drift:

- ADR-0008 `docs.tool: starlight`: the row reads only the root
  `package.json`. ontrack's site is in `site/`, and `site/package.json`
  names `@astrojs/starlight`. A docs site in its own folder is common.
- ADR-0010 `architecture.document: arc42`: the row looks for
  `<root>architecture/NN-*.md`, but ADR-0010 itself puts the twelve files in
  `docs/architecture/arc42/`. ontrack also writes three sections as `.mdx`,
  which embedding LikeC4 views in Starlight (ADR-0008's recommendation)
  requires.

Once ontrack syncs the `check:` lines, both would fail `ontrack check`.

## What Changes

- ADR-0008 rows look in any tracked folder: `@astrojs/starlight` in any
  tracked `package.json`; `docusaurus.config.js`, `.mjs` or `.ts` anywhere;
  `mkdocs.yml` anywhere.
- ADR-0010's arc42 row looks for `<root>architecture/arc42/<NN>-*.md` or
  `.mdx`, for each of the twelve sections.
- The how-to-rule notes of ADR-0008 and ADR-0010 say the same. No `revision`
  changes.
- Tests reproduce ontrack's layout.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-checks`: the "Wiring rows" requirement, for the ADR-0008 and ADR-0010
  rows.

## Impact

- `checks/governance-check.mjs`: two rows, and the pattern helper accepts
  `**/` anywhere in a pattern, not only at its start.
- `checks/governance-check.test.mjs`: the arc42 fixtures move to `arc42/`,
  and new cases cover `.mdx` sections and a site in a subfolder.
- `adr/ADR-0008-documentation.md`, `adr/ADR-0010-architecture-documentation.md`:
  the how-to-rule notes.
- A repository that put arc42 files directly in `docs/architecture/`, as the
  old row expected, now fails ADR-0010's check: that layout never matched
  ADR-0010.

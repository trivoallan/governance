# Proposal

## Why

ADR-0008 and ADR-0010 treat everything under `docs.root` as one
documentation with one audience, one classification and one location
(issue #71). There are three readers: whoever uses the product, whoever
changes it (arc42, often an agent), and whoever rules (the ADRs). Merging
them breaks four things: ADR-0008 and ADR-0010 promise that `docs/adr/` and
`docs/architecture/arc42/` move with `docs.root`, which ontrack never does;
the recommended Starlight `glob` publishes `adr/` and `architecture/` along
with the guides; Diátaxis is required over pages it does not classify; and
`rejected` cannot say "arc42 but no user documentation".

## What Changes

- ADR-0008 revision 2: governs the user documentation only; drops the "ADR
  directory moves with `docs.root`" sentence; rewords the `docs.root: docs/`
  reason (sharing the directory is a convenience); warns that the `glob`
  snippet publishes `adr/` and `architecture/` and shows how to exclude
  them; `rejected` means no user documentation.
- ADR-0010 revision 2: drops "the path moves with `docs.root`"; borrows
  nothing from ADR-0008 but a possible shared site; the audience of the
  architecture document and of the ADRs is the repository's visibility.
- `governance-check ADR-0010` looks for arc42 under
  `docs/architecture/arc42/` only, no longer under `docs.root`.

No key and no value changes. The scope of `docs.root` and `docs.audience`
narrows, so both revisions move (ADR-0001, rule 6): a repository that
answered `team` with its architecture in mind answered another question.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the split between user and architecture documentation.
- `adr-checks`: the arc42 wiring row stops reading `docs.root`.

## Impact

- Edited: `adr/ADR-0008-documentation.md`,
  `adr/ADR-0010-architecture-documentation.md`, `checks/governance-check.ts`,
  `checks/governance-check.test.ts`.
- A repository that ruled `docs.root: site/` and kept arc42 under
  `site/architecture/arc42/` now fails the ADR-0010 check until it moves the
  sections to `docs/architecture/arc42/`, where ontrack reads them.
- This repository's own copies in `docs/adr/trivoallan/` update through
  `ontrack apply` after the release, not here.

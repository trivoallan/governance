# Proposal

## Why

ontrack's `propose` workflow can now be called from other repositories
(trivoallan/ontrack#156). Its agent may add an ADR, and the job that writes
accepts it only in the repository's ADR directory. That directory is written
nowhere a machine can read: rule 2 of ADR-0001 states `docs/adr/` in prose,
and ontrack assumes it. The workflow has to name the directory in its
permission rules and its path filter, so it needs it as a trait.

## What Changes

- ADR-0001 revision 4 adds one key, `record-architecture-decisions.directory`:
  the directory where the ADRs a repository writes for itself live. It ships
  filled with `docs/adr`, like `format`, because ADR-0001 ships `accepted`.
- Rule 2 says the directory comes from that trait, and that governance ADRs
  are imported into `<directory>/trivoallan/`.
- Rule 2 also says that ontrack reads `docs/adr` until it reads the trait:
  a repository changes the value only once ontrack supports it.
- `adr/.mdschema.yml` accepts the key as a string.
- The **Revisions** list gets `Revision 4`: one key added, shipped with the
  value every repository already uses, so nothing to re-answer unless your
  ADRs live elsewhere.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0001 ships at revision 4 with the
  `record-architecture-decisions.directory` trait.

## Impact

- `adr/ADR-0001-record-architecture-decisions.md`: frontmatter, rule 2,
  Revisions list.
- `adr/.mdschema.yml`: one key.
- Every repository that imported ADR-0001 sees it `revised` from 3 to 4 at
  its next `ontrack plan`.
- ontrack: reading the trait in `plan`, `apply` and `instructions` is a
  separate change in ontrack. Until it lands, the trait's only working value
  is `docs/adr`. ontrack's `propose` workflow already reads the trait, with
  `docs/adr` as its default.

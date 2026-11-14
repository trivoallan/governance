# Proposal

## Why

ADR-0001 rule 8 and the specs say a `check:` line governance adds to an ADR
you have already ruled never reaches your frozen copy, that `ontrack plan`
reports that ADR `unchanged`, and that you copy the line by hand. ontrack
does otherwise: when only the source's `check:` line differs, `ontrack plan`
reports the ADR `check` (with the line that goes and the one that comes) and
exits `2`, and `ontrack apply` reports it `synced` and writes that one line,
into ruled copies too. An end-to-end run of the add-wiring-checks change
showed the seven ADRs it touched reported `check`, then `synced`. The text
tells a reader to do by hand what the tool already does, and to expect a
`plan` output they will not see.

## What Changes

- ADR-0001 rule 8: replace the "copy the line into it by hand" sentence
  with what ontrack does: `ontrack plan` reports the ADR `check` and shows
  the line, `ontrack apply` reports it `synced` and writes only that line,
  ruled copies included. Rule 4 already lists the `check:` line among what
  is still written in a frozen ADR; it stays.
- ADR-0001 `revision` stays: the question it asks does not change (no trait,
  enum value or recommended answer moves), per "Revision tracks the
  question". This is a fix of what the text says about tooling.
- `adr-format` spec: the "Check line added" scenario says `ontrack plan`
  reports `check` and `ontrack apply` writes the line; the "Check line
  copied into a ruled ADR" scenario keeps its name and says the copy is
  made by `ontrack apply`, reported `synced`.
- `adr-catalog` spec: ADR-0001's Decision states that `ontrack apply`
  writes a `check:` line added after a repository ruled the ADR, instead of
  that the repository adds it by hand.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-format`: the ruling lifecycle and revision requirements describe the
  `check`/`synced` behaviour instead of a hand copy and `unchanged`.
- `adr-catalog`: ADR-0001's Decision describes the `check`/`synced`
  behaviour instead of a hand copy.

## Impact

- `adr/ADR-0001-record-architecture-decisions.md` (rule 8, one paragraph).
- `openspec/specs/adr-format/spec.md` and `openspec/specs/adr-catalog/spec.md`
  through this change's deltas.
- No change to `checks/`, to any other ADR, or to `adr/.mdschema.yml`.
  Consumers see ADR-0001 as `unchanged` by `revision`; its text reaches them
  only on a new import, as for any wording fix.

# Proposal

## Why

ADR-0012 says what makes a version and its changelog, not who reads it. A
release-please changelog is a list of commits. It serves whoever maintains
the repository, but it does not tell a consumer what the release brings or
what they must do. governance's own 0.3.0 entry lists "open a change on
explicit request in ADR-0016" without saying whether a consumer has
anything to do. Nothing told a repository that had ruled ADR-0012 that
revision 2 asked it to set `bump-minor-pre-major`. An agent finishing a change also has no
rule about the documentation that change makes false: ADR-0012 asks it to
check the pipeline, nothing more.

## What Changes

- ADR-0012 revision 3 asks one more key, `delivery.release_notes`, which
  says what accompanies a version:
  - `changelog`: the generated changelog alone.
  - `highlights` (recommended): the changelog, plus a short text for
    readers that heads the release's notes on the forge.
  - `none`: there are no versions.

  With `highlights`, a release is not finished until that text is
  written. The Suggested skills line names `deliver-release-notes` from
  `pm-skills@product-on-purpose`.
- ADR-0012 extends its definition of done for every change, with no key:
  the pull request that changes behaviour also updates, in the same pull
  request, the documentation it makes false. Anything a check can verify
  becomes a check; review covers the rest. The Suggested skills line names
  `verification-before-completion` from `superpowers@superpowers-marketplace`.
- Every ADR governance ships ends with a **Revisions** list, with one entry
  per revision above 1. Each entry says what changed in the question and
  what a repository that already ruled must re-answer. A test in
  `npm test` refuses an ADR whose `revision` has no matching entry. The
  ADRs already above revision 1 (ADR-0001, ADR-0008, ADR-0010, ADR-0012,
  ADR-0016) get their missing entries.
- governance takes ADR-0012 revision 3 for itself, rules
  `delivery.release_notes: highlights`, and writes the highlights of its
  next release.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0012 asks `delivery.release_notes` and states the
  per-change definition of done.
- `adr-format`: every shipped ADR above revision 1 carries a Revisions list
  that a test checks.

## Impact

- Edited: `adr/ADR-0012-delivery.md` and `adr/.mdschema.yml` (the new key's enum). The Revisions lists go into
  `adr/ADR-0001-record-architecture-decisions.md`,
  `adr/ADR-0008-documentation.md`,
  `adr/ADR-0010-architecture-documentation.md` and
  `adr/ADR-0016-changes.md`. ADR-0001 gets one sentence of wording about
  the list, which leaves its revision unchanged.
- New: a test under `checks/` for the Revisions lists.
- governance's own copy, `docs/adr/trivoallan/ADR-0012-delivery.md`, and
  `AGENTS.md` take revision 3 through ontrack.
- Every repository that ruled ADR-0012 sees it `revised` and has one key to
  answer. `governance-check ADR-0012` stays unchanged: the highlights live
  on the forge, not in a committed file.

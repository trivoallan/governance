# Design

## Context

ontrack's README (`plan` and `apply` output contracts) defines a `check`
category: an ADR that is up to date by `revision` but whose source `check:`
line differs from the local one. `plan` prints it with `- ` / `+ ` lines and
exits `2`; `apply` reports it `synced` and sets, replaces or removes that
one line, nothing else, in ruled copies as well. Only an up-to-date ADR can
be `check`: a `revised` ADR gets its check once ruled again.

## Goals / Non-Goals

**Goals:** ADR-0001 and both specs describe what ontrack does with a
`check:` line.

**Non-Goals:** changing ontrack, changing any check script, or restating
ontrack's output format in governance beyond the category names.

## Decisions

- **Keep ADR-0001 at its current `revision`.** The change corrects a
  statement about tooling; no trait, enum or recommendation moves. Raising
  it would make every consumer re-rule ADR-0001 for nothing. Alternative:
  raise it so consumers get the fix; rejected, `revision` dates the
  question, not the file.
- **Name the categories, not the output layout.** ADR-0001 names `check`
  and `synced` and says the line is shown before it is written; the exact
  columns stay ontrack's to describe. This keeps governance from drifting
  when ontrack's output changes.
- **Keep the "read it as an install script" warning.** `apply` writing the
  line without a prompt makes reading it at `plan` time the moment to look;
  rule 8 says so.

## Risks / Trade-offs

- [ontrack changes the behaviour again] → the ADR names categories only,
  and ADR-0001's References already links ontrack's output contracts.
- [Consumers keep the old wording] → harmless: following it by hand gives
  the same file `apply` would write.

# Design

## Context

See proposal.md, Why. Three constraints shape the approach:

- **`revision` moves only when the question changes** (adr-format, Revision
  tracks the question). Adding a trait is such a change: ADR-0001 goes to 4.
- **ADR-0001 ships `accepted`, with its traits filled.** Its key is not a
  question waiting for an answer, it describes the mechanics in use. The new
  key follows `format`: shipped with the value in use.
- **ontrack hard-codes `docs/adr`** for the ADRs a repository writes and for
  the imported ones. A trait that says otherwise would describe a layout
  ontrack does not produce.

## Goals / Non-Goals

**Goals:**

- One key that a workflow can read to know where a repository's ADRs live.
- No repository has anything to re-answer.

**Non-Goals:**

- Making ontrack honour another directory. That is a change in ontrack.
- An enum of directory names. The value is a path, checked by whoever reads
  it: ontrack's `propose` workflow refuses an absolute path, `..`, and paths
  under `.github`, `.claude`, `.githooks` or `node_modules`.

## Decisions

### 1. A key of ADR-0001, not a new ADR

Where ADRs live is part of how they are recorded, which is ADR-0001's
subject. A new ADR would ask a question nobody needs to rule.

Alternative: an input of ontrack's workflow. Rejected: each caller would
repeat what its own repository already states, and the two could disagree.

### 2. Shipped as `docs/adr`, with the dependency on ontrack written down

Rule 2 says that ontrack reads `docs/adr` until it reads the trait. A
repository that sets another value before then gets a workflow that writes
ADRs where ontrack does not look.

Alternative: wait for ontrack to support the trait before adding it.
Rejected: the workflow needs the key now, and the shipped value changes
nothing for anyone.

## Risks / Trade-offs

- [A repository sets another directory too early] → Rule 2 says not to, and
  the Revisions entry repeats it.
- [Every repository sees ADR-0001 `revised`] → The Revisions entry says
  there is nothing to re-answer.

## Open Questions

- When ontrack reads the trait, should governance ADRs be imported into
  `<directory>/trivoallan/` or stay in `docs/adr/trivoallan/`? This proposal
  writes the first. ontrack's change decides.

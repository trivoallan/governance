---
adr: ADR-0010
slug: architecture-documentation
title: Architecture documentation
status: proposed
revision: 1
date:
authors: []
supersedes: []
traits:
  architecture:
    document:
---

# Architecture documentation

## Status

Proposed

> **What is this file?** A question governance asks your repository, with
> the answer it recommends. While it says `status: proposed`, you may edit
> it freely. `revision:` dates the question, not the file: you do not fill
> it, and it only moves when the question changes. `rejected` is a full
> answer: when the question does not apply here, rule `rejected`, remove
> the whole `traits:` block, and say what stands in for it.
> [ADR-0001](ADR-0001-record-architecture-decisions.md) explains the
> mechanics.

## Context

While this key is empty, an agent that needs to understand the system as a
whole (its context, its building blocks, how it is deployed) has nowhere to
look, so it rebuilds that picture from the code each time, and rebuilds it
differently. An agent that changes the architecture does not know whether a
document should change with it. Once the value is written, it knows where
the document is, or that there is none.

This question is asked separately from the code's pattern
([ADR-0003](ADR-0003-architecture.md)) because the two are ruled at
different times. A pattern is chosen before the first module; a document
is worth writing once there is something to describe, and a repository can
answer one without the other.

## Decision

**What governance recommends, and why.**

| Key | Recommended value | Reason |
| --- | --- | --- |
| `architecture.document` | `arc42` | its twelve sections give every architecture fact one fixed place, so an agent and a reader know where to look and where to write, and a missing section is visible as a missing section |

**The document lives at `docs/architecture/arc42.md`.** One file, under the
documentation root of [ADR-0008](ADR-0008-documentation.md). If `docs.root`
is not `docs/`, the path moves with it.

**governance ships no template for now.** Start the file with the twelve
arc42 sections as headings, in this order, and fill only those you have
something to say in; an empty section is better left with one line saying
so than removed:

1. Introduction and Goals
2. Constraints
3. Context and Scope
4. Solution Strategy
5. Building Block View
6. Runtime View
7. Deployment View
8. Cross-cutting Concepts
9. Architecture Decisions
10. Quality Requirements
11. Risks and Technical Debt
12. Glossary

**Section 9 does not repeat the ADRs.** It links to `docs/adr/`, where the
decisions live; copying them would give two places to keep in step.

**This recommendation does not bind your repository.** If your architecture
already lives in a mature document elsewhere, say `elsewhere` and name the
path in this ADR's body. If you keep no architecture document, say `none`:
that is an honest answer for a small repository.

Everything below disappears when you rule, from this sentence up to the
Consequences heading, which stays.

**How to rule: five steps, all in this file.** Read all of them before
doing any, because the last one deletes the other four, and do them in one
commit.

1. **Write the value of each key** under `traits:` in the frontmatter, or,
   if you rule `rejected`, **remove the whole `traits:` block**.
2. **Change `status:`** from `proposed` to `accepted` or `rejected`.
3. **Fill `date:` and `authors:`**: `date:` as `YYYY-MM-DD`, the day you
   rule; `authors:`, the names of the people who decided, without email
   addresses.
4. **Rewrite the Positive, Negative and Neutral lists under Consequences**
   for your verdict: what it makes easier, and what it costs.
5. **Last, delete this block**, from its first sentence up to the
   Consequences heading, which stays. In its place, write the reason for
   your decision wherever you depart from the recommendation, or, if you
   adopt it as is, one line that says so.

The first step is the one people forget: a decision written only in prose
leaves an agent guessing. This is what the frontmatter looks like once
filled, and it is the one part of the file an agent reads without
interpreting it:

```yaml
---
adr: ADR-0010
slug: architecture-documentation
title: Architecture documentation
status: accepted
revision: 1
date: 2026-11-14
authors: [Your Name]
supersedes: []
traits:
  architecture:
    document: arc42
---
```

The Alternatives Considered below were weighed by governance without
knowing your context. Weighing them against yours is still to do, and it is
what makes a decision different from an accepted default.

## Consequences

### Positive

- An agent finds the system's context, building blocks and deployment in
  one known file instead of rebuilding them from the code.
- Fixed section names make a gap visible: an empty Deployment View is a
  question someone has to answer.

### Negative

- The document has to be kept up to date by hand; nothing flags it when the
  code moves away from it.
- Without a shipped template, each repository starts the file by hand from
  the list above.

### Neutral

- The pattern itself is asked by ADR-0003; this ADR only says where it is
  described.

## Alternatives Considered

### `arc42`

A fixed set of twelve sections in `docs/architecture/arc42.md`.
Recommended.

### `elsewhere`

The architecture already lives in another document. Keep it there and name
its path in this ADR.

### `none`

No architecture document. Honest for a small repository whose structure is
read from the code and ADR-0003.

## References

- Split out of surdesrails [SDR-0003](https://github.com/trivoallan/surdesrails/blob/main/resources/docs/adr/SDR-0003-architecture.md), revision 1 (its `architecture.document` key). surdesrails ships an arc42 template; governance does not yet.
- [arc42](https://arc42.org/overview): the twelve sections.
- [ADR-0001](ADR-0001-record-architecture-decisions.md): how governance ADRs are ruled on.

**The key.**

| Key | What it holds | Allowed values |
| --- | --- | --- |
| `architecture.document` | where this repository's architecture document lives | `arc42` (`docs/architecture/arc42.md`), `elsewhere`, `none` |

**An empty key is not an answer**: this one is required. The value is
written in this file and nowhere else; whoever needs it links here. See
ADR-0001 for the check command.

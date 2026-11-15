# Design

## Context

See proposal.md, Why. A ruled copy's body is frozen, and `revision` moves
only when the question changes (adr-format). Adding a key changes the
question, so ADR-0011 goes from 2 to 3 and a consumer finds what to
re-answer in its closing Revisions list.

## Goals / Non-Goals

**Goals:**

- One key that records who can accept a change, readable by any tool.

**Non-Goals:**

- Saying how a tool uses the key, including ontrack's apply gate.
- Checking the key in `governance-check`. Review rules live in a forge
  setting, outside tracked files, as for the ruleset behind `forge.gate`.
- Editing ADR-0009. Its "one review" wording stays; ADR-0011 owns the
  question.

## Decisions

**A revision of ADR-0011, not a new ADR.** Review is already an actor of
ADR-0011 through `forge.gate`. A revision lets adopters rule again on a
question they know, rather than receive one more.

**The key is `forge.review`, with `peer` and `author`.** Two values suffice:
the difference that matters is whether someone other than the author
reviews.

- *Rejected: a count of reviewers.* It asks a finer question than any
  reader needs.

**The Decision recommends `peer`.** It is the safer rule for a team.
`author` stays tenable for a repository where one person has write access.

**The crossing with `forge.gate` is stated in the ADR.** `none` with
`author` leaves no control at all; `blocking` with `author` makes the
pipeline the control; `informative` with `author` leaves the author as the
sole decider of a pipeline that only reports. The ADR makes the
consequences visible without prescribing a tool's behaviour.

**The schema entry is an enum.** `traits.forge.review` takes `peer` or
`author`, optional like its neighbours so an older ruled copy still
validates.

## Risks / Trade-offs

- [A repository rules `author` to bypass a team's review] → the crossing
  paragraph names the cost, and ruling is a person's decision.
- [Readers confuse the key with the sentence on who reviews a change
  proposed elsewhere] → that sentence is untouched and the new paragraph
  says it concerns this repository's own changes.

## Migration Plan

1. Ship ADR-0011 revision 3 in one `feat(adr)` commit.
2. A consumer runs `ontrack plan`, sees ADR-0011 `revised`, reads
   `Revision 3:` and answers `forge.review`.

To roll back, revert the commit. No consumer copy changes until they run
`ontrack apply`.

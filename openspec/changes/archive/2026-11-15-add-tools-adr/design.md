# Design

## Context

- The issue leaves four points open: whether a recommendation is possible,
  how pins are updated, whether one binary justifies a manager, and whether
  this is a new ADR or a revision of ADR-0011 or ADR-0015.
- ADR-0011 rule 3 pins actions and images; ADR-0020 governs how a
  dependency comes in and refuses install-time scripts; ADR-0018 governs
  updates through Dependabot. None covers a standalone binary.

## Goals / Non-Goals

**Goals:**
- One question, asked once per repository, readable on its own in the
  `AGENTS.md` block.
- A Decision that holds whatever the answer.

**Non-Goals:**
- A check that each tool named by a ruled trait is pinned. It would need a
  per-manager parser and a map from trait to tool; deferred to a later
  change once a value is ruled in practice.
- Installing any tool in governance itself.

## Decisions

- **A new ADR, not a revision.** ADR-0011 is about CI and ADR-0015 about
  secrets; the question spans both and the workstation. A revision would
  also change their `revision:` and force consumers to re-rule.
- **Trait `tools.manager`, values `mise`, `aqua`, `script`, `none`.**
  `none` is allowed only when no accepted ADR names such a tool.
- **Recommendation is made after verification, in the ADR's writing task.**
  Maturity of `mise` and `aqua`, checksum support, and Dependabot support
  are facts to confirm against official documentation; the ADR recommends
  `script` for one tool and a checksum-keeping manager for several, and
  drops any sentence it cannot source.
- **asdf is named only as a rejected alternative**: its plugins are
  third-party shell scripts without an integrity check by default.

## Risks / Trade-offs

- [A recommendation rests on unverified maturity claims] → the first task
  verifies them; an unsourced claim is dropped.
- [Both this change and `add-review-merge-adr` edit the shipped table] →
  this one lands second and lists ADR-0022.

## Migration Plan

ADR-0025 ships `proposed`. Repositories leaving it unruled see no change.
Rollback: revert the commit.

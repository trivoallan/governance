# Proposal

## Why

governance is meant to be the method my repositories inherit through ontrack.
Today it ships one Nygard-style ADR that records a verdict, so a consuming
repository has nothing to decide. surdesrails already has a better approach:
it ships ADRs as *questions*, each with a recommended answer, that the
consuming repository rules on. That approach is tied to an enterprise
context (GitLab, aresis, WCS, Jira). governance should be a personal edition
of it, imported *instead of* surdesrails, not alongside it.

## What Changes

- **BREAKING** Replace the current `adr/ADR-0001.md` (Nygard, verdict-style,
  open in PR #1) with `ADR-0001-record-architecture-decisions.md`
  adapted from SDR-0001. It is the only ADR that ships `accepted`, because it
  describes how the others are ruled on rather than asking a question.
- Every other ADR ships as a question: `status: proposed`, empty `traits:`,
  the method's recommended answer with its reasons, and a "how to rule"
  block that the consuming repository deletes when it rules.
- Each ADR is written with `/pm-skills:develop-adr` and follows its Nygard
  template sections (Status, Context, Decision, Consequences with
  Positive / Negative / Neutral, Alternatives Considered, References),
  instead of the MADR sections surdesrails uses. Everything is in English.
- ADRs keep the surdesrails frontmatter (`adr`, `slug`, `title`, `status`,
  `revision`, `date`, `authors`, `supersedes`, `traits`) in place of the
  template's own (`artifact`, `version`, `created`), because ontrack
  compares `revision` and the questions live in `traits`.
- Files are named `ADR-NNNN-slug.md`, numbered as a gapless sequence.
  Each ADR's `References` names the SDR and revision it was adapted
  from, so drift from surdesrails can be checked by hand.
- Add `adr/.mdschema.yml`, rewritten for governance: it keeps the
  "an ADR carries its verdict" checks, checks the Nygard headings instead
  of MADR's, and drops enterprise-only enums.
- Adapt the surdesrails questions in three batches:

  | Batch | governance | from | adaptation |
  |---|---|---|---|
  | 1 | ADR-0001 record decisions | SDR-0001 | accepted; prefix and drift noted in Consequences |
  | 1 | ADR-0002 localization | SDR-0002 | none |
  | 1 | ADR-0006 commits | SDR-0006 | none |
  | 1 | ADR-0009 branching | SDR-0009 | none |
  | 2 | ADR-0003 architecture | SDR-0003 | none |
  | 2 | ADR-0004 languages | SDR-0004 | drop team-skills reasoning |
  | 2 | ADR-0005 validation | SDR-0005 | none |
  | 2 | ADR-0007 tests | SDR-0007 | none |
  | 2 | ADR-0008 documentation | SDR-0008 | narrow the `audience` enum |
  | 3 | ADR-0010 forge and CI | SDR-0010 | GitHub assumed; only `gate` stays a question |
  | 3 | ADR-0011 delivery | SDR-0011 | replace the `offer: caas\|paas` hosting trait |
  | 3 | ADR-0012 frontend | SDR-0013 | no Angular-only enum, no WCS themes |
  | 3 | ADR-0013 work tracking | SDR-0014 | which tracker, not a Jira project |

- SDR-0000 (aresis service baseline) is not adapted.

## Capabilities

### New Capabilities

- `adr-format`: the shape every governance ADR follows: Nygard sections,
  frontmatter keys, the `proposed` / `accepted` / `rejected` lifecycle,
  `revision` semantics, file naming and numbering, the "how to rule" block,
  and what `.mdschema.yml` checks.
- `adr-catalog`: the set of questions governance ships, which surdesrails
  question each one adapts, and the traits each one asks the consuming
  repository to fill.

### Modified Capabilities

None.

## Impact

- `adr/`: `ADR-0001.md` is replaced; new `ADR-NNNN-*.md` files and
  `.mdschema.yml` are added batch by batch.
- `README.md`: it calls the ADRs "the ADRs I apply"; it is rewritten to
  say governance ships questions for consuming repositories to rule on.
- PR #1 (trivoallan/governance) carries the old ADR-0001: it is either
  updated with batch 1 or closed in favour of a new PR (open question).
- Consuming repositories get `proposed` ADRs to rule on under
  `docs/adr/trivoallan/`, instead of a verdict they inherit as-is.
- governance diverges from surdesrails by design. Nothing detects when an
  SDR moves; the `References` source line is the only link.
- Open questions to settle during design: the recommended default for each
  trait, the trait that replaces `offer` in ADR-0011, and how to handle PR #1.

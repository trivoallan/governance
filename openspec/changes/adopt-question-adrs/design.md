# Design

## Context

governance today holds `adr/ADR-0001.md` (Nygard, verdict-style, PR #1),
a README that calls the ADRs "the ADRs I apply", and a `package.json` whose
`files` ships `adr/` and whose `ontrack` key sets `adr: adr` and
`namespace: trivoallan`. The source material is surdesrails'
`resources/docs/adr/`: fourteen SDRs written in French with MADR sections,
plus a `.mdschema.yml` full of enterprise enums. See proposal.md for why,
and the `adr-format` and `adr-catalog` specs for what each file must
satisfy.

## Goals / Non-Goals

**Goals:**
- A repeatable way to turn one SDR into one governance ADR, so the three
  batches are the same job done fourteen times.
- A consuming repository can rule on each ADR without reading anything but
  the file itself.

**Non-Goals:**
- Tooling that detects drift between an ADR and its SDR. The References
  source line is the whole mechanism.
- Checking governance's own unruled question files automatically.
- Publishing to npm: governance stays a git dependency.

## Decisions

### Nygard sections, surdesrails frontmatter

Each ADR uses the section set of the `/pm-skills:develop-adr` template and
the frontmatter keys of surdesrails. The template's own frontmatter
(`artifact`, `version`, `created`, `status: draft`) is dropped: ontrack
reads `revision`, and a question has nowhere to live without `traits:`.

Alternatives: the template's frontmatter alone loses `revision` and
`traits`, so ontrack cannot compare and the ADR cannot ask anything. Keeping
both sets duplicates `status` and `created`/`date` with nothing to keep them
in step.

### Section mapping from MADR

| SDR (MADR) | governance ADR (Nygard) |
|---|---|
| intro blockquote ("What is this file?") | top of `## Status`, under the status line |
| Context and Problem Statement | `## Context` |
| Decision Drivers | folded into `## Context` |
| Decision Outcome: what the method fixes, recommended answer | `## Decision` |
| Decision Outcome: "how to rule" steps | end of `## Decision`, behind the marker sentence |
| Consequences | `## Consequences`, split into Positive / Negative / Neutral |
| Considered Options, Pros and Cons | `## Alternatives Considered`, one `###` per option |
| More Information | `## References`, plus the source line |

The `## Status` section repeats the frontmatter status in words, because the
template has it. The frontmatter stays the one a machine reads.

### Marker sentence for the how-to-rule block

The block starts with `Everything below disappears when you rule`, the
translation of surdesrails' `Tout ce qui suit disparaît quand vous statuez`.
In surdesrails the block runs to the `### Consequences` heading; in a Nygard
ADR it runs to `## Consequences`. The schema forbids the sentence in
`## Decision`, so a ruled file that kept the block is named.

### One schema, for ruled ADRs

`adr/.mdschema.yml` checks what a consuming repository must hold after
ruling: status `accepted` or `rejected`, a date, no empty trait key, the
Nygard headings, no marker sentence. Every key outside the eight core ones
is `optional`, so a `rejected` ADR without `traits:` passes. Enums are the
English, enterprise-free values from the `adr-catalog` spec.

Consequence accepted: governance's own question files fail this schema by
design, and only ADR-0001 passes it here. The alternative, a second schema
for shipped questions, is what surdesrails forbids from experience: two
schemas drift. Review is the check on governance's side.

### Write each ADR with `/pm-skills:develop-adr`

For each row of the catalog: read the SDR, translate it, then run
`/pm-skills:develop-adr` with the SDR as input so its checklist applies
(context a newcomer can follow, decision in active voice, positive and
negative consequences, alternatives). Then apply the section mapping and the
frontmatter above in place of the template's. The skill's "Proposed" status
becomes `status: proposed` with an empty `date` and `authors: []`.

### Revisions start at 1

Every governance ADR starts at `revision: 1`, whatever its SDR's revision
(SDR-0010 is at 2). The revision dates the question governance asks; the
SDR revision is recorded separately in the source line.

### Enum values in English

"Everything in English" covers trait values. Each enum is translated once,
in the catalog spec and the schema together: `français`/`anglais` become
`french`/`english`, `aucun` becomes `none`, `bloquante`/`informative`/
`aucune` become `blocking`/`informative`/`none`, and so on.

### Delivery in three PRs

Batch 1 lands on the current branch, so PR #1 is retitled and its
description rewritten: it now carries the OpenSpec change, the new
ADR-0001, the schema, ADR-0002, ADR-0006, ADR-0009 and the README update.
The old `adr/ADR-0001.md` is renamed with `git mv` to keep its history.
PR #1 was squash-merged before batch 1 landed, so batch 1 was rebased onto
`main` and opened as its own PR instead.
Batches 2 and 3 each get their own branch and PR.

### arc42 gets its own ADR

SDR-0003 asks two things at once: the code's pattern and where the
architecture document lives. governance splits them: ADR-0003 asks the
pattern, ADR-0010 asks for the document. They are ruled at different times
(a pattern is chosen before the code, a document once there is something to
describe) and a repository can answer one without the other. ADR-0010 takes
the next free number; batch 3 moves to 0011-0014, which no repository has
seen yet. ADR-0010 recommends arc42 as one file per section under
`docs/architecture/arc42/`, so a change touches only its section, and a
LikeC4 model under `docs/architecture/model/` (trait `architecture.model`)
so the context, building-block and deployment views are generated from one
source instead of drawn by hand. governance ships no arc42 template for now:
ADR-0010 lists the twelve files.

## Risks / Trade-offs

- [ontrack may not import `.mdschema.yml`, or may list it as `unreadable`
  because it has no frontmatter] → Check with `ontrack plan` in a scratch
  consumer before batch 1 merges; if it is not imported, ADR-0001 tells the
  consuming repository to copy it, as SDR-0001 does.
- [A consuming repository that imported the old ADR-0001.md sees it as
  `removed` and the new one as `new`] → Acceptable: nothing has consumed
  governance yet, and PR #1 is not merged.
- [Translating each SDR loses nuance, and the translation drifts from the
  source] → The source line names the SDR revision, so a reader can go back
  to the French text.
- [The Nygard template has no place for the SDR's intro blockquote] → It
  moves under `## Status`, per the mapping above.
- [Changing the README from "the ADRs I apply" to questions] → Done in
  batch 1, so the README never describes the wrong model on `main`.

### What ontrack does with the schema (measured)

Measured on 2026-11-14 with ontrack from its `main` branch, governance
installed from this branch: `ontrack plan` lists `ADR-0001-...` as `new`
and does not mention `.mdschema.yml` at all, neither imported nor
`unreadable`. ontrack has only the `plan` command. ADR-0001 therefore tells
the consuming repository to copy the schema from
`node_modules/<alias>/adr/` into `docs/adr/<alias>/`.

## Migration Plan

1. Batch 1 on this branch, PR #1 updated. Rollback: revert the branch to
   commit `eb43594` (the old ADR-0001).
2. Batch 2 in its own PR once batch 1 is merged.
3. Batch 3 in its own PR, after the open questions below are settled.

## Open Questions

- The answer governance recommends for each trait. Settled one ADR at a
  time while writing it with `/pm-skills:develop-adr`; it changes the ADR's
  text, not the task list.
- What replaces `hosting.offer` in ADR-0012, and the enum for ADR-0013's
  framework and ADR-0014's tracker. Settled when batch 3 starts.

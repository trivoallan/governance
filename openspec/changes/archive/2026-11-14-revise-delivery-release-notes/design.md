# Design

## Context

See proposal.md, Why. Three constraints shape the approach:

- **A ruled copy's body is frozen** (adr-format, Ruling lifecycle). A
  consumer takes a new revision through `ontrack plan` / `apply`, which
  reports the ADR `revised`. Whatever tells them what changed has to sit
  in the shipped file and survive their ruling.
- **`revision` moves only when the question changes** (adr-format,
  Revision tracks the question). Adding `delivery.release_notes` raises
  ADR-0012 to 3. Wording added to ADR-0001 leaves it at 3.
- **release-please rewrites the release pull request body on every merge.**
  Anything written there before the tag is lost.

## Goals / Non-Goals

**Goals:**

- One key, one rule and one test, the smallest set that covers the three
  readers.

**Non-Goals:**

- Generating highlights in CI. Writing them is a judgment, made by an agent
  and reviewed by a person.
- A check of `delivery.release_notes` in `governance-check`. The highlights
  live on the forge, not in a committed file, and the wiring check only
  looks at tracked files (adr-checks, Wiring check is presence only).
- A generic "documentation is up to date" check for consumers. Nothing
  can verify that in a repository-independent way.

## Decisions

**Highlights head the GitHub release body, after the tag.** release-please
creates the release, and an agent using `deliver-release-notes` then
prepends the highlights with `gh release edit`. `CHANGELOG.md` stays fully
generated.

- *Rejected: a Highlights section in `CHANGELOG.md`.* release-please
  regenerates the release pull request, so the section would need a
  mechanism to survive regeneration.
- *Rejected: one file per version under `docs/`.* It is one more file to
  keep in step, for text the release page already shows.

**The key is `delivery.release_notes`, in ADR-0012.** Release notes come
with a version, which ADR-0012 already owns (`delivery.release_tool`).

- *Rejected: putting it in ADR-0006.* ADR-0006 governs the commit message,
  which feeds the changelog but not the highlights.

`none` mirrors `delivery.release_tool: none`, so a repository with no
versions still gives an answer rather than leaving the key empty, which the
schema refuses.

**Migration notes live in the revised ADR, in a closing `**Revisions.**`
list.** The list follows the "**The keys.**" pattern: a bold-led paragraph
at the end of References, with no new heading. That leaves the Nygard
section order (adr-format) untouched, and the list sits outside the
how-to-rule block, so a ruled copy keeps it.

- *Rejected: a commit footer surfaced by release-please.* It lands in the
  changelog, a file the consumer does not have, and it says nothing to the
  agent reading the ADR it is answering.
- *Rejected: an "Upgrading" section in the highlights.* It is written once,
  at release time, and is not found again next to the question.

**The test is stateless.** For each file in `adr/`, read `revision: N` from
the frontmatter and collect the `Revision K:` items after `**Revisions.**`.
The test fails unless K runs over exactly 2..N. It needs no git base and no
diff, and it runs in `npm test` next to `checks/readme.test.ts`, so it
counts toward ADR-0007's coverage and gates every pull request.

**The definition of done extends an existing ADR-0012 paragraph** ("Once a
pipeline file exists…"), not a new trait. A key would ask a question that
has only one sensible answer.

## Risks / Trade-offs

- [Backfilled entries for ADR-0001, 0008, 0010 and 0016 misstate an old
  change] → write each entry from the git log of the commit that raised the
  revision, and quote what it changed, not what it should have changed.
- [The test checks that an entry exists, not that it says anything useful] →
  review, as for every prose rule in governance.
- [The highlights are forgotten after a tag] → ADR-0012 makes them part of
  "a release is finished", and governance's own release is the first test.
- [ADR-0012 grows to six required keys] → accepted. The key answers the
  question a consumer cares about most once they update.

## Migration Plan

1. Ship ADR-0012 revision 3 and the Revisions lists in one release (a
   `feat(adr)` commit, so a minor version below 1.0.0).
2. governance takes revision 3 into `docs/adr/trivoallan/` through ontrack
   and rules `highlights`.
3. After that release's tag, write its highlights onto the GitHub release.
   This is the first real use of the rule.

To roll back, revert the commit. No consumer's copy changes until they run
`ontrack apply`.

# Proposal

## Why

ontrack is changing its vocabulary: what a track publishes is a
**convention**, what a repository does with it is a **ruling**, and what
coding agents read is **instructions**. "Question", "answer" and "verdict"
stop being terms. The change is proposed in ontrack's repository under the
same name, `rename-question-to-convention`.

This track is where a reader meets those words most often. Each of its 26
ADRs opens with "A question ontrack-engineering asks your repository, with
the answer it recommends", and ontrack's site shows that text on every page
of its catalogue. Until the track follows, the site lists conventions whose
own text says "question".

The same ADRs name surdesrails, the track they were first adapted from: a
source line in the References of 14 of them, a sentence in the 12 others
saying no SDR exists, and comparisons in ADR-0001 and in a few
Alternatives. A repository that imports ontrack-engineering never meets
surdesrails, so the name tells it nothing it can act on. The README
already does not mention it.

## What Changes

- The block that opens every shipped ADR, "What is this file?", says: a
  convention ontrack-engineering proposes to your repository, with the
  values it recommends; `revision:` dates the convention; `rejected` is a
  full ruling.
- The body of each shipped ADR says "convention" where it said "question",
  and "ruling" or "value" where it said "answer" or "verdict". ADR-0001,
  which explains the mechanics, is reworded the same way.
- The shipped ADRs and `adr/.mdschema.yml` no longer mention surdesrails
  or an SDR. The `Adapted from surdesrails` lines go; an ADR with no
  source says `Original to ontrack-engineering.`; ADR-0001 loses the
  consequences and the alternative that were about surdesrails; the
  Alternatives that cited it keep their reasons without the name.
- **No `revision:` moves.** This is a change of wording, which the format
  excludes from revisions. A repository that already imported an ADR sees
  it `unchanged` and keeps the text it has.
- **BREAKING** Three messages of `ontrack-engineering-check` change: "rule
  on it there and remove it here" where they said "answer it there", and
  "`none` is a valid value only when…" where it said "`none` is an answer
  only when…". A script that matches the old text stops matching.
- The README says "convention": its first screen, the heading "The
  questions", which becomes "The conventions", and the sentence that
  introduces the excerpt.
- In the code of the checks, the identifiers follow (`Verdict`,
  `toolAnswer`), with their tests.
- A test fails when a file of `adr/` names surdesrails or an SDR.
- The specs say the new words. Two requirements of `adr-format` are
  renamed: "Conventions ship proposed" and "Revision tracks the
  convention"; one of `adr-checks`: "Another ADR read as a ruling".
  `adr-format` loses "Source line"; `adr-catalog` no longer lists a
  source for each ADR.

Not changed, on purpose:

- What each ADR asks: no trait, no allowed value, no recommendation.
- The sentence `Everything below disappears when you rule`, which the
  schema check looks for.
- The track's own rulings under `docs/adr/`: ruled, so frozen.
- `CHANGELOG.md` and `openspec/changes/archive/`: history. They keep
  "question" and "surdesrails".
- The requirement titles of `adr-catalog` that read "ADR-00NN asks …":
  "asks" is the everyday verb.
- "Question" and "answer" in their everyday sense.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-format`: the shape of a shipped ADR is described with the new
  words; two requirements are renamed; "Source line" is removed.
- `adr-checks`: three printed messages change; one requirement is renamed.
- `readme`: the README says "convention".

- `adr-catalog`: eight requirements no longer name surdesrails or an
  SDR: the table of shipped ADRs loses its source column, and the ADRs
  with no source are said original to ontrack-engineering.

`adr-catalog` also says "question" and "answer" in the prose of 14
requirements, with no change of requirement: it gets the new words in
place.

## Impact

- **ADRs**: the 26 files of `adr/`. No `revision:` changes.
- **Checks**: `checks/ontrack-engineering-check.ts` and its tests.
- **Documentation**: `README.md`, the pages of `docs/` outside `docs/adr/`,
  the workflows and the agent files that use the words.
- **This repository's `AGENTS.md`**: rewritten by `ontrack apply` once the
  repository installs the ontrack release that carries the new heading.
- **Consumers**: nothing to do. Their copies keep the wording they
  imported; a new import gets the new one.
- **Order**: after ontrack's change is released, since this track's pages
  name what ontrack prints. The change `rename-to-ontrack-engineering` is
  open here and edits the README and two ADRs: it is archived first.
- **Release**: the wording ships with the package, so ontrack's site shows
  it once a release of the track is installed there.

Issue served: trivoallan/governance#103

# Proposal

## Why

ADR-0011 relies on review as a control in two places: with `forge.gate:
informative` the pipeline reports and review decides, and with `none` review
is the only control. It never asks who reviews. ADR-0009 speaks of "one
review" and leaves the same gap.

A repository with a single maintainer has nobody to review its changes. A
tool that enforces review cannot tell that deliberate rule from a team that
skipped review, because no trait records the choice. ontrack's apply gate is
the first reader: it needs an approval from a person, and GitHub refuses an
author's approval of their own pull request, so a lone maintainer cannot
apply a proposal they wrote by hand.

## What Changes

- ADR-0011 goes to revision 3 and asks one more key, `forge.review`, which
  says who can accept a change:
  - `peer`: a person with write access other than the author.
  - `author`: the author's own review is enough.
  - `agent`: the review of an agent that did not write the change is
    enough.
- The Decision recommends `peer`, says `agent` gives a sole writer a
  second reader, and says `author` is tenable when one
  person alone has write access.
- The ADR states what `author` means beside each value of `forge.gate`:
  - `none` with `author`: no control at all.
  - `blocking` with `author`: the pipeline is the control.
  - `informative` with `author`: the pipeline reports and the author alone
    decides.
- The ADR says nothing of ontrack's apply gate. It asks the question and a
  tool that reads the answer draws its own consequence. The sentence on who
  reviews a change proposed elsewhere (deployment manifests in another
  repository) stays as it is.
- ADR-0011 gets a `Revision 3:` entry naming `forge.review` as the one key to
  answer. The schema in `adr/.mdschema.yml` accepts the new key.
- A new ADR was weighed and set aside: review is already an actor of
  ADR-0011, and a revision lets adopters rule again on a question they
  already know.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0011 asks `forge.review` and states its crossing with
  `forge.gate`.

## Impact

- Edited: `adr/ADR-0011-forge-and-ci.md` and `adr/.mdschema.yml` (the
  key's enum).
- A repository that ruled ADR-0011 at revision 2 sees it `revised` through
  `ontrack plan` and has one key to answer. An absent key is read by
  ontrack as `peer`.
- `governance-check ADR-0011` is unchanged. Who reviews is a forge setting,
  not a committed file.
- governance's own copy under `docs/adr/trivoallan/` takes revision 3
  through ontrack in a follow-up, after its `trivoallan` dependency moves.

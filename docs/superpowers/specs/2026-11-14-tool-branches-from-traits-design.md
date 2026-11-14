# Tool branches follow the repository's traits

## Intent

ADR-0009's check exempts the branches that release and update tools open,
because their names belong to the tool. Today it exempts four prefixes
hard-coded in `checks/governance-check.ts` (`TOOL_BRANCHES`), whatever the
repository chose. The exemption should follow what the repository ruled.
That keeps the rule in the governance source, so a consuming repository does
not need a local workaround.

## Goals

- The ADR-0009 check exempts a branch prefix only when the trait that names
  that tool says so:

  | Trait | Value | Exempted prefix |
  | --- | --- | --- |
  | `delivery.release_tool` (ADR-0012) | `release-please` | `release-please--` |
  | | `releaser-pleaser` | `releaser-pleaser--` |
  | `dependencies.updater` (ADR-0018) | `dependabot` | `dependabot/` |
  | | `renovate` | `renovate/` |

- Any other value (another tool, `manual`, `none`) exempts nothing.

## Non-goals

- No new trait. The list follows from ADR-0012 and ADR-0018. A key that copies
  them would go stale.
- No exemption for the Claude Code app's session branches (`tritri/…`).
  AGENTS.md keeps asking for those to be renamed.
- No revision bump for ADR-0009: the question stays the same.

## Constraints

- **No answer means no exemption** (approach A, chosen). This covers an
  ADR-0012 or ADR-0018 that is missing from `docs/adr/*/`, still `proposed`
  with an empty key, or `rejected` with no `traits:`. In all these cases the
  tool's branches must match `branching.prefixes`.
- When a tool branch is refused, the failure names the ADR and key to rule,
  for example: `dependabot/… is not exempt: dependencies.updater in ADR-0018
  is not dependabot`.
- This repository's own CI keeps passing: its ADR-0012 says `release-please`
  and its ADR-0018 says `dependabot`.

## Approaches

- **A. Derive from traits, nothing when unanswered** (chosen). The rule
  follows the repository's ruling strictly, and a missing ruling surfaces as
  a blocked pull request with an actionable message.
- **B. Derive from traits, but fall back to the full list when unanswered**
  (rejected). Nothing breaks before ruling, but it keeps exempting tools
  nobody chose, which is the defect being fixed.

## How (decided)

- In `branching()`, read `delivery.release_tool` and `dependencies.updater`
  with `findAdr` + `readTraits`. A missing file or empty key counts as
  "no tool".
- Replace `TOOL_BRANCHES` with a value-to-prefix map.
- Update the check's bullet list in `adr/ADR-0009-branching.md`, and its
  copy in `docs/adr/trivoallan/ADR-0009-branching.md` if that copy carries
  the bullet list.
- Tests in `checks/governance-check.test.ts`: exempted when the trait
  matches, refused when it differs, refused when the ADR is missing or
  unanswered.

## Left to the builder

- Exact wording of the log and error lines.
- Whether a `findAdr` "several files match" error fails the check or counts
  as no answer. Builder's call: let it fail, since it is a broken setup.

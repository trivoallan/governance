# Proposal

## Why

ADR-0011 fixes five rules for every workflow job and admits that no tool
enforces rules 3 to 5. Its own measurement shows that actionlint does not
flag a movable tag, `echo ${{ secrets.X }}` or `pull_request_target`.
zizmor 1.32.0, run on governance's own workflows, found five issues
(fixed in trivoallan/governance#91):
- a template injection;
- two write permissions granted to the whole workflow, against ADR-0021
  rule 3;
- two checkouts that persist credentials.

Agents write these workflows from the rules, and nothing checks what they
write.

## What Changes

- **ADR-0011 revision 2**: one new key, `forge.audit` (`zizmor` recommended,
  `none` accepted). With `zizmor`:
  1. a CI job runs `zizmorcore/zizmor-action`, pinned by SHA, with online
     audits through `GITHUB_TOKEN`;
  2. a finding is silenced only inline (`# zizmor: ignore[<audit>]`) with
     its reason, proposed by the agent and merged by a person (ADR-0019
     rule 4, ADR-0022);
  3. every action is pinned by hash, GitHub's own included.
- The stage table gains an `audit` stage. The "what the tools do not catch"
  section gains zizmor's coverage: rules 3 and 5 and ADR-0021's
  permissions are covered; rules 1 and 4 stay with review.
- `governance-check ADR-0011` runs `zizmor --offline --no-config` on the
  tracked workflows, so a repository's `zizmor.yml` cannot loosen it.
  zizmor 1.32.0's defaults already require hash pins for every action
  (measured). It is the first check of ADR-0011 that looks
  at what workflows say, not only that they exist.
- Add the trait to `adr/.mdschema.yml`. README: the Delivery row says what
  the audit verifies. The counts do not change (ADR-0011 already has a
  check).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: ADR-0011 asks `forge.audit` at revision 2. The wiring ADRs
  requirement notes that ADR-0011's check now runs a tool.
- `adr-checks`: the ADR-0011 check gains the zizmor run.

## Impact

- `adr/ADR-0011-forge-and-ci.md`: `revision: 2`, one key, three rules, one
  stage, a Revisions list. Consumers see it `revised`, with one key to
  answer.
- `adr/.mdschema.yml`: one trait.
- `checks/governance-check.ts` and its tests: ADR-0011 moves from a wiring
  entry to a check that runs the wiring row and then zizmor.
- `README.md`: Delivery row.
- governance's own CI and its ruled copy of ADR-0011 are untouched here.
  governance re-answers ADR-0011 after the release, through `ontrack plan`.

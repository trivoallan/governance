# Design

## Context

See proposal.md for the motivation.

The current `review()` check in `checks/governance-check.ts` reads
`review.merge_by` with a zod enum. It reads `agent.host` from ADR-0017
through `toolAnswer`, and looks for one prefix in the tracked
`.claude/settings.json`.

`forge()` evaluates `forge.gate` as wiring and runs zizmor. It never reads
`forge.review`.

Tests run the compiled script as a subprocess, with fixture repositories
(`wired`, `settings`) and a controlled `PATH`, so a stubbed `gh` on `PATH`
is enough to test the online part.

Governance imports its own ADRs into `docs/adr/trivoallan/`, at revision 1
for ADR-0022 and revision 3 for ADR-0011. CI runs only
`governance-check ADR-0006` and `ADR-0009` directly, so nothing reads those
copies' review keys today.

## Goals / Non-Goals

**Goals:**
- One key that an agent in any repository, solo or team, reads to know whether it may approve or merge.
- A check that verifies what governance can see: the committed denies everywhere, and the branch rules in CI.

**Non-Goals:**
- Verifying the ruleset's bypass list. It needs admin rights, which the CI token and a contributor do not have.
- Classic branch protection. The check reads rulesets only, and an ADR that recommends a ruleset says so.
- `CODEOWNERS`.

## Decisions

### One three-valued key instead of `merge_by` plus a team key
`review.by: maintainer | peer | agent` replaces `review.merge_by`.

The two-key alternative was `review.by: person | agent` plus
`review.team: solo | team`. One combination of those, `agent` with `team`,
has no effect, because the agent never approves and therefore needs zero
approvals to merge. Two keys with one dead combination carry no more than
one key with three values.

`author` became `maintainer`, because the author of the diff is usually the
agent.

### `review.approvals` is a key on every value, not only on `peer`
A key read only with `peer` would have no effect for two values out of
three, the same flaw that ruled out `review.team`. Instead, the key holds
the ruleset's required count for every value:
- `0` with `maintainer` and `agent`, because the merge or nothing is the review;
- `1` or more with `peer`.

The check verifies this coherence offline, whatever the environment. So a
repository that writes `maintainer` with `approvals: 1` fails before CI
ever reads a ruleset. In CI, the merged count must equal the key, not
merely reach it. A ruleset stricter than the ruling is drift too, and the
ruling is the place to change it.

`readTraits` returns strings, so the check parses the value as a whole
number of `0` or more (zod's `coerce`), and its message names the key when
that fails. The schema types it `number`.

### "The agent never approves" is the rule for every value
An agent runs under a person's token, so an approval it makes is recorded
as that person's, and nothing afterwards can tell the two apart. That is
ADR-0022's argument about merges, applied to approvals.

The deny on `Bash(gh pr review` covers this. It is broader than
`--approve`: it also blocks `--comment` and `--request-changes` through
`gh`. That is acceptable, because the agent comments on its own pull
request with `gh pr comment`.

### With `peer`, GitHub enforces "merge only after a fresh approval"
The agent does not query review state. It attempts the merge, and the
ruleset's last-push approval refuses it until a new approval exists.

That is why `peer` needs no `gh pr merge` deny: a deny would block the very
merge the rule allows. A repository may still add one, and the check does
not fail on it.

### The ruleset part runs in GitHub Actions only
It runs when `GITHUB_ACTIONS=true`. The repository comes from
`GITHUB_REPOSITORY`, and the default branch from
`gh api repos/{repo} --jq .default_branch`. The rules come from
`gh api repos/{repo}/rules/branches/{branch}`, which needs read access
only, so it works with the job's `GITHUB_TOKEN` passed as `GH_TOKEN`.

Locally the part prints that it skipped the ruleset, the same split the
zizmor precedent uses for its online audits. The alternative was to run it
whenever `gh` is authenticated, which would make local and CI verdicts
differ from machine to machine.

### Merging several `pull_request` rules
Several active rulesets may each contribute a `pull_request` rule. The
check combines them:
- the approval count is the highest of the counts, compared with `review.approvals` for equality;
- `dismiss_stale_reviews_on_push` and `require_last_push_approval` are true when any rule sets them.

This is the effective requirement GitHub applies.

With `maintainer`, `review.approvals` is `0`, so a count above zero fails.
A maintainer alone can never satisfy such a rule, and a rule bypassed on
every merge is not a rule. The check's message says so in those words,
rather than only reporting the mismatch.

### Leftover keys fail and say where to go
- `forge.review` in ADR-0011 fails `governance-check ADR-0011`.
- `review.merge_by` in ADR-0022 fails `governance-check ADR-0022`.

Both messages name `review.by`. This is the cheapest migration signal for
repositories that inherit governance, because `ontrack plan` already
reports both ADRs as `revised`.

The ADR-0011 failure reuses `readTraits(text, 'forge')` and checks whether
the key is present.

### Tests stub `gh`
Tests write a small executable `gh` script into a temporary directory on
`PATH`. The script prints a JSON fixture or exits non-zero, and the tests
set `GITHUB_ACTIONS=true` and `GITHUB_REPOSITORY`. No network is used.

## Risks / Trade-offs

- [The bypass list is unverified, so a team can add itself to bypass and pass the check.] → ADR-0022 and the check's output both say it is not verified. It remains the person's ruling, as the ruleset was before.
- [Inheriting repositories break on upgrade until they re-answer.] → This is intended. `ontrack plan` marks both ADRs `revised`, and each failure names the new key and the mapping lives in `Revision 2:` and `Revision 4:`.
- [`gh` is missing in a CI image.] → The check fails in CI and says so. GitHub-hosted runners ship `gh`.
- [A `pull_request` rule scoped by `conditions` to other branches.] → The check reads only rules active on the default branch, so such a rule is not counted.
- [The `gh pr review` deny is a text match, not a security boundary.] → This is the same ceiling ADR-0022 already states for merges. In `peer`, the ruleset, not the deny, is what makes an agent-made approval detectable: approvals by the opening account do not count.

## Migration Plan

1. Ship ADR-0022 revision 2, ADR-0011 revision 4, the ADR-0018 and ADR-0019 sentences, the schema and the check in one release.
2. In governance itself, after that release, re-import with `ontrack`. Then rule `review.by: maintainer` and `review.approvals: 0` in `docs/adr/trivoallan/ADR-0022-review-and-merge.md`, remove `forge.review` from the ADR-0011 copy, and add the `Bash(gh pr review:*)` deny to `.claude/settings.json`.
3. Optional and separate: wire `governance-check ADR-0022` into `ci.yml` with `GH_TOKEN`.

Rollback: revert the release. Repositories that already re-answered keep a
`review.by` key that the previous schema does not know about, and they
restore their old keys from git.

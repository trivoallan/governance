---
adr: ADR-0022
slug: review-and-merge
title: Review and merge
status: proposed
revision: 1
date:
authors: []
supersedes: []
check: npx --no-install governance-check ADR-0022
traits:
  review:
    merge_by:
---

# Review and merge

## Status

Proposed

> **What is this file?** A question governance asks your repository, with
> the answer it recommends. While it says `status: proposed`, you may edit
> it freely. `revision:` dates the question, not the file: you do not fill
> it, and it only moves when the question changes. `rejected` is a full
> answer: when the question does not apply here, rule `rejected`, remove
> the whole `traits:` block, and say what stands in for it.
> [ADR-0001](ADR-0001-record-architecture-decisions.md) explains the
> mechanics.

## Context

This ADR is written for a repository kept by **one person**, who works
with a coding agent. The agent branches, commits and opens the pull
request ([ADR-0009](ADR-0009-branching.md)). While this key is empty, it
does not know **whether it may merge that pull request itself** once the
checks are green. It either waits without saying so, or merges what
nobody read.

**An agent's merge cannot be told apart afterwards.** The agent works with
the maintainer's `gh` session or token, so GitHub records its merge under
the maintainer's name. The history shows a merge, never who decided it.
The rule can only be enforced **before** the merge, not audited after it.

**For one person, the merge is the review.** GitHub does not let the author
of a pull request approve it. A repository with one maintainer that
required an approval would block every merge, or bypass the rule on each
one. What remains is the moment a person reads the diff and merges it.

Two ADRs already settle a case: [ADR-0018](ADR-0018-dependencies.md) lets
some updates merge without a person, and
[ADR-0019](ADR-0019-vulnerabilities.md) has a person merge every
vulnerability ignore rule. This ADR states the rule they are cases of.

**Not concerned:** how many approvals a pull request needs, and who owns
which path (`CODEOWNERS`). Both matter once several people review, which
this ADR does not address.

## Decision

**What governance recommends, and why.**

| Key | Recommended value | Reason |
| --- | --- | --- |
| `review.merge_by` | `person` | the agent proposes, reviews and fixes; a person reading the diff and merging it is the review, and the only one a repository with one maintainer can have |

`agent` is an acceptable answer for a repository nobody depends on, such as
a demo or a throwaway, and it is justified here when you rule it.

**What governance fixes when you rule `person`:**

1. **The agent opens the pull request ready for review, says when its
   checks are green, and stops.** Not as a draft: a draft adds a click and
   no review.
2. **The agent merges nothing.** Not with `gh pr merge`, not by enabling
   auto-merge (`--auto`), not through the API, not by pushing to the
   default branch.
3. **A bot that a workflow runs under another ADR's ruling is not an
   agent session.** ADR-0018's automerge is that exception: Dependabot's
   pull request is merged by a workflow the repository ruled, not by the
   agent.
4. **A review the agent runs on its own work is advice.** It can find
   faults and fix them. The person's merge remains the review.

**On GitHub, a ruleset backs the rule.** On the default branch: require a
pull request before merging, with zero required approvals, and leave the
bypass list empty. Pushing to the default branch then fails for everyone,
the agent included. That setting lives on GitHub, not in a file of the
repository, and the check does not verify it.

**With `agent.host: claude-code`** ([ADR-0017](ADR-0017-agent-tooling.md)),
`.claude/settings.json` denies the merge:

```json
{
  "permissions": {
    "deny": ["Bash(gh pr merge:*)"]
  }
}
```

If the GitHub MCP server is installed, deny its merge tool as well, under
the name your configuration gives the server (for example
`mcp__github__merge_pull_request`).

Everything below disappears when you rule, from this sentence up to the
Consequences heading, which stays.

**How to rule: five steps, all in this file.** Read all of them before
doing any, because the last one deletes the other four, and do them in one
commit.

1. **Write the value of the key** under `traits:` in the frontmatter, or,
   if you rule `rejected`, **remove the whole `traits:` block**.
2. **Change `status:`** from `proposed` to `accepted` or `rejected`.
3. **Fill `date:` and `authors:`**: `date:` as `YYYY-MM-DD`, the day you
   rule; `authors:`, the names of the people who decided, without email
   addresses.
4. **Rewrite the Positive, Negative and Neutral lists under Consequences**
   for your verdict: what it makes easier, and what it costs.
5. **Last, delete this block**, from its first sentence up to the
   Consequences heading, which stays. In its place, write the reason for
   your decision wherever you depart from the recommendation, or, if you
   adopt it as is, one line that says so.

The first step is the one people forget: a decision written only in prose
leaves an agent guessing. This is what the frontmatter looks like once
filled, and it is the one part of the file an agent reads without
interpreting it:

```yaml
---
adr: ADR-0022
slug: review-and-merge
title: Review and merge
status: accepted
revision: 1
date: 2026-11-15
authors: [Your Name]
supersedes: []
check: npx --no-install governance-check ADR-0022
traits:
  review:
    merge_by: person
---
```

**The `check:` line stays.** Once this ADR is `accepted`, `ontrack check`
runs it from your repository's root. With `merge_by: person`, it reads
ADR-0017's `agent.host`:

- with `claude-code`, the committed `.claude/settings.json` holds, under
  `permissions.deny`, an entry that starts with `Bash(gh pr merge`. The
  same entry under `allow` or `ask` fails, and
  `.claude/settings.local.json` is not read;
- with any other host, or no ADR-0017, there is nothing to check.

`merge_by: agent` has nothing to check, and passes.

**The check denies nothing itself, and the deny has a ceiling.** It
protects against an agent that merges by mistake, not against one working
around the rule. Claude Code matches the entry inside a compound command
(`cd x && gh pr merge 1`), but a rule matches command text, and its
documentation says deny rules are not a security boundary: `gh api` on the
merge endpoint, `/usr/bin/gh pr merge` and a push to the default branch do
not match. The ruleset above closes those.

The Alternatives Considered below were weighed by governance without
knowing your context. Weighing them against yours is still to do, and it is
what makes a decision different from an accepted default.

## Consequences

### Positive

- An agent at a green pull request knows what to do: say so and stop.
- Nothing reaches the default branch without a person having read it,
  except the updates ADR-0018 lets merge.
- ADR-0018 and ADR-0019 apply one rule instead of two separate ones.

### Negative

- Every change waits for the maintainer, even a trivial one.
- The deny entry protects against a mistake, not against a workaround;
  without the ruleset, the rule is an intention.

### Neutral

- The ruleset lives on GitHub, outside the repository, and nothing in the
  repository records it.

## Alternatives Considered

### `merge_by: agent`

The agent merges once the checks are green. No wait, and no reader: a
green check is not a review (ADR-0018 says why). Tenable for a repository
nobody installs from or depends on.

### One required approval

The usual rule for a team. For one maintainer it cannot work: GitHub
refuses the author's own approval, so every merge is blocked or bypassed,
and a rule bypassed on every merge is not a rule.

### `CODEOWNERS`

Routes each path to its owners for review. With one maintainer every path
has the same owner, so the file adds nothing. It belongs with required
approvals, in a revision of this ADR that addresses several reviewers.

### Draft pull requests

The agent opens a draft, and the person marks it ready, then merges. The
extra step proves nothing the merge does not already prove.

## References

- Original to governance; no surdesrails SDR asks this question.
- [ADR-0001](ADR-0001-record-architecture-decisions.md): how governance ADRs are ruled on.
- [ADR-0009](ADR-0009-branching.md): one change, one branch, one pull request.
- [ADR-0011](ADR-0011-forge-and-ci.md): the required checks a merge waits for.
- [ADR-0017](ADR-0017-agent-tooling.md): `agent.host`, which decides what the check reads.
- [ADR-0018](ADR-0018-dependencies.md) and [ADR-0019](ADR-0019-vulnerabilities.md): the two cases this ADR generalises.
- Claude Code: [permissions](https://code.claude.com/docs/en/permissions). GitHub: [about rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets), [available rules](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [approving a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews). Read on 2026-11-15.

**The key.**

| Key | What it holds | Allowed values |
| --- | --- | --- |
| `review.merge_by` | who merges a pull request into the default branch | `person`, `agent` |

**An empty key is not an answer.** The value is written in this file and
nowhere else; whoever needs it links here. See ADR-0001 for the check
command.

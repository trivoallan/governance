---
adr: ADR-0026
slug: agent-identity
title: Agent identity
status: proposed
revision: 1
date:
authors: []
supersedes: []
traits:
  agent:
    identity:
---

# Agent identity

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

This ADR is written, as [ADR-0022](ADR-0022-review-and-merge.md) is, for a
repository kept by **one person** who works with a coding agent. While this
key is empty, the agent uses **whatever GitHub credentials it finds** on the
maintainer's machine: their `gh` session, their SSH key.

**Everything the agent does is then recorded under the maintainer's name.**
Its commits, pushes, pull requests and comments cannot be told from the
maintainer's afterwards. ADR-0022 draws the consequence for the merge: the
rule "a person merges" can only be held before the merge, by a deny entry
in the agent host's settings, which its documentation says is not a
security boundary, and by a ruleset that cannot require an approval,
because GitHub does not let a pull request's author approve it.

**An identity of its own removes both limits.** The agent's work is
recorded under its name, and GitHub, not the agent host, refuses its merge:
the ruleset requires an approval the agent cannot give itself.

**An identity is only its own if the agent cannot reach the other one.** An
agent that runs on the maintainer's machine, with the maintainer's `gh`
session readable, has two identities and picks one. Keeping its credentials
apart is part of the answer, not a detail of it.

**Not concerned:** repositories with several maintainers, ownership
(`CODEOWNERS`) and the assignment of reviewers. Who merges stays
ADR-0022's question.

## Decision

**What governance recommends, and why.**

| Key | Recommended value | Reason |
| --- | --- | --- |
| `agent.identity` | `maintainer` | for one person, a second identity, a token kept apart and a ruleset with a bypass cost more to set up and keep than the deny entry ADR-0022 already asks for |

`own` is the stronger answer. It is worth its setup when **the history must
tell the agent from the person** (an audit, a repository others depend on),
or when **the merge rule must be held by GitHub** rather than by the agent
host. Rule `own` for either reason, and say which.

**What governance fixes when you rule `own`:**

1. **The agent acts under its own GitHub identity**, a GitHub App or a
   machine account. Its commits, pushes, pull requests and comments are
   recorded under it. The identity gets the **write** role on the
   repository, not admin.
2. **Its credentials are kept apart from the maintainer's.** The session
   that runs the agent reaches the agent's token, and not the maintainer's
   `gh` session or SSH key. The token is a secret, stored as
   [ADR-0015](ADR-0015-secrets.md) says secret values are.
3. **On the default branch, the ruleset requires a pull request with one
   approval, and its bypass list holds the repository admin role alone, in
   the mode "For pull requests only".** The maintainer is the only admin.
   The agent's identity is not a bypass actor and cannot approve its own
   pull request, so GitHub refuses its merge. The maintainer merges, as
   bypass actor, without approving: the merge is the review, as ADR-0022
   says. "For pull requests only" keeps direct pushes to the default branch
   refused for everyone.
4. **A `Co-Authored-By` trailer labels a commit, and is not an identity.**
   It is written by whoever commits, and GitHub enforces nothing on it.

**What the bypass costs.** The maintainer's own pull requests, written
without the agent, would otherwise wait for an approval nobody can give.
The bypass lets them merge, and it also lets the maintainer merge the
agent's pull request without reading it, exactly as under `maintainer`.
GitHub holds the agent to proposing; it cannot hold the maintainer to
reading.

**A GitHub App or a machine account.**

| | GitHub App | Machine account |
| --- | --- | --- |
| Shows as | `your-app[bot]` | a user of its own |
| Token | an installation token that expires after one hour, minted from the App's private key; a local session needs a helper to mint it | a fine-grained personal access token, long-lived, scoped to the repository |
| Commits | shown as verified when made through the API without a custom author; a local `git push` is unsigned unless the agent signs | unsigned unless the account signs |
| Terms | none beyond creating the App | one free machine account in addition to your personal account; a person who accepts the terms is responsible for it |
| Setup | create the App, install it on the repository, keep its private key | create the account, its 2FA, invite it with the write role, keep its token |

Either satisfies the four rules. The machine account is simpler to run from
a local session; the App leaves no long-lived token behind.

**With `agent.host: claude-code`** ([ADR-0017](ADR-0017-agent-tooling.md)),
the sandbox keeps the maintainer's credential files out of the agent's
shell commands, and permission rules keep them out of its Read tool. Both
are needed: a `sandbox.filesystem.denyRead` entry does not stop the Read
tool, and a `Read(...)` deny rule is merged into the sandbox. In
`.claude/settings.json`:

```json
{
  "permissions": {
    "deny": ["Read(~/.config/gh/**)", "Read(~/.ssh/**)"]
  }
}
```

This reaches files only. If `gh` keeps the maintainer's token in the
system keyring, as it does by default on macOS, a file rule does not reach
it: run the agent where the maintainer's credentials do not exist (a
container, another OS user, a cloud session), and hand it the agent's
token, for example as `GH_TOKEN`.

**Dependabot automerge under a required approval.** With
[ADR-0018](ADR-0018-dependencies.md)'s `automerge: patch` or `minor`, the
automerge workflow enables auto-merge, and auto-merge waits for every
required review. Under this ruleset the Dependabot pull request waits for
an approval. Two ways out:

- the maintainer approves Dependabot's pull requests, and auto-merge does
  the rest;
- the automerge workflow approves the pull request with
  `gh pr review --approve`, which needs the repository setting "Allow
  GitHub Actions to create and approve pull requests" (Settings, Actions,
  General). GitHub's documentation does not say whether that approval
  counts toward the required one: test it on your repository before you
  rely on it.

Do not add GitHub Actions to the bypass list: every workflow would then
merge without an approval, including one the agent writes.

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
adr: ADR-0026
slug: agent-identity
title: Agent identity
status: accepted
revision: 1
date: 2026-11-15
authors: [Your Name]
supersedes: []
traits:
  agent:
    identity: maintainer
---
```

**There is no check, and none is coming.** The identity, the token's
isolation and the ruleset live on GitHub and on the maintainer's machine,
not in a tracked file. A check could only look for something this ADR does
not require, and passing it would read as more than it proves.

The Alternatives Considered below were weighed by governance without
knowing your context. Weighing them against yours is still to do, and it is
what makes a decision different from an accepted default.

## Consequences

### Positive

- An agent knows which credentials it is meant to use.
- With `own`, the history tells the agent's work from the maintainer's, and
  GitHub refuses the agent's merge whatever the agent host allows.
- With `own`, ADR-0022's rule holds against a workaround, not only against
  a mistake.

### Negative

- `own` costs a second identity, a token kept apart, and a ruleset to set
  and keep on GitHub.
- The bypass lets the maintainer merge the agent's work unread, as before.
- Under `own`, Dependabot's automerge waits for an approval unless its
  workflow gives one.

### Neutral

- With `maintainer`, nothing changes: ADR-0022's deny entry and ruleset
  stay the whole rule.

## Alternatives Considered

### `maintainer`

The agent acts under the maintainer's name. No setup, and no way to tell
its work apart afterwards; ADR-0022's deny entry protects against a
mistake, not a workaround. The recommendation for one person, for the cost
reason above.

### The agent approves the maintainer's pull requests

Instead of a bypass, the agent's identity gives the approval the
maintainer's own pull requests need. No bypass at all, but an agent's
approval becomes the gate, where ADR-0022 calls an agent's review advice.

### Every change goes through the agent

No bypass: the maintainer never opens a pull request themselves. A rule
the maintainer breaks the first time they fix a typo.

### A `Co-Authored-By` trailer alone

Free, and already common. It labels commits, enforces nothing, and does
not reach merges, pushes or comments.

### `CODEOWNERS` with a required code owner review

Routes each path to its owner. With one maintainer, every path has the same
owner: with the bypass, the code owner review is bypassed with the rest;
without it, the maintainer's own pull requests block. Either way it adds no
enforcement here. It belongs to a repository with several maintainers.

## References

- Original to governance; no surdesrails SDR asks this question.
- [ADR-0001](ADR-0001-record-architecture-decisions.md): how governance ADRs are ruled on.
- [ADR-0015](ADR-0015-secrets.md): where the agent's token is stored.
- [ADR-0017](ADR-0017-agent-tooling.md): `agent.host`, which decides how the credentials are kept apart.
- [ADR-0018](ADR-0018-dependencies.md): the automerge a required approval holds back.
- [ADR-0022](ADR-0022-review-and-merge.md): who merges, which this ADR lets GitHub enforce.
- GitHub: [approving a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews), [creating rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository), [available rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [auto-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request), [Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository), [installation tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app), [commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification), [terms of service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service). Claude Code: [sandboxing](https://code.claude.com/docs/en/sandboxing), [settings](https://code.claude.com/docs/en/settings-reference). Read on 2026-11-15.

**The key.**

| Key | What it holds | Allowed values |
| --- | --- | --- |
| `agent.identity` | under whose GitHub identity the agent commits, pushes and opens pull requests | `maintainer`, `own` |

**An empty key is not an answer.** The value is written in this file and
nowhere else; whoever needs it links here. See ADR-0001 for the check
command.

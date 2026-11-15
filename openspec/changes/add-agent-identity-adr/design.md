# Design

## Context

- ADR-0022 (review and merge) rules `review.merge_by: person` and holds the
  rule with a Claude Code deny entry on `gh pr merge` plus a ruleset with zero
  approvals and no bypass. Its Context names the limit this change addresses
  (see proposal.md, Why).
- GitHub refuses a pull request's author's approval of their own pull request.
  A ruleset's bypass actors can be given "always" or "for pull requests only";
  the latter lets them merge a pull request whose rules are not met, and not
  push to the branch. To be confirmed in task 1.1.
- ADR-0018's automerge runs `gh pr merge --auto` from a workflow with
  `GITHUB_TOKEN`. With a required approval, auto-merge waits for one. A
  workflow can approve with `gh pr review --approve` when the repository
  allows GitHub Actions to approve pull requests. To be confirmed in task 1.1.
- ADR-0015 rules where secrets are stored and guarded; the agent's token is
  one.
- ADR-0017's `agent.host` already lives in the `agent` group. ontrack writes
  each ADR's traits as a separate block of `AGENTS.md`, so two ADRs sharing a
  group is a layout question, not a collision. `adr/.mdschema.yml` lists
  traits flat, each optional.
- `checks/governance-check.ts` checks tracked files only. ADR-0020 and
  ADR-0025 ship without a `check:` line; the README counts only ADRs with one.

## Goals / Non-Goals

**Goals:**
- One key that reads on its own in `AGENTS.md`: `agent.identity: own`.
- A ruleset described once, in ADR-0026, which ADR-0022 points to under `own`.

**Non-Goals:**
- Repositories with several maintainers: `CODEOWNERS`, several required
  approvals, review assignment. The README keeps them in "Not covered".
- Step-by-step setup of a GitHub App or a machine account. The ADR names the
  steps that matter and links GitHub's documentation.
- Hosts other than Claude Code for the isolation advice, as ADR-0022 does.
- Verifying anything on GitHub. No check calls the API today.

## Decisions

- **A new ADR, not a revision of ADR-0022.** The identity is a question of its
  own (it also changes attribution, secrets and isolation), and a revision
  would move ADR-0022's `revision:` and re-ask every consumer who ruled it.
  ADR-0022 gains links only.
- **Key `agent.identity`, values `maintainer` and `own`.** `own` reads on its
  own: the agent has its own identity. Splitting `own` into `app` and
  `machine-account` was rejected: the rules that follow are the same, and the
  choice between them is setup cost, which the ADR compares in prose.
  - Alternative: group `identity`, key `agent`. Rejected: `agent.identity`
    sits beside `agent.host` in `AGENTS.md`, where an agent looks.
- **Recommend `maintainer`.** governance's reader keeps a repository alone.
  A GitHub App or a machine account, a token kept apart from the maintainer's
  and a ruleset with a bypass are a large step from one deny line, and a
  recommendation that most readers reject teaches nothing. `own` is named as
  the stronger answer with the two signals that justify it.
- **Maintainer as the only bypass actor, for pull requests only.** One
  required approval blocks the maintainer's own pull requests, since GitHub
  refuses self-approval. Three answers were weighed:
  - the agent's identity approves the maintainer's pull requests: it makes an
    agent's approval a gate, which ADR-0022 rule 4 calls advice;
  - every change goes through an agent session: a rule the maintainer will
    break the first time they fix a typo;
  - the maintainer bypasses, chosen: the agent cannot merge, and the
    maintainer merges without approving, which is ADR-0022's review. The cost,
    stated in the ADR: the bypass also lets the maintainer merge the agent's
    pull request unread, exactly as today.
- **No `check:` line.** Every fact the ADR fixes sits outside tracked files.
  A check on, say, a `CODEOWNERS` file would verify something the ADR does not
  require, and passing it would read as more than it proves.
- **`CODEOWNERS` in Alternatives, not in the Decision.** With the maintainer
  bypassing, a required code owner review is bypassed too; without the bypass,
  the maintainer's own pull requests block. Either way the file adds no
  enforcement for one maintainer.
- **Isolation stated as an outcome, not a mechanism.** The ADR fixes that the
  agent's session reaches the agent's token and not the maintainer's, and
  names ways to get there (a sandbox that denies reading the maintainer's
  credential files, a container, a cloud session), without choosing one.

## Risks / Trade-offs

- [The agent's session can still read the maintainer's `gh` credentials on
  the same machine] → rule 2 makes isolation part of `own`, and the ADR says
  an `own` without it is two identities the agent chooses between.
- [A required approval silently stops Dependabot automerge] → the ADR states
  it, with the workflow change and the repository setting it needs.
- [The bypass lets the maintainer merge unread] → stated as a Negative
  consequence; it is ADR-0022's situation today, not a regression.
- [GitHub's bypass modes or Actions approval behave otherwise than described]
  → task 1.1 checks each sentence against GitHub's documentation and drops
  what it cannot source.

## Migration Plan

ADR-0026 ships `proposed` in the next release. Consumers see it `new` and rule
it. Repositories that leave it unruled, or rule `maintainer`, change nothing.
ADR-0022 keeps `revision: 1`. Rollback: revert the commit.

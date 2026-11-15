# Design

## Context

- ADR-0022 revision 2 asks `review.by` (`maintainer`, `peer`, `agent`) and
  `review.approvals`. The agent never approves. With `peer`, the ruleset
  requires `review.approvals` approvals of the latest push by another account,
  and the agent merges once GitHub accepts it. The bypass list holds
  Dependabot alone under `peer`, which ADR-0018 repeats ("no other actor goes
  there"). ADR-0022's check reads the ruleset's approvals in CI, not its
  bypass list, which needs admin rights. The `review-by-key` change that made
  revision 2 is not yet archived, so this change does not modify ADR-0022's
  requirement; it states the new links in ADR-0026's own requirement.
- GitHub refuses a pull request's author's approval of their own pull
  request. A ruleset bypass actor can be "Always allow" or "For pull requests
  only"; the latter merges a pull request whose rules are not met and cannot
  push to the branch. In a personal repository the eligible actors include
  the repository admin role, GitHub Apps and Dependabot.
- ADR-0015 rules where secrets are stored; the agent's token is one.
- ADR-0017's `agent.host` already lives in the `agent` group. ontrack writes
  each ADR's traits as a separate block of `AGENTS.md`, and
  `adr/.mdschema.yml` lists traits flat, each optional.
- ADR-0020 and ADR-0025 ship without a `check:` line; the README counts only
  ADRs with one.

## Goals / Non-Goals

**Goals:**
- One key that reads on its own in `AGENTS.md`: `agent.identity: own`.
- No second ruleset: `own` reuses ADR-0022's `peer` ruleset and adds one bypass actor.

**Non-Goals:**
- Repositories with several maintainers: `CODEOWNERS`, several required
  approvals, review assignment. The README keeps them in "Not covered".
- Step-by-step setup of a GitHub App or a machine account. The ADR names the
  steps that matter and links GitHub's documentation.
- Hosts other than Claude Code for the isolation advice, as ADR-0022 does.
- Verifying the identity or the bypass list. ADR-0022's check reads the
  ruleset in CI and cannot see its bypass list.

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
- **`own` rules ADR-0022 `peer`.** Once the agent is another account, the
  maintainer's approval is a peer approval, the one review GitHub enforces.
  ADR-0022 already says what follows: the agent never approves, and merges
  once GitHub accepts. `own` with `maintainer` stays possible (attribution
  only) and the ADR says what it leaves to the deny entry.
- **The repository admin role as an extra bypass actor, for pull requests
  only.** Under `peer`, the maintainer's own pull requests wait for an
  approval nobody can give. Three answers were weighed:
  - the agent's identity approves them: ADR-0022 rule 1 forbids the agent to
    approve, under any account;
  - every change goes through an agent session: a rule the maintainer breaks
    the first time they fix a typo;
  - the admin role bypasses, chosen: the maintainer's pull requests merge, the
    agent's still need the approval. The cost, stated in the ADR: the bypass
    also lets the maintainer merge the agent's pull request unapproved.
  ADR-0022 and ADR-0018 name this second actor where they say Dependabot is
  the only one.
- **No `check:` line.** The identity and the token's isolation sit outside
  tracked files, and ADR-0022's check already reads the approvals the ruleset
  requires. A check of its own would verify nothing new.
- **`CODEOWNERS` in Alternatives, not in the Decision.** While the
  maintainer is the only account that approves, requiring a code owner's
  review names the same person the approval already comes from.
- **Isolation stated as an outcome, not a mechanism.** The ADR fixes that the
  agent's session reaches the agent's token and not the maintainer's, and
  names ways to get there (a sandbox that denies reading the maintainer's
  credential files, a container, a cloud session), without choosing one.

## Risks / Trade-offs

- [The agent's session can still read the maintainer's `gh` credentials on
  the same machine] → rule 2 makes isolation part of `own`, and the ADR says
  an `own` without it is two identities the agent chooses between.
- [Three ADRs name the bypass list] → each names both actors, and a spec
  scenario reads them together.
- [The bypass lets the maintainer merge the agent's work unapproved] →
  stated as a Negative consequence; it is the `maintainer` situation, not a
  regression.
- [GitHub's bypass modes behave otherwise than described] → checked against
  GitHub's documentation on 2026-11-15; the ADR links the pages.

## Migration Plan

ADR-0026 ships `proposed` in the next release. Consumers see it `new` and rule
it. Repositories that leave it unruled, or rule `maintainer`, change nothing.
ADR-0022 and ADR-0018 keep their `revision:`. Rollback: revert the commit.

# Proposal

## Why

The agent works with the maintainer's `gh` session or token, so GitHub records
everything it does under the maintainer's name. ADR-0022 (revision 2) states
the cost: an agent's act cannot be told apart afterwards. And a repository
kept by one person can only rule `review.by: maintainer`, where the review is
an unenforced merge and the agent is held back by a deny entry that is not a
security boundary. With an identity of its own, the agent's pull requests have
an author other than the maintainer, so the maintainer's approval becomes the
`peer` review GitHub enforces. No ADR asks the question.

## What Changes

- Add **ADR-0026 "Agent identity"**, a question ADR original to governance,
  written for a repository kept by one person with a coding agent. Its
  question: *under whose GitHub identity does the agent act?* One trait:
  - `agent.identity` (`maintainer`, `own`), recommending `maintainer`. `own`
    is the stronger answer, worth its setup when the history must tell the
    agent from the person, or when the person's review must be an approval
    GitHub enforces.
- Its Decision fixes, when the repository rules `own`:
  1. the agent acts under its own GitHub identity, a GitHub App or a machine
     account with the write role;
  2. its credentials are kept apart from the maintainer's, and its token is
     stored as ADR-0015 says secrets are;
  3. ADR-0022 is ruled `review.by: peer` with `review.approvals: 1`: the
     maintainer approves the agent's latest push, and the agent merges once
     GitHub accepts it;
  4. a `Co-Authored-By` trailer labels a commit and is not an identity.
- The ruleset is ADR-0022's `peer` ruleset, with the repository admin role in
  the bypass list, "For pull requests only", so the maintainer's own pull
  requests merge. The ADR states that the bypass also lets the maintainer
  merge the agent's work unapproved.
- It ships **no check**: the identity and the token's isolation live outside
  tracked files; ADR-0022's check already reads the ruleset's approvals in CI,
  not its bypass list. The ADR says so.
- `CODEOWNERS` stays out: while the maintainer is the only account that
  approves, a required code owner review adds nothing. The ADR names it in
  Alternatives Considered.
- ADR-0022: its Context links ADR-0026; its bypass sentence names the admin
  role under ADR-0026's `own` beside Dependabot; its "One required approval
  for a single maintainer" alternative says ADR-0026 makes it workable.
  ADR-0018's "no other actor goes there" names the same exception. No trait
  changes, so neither `revision:` moves.
- Add the trait to `adr/.mdschema.yml`.
- README: ADR-0026 joins the question list and the Agents row. The counts
  become 26 decisions, 16 of them with a check.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0026 and its trait, and the
  requirement states the links ADR-0022 and ADR-0018 gain.

## Impact

- `adr/ADR-0026-agent-identity.md`: new; consumers see it `new`.
- `adr/ADR-0022-review-and-merge.md`, `adr/ADR-0018-dependencies.md`: a few
  sentences, no trait change, so `revision:` stays (ADR-0001 rule 6).
- `adr/.mdschema.yml`: one trait.
- `README.md`: counts, list, Agents row.
- `checks/`: unchanged.
- governance itself rules ADR-0026 only after a release ships it.

# Proposal

## Why

The agent works with the maintainer's `gh` session or token, so GitHub records
everything it does under the maintainer's name. ADR-0022 states the two costs
and cannot remove them: an agent's merge cannot be told apart afterwards, and
the rule "a person merges" is held only by a deny entry that is not a security
boundary, plus a ruleset that cannot require an approval from a repository's
only maintainer. Giving the agent an identity of its own removes both, and no
ADR asks the question.

## What Changes

- Add **ADR-0026 "Agent identity"**, a question ADR original to governance,
  written, as ADR-0022 is, for a repository kept by one person with a coding
  agent. Its question: *under whose GitHub identity does the agent act?* One
  trait:
  - `agent.identity` (`maintainer`, `own`), recommending `maintainer`. `own`
    is the stronger answer, worth its setup when the history must tell the
    agent from the person, or when the merge rule must be held by GitHub
    rather than by the agent host.
- Its Decision fixes, when the repository rules `own`:
  1. the agent acts under its own GitHub identity, a GitHub App or a machine
     account: its commits, pushes, pull requests and comments are recorded
     under it;
  2. its credentials are kept apart from the maintainer's: the session that
     runs the agent reaches the agent's token and not the maintainer's `gh`
     session or SSH key, and the token is stored as ADR-0015 says secrets are;
  3. on the default branch, the ruleset requires a pull request with one
     approval, and its bypass list holds the maintainer alone, for pull
     requests only. The agent's identity is not a bypass actor and cannot
     approve its own pull request, so it cannot merge; the maintainer merges
     without approving, which ADR-0022 calls the review;
  4. a `Co-Authored-By` trailer labels a commit and is not an identity.
- It states that a required approval stops ADR-0018's automerge unless the
  automerge workflow approves the Dependabot pull request, and says how.
- It ships **no check**: the identity, the token's isolation and the ruleset
  live on GitHub and on the maintainer's machine, not in tracked files. The
  ADR says so.
- `CODEOWNERS` stays out: with the maintainer as bypass actor, a required code
  owner review is bypassed with the rest, and the file only routes review
  requests. The ADR names it in Alternatives Considered.
- ADR-0022: its Context links ADR-0026 where it says an agent's merge cannot be
  told apart; its ruleset paragraph says that with `agent.identity: own`,
  ADR-0026's ruleset replaces it; its "One required approval" alternative says
  ADR-0026 makes it workable. No trait changes, so `revision:` stays `1`.
- Add the trait to `adr/.mdschema.yml`.
- README: ADR-0026 joins the question list and the Agents row. The counts
  become 26 questions, 14 of them with a check. The code review item in "Not
  covered" shrinks to ownership (`CODEOWNERS`) and review among several people.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0026 and its trait; ADR-0022's
  requirement gains the link to ADR-0026.
- `readme`: the "Not covered" item about code review changes.

## Impact

- `adr/ADR-0026-agent-identity.md`: new; consumers see it `new`.
- `adr/ADR-0022-review-and-merge.md`: three sentences, no trait change, so
  `revision:` stays `1` (ADR-0001 rule 6).
- `adr/.mdschema.yml`: one trait.
- `README.md`: counts, list, Agents row, "Not covered".
- `checks/`: unchanged.
- governance itself rules ADR-0026 only after a release ships it.

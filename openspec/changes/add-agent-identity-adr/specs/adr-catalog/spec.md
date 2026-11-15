# Spec Delta

## MODIFIED Requirements

### Requirement: Shipped ADRs
governance SHALL ship exactly these ADRs, each adapted from the named SDR
unless the table says it is original:

| ADR | slug | from | status as shipped |
|---|---|---|---|
| ADR-0001 | record-architecture-decisions | SDR-0001 | accepted |
| ADR-0002 | localization | SDR-0002 | proposed |
| ADR-0003 | architecture | SDR-0003 | proposed |
| ADR-0004 | languages | SDR-0004 | proposed |
| ADR-0005 | validation | SDR-0005 | proposed |
| ADR-0006 | commits | SDR-0006 | proposed |
| ADR-0007 | tests | SDR-0007 | proposed |
| ADR-0008 | documentation | SDR-0008 | proposed |
| ADR-0009 | branching | SDR-0009 | proposed |
| ADR-0010 | architecture-documentation | SDR-0003 (`architecture.document` only) | proposed |
| ADR-0011 | forge-and-ci | SDR-0010 | proposed |
| ADR-0012 | delivery | SDR-0011 | proposed |
| ADR-0013 | frontend | SDR-0013 | proposed |
| ADR-0014 | work-tracking | SDR-0014 | proposed |
| ADR-0015 | secrets | none (original to governance) | proposed |
| ADR-0016 | changes | none (original to governance) | proposed |
| ADR-0017 | agent-tooling | none (original to governance) | proposed |
| ADR-0018 | dependencies | none (original to governance) | proposed |
| ADR-0019 | vulnerabilities | none (original to governance) | proposed |
| ADR-0020 | adding-dependencies | none (original to governance) | proposed |
| ADR-0021 | build-provenance | none (original to governance) | proposed |
| ADR-0022 | review-and-merge | none (original to governance) | proposed |
| ADR-0023 | license | none (original to governance) | proposed |
| ADR-0024 | code-scanning | none (original to governance) | proposed |
| ADR-0025 | tools | none (original to governance) | proposed |
| ADR-0026 | agent-identity | none (original to governance) | proposed |

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-six files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

### Requirement: ADR-0022 asks who merges a pull request
ADR-0022 "Review and merge" SHALL ask who merges a pull request in a
repository kept by one person, through one trait, `review.merge_by`, with the
values `person` and `agent` and the recommended value `person`. It SHALL say
that `agent` is acceptable when the ADR's text gives the reason. When the
repository rules `person`, its Decision SHALL fix four rules:
1. the agent opens the pull request ready for review, says when its checks are green, and stops;
2. the agent merges nothing: not with `gh pr merge`, not with `--auto`, not through the API, not by pushing to the default branch;
3. a bot that a workflow runs under another ADR's ruling is not an agent session, and ADR-0018's automerge is that exception;
4. a review the agent runs on its own work is advice, and the person's merge is the review.

It SHALL describe the GitHub ruleset that backs these rules (pull request
required, zero approvals, no bypass) and SHALL say the check does not
verify it. It SHALL name required approvals and `CODEOWNERS` as outside its
question. It SHALL say that with ADR-0026's `agent.identity: own`, ADR-0026's
ruleset replaces this one, and its Context SHALL link ADR-0026 where it says
an agent's merge cannot be told apart. Its "One required approval"
alternative SHALL say that ADR-0026 makes it workable. It SHALL ship with
`check: npx --no-install governance-check ADR-0022`,
and its how-to-rule block SHALL say that the check denies nothing itself, and
that `gh api` and a push to the default branch pass it. ADR-0018 SHALL state
that its automerge is the exception ADR-0022 allows, and ADR-0019's rule 4
SHALL link to ADR-0022. Neither SHALL change `revision:`.

#### Scenario: One trait
- **WHEN** ADR-0022's frontmatter is read as shipped
- **THEN** it holds `review.merge_by` with an empty value, `status: proposed` and `revision: 1`

#### Scenario: Agent at a green pull request
- **WHEN** an agent reads `review.merge_by: person` and its pull request's checks are green
- **THEN** ADR-0022 tells it to say so and stop, not to merge or enable auto-merge

#### Scenario: Dependabot automerge
- **WHEN** ADR-0018 rules `automerge: patch` and ADR-0022 rules `merge_by: person`
- **THEN** both ADRs say the Dependabot merge is the allowed exception, and neither contradicts the other

#### Scenario: Original to governance
- **WHEN** ADR-0022's References are read
- **THEN** they say it is original to governance and hold the key table

#### Scenario: Agent with its own identity
- **WHEN** ADR-0022 rules `merge_by: person` and ADR-0026 rules `agent.identity: own`
- **THEN** ADR-0022 points to ADR-0026's ruleset, and the two ADRs describe one ruleset, not two

## ADDED Requirements

### Requirement: ADR-0026 asks under whose identity the agent acts
ADR-0026 "Agent identity" SHALL ask, for a repository kept by one person with
a coding agent, under whose GitHub identity the agent acts, through one trait,
`agent.identity`, with the values `maintainer` and `own` and the recommended
value `maintainer`. It SHALL say that `own` is the stronger answer and when it
is worth its setup: when the history must tell the agent from the person, or
when the merge rule must be held by GitHub rather than by the agent host. When
the repository rules `own`, its Decision SHALL fix four rules:
1. the agent acts under its own GitHub identity, a GitHub App or a machine account, and its commits, pushes, pull requests and comments are recorded under it;
2. its credentials are kept apart: the session that runs the agent reaches the agent's token and not the maintainer's `gh` session or SSH key, and the token is stored as ADR-0015 says secrets are;
3. the default branch's ruleset requires a pull request with one approval, and its bypass list holds the maintainer alone, for pull requests only, so the agent cannot merge and the maintainer merges without approving;
4. a `Co-Authored-By` trailer labels a commit and is not an identity.

It SHALL compare a GitHub App and a machine account by what each costs to set
up and to keep. It SHALL state that a required approval stops ADR-0018's
automerge unless the automerge workflow approves the pull request, and how.
It SHALL ship without a `check:` line, and SHALL say that the identity, the
token's isolation and the ruleset are not verified because none of them lives
in a tracked file. Its Alternatives Considered SHALL hold, each with its cost:
`maintainer`; a machine account; a GitHub App; a `Co-Authored-By` trailer
alone; `CODEOWNERS` with a required code owner review.

#### Scenario: One trait
- **WHEN** ADR-0026's frontmatter is read as shipped
- **THEN** it holds `agent.identity` with an empty value, `status: proposed`, `revision: 1` and no `check:` line

#### Scenario: Agent at a green pull request with its own identity
- **WHEN** a repository rules `agent.identity: own` and the agent's pull request is green
- **THEN** ADR-0026 says GitHub refuses the agent's merge, because it is not a bypass actor and cannot approve its own pull request

#### Scenario: The maintainer's own pull request
- **WHEN** the maintainer opens a pull request without the agent, under `agent.identity: own`
- **THEN** ADR-0026 says the maintainer merges it as the bypass actor, and states that this bypass also lets the maintainer merge the agent's pull request without approving it

#### Scenario: Dependabot automerge under a required approval
- **WHEN** ADR-0018 rules `automerge: patch` and ADR-0026 rules `agent.identity: own`
- **THEN** ADR-0026 says the automerge waits for an approval unless its workflow approves the pull request, and names what that requires

#### Scenario: CODEOWNERS left out
- **WHEN** ADR-0026's Alternatives Considered are read
- **THEN** `CODEOWNERS` is there, with the reason it adds no enforcement once the maintainer bypasses the ruleset

#### Scenario: Original to governance
- **WHEN** ADR-0026's References are read
- **THEN** they say it is original to governance and hold the key table

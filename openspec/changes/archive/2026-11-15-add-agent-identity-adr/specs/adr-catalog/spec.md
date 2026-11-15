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

## ADDED Requirements

### Requirement: ADR-0026 asks under whose identity the agent acts
ADR-0026 "Agent identity" SHALL ask, for a repository kept by one person with
a coding agent, under whose GitHub identity the agent acts, through one trait,
`agent.identity`, with the values `maintainer` and `own` and the recommended
value `maintainer`. It SHALL say that `own` is the stronger answer and when it
is worth its setup: when the history must tell the agent from the person, or
when the person's review must be an approval GitHub enforces. When the
repository rules `own`, its Decision SHALL fix four rules:
1. the agent acts under its own GitHub identity, a GitHub App or a machine account with the write role, and its commits, pushes, pull requests and comments are recorded under it;
2. its credentials are kept apart: the session that runs the agent reaches the agent's token and not the maintainer's `gh` session or SSH key, and the token is stored as ADR-0015 says secrets are;
3. ADR-0022 is ruled `review.by: peer` with `review.approvals: 1`: the maintainer's approval of the agent's latest push is the review, and the agent merges once GitHub accepts the merge;
4. a `Co-Authored-By` trailer labels a commit and is not an identity.

It SHALL say that the ruleset is ADR-0022's `peer` ruleset, with the
repository admin role added to its bypass list in the mode "For pull requests
only", so the maintainer's own pull requests merge without an approval nobody
can give, and SHALL state that this bypass also lets the maintainer merge the
agent's pull request unapproved. It SHALL say that `own` with
`review.by: maintainer` records the agent apart but leaves the merge held by
the deny entry alone. It SHALL compare a GitHub App and a machine account by
what each costs to set up and to keep. It SHALL ship without a `check:` line,
and SHALL say that the identity and the token's isolation are not verified,
and that ADR-0022's check reads the ruleset's approvals but not its bypass
list. Its Alternatives Considered SHALL hold, each with its cost:
`maintainer`; the agent approving the maintainer's pull requests; every change
going through the agent; a `Co-Authored-By` trailer alone; `CODEOWNERS` with a
required code owner review.

ADR-0022 SHALL link ADR-0026 where it says an agent's act cannot be told
apart, SHALL name the repository admin role under ADR-0026's `own` beside
Dependabot in its bypass list, and its alternative "One required approval for
a single maintainer" SHALL say that ADR-0026 makes it workable. ADR-0018
SHALL name the same exception where it says no other actor goes in the bypass
list. Neither SHALL change `revision:`.

#### Scenario: One trait
- **WHEN** ADR-0026's frontmatter is read as shipped
- **THEN** it holds `agent.identity` with an empty value, `status: proposed`, `revision: 1` and no `check:` line

#### Scenario: Agent at a green pull request with its own identity
- **WHEN** a repository rules `agent.identity: own` and `review.by: peer`, and the agent's pull request is green but unapproved
- **THEN** ADR-0026 says GitHub refuses the merge until the maintainer approves the latest push, and that the agent merges after

#### Scenario: The maintainer's own pull request
- **WHEN** the maintainer opens a pull request without the agent, under `agent.identity: own`
- **THEN** ADR-0026 says the maintainer merges it as the bypass actor, and states that this bypass also lets the maintainer merge the agent's pull request unapproved

#### Scenario: Bypass list read the same way everywhere
- **WHEN** ADR-0018, ADR-0022 and ADR-0026 are read for who sits in the bypass list under `peer`
- **THEN** all three name Dependabot, and the repository admin role only under `agent.identity: own`

#### Scenario: CODEOWNERS left out
- **WHEN** ADR-0026's Alternatives Considered are read
- **THEN** `CODEOWNERS` is there, with the reason it adds no enforcement while the maintainer is the only account that approves

#### Scenario: Original to governance
- **WHEN** ADR-0026's References are read
- **THEN** they say it is original to governance and hold the key table

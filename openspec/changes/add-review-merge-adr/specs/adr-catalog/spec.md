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

SDR-0000 (service baseline) SHALL NOT be adapted.

#### Scenario: Catalog matches the directory
- **WHEN** the `ADR-*.md` files in `adr/` are listed once all batches are done
- **THEN** they are exactly the twenty-two files in the table, with the slugs shown

#### Scenario: No service baseline
- **WHEN** `adr/` is searched for an ADR adapted from SDR-0000 or mentioning aresis
- **THEN** none is found

## ADDED Requirements

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
question. It SHALL ship with `check: npx --no-install governance-check ADR-0022`,
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

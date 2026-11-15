# Spec Delta

## ADDED Requirements

### Requirement: ADR-0022 asks where the review happens
ADR-0022 "Review and merge" SHALL ask two traits, `review.by` and
`review.approvals`. `review.by` says where the review a person does
happens. Its values are:
- `maintainer`: the merge of the one person who keeps the repository is the review;
- `peer`: the approval of the latest push by an account other than the one that opened the pull request is the review;
- `agent`: no person reviews.

It SHALL recommend `maintainer` and say that `peer` is the answer once
another account can approve. It SHALL say that `agent` is acceptable for a
repository nobody depends on, when the ADR's text gives the reason.

`review.approvals` SHALL hold the number of approvals the default branch's
ruleset requires, as a whole number:
- `0` with `maintainer` and with `agent`, because a maintainer cannot approve their own pull request and the agent never approves;
- `1` or more with `peer`, recommending `1`.

ADR-0022 SHALL say that this number is the repository's own choice, and
that it changes nothing the agent does. Its Context SHALL NOT assume the size of the repository's team. ADR-0022 SHALL
be at revision 2, with a `Revision 2:` entry. That entry SHALL say that
`review.merge_by` and ADR-0011's `forge.review` are replaced by
`review.by` and `review.approvals`, and SHALL give the mapping:
- `forge.review: author` with `merge_by: person` becomes `maintainer` with `approvals: 0`;
- `forge.review: peer` becomes `peer` with the number of approvals the ruleset already requires, at least `1`;
- `merge_by: agent` becomes `agent` with `approvals: 0`.

Its Decision SHALL fix these rules:
1. whatever the value, the agent opens the pull request ready for review, says when its checks are green, and never approves a pull request, its own or another's, under any account;
2. with `maintainer`, the agent merges nothing: not with `gh pr merge`, not with `--auto`, not through the API, not by pushing to the default branch;
3. with `peer`, the agent may merge once GitHub accepts the merge, and never by working around the ruleset;
4. with `agent`, the agent merges once the checks are green;
5. a bot that a workflow runs under another ADR's ruling is not an agent session, and ADR-0018's automerge is that exception;
6. a review the agent runs is advice and never stands in for the person's merge or approval.

It SHALL describe the ruleset on the default branch that each value needs:
- `maintainer`: a pull request is required, with zero approvals;
- `peer`: `review.approvals` approvals, stale approvals dismissed on push, and the most recent push approved;
- `agent`: a pull request is required, with zero approvals.

For every value, the bypass list SHALL be empty, except the Dependabot
bypass ADR-0018 names under `peer`. It SHALL state what `maintainer` leaves
beside each value of ADR-0011's `forge.gate`:
- with `none`, no control but the maintainer's reading;
- with `blocking`, the pipeline and that reading;
- with `informative`, the maintainer alone decides on a red.

It SHALL name `CODEOWNERS` as outside its question. With
`agent.host: claude-code` (ADR-0017), it SHALL show the `.claude/settings.json`
deny entries each value needs. It SHALL keep
`check: npx --no-install governance-check ADR-0022`. Its how-to-rule block
SHALL say:
- what the check reads;
- that the check verifies the ruleset only in CI;
- that the check cannot see the bypass list.

ADR-0018 SHALL state that, with `review.by: peer`, Dependabot is the one
actor in the ruleset's bypass list, so its automerge passes the approval
rule, and that this is the exception ADR-0022 allows. ADR-0018's
`revision` SHALL NOT change.

#### Scenario: Two traits, revision 2
- **WHEN** ADR-0022's frontmatter is read as shipped
- **THEN** its `traits:` block holds exactly `review.by` and `review.approvals`, both with empty values, with `status: proposed` and `revision: 2`

#### Scenario: Approvals follow where the review happens
- **WHEN** ADR-0022's Decision is read
- **THEN** it says `review.approvals` is `0` with `maintainer` and `agent`, and at least `1` with `peer`

#### Scenario: Team asks for two approvals
- **WHEN** a team rules `review.by: peer` and `review.approvals: 2`
- **THEN** ADR-0022's ruleset for `peer` requires two approvals, and the agent's rules are the same as with `1`

#### Scenario: Consumer reads what to re-answer
- **WHEN** `ontrack plan` reports ADR-0022 `revised` from revision 1 to 2
- **THEN** its `Revision 2:` entry names `review.by` as the key to answer and maps the old values to the new ones

#### Scenario: Agent never approves
- **WHEN** an agent in a repository that rules `review.by: peer` is asked to approve a colleague's pull request
- **THEN** ADR-0022's Decision forbids it, whatever account the agent runs under

#### Scenario: Agent at a green pull request, maintainer
- **WHEN** an agent reads `review.by: maintainer` and its pull request's checks are green
- **THEN** ADR-0022 tells it to say so and stop, not to merge or enable auto-merge

#### Scenario: Agent at an approved pull request, peer
- **WHEN** an agent reads `review.by: peer`, its pull request's checks are green and another account approved its latest push
- **THEN** ADR-0022 lets it merge

#### Scenario: Push after approval
- **WHEN** an agent pushes a commit to a pull request that another account approved, in a repository that rules `review.by: peer`
- **THEN** ADR-0022's ruleset dismisses the approval, and the agent may not merge until the new push is approved

#### Scenario: Dependabot under peer
- **WHEN** ADR-0018 rules `automerge: patch` and ADR-0022 rules `review.by: peer`
- **THEN** both ADRs name Dependabot as the one bypass actor, and neither contradicts the other

#### Scenario: Schema accepts the key
- **WHEN** a ruled ADR-0022 holds `review.by: peer`
- **THEN** the schema in `adr/.mdschema.yml` accepts it and refuses any value other than `maintainer`, `peer` or `agent`. A leftover `review.merge_by` is refused by the ADR-0022 check, since the schema tolerates keys it does not list

#### Scenario: Schema types the approvals
- **WHEN** a ruled ADR-0022 holds `review.approvals: two`
- **THEN** the schema in `adr/.mdschema.yml` refuses it, because the value is not a number

#### Scenario: Original to governance
- **WHEN** ADR-0022's References are read
- **THEN** they say it is original to governance and hold the key table

### Requirement: ADR-0011 revision 4 moves review to ADR-0022
ADR-0011 SHALL NOT ask `forge.review`. Removing the key SHALL raise ADR-0011
to revision 4, with a `Revision 4:` entry. That entry SHALL say that
`forge.review` moved to ADR-0022's `review.by`, and that a repository
re-answers it there and deletes it from ADR-0011. ADR-0011 SHALL say in one
sentence that who reviews and who merges a change is ADR-0022's question.
The sentence on who reviews a change proposed elsewhere SHALL remain
unchanged.

#### Scenario: Key gone
- **WHEN** ADR-0011 is read straight from governance
- **THEN** its `traits:` block holds no `forge.review`, and its `revision` is 4

#### Scenario: Consumer reads what to re-answer
- **WHEN** `ontrack plan` reports ADR-0011 `revised` from revision 3 to 4
- **THEN** ADR-0011's `Revision 4:` entry says `forge.review` moved to ADR-0022's `review.by`

## MODIFIED Requirements

### Requirement: ADR-0019 asks what a release contains and what blocks on its vulnerabilities
ADR-0019 SHALL ask `vulnerabilities.sbom` (`cyclonedx`, `spdx`, `none`),
recommending `cyclonedx`, `vulnerabilities.scanner` (a tool name or
`none`), recommending `grype`, and `vulnerabilities.fail_on` (`critical`,
`high`, `medium`, `low`, `none`), recommending `critical`. Its Decision
SHALL fix, whatever the repository rules:
- `fail_on` other than `none` requires `forge.gate: blocking` (ADR-0011);
- the scan runs on every pull request and on a schedule, at least weekly;
- only a vulnerability with a fixed version fails the check;
- an agent never silences a finding by an ignore rule, a lower threshold or
  a removed job; an ignore rule it proposes is approved or merged by a
  person, as ADR-0022's `review.by` says;
- every ignore rule names one vulnerability and gives a reason;
- the SBOM is built by the release job from what is released and published
  with the release.
ADR-0011's stage table SHALL list a `scan` stage conditioned on
`vulnerabilities.scanner`, without a change to ADR-0011's `revision`.
ADR-0019's `revision` SHALL NOT change for the reference to `review.by`.

#### Scenario: Three traits
- **WHEN** the `traits:` block of ADR-0019 is read
- **THEN** it holds exactly `vulnerabilities.sbom`, `vulnerabilities.scanner` and `vulnerabilities.fail_on`

#### Scenario: Blocking scan without a blocking gate
- **WHEN** a repository rules `vulnerabilities.fail_on: critical` while its ADR-0011 rules `forge.gate: informative`
- **THEN** ADR-0019's Decision names that combination as forbidden

#### Scenario: Agent meets a red scan
- **WHEN** an agent's change fails the scan on a vulnerability with no fixed version
- **THEN** ADR-0019's Decision lets it only propose an ignore rule with a reason, for a person to approve or merge as ADR-0022's `review.by` says

#### Scenario: Scan stage exists
- **WHEN** ADR-0011's stage table is read
- **THEN** it has a `scan` row conditioned on `vulnerabilities.scanner` and its `revision` is `1`

#### Scenario: Original to governance
- **WHEN** ADR-0019's References are read
- **THEN** they state that no surdesrails SDR asks this question

## REMOVED Requirements

### Requirement: ADR-0022 asks who merges a pull request
**Reason**: `review.merge_by` assumed a repository kept by one person, and
blocked the agent's merge even after a peer's approval.
**Migration**: replaced by "ADR-0022 asks where the review happens".
`merge_by: person` becomes `review.by: maintainer` (or `peer` in a team),
and `merge_by: agent` becomes `review.by: agent`.

### Requirement: ADR-0011 asks who can accept a change
**Reason**: `forge.review` asked the same question as ADR-0022, in a
second file, with no rule and no check behind it.
**Migration**: re-answer it as ADR-0022's `review.by`:
- `author` becomes `maintainer`;
- `peer` becomes `peer`;
- `agent` (an agent's review stands for a person's) becomes `agent`, because a review the agent runs is advice under ADR-0022.

### Requirement: ADR-0011 states review beside the gate
**Reason**: the text depends on the review key, which leaves ADR-0011.
**Migration**: ADR-0022 states what `maintainer` leaves beside each value
of `forge.gate`, under "ADR-0022 asks where the review happens".

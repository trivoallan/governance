# Spec Delta

## MODIFIED Requirements

### Requirement: ADR-0017 asks which agent host the repository uses
ADR-0017 SHALL ask `agent.hosts`, a list whose values are `claude-code` and
`opencode`, recommending `[claude-code]`. `[]` SHALL say that the repository
declares no agent tooling. ADR-0017 SHALL be at `revision: 2`. Its Revisions
list SHALL say that `agent.host` became `agent.hosts`, and that a repository
re-answers by writing its former value as a one-item list, or `[]` for `none`.

Its Decision SHALL fix, for every repository whose list holds `claude-code`:
- skills arrive as plugins from the repository's own marketplace,
  `marketplace/.claude-plugin/marketplace.json`, named distinctly from any
  upstream marketplace, declared in `.claude/settings.json` through
  `extraKnownMarketplaces` (a `directory` source) and `enabledPlugins`;
- every entry of that marketplace pins its plugin to a full commit SHA in
  `sha`, and no third-party marketplace is enabled directly;
- a skill no marketplace publishes is copied into `.claude/skills/<name>/`
  at a tag, checked against a hash, and reviewed in the pull request,
  including its `allowed-tools`;
- an unpinned source, a `package.json` key and `npx -y` are forbidden;
- skills listed by an OpenSpec schema are installed only on explicit
  request, as ADR-0016 rule 3 says.

Its Decision SHALL fix, for every repository whose list holds `opencode`:
- the project configuration is committed as `opencode.json` at the root,
  and `.opencode/opencode.json` only when the repository needs one;
- every npm entry under `plugins` names an exact version
  (`<package>@<x.y.z>`), and every Git entry a full commit hash; a range, a
  tag or a bare name is forbidden;
- a local plugin under `.opencode/plugins/` is committed and reviewed like
  code;
- a vendored skill goes under `.claude/skills/<name>/` under the same rule
  as for `claude-code`, which opencode also reads, so a repository with
  both hosts keeps one copy;
- skills listed by an OpenSpec schema are installed only on explicit
  request, as ADR-0016 rule 3 says.

ADR-0017 SHALL say that opencode reads `AGENTS.md` and not `CLAUDE.md`, so
the rules ontrack writes reach both hosts. The list of plugins SHALL live in
each host's own files, not in a trait.

ADR-0017 SHALL ship with `check: npx --no-install ontrack-engineering-check ADR-0017`.
Its how-to-rule block SHALL say:
- that the line runs once the ADR is `accepted`;
- which file each host requires (`.claude/settings.json`; `opencode.json` or
  `.opencode/opencode.json`), and that the check reads neither;
- that `[]` has nothing to check;
- that an unknown host and the revision 1 key `agent.host` fail.

#### Scenario: One trait
- **WHEN** the `traits:` block of ADR-0017 is read
- **THEN** it holds only `agent.hosts`, and no `agent.host`

#### Scenario: Pinned entries
- **WHEN** a repository has ruled ADR-0017 `accepted` with `claude-code` in `agent.hosts`
- **THEN** every plugin entry in its `marketplace/.claude-plugin/marketplace.json` has a `sha` of 40 lowercase hexadecimal characters, and every marketplace in `extraKnownMarketplaces` is a `directory` source inside the repository

#### Scenario: Pinned opencode plugins
- **WHEN** a repository has ruled ADR-0017 `accepted` with `opencode` in `agent.hosts`
- **THEN** every string or `package` entry under `plugins` in its `opencode.json` is a local path, a `<package>@<x.y.z>` exact version, or a Git specification ending in a 40-character commit hash

#### Scenario: Re-answering revision 2
- **WHEN** a repository that ruled `agent.host: claude-code` reads ADR-0017's Revisions list
- **THEN** it learns to write `agent.hosts: [claude-code]`

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

It SHALL name `CODEOWNERS` as outside its question. For each host of
ADR-0017's `agent.hosts`, it SHALL show the deny entries each value needs:
- for `claude-code`, the `.claude/settings.json` entries;
- for `opencode`, the `shell` deny rules for `gh pr review *` and, with
  `maintainer`, `gh pr merge *`, placed last in the `permissions` array of
  `opencode.json`, since opencode applies the last rule that matches.

ADR-0022 SHALL be at `revision: 3`. Its `Revision 3:` entry SHALL say that
the denies are required on each host of `agent.hosts`, and that the keys are
unchanged. It SHALL keep
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
- **THEN** its `traits:` block holds exactly `review.by` and `review.approvals`, both with empty values, with `status: proposed` and `revision: 3`

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

#### Scenario: opencode denies shown
- **WHEN** ADR-0022's Decision is read by a repository whose `agent.hosts` holds `opencode`
- **THEN** it shows the `shell` deny rules for `gh pr review *` and `gh pr merge *`, and says that they go last in `permissions`

### Requirement: Wiring ADRs ship their check
ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0018, ADR-0021 and ADR-0024
SHALL
each ship with `check: npx --no-install ontrack-engineering-check <number>`, at their
current `revision`. Each how-to-rule block SHALL say that the line runs once
the ADR is `accepted`, which files the check looks for, that it checks
presence only, and that a value it has no row for passes with "nothing to
check". ADR-0011's SHALL add that the check does not verify the ruleset that
makes the pipeline required, and, from revision 2, that with
`forge.audit: zizmor` the check also runs zizmor on the workflows, so for
that key it checks content, not presence.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0018 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install ontrack-engineering-check ADR-0018` and its `revision` is `1`

#### Scenario: How-to-rule names the files
- **WHEN** ADR-0018's how-to-rule block is read
- **THEN** it names `.github/dependabot.yml` for `dependabot` and says that `none` has nothing to check

#### Scenario: Gate ceiling stated
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it says the ruleset is not verified

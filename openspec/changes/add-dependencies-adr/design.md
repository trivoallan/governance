# Design

## Context

`main` holds ADR-0001 to ADR-0017 and the schema `adr/.mdschema.yml`.
ADR-0011 fixes GitHub as the forge, the `forge.gate` key and rule 3 (actions
pinned by SHA); its Negative consequences already name Dependabot as the way
out of the update chore. See proposal.md for why.

Facts this design relies on, from GitHub's and Renovate's documentation as
the maintainer knows them on 2026-11-14 (task 1.1 re-checks each before
writing):

- Dependabot version updates are configured in `.github/dependabot.yml`
  (`version: 2`, one `updates:` entry per `package-ecosystem` and
  `directory`), with `groups` and `cooldown` (`default-days`,
  `semver-major-days`…).
- Dependabot updates an action already pinned by SHA and its version
  comment, but does not convert a tag into a SHA.
- Dependabot merges nothing. GitHub's documented pattern is a workflow on
  `pull_request`, guarded by
  `github.event.pull_request.user.login == 'dependabot[bot]'`, reading
  `dependabot/fetch-metadata`'s `update-type` and running
  `gh pr merge --auto` (the doc's example uses `--merge`; ADR-0018 defers
  the method to ADR-0009). Workflows triggered by Dependabot get a
  read-only `GITHUB_TOKEN` unless `permissions:` grants more, and see
  Dependabot secrets, not Actions secrets. `--auto` needs "Allow
  auto-merge" enabled and waits for the required checks.
- Renovate runs as the Mend GitHub App (or self-hosted), configured in
  `renovate.json`; `automerge` per `packageRules`, `minimumReleaseAge`,
  `helpers:pinGitHubActionDigests` (converts tags to SHAs), regex managers,
  and a Dependency Dashboard issue.

## Goals / Non-Goals

**Goals:**
- One answer to "may I merge this bot pull request?" that an agent reads
  without interpreting.
- Tie automerge to ADR-0011's gate so the two ADRs cannot contradict each
  other.

**Non-Goals:**
- Security alerts (Dependabot alerts, `npm audit`): they report, they do
  not keep dependencies current.
- Notifying a consuming repository of a new governance `revision`: the user
  scoped the ADR to a repository's own dependencies.
- Shipping a `dependabot.yml` or `renovate.json` template: governance ships
  questions, not configuration.

## Decisions

### The tool is a value; the question is who merges

"Renovate or Dependabot" as a question would date as soon as either tool
moves. As with ADR-0015, where `gitleaks` is a value of `secrets.guard`,
the tool is the value of `dependencies.updater`, and the question that
matters to an agent, merging, gets its own key. Alternative: a single
`dependencies.policy` enum mixing tool and level. Not chosen: it multiplies
values (`dependabot-patch`, `renovate-minor`…) for two independent choices.

### `dependabot` recommended over `renovate`

GitHub is the only forge, so Renovate's multi-forge reach is moot, and
Dependabot is built in: no third-party app holds write access to the
repository, a posture ADR-0011 and ADR-0015 already take. Renovate's real
advantages (native automerge, pinning tags to SHAs, regex managers, the
dashboard) are stated in Alternatives Considered, with pinning as the
strongest: under Dependabot, rule 3 stays a review check.

### A separate ADR, not a key in ADR-0011

Each ADR asks one question. ADR-0011 asks what a red pipeline prevents;
this ADR depends on that answer but asks something else. ADR-0011 only
gains a link where it already names Dependabot, which is wording: no
`revision` change.

### Fixed rules rather than more keys

The cooldown, the exclusion of GitHub Actions from automerge and the human
review of majors are the same for every repository: a repository that wants
otherwise departs in its own ADR, as ADR-0011 already allows. The user
confirmed that actions are excluded at every level, not only from `minor`;
making it a fixed rule keeps `dependencies.automerge` a single level for
every ecosystem.

### `dependencies.updater` as an enum

`[dependabot, renovate, none]`, unlike `secrets.guard`'s free string: the
GitHub-only scope leaves no third tool worth naming, and an enum lets the
schema refuse a typo. `none` means nothing proposes updates, not "not
decided".

## Risks / Trade-offs

- [The automerge workflow is code with write permissions on every
  repository that rules `patch`] → it obeys ADR-0011's five rules, which
  ADR-0018 says; the ADR shows its shape in prose, not a file to copy.
- [A patch release can still break or be malicious] → the cooldown and the
  required checks; ADR-0018 states that neither proves the code is safe.
- [Excluding actions from automerge keeps their updates a manual chore] →
  accepted: they run with the pipeline's rights.
- [Dependabot facts drift] → task 1.1 re-checks them before writing; the
  ADR names features, not versions.

## Migration Plan

One pull request: ADR-0018, the schema lines, the ADR-0011 link, and this
change. Consumers see ADR-0018 `new` in `ontrack plan`. Rollback: revert
the pull request.

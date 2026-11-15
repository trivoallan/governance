# Spec Delta

## MODIFIED Requirements

### Requirement: Adapted traits
The remaining ADRs SHALL adapt their SDR's traits as follows:
- ADR-0003 SHALL ask `architecture.pattern` only, recommending `hexagonal`.
- ADR-0010 SHALL ask `architecture.document` (`arc42`, `elsewhere`, `none`),
  recommending `arc42` as a `docs/architecture/arc42/` directory with one
  file per section, and `architecture.model` (a named architecture-as-code
  tool or `none`), recommending `likec4` in `docs/architecture/model/`, and
  `architecture.diagrams` (`mermaid`, `plantuml`, `none`) for diagrams the
  model does not cover, recommending `mermaid`. It SHALL NOT point to a template, since governance ships none.
- ADR-0004 SHALL ask `languages.main.name`, recommending Python or
  TypeScript, without reasoning that relies on a team's existing skills.
- ADR-0008 SHALL ask `docs.tool`, `docs.root` and `docs.audience`,
  recommending `starlight` (with its `docs` collection pointed at `docs/`)
  and `public`, with a `docs.tool` enum of `starlight`, `docusaurus`,
  `mkdocs` and `none`, and an
  `audience` enum of `single-user`, `team` and `public`: SDR-0008's
  scale translated, without the enterprise-only steps `LS` and `groupe`.
- ADR-0011 SHALL assume GitHub as the forge, SHALL NOT ask `forge.vendor`,
  and SHALL ask `forge.gate` and, from revision 2, `forge.audit`.
- ADR-0012 SHALL ask `delivery.target` (`container`, `platform`, `package`,
  `none`) in place of SDR-0011's `hosting.offer`, plus `delivery.environments`,
  `delivery.release_tool` (recommended `release-please`), `delivery.registry`
  and `deployment.manifests`.
- ADR-0013 SHALL ask `frontend.framework` as a free string, recommending
  `astro`, with no WCS theme trait.
- ADR-0014 SHALL ask `tracking.tool` (`github-issues`, `linear`, `jira`,
  `none`), recommending `github-issues`, and `tracking.project`, not a Jira
  project key, and SHALL place its `Issue served` line in the first
  artefact of a change as ADR-0016 defines it.
- ADR-0016 SHALL ask `changes.framework` (`openspec`, `none`), recommending
  `openspec`, and `changes.schema` (a name `openspec schema validate`
  accepts, or `none`), recommending `spec-driven-with-adr` copied and
  adjusted so that its ADRs follow ADR-0001.

#### Scenario: Architecture split in two
- **WHEN** the `traits:` blocks of ADR-0003 and ADR-0010 are read
- **THEN** ADR-0003 has only `architecture.pattern` and ADR-0010 has `architecture.document`, `architecture.model` and `architecture.diagrams`

#### Scenario: No enterprise vocabulary
- **WHEN** the shipped ADRs are searched for `gitlab`, `aresis`, `wcs`, `caas` or `paas` as trait keys or enum values
- **THEN** none is found

#### Scenario: GitHub assumed
- **WHEN** the `traits:` block of ADR-0011 is read
- **THEN** it contains `forge.gate` and `forge.audit`, and no `forge.vendor`

### Requirement: Wiring ADRs ship their check
ADR-0008, ADR-0010, ADR-0011, ADR-0012, ADR-0017, ADR-0018 and ADR-0021 SHALL
each ship with `check: npx --no-install governance-check <number>`, at their
current `revision`. Each how-to-rule block SHALL say that the line runs once
the ADR is `accepted`, which files the check looks for, that it checks
presence only, and that a value it has no row for passes with "nothing to
check". ADR-0011's SHALL add that the check does not verify the ruleset that
makes the pipeline required, and, from revision 2, that with
`forge.audit: zizmor` the check also runs zizmor on the workflows, so for
that key it checks content, not presence.

#### Scenario: Check line without a revision bump
- **WHEN** ADR-0018 is read straight from governance after this change
- **THEN** it holds `check: npx --no-install governance-check ADR-0018` and its `revision` is `1`

#### Scenario: How-to-rule names the files
- **WHEN** ADR-0018's how-to-rule block is read
- **THEN** it names `.github/dependabot.yml` for `dependabot` and says that `none` has nothing to check

#### Scenario: Gate ceiling stated
- **WHEN** ADR-0011's how-to-rule block is read
- **THEN** it says the ruleset is not verified

## ADDED Requirements

### Requirement: ADR-0011 revision 2 audits the workflows
ADR-0011 SHALL move to `revision: 2` and SHALL add one key, `forge.audit`,
with `zizmor` recommended and `none` accepted. Its Revisions list SHALL say
that revision 2 adds `forge.audit` and that only that key needs answering.
With `forge.audit: zizmor`, its Decision SHALL fix:
1. a workflow job runs zizmor on pull requests, through `zizmorcore/zizmor-action` pinned by SHA (rule 3), with its online audits using the job's `GITHUB_TOKEN`;
2. a finding is silenced only by an inline `# zizmor: ignore[<audit>]` comment that gives its reason; the agent proposes it, a person merges it (ADR-0019 rule 4, ADR-0022). A `zizmor.yml` that loosens a policy is not a way to silence;
3. every action is pinned by hash, including GitHub's own (`actions/*`), whatever zizmor's default policy allows.

Its stage table SHALL gain an `audit` stage that exists when `forge.audit` is
not `none`. The section on what the tools do not catch SHALL list, for
zizmor, which of rules 1 to 5 it covers and which stay with review (rule 1
and rule 4). The Consequences SHALL no longer say that no tool enforces rules
3 to 5.

#### Scenario: Revision 2
- **WHEN** ADR-0011 is read straight from governance after this change
- **THEN** it holds `revision: 2`, an empty `forge.audit`, and a Revisions line naming `forge.audit` as the key to answer

#### Scenario: An agent meets a finding
- **WHEN** zizmor reports `template-injection` on a workflow an agent wrote
- **THEN** ADR-0011 tells the agent to fix the step, or to propose an inline ignore with its reason for a person to merge, not to add the ignore and merge it

#### Scenario: Rules still left to review
- **WHEN** the section on what the tools do not catch is read
- **THEN** it names rule 1 (deploy only from the default branch) and rule 4 (no secret in a log) as not covered by zizmor

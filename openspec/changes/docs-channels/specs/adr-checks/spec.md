# Spec Delta

## ADDED Requirements

### Requirement: ADR-0008 check reads the channels
`governance-check ADR-0008` SHALL keep its `docs.tool` and `docs.root`
rows, and SHALL also read `docs.channels`. One run SHALL report every key
at fault.
- When `docs.tool` is `none` and `docs.channels` is absent, it SHALL print `ADR-0008: docs.tool is none, no channels to check`.
- When `docs.tool` is `none` and `docs.channels` is present, it SHALL fail and say to remove `docs.channels`.
- When `docs.tool` is not `none` and `docs.channels` is absent or an empty list, it SHALL fail and say that `docs.channels` is not set.
- When `docs.channels` is not a list, holds a value other than `release` or `main`, or holds a value twice, it SHALL fail and name the value.

When the channels are valid and `docs.tool` is not `none`, it SHALL look
for the tracked workflows that hold `actions/deploy-pages`:
- When there is none, it SHALL print that no workflow deploys GitHub Pages, so the triggers are not checked, and SHALL NOT fail.
- Otherwise it SHALL pass when one of those workflows has every trigger the channels need, and name it. With `release`, that is a push of tags. With `main`, it is a push to the default branch.
- When none of those workflows has them, it SHALL fail and name the missing trigger.

The default branch SHALL be the branch `origin/HEAD` points to, or `main`
when `origin/HEAD` is not set. A `push` trigger with neither a `branches`
nor a `tags` filter SHALL count for both channels. As on GitHub, a `push`
filtered by `tags` alone SHALL NOT count as a push to the default branch,
and one filtered by `branches` alone SHALL NOT count as a push of tags.
The check SHALL read the files only, and SHALL NOT call the network.

#### Scenario: Unfiltered push
- **WHEN** ADR-0008 has `docs.channels: [release, main]` and the workflow holding `actions/deploy-pages` runs `on: push`
- **THEN** the `docs.channels` line passes

#### Scenario: ontrack today
- **WHEN** ADR-0008 has `docs.tool: starlight` and `docs.channels: [release, main]`, and the only workflow holding `actions/deploy-pages` runs on `push: branches: [main]` and `pull_request`
- **THEN** the check exits non-zero and says the workflow is not triggered by a push of tags

#### Scenario: Both triggers
- **WHEN** ADR-0008 has `docs.channels: [release, main]`, and the workflow holding `actions/deploy-pages` runs on `push` with `branches: [main]` and `tags: ['v*']`
- **THEN** the `docs.channels` line passes and names that workflow

#### Scenario: Main only
- **WHEN** ADR-0008 has `docs.channels: [main]` and the workflow holding `actions/deploy-pages` runs on `push: branches: [main]`
- **THEN** the `docs.channels` line passes

#### Scenario: Another host deploys the site
- **WHEN** ADR-0008 has `docs.tool: starlight` and `docs.channels: [release, main]`, and no tracked workflow holds `actions/deploy-pages`
- **THEN** the output says no workflow deploys GitHub Pages and the triggers are not checked, and that line does not fail

#### Scenario: Channels without a site
- **WHEN** ADR-0008 has `docs.tool: none` and `docs.channels: [main]`
- **THEN** the check exits non-zero and says to remove `docs.channels`

#### Scenario: Site without channels
- **WHEN** ADR-0008 has `docs.tool: starlight` and no `docs.channels`
- **THEN** the check exits non-zero and says `docs.channels` is not set

#### Scenario: Unknown channel
- **WHEN** ADR-0008 has `docs.channels: [release, beta]`
- **THEN** the check exits non-zero and names `beta`

#### Scenario: Default branch not main
- **WHEN** `origin/HEAD` points to `trunk`, ADR-0008 has `docs.channels: [main]`, and the workflow holding `actions/deploy-pages` runs on `push: branches: [trunk]`
- **THEN** the `docs.channels` line passes

# Proposal

## Why

ADR-0011 rule 3 pins every action by commit SHA, and its Negative
consequences admit the cost: updates become "a deliberate chore, unless a
tool such as Dependabot proposes them". No ADR says which tool, and above
all none says **which of its pull requests may merge without a human**. An
agent facing a bot's pull request either leaves it open forever or merges
what nobody checked.

## What Changes

- Add **ADR-0018 "Dependencies"**, a question ADR original to governance
  (no surdesrails SDR asks it). Its question: *what keeps dependencies
  current, and what merges without a human?* Two traits:
  - `dependencies.updater` (`dependabot`, `renovate`, `none`),
    recommending `dependabot`: GitHub is the only forge (ADR-0011), so
    Renovate's multi-forge reach buys nothing, and Dependabot needs no
    third-party app with write access.
  - `dependencies.automerge` (`none`, `patch`, `minor`), recommending
    `patch`.
- Its Decision fixes, whatever the repository rules:
  1. **No automerge without `forge.gate: blocking`.** Automerge relies on a
     required check; with `informative` or `none` it merges untested code.
  2. **A cooldown before any update is proposed** (Dependabot `cooldown`,
     Renovate `minimumReleaseAge`), at least three days: it is the only
     defence an automerged update has against a compromised release.
  3. **GitHub Actions are never automerged**, whatever the level: a new SHA
     runs with the pipeline's rights, and its version number says nothing
     about what changed.
  4. **Majors are always reviewed by a person.**
  5. **The ecosystems watched follow from tracked files**, as ADR-0011's
     stage table does: a `package.json` adds `npm`, `.github/workflows/`
     adds `github-actions`. An ecosystem no file justifies is invented.
- It states the cost Dependabot hides: it does not merge by itself. The
  automerge workflow (`dependabot/fetch-metadata`, then
  `gh pr merge --auto`) is a workflow like any other and obeys ADR-0011
  (SHA pin, explicit `permissions:`, `pull_request` and not
  `pull_request_target`), and "Allow auto-merge" is a repository setting.
- In ADR-0011's Negative consequences, "a tool such as Dependabot" points
  to ADR-0018. Wording only: ADR-0011's `revision` does not change.
- Add the two traits to `adr/.mdschema.yml`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0018 and its two traits.

## Impact

- `adr/ADR-0018-dependencies.md`: new. Consumers see it `new` in
  `ontrack plan`.
- `adr/ADR-0011-forge-and-ci.md`: one link in Consequences, no revision
  change.
- `adr/.mdschema.yml`: two traits added.
- governance itself has no `package.json` dependency and no workflow, so it
  does not rule ADR-0018 here; the ADR ships `proposed`.

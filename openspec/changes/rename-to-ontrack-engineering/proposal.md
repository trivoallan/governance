# Proposal

## Why

The README opens on the mechanism ("Opinionated ADRs you import…") and
calls the package by a name, `@trivoallan/ontrack-governance`, broader
than what it holds. The developer it is shown to (a solo developer with
several repositories and a coding agent) copies conventions from one
repository to the next; the first screen should name that problem.
"Governance" means organisation-level policy in the wider field, and the
package holds engineering decisions for a repository.

## What Changes

- The package is published as `@trivoallan/ontrack-engineering`, the README
  title. The repository, its `governance-check` command and the ontrack
  namespace `trivoallan` keep their names.
- The README opens with "Stop copying your conventions from repo to repo.",
  then the scope and counts, then what an ontrack track is. The author no
  longer speaks in the first person in the pitch.
- The domain table lists its rows in alphabetical order.
- The install command becomes
  `npm i -D trivoallan@npm:@trivoallan/ontrack-engineering`.
- ADR-0012's ruling names the new package and why it was renamed;
  ADR-0021 names it.
- `@trivoallan/ontrack-governance` is deprecated on npm, pointing to the new
  name, once the new name has a version.

## Capabilities

### Modified Capabilities

- `readme`: the pitch, the table order and the install command.

## Impact

- Edited: `README.md`, `package.json` (`name`), `package-lock.json`,
  `.github/workflows/release.yml` (a comment), `checks/readme.test.ts` (the
  count it reads), `docs/adr/trivoallan/ADR-0012-delivery.md`,
  `docs/adr/trivoallan/ADR-0021-build-provenance.md`.
- The `trivoallan` devDependency, this repository importing itself, stays on
  `@trivoallan/ontrack-governance` until the new name has a version older
  than the three-day cooldown (ADR-0020).
- Consumers (tambouille) change their alias to the new name; the old one
  keeps working, deprecated, at its last version.

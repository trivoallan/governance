# Proposal

## Why

A consumer that installs a package trusts that what it downloads was built
from the source it can read. Nothing in the catalog asks a repository to
prove it. ADR-0012 decides how a version is made (`delivery.release_tool`)
but not whether anyone can tell, afterwards, which workflow and which commit
produced the published artifact. An agent setting up a release has no
answer to "do I attach a provenance, and of what strength?".

## What Changes

- Add **ADR-0021 "Build provenance"**, a question ADR original to governance
  (no surdesrails SDR asks it). Its question: *what proves where a published
  artifact was built?* One trait:
  - `supply_chain.build_level` (`0`, `1`, `2`, `3`), the SLSA v1.x Build
    track level the repository's published artifacts reach, recommending
    **`2`**: a provenance signed by the hosted build platform, through
    `actions/attest-build-provenance`, `npm publish --provenance`, or PyPI
    Trusted Publishing with PEP 740 attestations for Python. On
    GitHub-hosted runners this costs a few workflow lines and no key to
    manage.
- Its Decision fixes, whatever the repository rules:
  1. **The key applies only to a repository that publishes.** It is ruled
     only when ADR-0012's `delivery.release_tool` is neither `manual` nor
     `none`, the condition ADR-0011's stage table uses for `release`. A
     repository that publishes nothing produces no provenance and rules
     ADR-0021 `rejected`.
  2. **An unverified provenance proves nothing.** The ADR points to the
     consumer side (`npm audit signatures`, `gh attestation verify`) and to
     ADR-0020's admission rule, which reports it when a dependency is
     added.
  3. **The provenance is produced by the workflow that publishes**, under
     ADR-0011's rules (SHA pins, explicit `permissions:` limited to
     `id-token: write` and `attestations: write` or the registry's
     equivalent), never by hand on a workstation.
- L3 (an isolated builder such as `slsa-github-generator`, or a reusable
  workflow that separates the build from the caller) appears under
  Alternatives Considered, with its cost.
- Add the trait to `adr/.mdschema.yml`.

governance applies its own recommendation once it is published to npm, a
separate change the user already decided: today it installs from a git URL,
which carries no provenance (L0), so it cannot rule `2` yet and ships
ADR-0021 `proposed`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0021 and its trait.

## Impact

- `adr/ADR-0021-build-provenance.md`: new. Consumers see it `new` in
  `ontrack plan`.
- `adr/.mdschema.yml`: one trait added.
- Depends on `add-adding-dependencies-adr` (ADR-0020, trivoallan/governance#17) landing first: the
  catalog table counts it, and ADR-0021 links to its admission rule.

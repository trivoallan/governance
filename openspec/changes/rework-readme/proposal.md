# Proposal

## Why

The README is meant to be a public showcase, but it serves two readers at
once. Its first half tells a visitor what governance asks. Its second half,
on plugins, the gitleaks hook and `core.hooksPath`, is for a contributor. It
also restates ontrack's lifecycle (statuses, `revision`, `ontrack check`) and
installs ontrack unpinned, when ontrack's own documentation is the source of
truth. It never says what a visitor gains, and its Check column is wrong: it
marks ADR-0001 as checked, yet only eleven ADRs carry a `check:` line in
their frontmatter.

## What Changes

- Rewrite `README.md` as a showcase, in the first person, with no mention of
  surdesrails:
  - a two-line pitch that limits the scope to Python or TypeScript
    repositories on GitHub and counts eleven checks;
  - a table grouped by domain (Workflow, Delivery, Supply chain,
    Architecture, Code, Decisions & docs, Agents) that says, per domain,
    what you gain and what `governance-check` verifies, with every verified
    claim matching `checks/governance-check.ts`;
  - a link to each of the 21 ADRs;
  - a "Not covered" section listing what governance decides nothing about,
    each item taken from an ADR's own exclusion or from the absence of any
    ADR on it;
  - a short, language-neutral excerpt of one ADR;
  - an install section that keeps only governance's own command and
    `npm audit signatures`, and links to ontrack's documentation for
    everything else;
  - a "See it in use" paragraph pointing at ontrack, which imports this
    source;
  - a link to `CONTRIBUTING.md`.
- Add `CONTRIBUTING.md`, carrying the current "Work on it" and "Secret
  guard" sections unchanged in substance.
- Add npm `keywords` to `package.json` next to `ontrack-source`.
- Add a C4 reference to ADR-0010's References. This is a link, so its
  `revision` stays the same (ADR-0001, rule 6).
- Add a test that fails when the README's check count or its ADR links
  drift from `adr/`.

## Capabilities

### New Capabilities

- `readme`: what the README and CONTRIBUTING.md say, the facts they must
  agree with, and the test that holds them to those facts.

### Modified Capabilities

None. ADR-0010 gains a reference link only, which no `adr-catalog`
requirement covers.

## Impact

- `README.md` (rewritten), `CONTRIBUTING.md` (new), `package.json`
  (`keywords`), `adr/ADR-0010-architecture-documentation.md` (one
  References line), and a new `checks/readme.test.ts`.
- No change to `governance-check`, to any ADR's traits or `revision`, or to
  the published package's behaviour. `README.md` ships on npm, so the npm
  page changes with the next release.
- Out of scope: shipping CI/CD workflow templates, and writing new ADRs for
  what "Not covered" lists.

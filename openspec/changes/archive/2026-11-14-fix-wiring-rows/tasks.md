# Tasks

## 1. Rows

- [x] 1.1 In `checks/governance-check.mjs`, let the pattern helper turn `**/` anywhere into "any folders, or none"; change the ADR-0008 rows to `**/package.json`, `**/docusaurus.config.*` and `**/mkdocs.yml`, and the arc42 row to `<root>architecture/arc42/<NN>-*.md` or `.mdx`; verify in `checks/governance-check.test.mjs` the "arc42 sections in mdx", "Starlight site in a subfolder" and updated "arc42 under another root" scenarios, and that `npm test` passes
- [x] 1.2 In ADR-0008 and ADR-0010, update the how-to-rule notes to the new rows; keep each `revision`; verify with `git diff` that only the note lines change

## 2. Real repository

- [x] 2.1 Run this branch's `checks/governance-check.mjs` for ADR-0008 and ADR-0010 from a clone of ontrack's `main`; verify both exit `0` and name `site/package.json` and `docs/architecture/arc42/` files
- [x] 2.2 Run `openspec validate fix-wiring-rows --strict`; verify it passes

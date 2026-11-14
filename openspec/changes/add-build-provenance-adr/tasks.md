# Tasks

Every ADR edit below is written with `/pm-skills:develop-adr`, keeping the
Nygard sections and frontmatter of the `adr-format` spec.

## 1. Facts and schema

- [x] 1.1 Re-check each fact in design.md's Context against the SLSA v1.1 levels page, GitHub's artifact attestations documentation, npm's provenance documentation and PyPI's attestations documentation; verify each sentence ADR-0021 will state has a source, and drop or correct any that does not
- [x] 1.2 Add `traits.supply_chain.build_level` (enum `0`, `1`, `2`, `3` as integers), optional, under an `# ADR-0021` comment in `adr/.mdschema.yml`; verify a ruled sample with `build_level: 2` (quoted and unquoted) passes or is named as `npx @jackchuka/mdschema@0.15.1 check '*.md'` reports, and fix the ADR's example accordingly

## 2. ADR-0021

- [x] 2.1 Write `adr/ADR-0021-build-provenance.md` as a question ADR (`proposed`, `revision: 1`, trait empty, recommendation `2`, how-to-rule block, key table in References) with the three fixed rules, one L2 workflow example under ADR-0011's rules, and "Original to governance" in References; verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 2.2 Write its Alternatives Considered: `0`, `1`, `3` (isolated builder, `slsa-github-generator` or a reusable workflow, and its cost); verify each states its cost
- [x] 2.3 Add a `Suggested skills` line only if a plugin for SLSA provenance or artifact attestations can be confirmed in a marketplace; leave it out otherwise

## 3. Catalog

- [x] 3.1 Rebase on `main` once ADR-0020 is merged; verify ADR-0021's link to ADR-0020 resolves and `adr/` holds twenty-one `ADR-*.md` files
- [x] 3.2 Check in a scratch consumer: install `main` and this branch in turn and run `npx ontrack plan`; verify ADR-0021 is reported `new`
- [x] 3.3 Run `openspec validate add-build-provenance-adr --strict`; verify it passes

## 4. Delivery

- [ ] 4.1 Commit, push and open the pull request; verify its diff holds ADR-0021, the schema lines and this change, and nothing else

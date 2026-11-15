# Tasks

## 1. Facts and schema

- [ ] 1.1 Confirm against official documentation: `mise` and `aqua` checksum and lockfile support, their install scripts' integrity, whether Dependabot or Renovate read their files, and the asdf plugin claim; verify each sentence ADR-0023 will state has a source, and drop any that does not
- [ ] 1.2 Add `traits.tools.manager` (enum `mise`, `aqua`, `script`, `none`, optional) under an `# ADR-0023` comment in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty value fails

## 2. ADR-0023

- [ ] 2.1 Write `adr/ADR-0023-tools.md` as a question ADR: `proposed`, `revision: 1`, one empty trait, the four fixed rules, a how-to-rule block, the key table in References, and "Original to governance"; verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [ ] 2.2 Write its Alternatives Considered (`script` for one tool, `mise`, `aqua`, asdf, `none`), each with its cost, and the update question with what keeps pins current; verify each states its cost

## 3. Catalog

- [ ] 3.1 Run `openspec validate add-tools-adr --strict`; verify it passes
- [ ] 3.2 Open the pull request; verify its diff holds ADR-0023, the schema line and this change, and nothing else

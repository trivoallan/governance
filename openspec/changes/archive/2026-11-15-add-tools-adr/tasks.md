# Tasks

## 1. Facts and schema

- [x] 1.1 Confirm against official documentation: `mise` and `aqua` checksum and lockfile support, their install scripts' integrity, whether Dependabot or Renovate read their files, and the asdf plugin claim; verify each sentence ADR-0025 will state has a source, and drop any that does not
- [x] 1.2 Add `traits.tools.manager` (enum `mise`, `aqua`, `script`, `none`, optional) under an `# ADR-0025` comment in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty value fails

## 2. ADR-0025

- [x] 2.1 Write `adr/ADR-0025-tools.md` as a question ADR: `proposed`, `revision: 1`, one empty trait, the four fixed rules, a how-to-rule block, the key table in References, and "Original to governance"; verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 2.2 Write its Alternatives Considered (`script` for one tool, `mise`, `aqua`, asdf, `none`), each with its cost, and the update question with what keeps pins current; verify each states its cost

## 3. Catalog

- [x] 3.1 Run `openspec validate add-tools-adr --strict`; verify it passes
- [x] 3.2 Open the pull request; verify its diff holds ADR-0025, the schema line, its README entry and this change, and nothing else

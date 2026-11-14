# Tasks

Every ADR edit below is written with `/pm-skills:develop-adr`, keeping the
Nygard sections and frontmatter of the `adr-format` spec.

## 1. Facts and schema

- [x] 1.1 Confirm each npm and pnpm fact in design.md's Context against official documentation (npm 12 `allowScripts`, `approve-scripts`, `strict-allow-scripts`, `ignore-scripts` precedence, `min-release-age`, `npm audit signatures`, pnpm `allowBuilds` and `minimumReleaseAge`), replacing the secondary sources in design.md's Sources; verify each sentence ADR-0020 will state has a source, and drop or correct any that does not
- [x] 1.2 Confirm the Python facts against uv's and pip's official documentation (`no-build`, `no-build-package`, the `pyproject.toml` form of a per-package override of `:all:`, `exclude-newer` relative durations and the uv version that added them, `exclude-newer-package`, `uv sync --locked`, `--uploaded-prior-to` and its relative form, `--require-hashes`, the experimental status of `pylock.toml`, the absence of install-time PEP 740 verification); verify each Python cell of the ADR's tables has a source, and leave a cell out rather than guess
- [x] 1.3 Add `traits.admission.approver` (enum `person`, `agent`) and `traits.admission.install_scripts` (enum `ignored`, `allowed`), both optional, under an `# ADR-0020` comment in `adr/.mdschema.yml`; verify a ruled sample with both set passes and one with an empty `approver` is named by `npx @jackchuka/mdschema@0.15.1 check '*.md'`

## 2. ADR-0020

- [x] 2.1 Write `adr/ADR-0020-adding-dependencies.md` as a question ADR (`proposed`, `revision: 1`, both traits empty, recommendations `person` and `ignored`, how-to-rule block, key table in References) with the five fixed rules, the "ask before installing, not at review" reasoning, and "Original to governance" in References; verify the schema fails it only on `status`, `date`, the empty traits and the marker sentence
- [x] 2.2 Give each fixed rule and `admission.install_scripts` an npm column and a Python column (uv first, pip where it differs), state that a wheel runs no install code and an sdist does, and add the import-name trap to rule 1 with `yaml`/`PyYAML` and `sklearn`/`scikit-learn`; verify every cell traces to a source from 1.1 or 1.2 and that Go, Rust and Ruby are left to the principle
- [x] 2.3 Write its Alternatives Considered: `agent` (legitimate with `ignored` and the fixed rules), `allowed`, an allowlist or denylist of packages, required provenance, npm only with "the ecosystem's equivalent" for Python; verify each states its cost
- [x] 2.4 Add a `Suggested skills` line only if a plugin for dependency vetting can be confirmed in a marketplace; verify by `claude plugin marketplace list` or the marketplace repository, and leave the line out otherwise

## 3. ADR-0018 and catalog

- [x] 3.1 In ADR-0018's "Not concerned" paragraph, add that adding a new dependency is ADR-0020's question; verify `git diff adr/ADR-0018-dependencies.md` changes that paragraph only and `revision:` stays `1`
- [x] 3.2 Check in a scratch consumer: install `main` and this branch in turn and run `npx ontrack plan`; verify ADR-0020 is reported `new` and ADR-0018 `unchanged`
- [x] 3.3 Run `openspec validate add-adding-dependencies-adr --strict`; verify it passes

## 4. Delivery

- [x] 4.1 Commit, push and open the pull request; verify its diff holds ADR-0020, the ADR-0018 line, the schema lines and this change, and nothing else

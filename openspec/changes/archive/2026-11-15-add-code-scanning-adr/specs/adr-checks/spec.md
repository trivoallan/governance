# Spec Delta

## MODIFIED Requirements

### Requirement: Wiring rows
governance SHALL ship these rows. Workflows are the tracked files matching
`.github/workflows/*.yml` or `.github/workflows/*.yaml`.

| ADR | Trait = value | Kind | What must be tracked |
| --- | --- | --- | --- |
| ADR-0008 | `docs.tool = starlight` | contains | a `package.json`, in any folder, holds `@astrojs/starlight` |
| ADR-0008 | `docs.tool = docusaurus` | exists | `docusaurus.config.js`, `.mjs` or `.ts`, in any folder |
| ADR-0008 | `docs.tool = mkdocs` | exists | `mkdocs.yml`, in any folder |
| ADR-0008 | `docs.root = <path>` | path | a file under that path |
| ADR-0010 | `architecture.document = arc42` | exists | for each of `01` to `12`, a file `docs/architecture/arc42/<NN>-*.md` or `docs/architecture/arc42/<NN>-*.mdx` |
| ADR-0010 | `architecture.model = likec4` | exists | a file ending in `.c4` or `.likec4` |
| ADR-0011 | `forge.gate = blocking` or `informative` | exists | a workflow |
| ADR-0012 | `delivery.release_tool = release-please` | contains | a workflow holds `googleapis/release-please-action` |
| ADR-0012 | `delivery.target = container` | exists | a file named `Dockerfile` or `Containerfile` |
| ADR-0012 | `deployment.manifests = <relative path>` | path | a file under that path |
| ADR-0017 | `agent.host = claude-code` | exists | `.claude/settings.json` |
| ADR-0018 | `dependencies.updater = dependabot` | exists | `.github/dependabot.yml` or `.github/dependabot.yaml` |
| ADR-0018 | `dependencies.updater = renovate` | exists | `renovate.json`, `renovate.json5`, `.renovaterc`, `.renovaterc.json`, `.github/renovate.json` or `.github/renovate.json5` |
| ADR-0018 | `dependencies.automerge = patch` or `minor`, when `dependencies.updater` is `dependabot` | contains | a workflow holds `dependabot/fetch-metadata` |
| ADR-0021 | `supply_chain.build_level = 1`, `2` or `3` | contains | a workflow holds `actions/attest-build-provenance`, `--provenance` or `pypa/gh-action-pypi-publish` |
| ADR-0024 | `code_scanning.tool = codeql` | contains | a workflow holds `github/codeql-action/analyze` |
| ADR-0024 | `code_scanning.tool = <any other value but none>` | contains all | one workflow holds the value, and `github/codeql-action/upload-sarif` or `actions/upload-artifact` (ADR-0024 rule 2: the SARIF goes to code scanning, or stays a job artifact where the plan does not allow the upload) |

The arc42 row looks under `docs/architecture/arc42/` whatever ADR-0008's
`docs.root` says: the architecture document does not move with the user
documentation. A
`deployment.manifests` value holding `://` is a URL and has no row. The
ADR-0011 line SHALL say that the ruleset requiring the pipeline is not
verified. With `dependencies.updater: renovate`, `dependencies.automerge` has
no row. A `contains all` row passes only when a single file holds, for each
of its lists, one of that list's strings. `code_scanning.fail_on` has no row: the threshold lives in the
ruleset and the workflow, which the check does not read.

#### Scenario: arc42 under another root
- **WHEN** ADR-0008 has `docs.root: site/` and ADR-0010 has `architecture.document: arc42`
- **THEN** the ADR-0010 check looks for the twelve files under `docs/architecture/arc42/`, not `site/architecture/arc42/`

#### Scenario: Gate states its ceiling
- **WHEN** ADR-0011 has `forge.gate: blocking` and the repository tracks `.github/workflows/ci.yml`
- **THEN** the check exits `0` and its line says the ruleset is not verified

#### Scenario: Manifests elsewhere
- **WHEN** ADR-0012 has `deployment.manifests: https://github.com/acme/deploy`
- **THEN** the output says `deployment.manifests` has nothing to check

#### Scenario: Provenance step present
- **WHEN** ADR-0021 has `supply_chain.build_level: 2` and a workflow runs `npm publish --provenance`
- **THEN** the check exits `0`

#### Scenario: Several traits in one ADR
- **WHEN** ADR-0012 has `delivery.release_tool: release-please` with no workflow holding it, and `delivery.target: none`
- **THEN** the check exits non-zero, and its output fails `delivery.release_tool` and says `delivery.target` has nothing to check

#### Scenario: arc42 sections in mdx
- **WHEN** ADR-0010 has `architecture.document: arc42` and the repository tracks the twelve sections under `docs/architecture/arc42/`, three of them as `.mdx`
- **THEN** the ADR-0010 check exits `0`

#### Scenario: Starlight site in a subfolder
- **WHEN** ADR-0008 has `docs.tool: starlight` and only `site/package.json` names `@astrojs/starlight`
- **THEN** the `docs.tool` row passes and names `site/package.json`

#### Scenario: CodeQL in advanced setup
- **WHEN** ADR-0024 has `code_scanning.tool: codeql` and a workflow uses `github/codeql-action/analyze@<sha>`
- **THEN** the check exits `0` and names that workflow

#### Scenario: CodeQL in default setup only
- **WHEN** ADR-0024 has `code_scanning.tool: codeql` and no workflow holds `github/codeql-action/analyze`
- **THEN** the check exits non-zero, even if default setup is on in the repository's settings

#### Scenario: Another tool uploads SARIF
- **WHEN** ADR-0024 has `code_scanning.tool: semgrep` and one workflow runs `semgrep ci --sarif` and `github/codeql-action/upload-sarif`
- **THEN** the check exits `0` and names that workflow

#### Scenario: Private repository keeps the SARIF
- **WHEN** ADR-0024 has `code_scanning.tool: semgrep` and one workflow runs `semgrep ci --sarif` and keeps the file with `actions/upload-artifact`
- **THEN** the check exits `0`

#### Scenario: Grype's upload does not count
- **WHEN** ADR-0024 has `code_scanning.tool: semgrep`, the only `upload-sarif` is in a workflow running Grype, and semgrep runs in another workflow
- **THEN** the check exits non-zero

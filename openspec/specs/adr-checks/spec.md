# adr-checks Specification

## Purpose
Defines `governance-check`, the command a governance ADR's `check:` line calls,
so that `ontrack check` can tell a consuming repository when its work departs
from a decision it ruled.

## Requirements

### Requirement: The governance-check command
governance's package SHALL expose a command `governance-check` that takes one
argument, an ADR number such as `ADR-0006`. It SHALL run from the consuming
repository's root and read that repository's copy of the ADR, the single file
matching `docs/adr/*/<number>-*.md`. When no file or more than one file
matches, or when governance ships no check for that number, it SHALL exit with
a non-zero code and say why on standard error. It MUST NOT create, modify or
delete any file in the repository.

#### Scenario: ADR found
- **WHEN** `governance-check ADR-0006` runs in a repository holding `docs/adr/trivoallan/ADR-0006-commits.md`
- **THEN** it reads the traits of that file

#### Scenario: ADR missing
- **WHEN** `governance-check ADR-0006` runs in a repository with no file matching `docs/adr/*/ADR-0006-*.md`
- **THEN** it exits non-zero and standard error names the pattern it looked for

#### Scenario: No check for that ADR
- **WHEN** `governance-check ADR-0003` runs
- **THEN** it exits non-zero and standard error says governance ships no check for ADR-0003

#### Scenario: Repository left untouched
- **WHEN** `governance-check ADR-0006` has run, whatever its result
- **THEN** `git status --porcelain` in the repository prints the same as before

### Requirement: ADR-0006 check with commitlint
When ADR-0006's `commits.tool` is `commitlint`, `governance-check ADR-0006`
SHALL run the repository's installed commitlint on the commits between
`origin/HEAD` and `HEAD`, or between `<ref>` and `HEAD` when called with
`--from <ref>`. It SHALL apply the Conventional Commits rules and the decided
scopes: when `commits.scopes` lists words, a scope outside the list is
refused; when it is `[]`, any scope is refused. It SHALL exit `0` when every
commit passes and non-zero otherwise, with commitlint's report on its output.

#### Scenario: Conforming commits
- **WHEN** `commits.scopes` is `[api, docs]` and the branch's commits are `feat(api): add x` and `docs: fix typo`
- **THEN** the check exits `0`

#### Scenario: Scope outside the list
- **WHEN** `commits.scopes` is `[api, docs]` and a branch commit is `fix(backend): y`
- **THEN** the check exits non-zero and its output names the scope rule

#### Scenario: No scope allowed
- **WHEN** `commits.scopes` is `[]` and a branch commit is `feat(api): x`
- **THEN** the check exits non-zero

#### Scenario: Other base
- **WHEN** the check runs with `--from develop`
- **THEN** only the commits between `develop` and `HEAD` are linted

#### Scenario: commitlint not installed
- **WHEN** `commits.tool` is `commitlint` and the repository has no `@commitlint/cli` or no `@commitlint/config-conventional`
- **THEN** the check exits non-zero and standard error names the missing package

### Requirement: ADR-0006 check without a tool to run
When ADR-0006's `commits.tool` is `hook` or `none`, `governance-check ADR-0006`
SHALL print one line saying that there is nothing to check and why, and exit
`0`. When `commits.tool` is absent or empty, it SHALL exit non-zero and say
that the ADR is not ruled.

#### Scenario: Tool is none
- **WHEN** `commits.tool` is `none`
- **THEN** the check prints `ADR-0006: commits.tool is none, nothing to check` and exits `0`

#### Scenario: Tool is hook
- **WHEN** `commits.tool` is `hook`
- **THEN** the check prints `ADR-0006: commits.tool is hook, nothing to check` and exits `0`

#### Scenario: Not ruled
- **WHEN** the repository's ADR-0006 has `tool:` with no value
- **THEN** the check exits non-zero and standard error says `commits.tool` is not set

### Requirement: Wiring check
When governance ships no dedicated check for an ADR but its wiring table has
rows for it, `governance-check <number>` SHALL run the wiring check on the
repository's copy of that ADR. For each trait the table names, it SHALL read
the trait's value and apply the row for that value. A row is one of three
kinds, and each looks only at files the repository tracks (as `git ls-files`
lists them):
- `exists`: a list of entries, each a set of alternative paths or patterns;
  the row passes when every entry matches at least one tracked file;
- `contains`: a pattern and a set of alternative strings; the row passes when
  a tracked file matching the pattern holds one of the strings;
- `path`: the trait's value is a path; the row passes when at least one
  tracked file lives under it.

It SHALL print one line per trait on standard output, naming the trait, its
value and, for a passing row, the file it found. A failing row SHALL name
what it looked for. The check SHALL exit `0` when no row fails and non-zero
otherwise. It MUST NOT create, modify or delete any file in the repository.

#### Scenario: Row passes
- **WHEN** ADR-0018 has `dependencies.updater: dependabot` and the repository tracks `.github/dependabot.yml`
- **THEN** the output names `.github/dependabot.yml` for `dependencies.updater` and, if no other row fails, the check exits `0`

#### Scenario: Row fails
- **WHEN** ADR-0018 has `dependencies.updater: dependabot` and the repository tracks no `.github/dependabot.yml` or `.github/dependabot.yaml`
- **THEN** the check exits non-zero and its output names both paths

#### Scenario: Untracked file does not count
- **WHEN** `.github/dependabot.yml` exists in the working tree but is not tracked
- **THEN** the `dependencies.updater: dependabot` row fails

#### Scenario: Every entry must match
- **WHEN** ADR-0010 has `architecture.document: arc42` and the repository tracks eleven of the twelve section files
- **THEN** the check exits non-zero and its output names the missing section

### Requirement: Wiring check is presence only
A wiring row SHALL only require that something be present. No row SHALL
require a file to be absent. When a trait's value has no row (`none`,
`manual`, a URL where a path is expected, or a value governance did not
foresee), the check SHALL print `<number>: <trait> is <value>, nothing to
check` for that trait and SHALL NOT fail on it. When a trait the table names
is absent or empty in the ADR, the check SHALL exit non-zero and say that the
trait is not set.

#### Scenario: Value none
- **WHEN** ADR-0018 has `dependencies.updater: none` and the repository tracks `.github/dependabot.yml`
- **THEN** the output says `ADR-0018: dependencies.updater is none, nothing to check` and that trait does not fail

#### Scenario: Unforeseen value
- **WHEN** ADR-0018 has `dependencies.updater: foo`
- **THEN** the output says `ADR-0018: dependencies.updater is foo, nothing to check` and that trait does not fail

#### Scenario: Trait not set
- **WHEN** ADR-0017 has `host:` with no value
- **THEN** the check exits non-zero and standard error says `agent.host` is not set

### Requirement: Wiring rows
governance SHALL ship these rows. Workflows are the tracked files matching
`.github/workflows/*.yml` or `.github/workflows/*.yaml`.

| ADR | Trait = value | Kind | What must be tracked |
| --- | --- | --- | --- |
| ADR-0008 | `docs.tool = starlight` | contains | `package.json` holds `@astrojs/starlight` |
| ADR-0008 | `docs.tool = docusaurus` | exists | `docusaurus.config.js`, `.mjs` or `.ts` |
| ADR-0008 | `docs.tool = mkdocs` | exists | `mkdocs.yml` |
| ADR-0008 | `docs.root = <path>` | path | a file under that path |
| ADR-0010 | `architecture.document = arc42` | exists | for each of `01` to `12`, a file `<root>architecture/<NN>-*.md` |
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

In the arc42 row, `<root>` is `docs.root` from the repository's copy of
ADR-0008, or `docs/` when that copy or that trait is absent or empty. A
`deployment.manifests` value holding `://` is a URL and has no row. The
ADR-0011 line SHALL say that the ruleset requiring the pipeline is not
verified. With `dependencies.updater: renovate`, `dependencies.automerge` has
no row.

#### Scenario: arc42 under another root
- **WHEN** ADR-0008 has `docs.root: site/` and ADR-0010 has `architecture.document: arc42`
- **THEN** the ADR-0010 check looks for the twelve files under `site/architecture/`

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

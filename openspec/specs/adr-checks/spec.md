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

### Requirement: Repository tools
When a check runs a tool other than commitlint, it SHALL look for it in the
repository's `node_modules/.bin` first, then on `PATH`. When the tool is
found in neither, the check SHALL exit non-zero and standard error SHALL
name the tool and the trait that asks for it. The tool's own report SHALL
reach the check's output, and the check SHALL fail when the tool exits
non-zero.

#### Scenario: Tool installed in the repository
- **WHEN** `secrets.guard` is `gitleaks` and the repository has `node_modules/.bin/gitleaks`
- **THEN** the check runs that binary

#### Scenario: Tool missing
- **WHEN** `secrets.guard` is `gitleaks` and no `gitleaks` is found
- **THEN** the check exits non-zero and standard error says `gitleaks` is not installed

### Requirement: ADR-0009 check
`governance-check ADR-0009` SHALL check one branch name. The name SHALL be
the value of `--branch <name>` when given, else `GITHUB_HEAD_REF` when it is
set and not empty, else the repository's current branch. When there is no
name, or the name is the default branch (the branch `origin/HEAD` points to,
or `main` or `master` when `origin/HEAD` is not set), the check SHALL print
that there is nothing to check and exit `0`. When the name starts with the prefix of a tool the repository's ADRs
rule, the check SHALL print that it is a tool branch with nothing to check and exit `0`.
A tool is ruled when ADR-0012 `delivery.release_tool` or ADR-0018
`dependencies.updater` names it, and its prefix is `release-please--` for
`release-please`, `releaser-pleaser--` for `releaser-pleaser`, `dependabot/`
for `dependabot` and `renovate/` for `renovate`. An ADR that is missing,
whose key is empty, or that names another tool, SHALL exempt nothing, and the
failure SHALL say why the branch is not exempt. Otherwise the
name SHALL be `<prefix>/<description>`, where `<prefix>` is one of
`branching.prefixes` and `<description>` is lower-case words of letters and
digits joined by single hyphens; the check SHALL exit `0` when it is, and
non-zero otherwise, naming the allowed prefixes and the form. When
`branching.prefixes` is absent, empty, or not a list, the check SHALL exit
non-zero and say it is not set. `branching.model` and `branching.merge`
SHALL NOT be checked.

#### Scenario: Conforming branch
- **WHEN** `branching.prefixes` is `[feat, fix, docs]` and the branch is `feat/schema-port`
- **THEN** the check exits `0`

#### Scenario: Prefix outside the list
- **WHEN** `branching.prefixes` is `[feat, fix, docs]` and the branch is `chore/bump`
- **THEN** the check exits non-zero and its output names `feat, fix, docs`

#### Scenario: Description not in kebab case
- **WHEN** the branch is `feat/Schema_Port`
- **THEN** the check exits non-zero

#### Scenario: Pull request in CI
- **WHEN** the checkout is detached and `GITHUB_HEAD_REF` is `fix/dead-link`
- **THEN** the check reads `fix/dead-link`

#### Scenario: Explicit branch
- **WHEN** the check runs with `--branch docs/readme`
- **THEN** it checks `docs/readme`, whatever the current branch

#### Scenario: Default branch
- **WHEN** `origin/HEAD` points to `origin/main` and the current branch is `main`
- **THEN** the check prints `ADR-0009: main is the default branch, nothing to check` and exits `0`

#### Scenario: Tool branch exempt when its tool is ruled
- **WHEN** ADR-0012 `delivery.release_tool` is `release-please` and the branch is `release-please--branches--main`
- **THEN** the check prints that it is a tool branch with nothing to check and exits `0`

#### Scenario: Release tool branch
- **WHEN** ADR-0012 `delivery.release_tool` is `release-please` and `GITHUB_HEAD_REF` is `release-please--branches--main--components--ontrack-governance`
- **THEN** the check prints that it is a tool branch with nothing to check and exits `0`

#### Scenario: Update tool branch
- **WHEN** ADR-0018 `dependencies.updater` is `dependabot` and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits `0`

#### Scenario: Tool branch refused without its ADR
- **WHEN** the repository has no ADR-0018 and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and says no ADR-0018 rules `dependencies.updater`

#### Scenario: Tool branch refused when another tool is ruled
- **WHEN** ADR-0018 `dependencies.updater` is `renovate` and the branch is `dependabot/npm_and_yarn/zod-4.1.0`
- **THEN** the check exits non-zero and says `dependencies.updater` is not `dependabot`

#### Scenario: Tool prefix needs its separator
- **WHEN** `branching.prefixes` is `[feat]` and the branch is `dependabot-tweaks`
- **THEN** the check exits non-zero

#### Scenario: Prefixes not set
- **WHEN** `branching.prefixes` has no value
- **THEN** the check exits non-zero and standard error says `branching.prefixes` is not set

### Requirement: ADR-0015 check
When `secrets.guard` is `gitleaks`, `governance-check ADR-0015` SHALL run
`gitleaks git` on the commits between `origin/HEAD` and `HEAD`, or between
`<ref>` and `HEAD` with `--from <ref>`, with secrets redacted from its
report, and SHALL exit `0` when gitleaks finds no leak and non-zero
otherwise. When `secrets.guard` is `none` or another value, it SHALL print
that there is nothing to check and exit `0`. When `secrets.guard` is absent
or empty, it SHALL exit non-zero and say it is not set. `secrets.storage`
SHALL NOT be checked.

#### Scenario: No leak
- **WHEN** `secrets.guard` is `gitleaks` and the branch's commits hold no secret
- **THEN** the check exits `0`

#### Scenario: Leak in a branch commit
- **WHEN** `secrets.guard` is `gitleaks` and a commit after `origin/HEAD` adds a private key
- **THEN** the check exits non-zero and the key does not appear in its output

#### Scenario: Leak before the base
- **WHEN** the only secret is in a commit at or before `origin/HEAD`
- **THEN** the check exits `0`

#### Scenario: Guard none
- **WHEN** `secrets.guard` is `none`
- **THEN** the check prints `ADR-0015: secrets.guard is none, nothing to check` and exits `0`

### Requirement: ADR-0016 check
When `changes.framework` is `openspec`, `governance-check ADR-0016` SHALL
check three things, report each, and exit non-zero when any fails:
1. `openspec/config.yaml` (or `openspec/config.yml` when it is absent) has a
   `schema:` equal to `changes.schema`; a missing file or a different value
   fails and names both values;
2. `openspec schema validate <changes.schema>` exits `0`;
3. `openspec validate --all --no-interactive` exits `0`.

When `changes.schema` is absent or empty, the check SHALL exit non-zero and
say it is not set; when it is `none`, it SHALL exit non-zero and say that
`none` goes with `changes.framework: none`. When `changes.framework` is
`none` or another value, it SHALL print that there is nothing to check and
exit `0`. When it is absent or empty, it SHALL exit non-zero and say it is
not set.

#### Scenario: Ruled schema in use and valid
- **WHEN** `changes.schema` is `spec-driven`, `openspec/config.yaml` has `schema: spec-driven`, and both openspec commands exit `0`
- **THEN** the check exits `0`

#### Scenario: Config names another schema
- **WHEN** `changes.schema` is `spec-driven-with-adr` and `openspec/config.yaml` has `schema: spec-driven`
- **THEN** the check exits non-zero and its output names both schemas

#### Scenario: Invalid change
- **WHEN** `openspec validate --all --no-interactive` exits non-zero
- **THEN** the check exits non-zero with openspec's report in its output

#### Scenario: Framework none
- **WHEN** `changes.framework` is `none`
- **THEN** the check prints `ADR-0016: changes.framework is none, nothing to check` and exits `0`

#### Scenario: Schema none with openspec
- **WHEN** `changes.framework` is `openspec` and `changes.schema` is `none`
- **THEN** the check exits non-zero

### Requirement: Shipped as JavaScript
governance's package SHALL ship `governance-check` as JavaScript that Node
22.18 or later runs from `node_modules` with no type stripping, loader or
build in the consuming repository. The installed package SHALL hold that
compiled script and no TypeScript source. It SHALL work installed from the
npm registry and installed from a git tag of governance, with the same
behaviour as every other requirement of this capability.

#### Scenario: Installed from the npm registry
- **WHEN** the package as `npm pack` builds it is installed in a repository holding a ruled ADR-0006, and `npx --no-install governance-check ADR-0006` runs there
- **THEN** the check runs and reports on ADR-0006, and no `.ts` file is in the installed package

#### Scenario: Installed from a git tag
- **WHEN** governance is installed with `npm i -D trivoallan@git+https://github.com/trivoallan/governance.git#<tag>` and `npx --no-install governance-check ADR-0006` runs
- **THEN** the check runs and reports on ADR-0006

### Requirement: Declared validation of arguments and traits
`governance-check` SHALL validate its command-line arguments, and the traits
each check reads from the ADR, against a schema declared for that boundary,
before the check acts on them. A missing ADR number, an option it does not
know, or an option given without its value SHALL make it exit non-zero, with
standard error naming the argument at fault or giving the usage line. A
trait that is absent, empty, or not of the shape the check reads (a list
where one value is expected, or one value where a list is expected) SHALL
make the check exit non-zero, with standard error naming the ADR number and
`<group>.<key>`; such a value MUST NOT be read as a default or converted to
another shape. Values that the other requirements of this capability let
pass, including unforeseen values of a wiring key, SHALL still pass.

#### Scenario: Option without its value
- **WHEN** `governance-check ADR-0006 --from` runs
- **THEN** it exits non-zero and standard error names `--from`

#### Scenario: Unknown option
- **WHEN** `governance-check ADR-0006 --form develop` runs
- **THEN** it exits non-zero and standard error names `--form`

#### Scenario: A list where one value is expected
- **WHEN** ADR-0015 has `guard: [gitleaks]` under `traits.secrets`
- **THEN** the check exits non-zero and standard error names `ADR-0015` and `secrets.guard`

#### Scenario: One value where a list is expected
- **WHEN** ADR-0006 has `scopes: api` under `traits.commits` and `tool: commitlint`
- **THEN** the check exits non-zero and standard error says `commits.scopes` is not a list

#### Scenario: Unforeseen wiring value still passes
- **WHEN** ADR-0018 has `updater: something-else` and `automerge: none`
- **THEN** the check prints that there is nothing to check for `dependencies.updater` and exits `0`

### Requirement: One runtime dependency
governance's package SHALL declare exactly one runtime dependency: the
library its own ADR-0005 rules as `validation.boundary`. Everything else the
check uses SHALL come from Node's standard library or from the consuming
repository (commitlint, gitleaks, openspec, as the other requirements say).

#### Scenario: Dependencies of the package
- **WHEN** governance's `package.json` is read after this change
- **THEN** `dependencies` holds exactly `zod`

### Requirement: ADR-0022 check
`governance-check ADR-0022` SHALL read `review.merge_by` from ADR-0022 and
`agent.host` from the repository's copy of ADR-0017.
- When `review.merge_by` is absent or empty, it SHALL exit non-zero and say it is not set.
- When `review.merge_by` is `agent`, it SHALL print that there is nothing to check and exit `0`.
- When `review.merge_by` is `person` and ADR-0017 is missing, or `agent.host` is empty, `none` or a value other than `claude-code`, it SHALL print that there is nothing to check and give the reason. It SHALL exit `0`.
- When `review.merge_by` is `person` and `agent.host` is `claude-code`, it SHALL read the tracked `.claude/settings.json`. It SHALL exit `0` only when that file's `permissions.deny` array holds an entry that starts with `Bash(gh pr merge`.
- It SHALL exit non-zero, naming the file, when that file is not tracked, is not valid JSON, or has no such entry.

An entry under `permissions.allow` or `permissions.ask` SHALL NOT satisfy
the check. `.claude/settings.local.json` SHALL NOT be read.

#### Scenario: Merge denied
- **WHEN** `merge_by` is `person`, `host` is `claude-code`, and the tracked `.claude/settings.json` has `"deny": ["Bash(gh pr merge:*)"]` under `permissions`
- **THEN** the check exits `0` and names the entry

#### Scenario: Merge only asked
- **WHEN** the same entry sits under `permissions.ask` and not under `permissions.deny`
- **THEN** the check exits non-zero and says `permissions.deny` has no `Bash(gh pr merge` entry

#### Scenario: No agent host
- **WHEN** `merge_by` is `person` and ADR-0017 rules `agent.host: none`
- **THEN** the check prints `ADR-0022: review.merge_by is person, but ADR-0017 agent.host is none, nothing to check` and exits `0`

#### Scenario: Agent merges
- **WHEN** `merge_by` is `agent`
- **THEN** the check prints `ADR-0022: review.merge_by is agent, nothing to check` and exits `0`

#### Scenario: Settings not committed
- **WHEN** `merge_by` is `person`, `host` is `claude-code`, and `.claude/settings.json` exists but is not tracked
- **THEN** the check exits non-zero and names `.claude/settings.json`

### Requirement: ADR-0023 check
`governance-check ADR-0023` SHALL read `license.spdx` from ADR-0023.
- When it is absent or empty, the check SHALL exit non-zero and say it is not set.
- Otherwise it SHALL read the tracked root manifests: `package.json` (its `license` field) and `pyproject.toml` (its `[project] license`, as a string or as `{ text = "..." }`).
- It SHALL exit non-zero, naming the file and both values, when a tracked root manifest has no licence field or one that differs from the trait.
- When the value is not `UNLICENSED`, it SHALL also exit non-zero unless a tracked `LICENSE`, `LICENSE.md`, `LICENSE.txt` or `COPYING` exists at the root.
- When no root manifest is tracked, it SHALL check only the licence file and say no manifest was found.

The check SHALL NOT read the licence file's text, nor manifests outside the
root.

#### Scenario: Ruled and wired
- **WHEN** `license.spdx` is `MIT`, `package.json` has `"license": "MIT"` and `LICENSE` is tracked
- **THEN** the check exits `0` and names both files

#### Scenario: Manifest disagrees
- **WHEN** `license.spdx` is `MIT` and `package.json` has `"license": "ISC"`
- **THEN** the check exits non-zero and says `package.json` has `ISC` where ADR-0023 rules `MIT`

#### Scenario: No licence file
- **WHEN** `license.spdx` is `Apache-2.0`, `pyproject.toml` has `license = "Apache-2.0"` and no licence file is tracked
- **THEN** the check exits non-zero and names the file names it looked for

#### Scenario: Private repository
- **WHEN** `license.spdx` is `UNLICENSED`, `package.json` has `"license": "UNLICENSED"` and no licence file exists
- **THEN** the check exits `0`


<!-- ontrack:begin -->
## Project instructions (ontrack)

When asked to review, rule on or supersede an ADR, run `npx ontrack review [adr]` and follow its output.

### Record architecture decisions (trivoallan/ADR-0001-record-architecture-decisions)

```yaml
record-architecture-decisions:
  format: nygard
```

### Localization (trivoallan/ADR-0002-localization)

```yaml
localization:
  language:
    default: english
    documentation:
    commits:
    code:
    comments:
```

### Software architecture (trivoallan/ADR-0003-architecture)

```yaml
architecture:
  pattern: monolithic
```

### Languages (trivoallan/ADR-0004-languages)

```yaml
languages:
  main:
    name: TypeScript
```

### Validation (trivoallan/ADR-0005-validation)

```yaml
validation:
  boundary: zod
  data_files: mdschema
```

### Commits (trivoallan/ADR-0006-commits)

```yaml
commits:
  scopes: [adr, checks, openspec, readme]
  tool: commitlint
```

### Tests (trivoallan/ADR-0007-tests)

```yaml
tests:
  coverage_target: 90
```

### Documentation (trivoallan/ADR-0008-documentation)

```yaml
docs:
  tool: none
  root: docs/
  audience: public
```

### Branching (trivoallan/ADR-0009-branching)

```yaml
branching:
  model: github-flow
  merge: squash
  prefixes: [feat, fix, docs, chore]
```

### Architecture documentation (trivoallan/ADR-0010-architecture-documentation)

```yaml
architecture:
  document: none
  model: none
  diagrams: mermaid
```

### Forge and continuous integration (trivoallan/ADR-0011-forge-and-ci)

```yaml
forge:
  gate: blocking
  audit: zizmor
  review: author
```

### Delivery (trivoallan/ADR-0012-delivery)

```yaml
delivery:
  target: package
  environments:
    - { name: github, trigger: tag }
    - { name: npm, trigger: tag }
  release_tool: release-please
  release_notes: highlights
  registry: none
deployment:
  manifests: none
```

### Work tracking (trivoallan/ADR-0014-work-tracking)

```yaml
tracking:
  tool: github-issues
  project: trivoallan/ontrack-engineering
```

### Secrets (trivoallan/ADR-0015-secrets)

```yaml
secrets:
  storage: none
  guard: gitleaks
```

### Changes (trivoallan/ADR-0016-changes)

```yaml
changes:
  framework: openspec
  schema: spec-driven
```

### Agent tooling (trivoallan/ADR-0017-agent-tooling)

```yaml
agent:
  host: claude-code
```

### Dependencies (trivoallan/ADR-0018-dependencies)

```yaml
dependencies:
  updater: dependabot
  automerge: patch
```

### Vulnerabilities (trivoallan/ADR-0019-vulnerabilities)

```yaml
vulnerabilities:
  sbom: cyclonedx
  scanner: grype
  fail_on: critical
```

### Adding a dependency (trivoallan/ADR-0020-adding-dependencies)

```yaml
admission:
  approver: person
  install_scripts: ignored
```

### Build provenance (trivoallan/ADR-0021-build-provenance)

```yaml
supply_chain:
  build_level: 2
```

### Review and merge (trivoallan/ADR-0022-review-and-merge)

```yaml
review:
  merge_by: person
```

### License (trivoallan/ADR-0023-license)

```yaml
license:
  spdx: MIT-0
```

### Code scanning (trivoallan/ADR-0024-code-scanning)

```yaml
code_scanning:
  tool: codeql
  fail_on: high
```

### Tools outside the package manager (trivoallan/ADR-0025-tools)

```yaml
tools:
  manager: mise
```

<!-- ontrack:end -->

## Branches

A branch name is `<prefix>/<description-in-kebab-case>`, with a prefix from
`branching.prefixes` (ADR-0009), and the pull request gate checks it. Tooling
may create a branch with another name (the Claude Code desktop app names a
session branch `<branch prefix>/<name>`, for example `tritri/…`). Before its
first push, rename such a branch, taking the prefix from the commit type of
the work:

```sh
git branch -m fix/dead-glossary-link
```

Branches opened by release and update tools (`release-please--…`,
`releaser-pleaser--…`, `dependabot/…`, `renovate/…`) keep their names.

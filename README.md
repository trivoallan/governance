<p align="center">
  <img src="docs/assets/logo.png" alt="A red and orange brushstroke" width="240">
</p>

# governance

**Opinionated ADRs you import, overrule where you disagree, and check in CI.**

The 25 questions I answer for every Python or TypeScript repository I keep
on GitHub (commits, branching, delivery, supply chain, agent tooling), each
with the answer I recommend and why; 14 of them come with a check.

governance is an [ontrack](https://github.com/trivoallan/ontrack) source:
an npm package of ADRs that your repository imports and rules on, one
question at a time.

## What you get

| Domain | What you gain | What `governance-check` verifies |
| --- | --- | --- |
| **Workflow** (0006, 0009, 0014, 0016) | One convention for commits and branch names, refused at the gate instead of argued in review | the branch's commits pass commitlint; the branch name has an accepted prefix; OpenSpec uses the schema you chose |
| **Delivery** (0011, 0012, 0023) | A pipeline designed once (stages, a blocking gate, releases cut from tags) that your agent writes from the rules and that [zizmor](https://docs.zizmor.sh/) reads for what those rules forbid, and a licence others can reuse the code under | a workflow exists; zizmor finds no movable action reference, dangerous trigger, template injection or over-broad permission in the workflows; release-please runs in one; a Dockerfile if you ship a container; the root manifest declares the ruled licence and a licence file is committed |
| **Supply chain** (0015, 0018, 0019, 0020, 0021) | Current practice, by name: gitleaks before every commit, dependencies admitted by a person with install scripts ignored, a CycloneDX SBOM scanned by Grype, SLSA Build Level 2 provenance | gitleaks finds no secret on the branch; Dependabot is configured, and so is its automerge; the publishing workflow emits provenance |
| **Architecture** (0003, 0010) | A hexagonal core by default, where the domain depends on no I/O, so an agent writes and tests it without a running environment. The architecture is documented in [arc42](https://arc42.org/overview)'s twelve sections, with [C4](https://c4model.com/) diagrams generated from a [LikeC4](https://likec4.dev/) model kept as code | the twelve arc42 section files; the LikeC4 model files, if you chose them |
| **Code** (0004, 0005, 0007, 0013, 0024) | Validation at every boundary (`zod` or `pydantic`), a test coverage target you set, and your own code scanned by CodeQL, its alerts blocking from `high` | a scan workflow sends its SARIF to code scanning (or keeps it as an artifact); the threshold, held by the ruleset, is not verified |
| **Decisions & docs** (0001, 0002, 0008) | Decisions kept as ADRs, docs in one language under one root | the docs tool and root exist. Separately, the `.mdschema.yml` shipped beside the ADRs attests that each ruled ADR carries its verdict |
| **Agents** (0017, 0022) | The rules you accepted, written by ontrack into a managed block of `AGENTS.md`, which your coding agent reads on every session; plugins pinned; the agent opens the pull request, a person merges it | `.claude/settings.json` exists, and denies `gh pr merge` when a person merges |

Checks confirm the wiring is there, not that it is right: the gate's
ruleset, for one, is yours to set on GitHub. Reject any question that
doesn't fit your repository.

### The questions

- [ADR-0001](adr/ADR-0001-record-architecture-decisions.md) Record architecture decisions
- [ADR-0002](adr/ADR-0002-localization.md) Localization
- [ADR-0003](adr/ADR-0003-architecture.md) Software architecture
- [ADR-0004](adr/ADR-0004-languages.md) Languages
- [ADR-0005](adr/ADR-0005-validation.md) Validation
- [ADR-0006](adr/ADR-0006-commits.md) Commits
- [ADR-0007](adr/ADR-0007-tests.md) Tests
- [ADR-0008](adr/ADR-0008-documentation.md) Documentation
- [ADR-0009](adr/ADR-0009-branching.md) Branching
- [ADR-0010](adr/ADR-0010-architecture-documentation.md) Architecture documentation
- [ADR-0011](adr/ADR-0011-forge-and-ci.md) Forge and continuous integration
- [ADR-0012](adr/ADR-0012-delivery.md) Delivery
- [ADR-0013](adr/ADR-0013-frontend.md) Frontend
- [ADR-0014](adr/ADR-0014-work-tracking.md) Work tracking
- [ADR-0015](adr/ADR-0015-secrets.md) Secrets
- [ADR-0016](adr/ADR-0016-changes.md) Changes
- [ADR-0017](adr/ADR-0017-agent-tooling.md) Agent tooling
- [ADR-0018](adr/ADR-0018-dependencies.md) Dependencies
- [ADR-0019](adr/ADR-0019-vulnerabilities.md) Vulnerabilities
- [ADR-0020](adr/ADR-0020-adding-dependencies.md) Adding a dependency
- [ADR-0021](adr/ADR-0021-build-provenance.md) Build provenance
- [ADR-0022](adr/ADR-0022-review-and-merge.md) Review and merge
- [ADR-0023](adr/ADR-0023-license.md) License
- [ADR-0024](adr/ADR-0024-code-scanning.md) Code scanning
- [ADR-0025](adr/ADR-0025-tools.md) Tools outside the package manager

### Not covered

governance decides nothing about:

- licence compliance of your dependencies
  ([ADR-0019](adr/ADR-0019-vulnerabilities.md) says so);
- which linter, formatter or test runner you use
  ([ADR-0004](adr/ADR-0004-languages.md)); the pipeline runs the lint
  command your repository already has
  ([ADR-0011](adr/ADR-0011-forge-and-ci.md));
- forges other than GitHub ([ADR-0011](adr/ADR-0011-forge-and-ci.md));
- the workflow files themselves: none ship, your agent writes them from the
  rules;
- infrastructure as code, hosting and operations (logging, monitoring,
  incidents);
- how many approvals a pull request needs, and ownership (`CODEOWNERS`):
  [ADR-0022](adr/ADR-0022-review-and-merge.md) decides only who merges.

## What an ADR looks like

Each ADR asks a question, recommends an answer and gives the reasons. You
rule on it by filling its `traits:`. From
[ADR-0009](adr/ADR-0009-branching.md), abridged:

> While these keys are empty, an agent starting a piece of work does not
> know how to name its branch, whether it may push to the default branch,
> or whether its eight commits will land as eight or as one.
>
> | Key | Recommended value | Reason |
> | --- | --- | --- |
> | `branching.model` | `github-flow` | one change, one branch, one pull request, one review |
> | `branching.merge` | `squash` | a change becomes one commit on the default branch |
> | `branching.prefixes` | `[feat, fix, docs]` | these are already commit types |

Accepted, its traits read:

```yaml
traits:
  branching:
    model: github-flow
    merge: squash
    prefixes: [feat, fix, docs]
```

## Use it

With [ontrack installed](https://trivoallan.github.io/ontrack/), add the
source:

```bash
npm i -D trivoallan@npm:@trivoallan/ontrack-governance
```

Check the package was built by this repository's release workflow with
`npm audit signatures`.

Everything after that (`ontrack plan`, `ontrack apply`, what a new
`revision` means, `ontrack check`) is ontrack's, and
[its documentation](https://trivoallan.github.io/ontrack/) explains it.

## See it in use

[ontrack](https://github.com/trivoallan/ontrack) imports this source: its
answers are in
[`docs/adr/trivoallan/`](https://github.com/trivoallan/ontrack/tree/main/docs/adr/trivoallan),
the rules they produce in its
[`AGENTS.md`](https://github.com/trivoallan/ontrack/blob/main/AGENTS.md),
and its architecture in arc42 and LikeC4 under
[`docs/architecture/`](https://github.com/trivoallan/ontrack/tree/main/docs/architecture).

## Contributing

Setting up a clone (Claude Code plugins, the secret guard) is in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

The code and the ADRs are under [MIT-0](LICENSE). The logo is a painting by
[nota2k](https://github.com/nota2k), under [CC BY-ND 4.0](docs/assets/LICENSE.md).

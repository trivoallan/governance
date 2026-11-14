# governance

The questions I ask of my own repositories, shipped as ADRs through an
[ontrack](https://github.com/trivoallan/ontrack) source.

Each ADR asks one question (commit format, branching, localization…),
gives the answer I recommend and why, and leaves the verdict to the
repository that imports it. It arrives `status: proposed`; you rule on it
by filling its `traits:` and setting it `accepted` or `rejected`.
[ADR-0001](adr/ADR-0001-record-architecture-decisions.md) explains how.

governance is a personal edition of
[surdesrails](https://github.com/trivoallan/surdesrails), without its
enterprise context. Import one or the other, not both.

It is real, not a demo. A new `revision:` means the question itself moved.

## What it asks

The source asks 21 questions, one per ADR. You receive all of them, and
you may answer `rejected` to those that do not apply to your repository.

A question marked "check" names a command that `ontrack check` runs in your
repository once you accept the ADR. That command is `governance-check`,
shipped in this package.

| ADR | Question | Check |
| --- | --- | --- |
| [ADR-0001](adr/ADR-0001-record-architecture-decisions.md) | Record architecture decisions | yes |
| [ADR-0002](adr/ADR-0002-localization.md) | Localization |  |
| [ADR-0003](adr/ADR-0003-architecture.md) | Software architecture |  |
| [ADR-0004](adr/ADR-0004-languages.md) | Languages |  |
| [ADR-0005](adr/ADR-0005-validation.md) | Validation |  |
| [ADR-0006](adr/ADR-0006-commits.md) | Commits | yes |
| [ADR-0007](adr/ADR-0007-tests.md) | Tests |  |
| [ADR-0008](adr/ADR-0008-documentation.md) | Documentation | yes |
| [ADR-0009](adr/ADR-0009-branching.md) | Branching | yes |
| [ADR-0010](adr/ADR-0010-architecture-documentation.md) | Architecture documentation | yes |
| [ADR-0011](adr/ADR-0011-forge-and-ci.md) | Forge and continuous integration | yes |
| [ADR-0012](adr/ADR-0012-delivery.md) | Delivery | yes |
| [ADR-0013](adr/ADR-0013-frontend.md) | Frontend |  |
| [ADR-0014](adr/ADR-0014-work-tracking.md) | Work tracking |  |
| [ADR-0015](adr/ADR-0015-secrets.md) | Secrets | yes |
| [ADR-0016](adr/ADR-0016-changes.md) | Changes | yes |
| [ADR-0017](adr/ADR-0017-agent-tooling.md) | Agent tooling | yes |
| [ADR-0018](adr/ADR-0018-dependencies.md) | Dependencies | yes |
| [ADR-0019](adr/ADR-0019-vulnerabilities.md) | Vulnerabilities |  |
| [ADR-0020](adr/ADR-0020-adding-dependencies.md) | Adding a dependency |  |
| [ADR-0021](adr/ADR-0021-build-provenance.md) | Build provenance | yes |

## Use it

```bash
npm i -D ontrack@git+https://github.com/trivoallan/ontrack.git
npm i -D trivoallan@npm:@trivoallan/ontrack-governance
npx ontrack plan
```

From Git instead, pin a released tag:
`npm i -D trivoallan@git+https://github.com/trivoallan/governance.git#vX.Y.Z`.
Check the npm package was built by this repository's release workflow with
`npm audit signatures`.

Install ontrack first: without it, `npx ontrack` fetches and runs an
unrelated package of the same name from the npm registry.

The alias (`trivoallan` here) is yours: it becomes the namespace, and the
ADRs land in `docs/adr/<alias>/`. Rename it if you like.

## Work on it

This repository is worked on with Claude Code
([ADR-0017](docs/adr/trivoallan/ADR-0017-agent-tooling.md)). Its plugins
come from its own marketplace, `marketplace/`, each pinned to a commit.
Accept the workspace trust dialog, then install each plugin once:

```bash
claude plugin install source-control@ontrack-trivoallan-tools --scope project
claude plugin install superpowers@ontrack-trivoallan-tools --scope project
claude plugin install claude-security@claude-plugins-official --scope project
```

`claude-security` comes from Anthropic's marketplace, unpinned: a departure
recorded in ADR-0017.

If you already have one of them from its upstream marketplace, turn that
copy off in your untracked `.claude/settings.local.json`
(`"superpowers@superpowers-marketplace": false`, say).

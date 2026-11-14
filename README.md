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
```

If you already have one of them from its upstream marketplace, turn that
copy off in your untracked `.claude/settings.local.json`
(`"superpowers@superpowers-marketplace": false`, say).

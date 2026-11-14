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
npm i -D trivoallan@git+https://github.com/trivoallan/governance.git
npx ontrack plan
```

Install ontrack first: without it, `npx ontrack` fetches and runs an
unrelated package of the same name from the npm registry.

The alias (`trivoallan` here) is yours: it becomes the namespace, and the
ADRs land in `docs/adr/<alias>/`. Rename it if you like.

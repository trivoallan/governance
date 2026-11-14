---
adr: ADR-0006
slug: commits
title: Commits
status: accepted
revision: 1
date: 2026-11-14
authors: [Tristan Rivoallan]
supersedes: []
check: npx --no-install governance-check ADR-0006
traits:
  commits:
    scopes: [adr, checks, openspec, readme]
    tool: commitlint
---

# Commits

## Status

Accepted

## Context

While these keys are empty, an agent writing a commit message **invents a
scope**: `fix(api)`, then `fix(backend)`, then `fix(server)` for the same
place. The history can no longer be filtered, and a release generated from
the messages sorts changes into the wrong places. Once the list is written,
the agent picks from it.

**The format itself is not decided here.** governance requires
[Conventional Commits](https://www.conventionalcommits.org/) and its eleven
types. What is yours to decide is the **scope vocabulary** of this
repository, and the **tool** that enforces it, or the absence of one.

**What `rejected` means in this ADR**, then: that you name neither scopes
nor a tool. Not that you refuse the format, which does not depend on you. A
single-area repository with no pipeline is the typical case.

## Decision

**What governance fixes, and is not up for ruling:** the Conventional
Commits format, its **eleven types** (`feat`, `fix`, `docs`, `style`,
`refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`) and its
breaking-change syntax. It is the one thing that makes histories comparable
from one repository to the next.

**What governance recommends for the tool, and why.**

| Key | Recommended value | Reason |
| --- | --- | --- |
| `commits.tool` | `commitlint` | **if this repository generates its versions from commit messages**: an off-format message then produces a wrong version, and review does not catch it reliably |

**Check that premise first.** If you set versions by hand, the
recommendation falls, and `none` is just as good an answer. The reason rests
on that premise and only holds for repositories it describes.

**For `commits.scopes`, governance has no answer to recommend**, and that is
information: scopes name **your** areas, and governance does not know them.
A default list would be a guess dressed as a recommendation. Write one word
per area you want to be able to filter on, and not one more. **`[]` is a
full answer**: a single-area repository has nothing to name, and a list
invented on adoption ages worse than no list.

`commitlint` adopted, although its premise does not hold yet: this
repository does not generate its versions from commit messages (no tags, no
release tooling, `version` set by hand). It is kept anyway because
`@commitlint/cli` and `@commitlint/config-conventional` are already
installed, and because this repository ships the ADR-0006 check and runs it
on its own history.

The scopes are the ones the history already uses: `adr` for the shipped
questions, `checks` for the check scripts, `openspec` for change proposals,
and `readme` for the README.

**Departure: the CI commit check skips Dependabot's pull requests.** The
ADR-0006 step of `.github/workflows/ci.yml` does not run on a pull request
authored by `dependabot[bot]` (ADR-0018). Dependabot's commit bodies start
with a `Bumps [name](url) from a to b.` line that passes commitlint's
100-character body limit for most packages, and Dependabot has no setting
for the body. Its titles, which the squash merge of ADR-0009 keeps, are
`chore: bump …`, a type with no scope, set by `.github/dependabot.yml`.
Installs and tests still run on those pull requests and the required `test`
check still reports. Every other pull request is checked as before; a
commit a person pushes to a Dependabot branch is not, and review catches it.

## Consequences

### Positive

- An agent picks a scope from four words instead of inventing one.
- `ontrack check` runs commitlint on this repository, which is also the
  test bench of the check governance ships.

### Negative

- Nothing runs the check automatically until a CI job calls it
  (ADR-0011).
- A new area (for example a docs site) needs a new scope added here first.

### Neutral

- The eleven types and the breaking-change syntax apply whatever is ruled
  here.

## Alternatives Considered

### A closed list of scopes

One word per area of the repository, decided once. Filterable history; the
list needs updating when areas change.

### No scopes

`feat:` with no parentheses. A sound answer for a single-area repository;
write `[]`, not nothing.

### `commitlint`

The reference tool, run in CI: it refuses the pull request, so it also
protects what arrives through the forge.

### `hook`

A local check before each commit. It warns earlier, but it does not see what
is pushed from a machine that does not have it installed.

### No tool

Review keeps the convention. Enough when versions are set by hand.

## References

- Suggested skills: `commit` from `source-control@melodic-software`.
- Adapted from surdesrails [SDR-0006](https://github.com/trivoallan/surdesrails/blob/main/resources/docs/adr/SDR-0006-commits.md), revision 1.
- [Conventional Commits](https://www.conventionalcommits.org/).
- [ADR-0001](ADR-0001-record-architecture-decisions.md): how governance ADRs are ruled on.
- [ADR-0009](ADR-0009-branching.md): with `squash`, the merge message is the one that carries the type.

**The keys.**

| Key | What it holds | Allowed values |
| --- | --- | --- |
| `commits.scopes` | the scopes allowed in this repository | a list of words, or `[]` |
| `commits.tool` | what enforces the convention, and **where** | `commitlint` in CI, `hook` locally, or `none` |

**What these keys do not cover:** the eleven types and the breaking-change
syntax. They come from governance and are not declared here.

**An empty key is not an answer**: both are required. `[]` and `none` are
answers; empty is not. The value is written in this file and nowhere else;
whoever needs it links here. See ADR-0001 for the check command.

# Design

## Context

Two unarchived changes touch the same requirements. `run-pinned-tools` is
complete and modifies `adr-format`'s "Schema check" and "Check line" and
`adr-catalog`'s ADR-0025 and ADR-0001 requirements. This change's deltas for
those four are built from `run-pinned-tools`' text.
`rename-to-ontrack-engineering` still has open tasks for the person and
modifies `readme` requirements. This change leaves `readme` alone.

This repository runs its own checks from source (`node checks/…ts` in
`ci.yml`) and from the `docs/adr/trivoallan/` copies imported through the
`trivoallan` devDependency. Those copies change only at a re-import, after
ADR-0020's three-day cooldown.

## Goals / Non-Goals

**Goals:**
- One command name everywhere this package writes it, with the old name kept
  for one version.

**Non-Goals:**
- Removing the alias. A later change does that and is breaking. An issue
  tracks it.
- Renaming "governance" where it names the project rather than what the
  package ships ("governance's own workflows", "governance's false
  positive", the References sections). That is a separate wording sweep.
- Re-importing `docs/adr/trivoallan/` in this change.

## Decisions

**Alias as a second `bin` entry.** `package.json` maps both names to
`dist/ontrack-engineering-check.js`. npm links both into `node_modules/.bin`.
No wrapper script is needed, and the usage line names the new command
whichever name was typed. Alternative considered: a two-line
`dist/governance-check.js` that imports the new one. That is an extra
shipped file and an extra entry in `files`, for no behaviour gained.

**Specs: rename only where a statement would become false.** The ADRs'
`check:` lines change, so every `adr-catalog` and `adr-format` requirement
that quotes one is modified. The `adr-checks` command requirement is
renamed, and it states that its sibling requirements naming
`governance-check` hold for both names. Those siblings, and the scenarios in
`readme`, `repo-tooling` (whose copy keeps the old line until the re-import)
and `dependency-updates`, stay true through the alias. They are renamed
by the change that removes it. Alternative considered: modifying every
requirement that names the command, about thirty. That copies whole
blocks for a word, and it collides with `run-pinned-tools` and
`rename-to-ontrack-engineering` on the requirements they modify.

**"this package" in prose.** Comments, messages and shipped ADR sentences
that say "governance ships" say "this package ships". That stays true
under a later rename and is shorter than the package name.

**Archive order.** `run-pinned-tools` is archived before this change, so
that this change's `adr-format` and `adr-catalog` deltas apply over its text.

**ADR-0022 left to `review-by-key`.** `review-by-key` (#128) removes the
ADR-0022 requirement this change first modified. It adds its own, which
quotes `governance-check`. It cannot be archived yet, because its
`adr-checks` delta lacks a scenario `main` now holds. So this change's
delta does not touch ADR-0022's requirements. The ADR file calls the new
name, and the spec text stays true through the alias. #129 renames it with
the rest.

## Risks / Trade-offs

- [A consumer re-imports after the alias is removed but never ran a
  version that had both names] → it gets the new `check:` lines in the same
  import, so nothing breaks. Only a consumer that upgrades the package
  without re-importing breaks, and the alias version gives it a release's
  worth of time.
- [`checks/governance-check.test.ts` is renamed, so its history is harder to
  follow] → `git mv` keeps the rename detectable, and `git log --follow`
  finds it.
- [Specs keep the old name in places for one version] → the `adr-checks`
  command requirement says the two names are equivalent, and the
  alias-removal issue lists the requirements to rename.

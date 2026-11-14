# Design

## Context

`checks/governance-check.mjs` (131 lines) finds the repository's copy of an
ADR, reads one `traits.<group>` block line by line with no YAML parser
(`readTraits`), and dispatches through `CHECKS = { 'ADR-0006': commits }`.
Anything else exits non-zero with "governance ships no check". The rows to
add are listed in `specs/adr-checks/spec.md`; this document covers how they
are encoded and run.

## Goals / Non-Goals

**Goals:**
- One generic function plus data: adding a row touches only the table.
- Keep the ADR-0006 path and its tests unchanged.

**Non-Goals:**
- A YAML parser, a glob library, or any new runtime dependency.
- Reading a file's structure (JSON keys, workflow jobs). `contains` is a
  substring test.

## Decisions

**The table is data in the same file.** `WIRING` maps an ADR number to a list
of `{ group, key, rows }`, where `rows` maps a value to a row. A row is
`{ exists: [[alt, …], …] }`, `{ contains: { in, any: [str, …] } }` or
`{ path: true }`. Values sharing a row (`blocking`, `informative`) list the
same object. Two cases need code rather than data and get a small function in
place of a row: the arc42 root read from ADR-0008, and the automerge row that
depends on `dependencies.updater`. A row may therefore be a function
`(traits, root) => row | null`, where `null` means nothing to check.
*Alternative:* one file per ADR under `checks/`. Rejected: it multiplies
files and `package.json` `files` entries for what is ten lines of data.

**Tracked files come from one `git ls-files -z` call.** Every row matches
against that list, so ignored folders (`node_modules`) are skipped for free,
and a file that exists only in the working tree does not count, because
wiring that was never committed is not wiring. Patterns are turned into
`RegExp` by a small helper handling only `*` (no `/`) and a leading `**/`
(any directory). `contains` reads the matching files with `readFileSync`.
*Alternative:* `fs.globSync` (Node 22). Rejected: it walks the working tree,
untracked and ignored files included.

**Dispatch order: dedicated check, then the table, then "no check".**
`main` stays the single entry point; the "no check" error message and exit
code are unchanged, so the existing test still holds.

**Unforeseen values pass, unset keys fail.** This differs from ADR-0006, where
an unknown `commits.tool` is an error: there the check must run a tool and
cannot guess one, whereas a wiring row is only evidence, and missing a row
for a legitimate value must not fail a repository. An empty key still means
the ADR was accepted without being ruled, which is an error in both.

**Output.** One line per trait: `ADR-0018: dependencies.updater is dependabot,
found .github/dependabot.yml` on standard output; on failure,
`ADR-0018: dependencies.updater is dependabot, but no tracked file matches
.github/dependabot.yml or .github/dependabot.yaml` on standard error. All
traits are evaluated before exiting, so one run reports every gap.

**`readTraits` is reused per group.** ADR-0012 has two groups (`delivery`,
`deployment`); the wiring check calls `readTraits` once per group. Numeric
values (`build_level: 2`) come back as the string `'2'`, which is what the
row keys use.

## Risks / Trade-offs

- [A file present but empty or wrong passes] → Accepted ceiling, stated in
  every how-to-rule note. Content checks get added row by row when a real
  drift shows they are worth it.
- [`contains` matches a commented-out line in a workflow] → Accepted, for the
  same reason.
- [The arc42 row couples ADR-0010 to ADR-0008] → It falls back to `docs/`, the
  value ADR-0008 recommends, when ADR-0008 is missing or empty, so ADR-0010
  can still be checked on its own.
- [A repository that accepted these ADRs without setting them up starts
  failing `ontrack check`] → Intended. `ontrack plan` shows the new `check:`
  line before `ontrack apply` writes it, so the repository sees it coming.
- [The table lags behind the ADRs' allowed values] → An unforeseen value
  passes with "nothing to check", so the lag shows up as a gap in coverage,
  never as a false failure.

## Migration Plan

Nothing to migrate in governance. Consuming repositories pick up the new code
with their next update of the governance package; `ontrack apply` then syncs
the `check:` line into each of the seven ADRs, ruled ones included (ontrack's
`check` / `synced` categories). Rollback: removing a row or a `check:` line
changes no `revision`, and `apply` removes the line the same way.

## Open Questions

- Which consuming repository serves as the first real test (ADRs `accepted`
  with traits filled). Until there is one, only the throwaway repositories in
  the tests exercise the rows.

# Design

## Context

After `migrate-checks-to-typescript` (#31), `checks/governance-check.ts`
holds every check. `main` walks `argv` by hand (`--from`, `--branch`, else
"unknown argument"). `readTraits` reads one `traits.<group>` block line by
line into `Record<string, string | string[]>`, `''` for an empty key, and
each check then tests its keys with `if` statements: ADR-0006 (`tool` in
`hook | none | commitlint`, `scopes` a list), ADR-0009 (`prefixes` a
non-empty list), ADR-0015 (`guard`), ADR-0016 (`framework`, `schema`), and
`wiring()` for every wiring entry (`!value` is "not set", then
`String(value)`, which is how a list slips through). `docsRoot` reads
ADR-0008's `docs.root` with a fallback. See proposal.md for motivation.

**Order:** this change assumes #31 has landed and edits the `.ts` file. It
lands before `enforce-test-coverage` (#33), which has no dependency on it
but measures the code it adds; the order avoids two changes rewriting
`package.json` at once.

## Goals / Non-Goals

**Goals:**
- One declared schema per boundary, next to the code that reads it
  (ADR-0005: "the model lives next to the boundary it guards").
- Types of options and traits derived from the schemas (`z.infer`), replacing
  #31's hand-written trait types.
- Every message the `adr-checks` spec fixes stays word for word.

**Non-Goals:**
- A YAML parser: `readTraits` keeps producing the raw record; zod validates
  that record, it does not read the file.
- Validating keys a check does not read.

## Decisions

**`util.parseArgs`, then zod.** `parseArgs({ strict: true,
allowPositionals: true, options: { from: string, branch: string } })`
tokenizes `argv` and refuses unknown options and missing values, naming the
option. A zod object then validates the result: exactly one positional (the
ADR number, else the usage line), `from` defaulting to `origin/HEAD`,
`branch` to `''`. Both errors become a `CheckError`. *Alternative:* keep the
hand loop and validate its output with zod; the loop is the hand-written
check ADR-0005 removes. *Alternative:* a CLI library (commander, yargs), a
second runtime dependency for two options.

**One small schema vocabulary, messages kept.** Two field builders cover
every key: one value (`z.string().min(1)`, refusing an array) and a list
(`z.array(z.string())`). Each dedicated check declares
`z.object({ ... })` for its group; ADR-0006's `tool` is
`z.enum(['commitlint', 'hook', 'none'])` because the spec fails unknown
values there, while `secrets.guard` and `changes.framework` stay open
strings because the spec lets unforeseen values pass. One helper,
`traitsOf(schema, number, group, file, text)`, runs `safeParse` and turns
the first issue into the spec's message for that kind of issue: missing or
empty is "`<number>: <group>.<key>` is not set in `<file>`; the ADR is not
ruled", a non-array where a list is expected is "is not a list", an enum
miss is "has an unknown value", any other shape is "is not <expected>". The
issue's `path` gives `<key>`. *Alternative:* zod's default messages, which
would change messages the spec and the tests fix.

**Wiring validates per entry.** `wiring()` builds, for each entry, the
one-value field and reports every failing entry before returning, as today
(one run shows every unset key). ADR-0018's `automerge` row reads the
validated `updater`.

**`docsRoot` keeps its fallback.** An absent or empty `docs.root` still
means `docs/`; a list there now falls back too rather than failing, because
ADR-0010's check is not the place to rule on ADR-0008.

**zod 4, declared before install.** The latest 4.x at least three days old,
caret range in `dependencies`, asked for and declared in ADR-0020's form
(source: zod's documentation and repository; provenance from
`npm audit signatures`). zod has no install script and no dependency of its
own. It is imported from the top of the check; Node resolves it from
governance's own `node_modules` in the consumer.

## Risks / Trade-offs

- [A consumer whose ADR has a list where one value is expected now fails
  where it passed] → Intended: the value was never what the check read. The
  message names the key, and the release notes (`fix` commit) say so.
- [zod's install size in every consumer] → Accepted by ADR-0005's Negative
  consequence; it is a dev dependency of the consumer, never shipped by it.
- [zod 4 issue codes change] → The mapping lives in one helper, and the
  wrong-shape tests pin the messages.

## Migration Plan

None. Consumers get zod with their next update of governance; `ontrack
check` lines are unchanged.

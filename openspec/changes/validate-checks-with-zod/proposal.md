# Proposal

## Why

ADR-0005 rules `validation.boundary: zod` and names the two boundaries of
`governance-check`: its command-line arguments and the ADR traits it reads.
Both are checked by hand today, field by field (#32), and one shape slips
through: a list where a single value is expected (`secrets.guard:
[gitleaks]`) is turned into a string and passes as "nothing to check".

This change assumes `migrate-checks-to-typescript` (#31) has landed: it
edits `checks/governance-check.ts`, not the `.mjs` file, and replaces the
trait types #31 writes by hand with types derived from the schemas.
`enforce-test-coverage` (#33) comes after it.

## What Changes

- The arguments are parsed with Node's `util.parseArgs` and validated, with
  their defaults, by one zod schema next to `main`.
- Each check declares the zod schema of the trait group it reads, next to
  the check; a wiring entry's key is validated as one non-empty value.
  Values the checks let pass today (unforeseen wiring values, `hook`,
  `none`) still pass.
- A trait of the wrong shape now fails, naming `<group>.<key>`, instead of
  being stringified. The messages the spec already fixes ("is not set",
  "is not a list", "unknown value") are kept.
- `zod` becomes the package's first runtime dependency (`dependencies`),
  admitted under ADR-0020 (`approver: person`).

Out of scope: replacing the line-based frontmatter reader (`readTraits`)
with a YAML parser; validating ADR files statically (mdschema already does,
ADR-0001); the coverage threshold (#33); npm 12 and the cooldown setting
(#42).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-checks`: arguments and traits are validated against declared schemas
  before a check acts on them; a trait of the wrong shape fails; the package
  declares one runtime dependency.

## Impact

- `checks/governance-check.ts`: schemas next to `main` and each check; the
  hand-written `if` checks on traits and arguments go.
- `checks/governance-check.test.ts`: tests for the wrong-shape and argument
  scenarios; existing tests unchanged.
- `package.json` gains `dependencies: { zod }`; `package-lock.json` follows.
- Every consuming repository installs `zod` with governance (ADR-0005,
  Negative consequence).

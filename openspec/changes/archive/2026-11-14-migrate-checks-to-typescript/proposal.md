# Proposal

## Why

ADR-0004 rules `languages.main.name: TypeScript`, but the checks
(`checks/governance-check.mjs` and its test) are plain JavaScript (#31).
Consumers run `governance-check` from `node_modules`, where Node refuses to
strip types, so the package has to compile the TypeScript and ship the
JavaScript. This change comes first of three: ADR-0005's zod validation
(`validate-checks-with-zod`, #32) and ADR-0007's coverage gate
(`enforce-test-coverage`, #33) both edit the files it renames.

## What Changes

- `checks/governance-check.mjs` becomes `checks/governance-check.ts`, and
  `checks/governance-check.test.mjs` becomes `checks/governance-check.test.ts`,
  with types added and behaviour unchanged.
- A `tsc` build compiles the check to `dist/governance-check.js`, which
  becomes the package's `bin` and the only script in `files`. `dist/` is not
  tracked.
- The package builds itself on `prepare`, so an install from a git tag
  (which README documents) and `npm publish` both get the compiled file.
- `npm test` type-checks, then runs the tests against the TypeScript source,
  which Node runs directly outside `node_modules`.
- The release workflow's publish job installs from the lockfile (`npm ci`)
  before publishing. Today it skips the install because nothing is built.
- `typescript` and `@types/node` become dev dependencies, admitted under
  ADR-0020 (`approver: person`).

Out of scope: validating arguments and traits with zod (#32), the coverage
threshold (#33), a CI workflow running `npm test` (#35), npm 12 and the
release cooldown (#42). The ruled ADR texts that name the `.mjs` file
(ADR-0004, ADR-0005) are left as written at ruling time.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-checks`: the command ships as compiled JavaScript that runs from
  `node_modules`, installed from npm or from a git tag.

## Impact

- `checks/`: two files renamed to `.ts` and typed. Still one check file.
- New `tsconfig.json`; `.gitignore` gains `dist/`.
- `package.json`: `bin`, `files`, `scripts` (`build`, `prepare`, `test`),
  two dev dependencies; `package-lock.json` follows.
- `.github/workflows/release.yml`: `npm ci` before `npm publish`, and the
  "No install" comment goes.
- Consumers: no change to the `check:` lines or to `npx --no-install
  governance-check`. A consumer installing from git now runs governance's
  `prepare` (a `tsc` build) at install time.

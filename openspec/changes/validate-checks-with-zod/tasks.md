# Tasks

## 1. Dependency

- [x] 1.1 Confirm `migrate-checks-to-typescript` has landed (`checks/governance-check.ts` exists); ask before installing, in ADR-0020's form, for `zod` (latest 4.x at least three days old, source, why, provenance from `npm audit signatures`); on a yes, `npm install zod`; verify `dependencies` in `package.json` holds exactly `zod` and the lockfile entry has no install script

## 2. Arguments

- [x] 2.1 Replace the `argv` loop in `main` with `util.parseArgs` (strict, positionals) and a zod schema giving the ADR number and the `from`/`branch` defaults; verify in `checks/governance-check.test.ts` the "Option without its value" and "Unknown option" scenarios, and that the existing `--from` and `--branch` tests still pass

## 3. Traits

- [x] 3.1 Add the one-value and list field builders and the `traitsOf` helper mapping zod issues to the spec's messages; declare the schemas of ADR-0006, ADR-0009, ADR-0015 and ADR-0016 next to their checks, derive their types with `z.infer`, and remove the hand-written `if` checks; verify the "A list where one value is expected" and "One value where a list is expected" scenarios and that every existing ADR-0006/0009/0015/0016 test still passes unchanged
- [x] 3.2 Validate each wiring entry with the one-value field, reporting every failing entry; keep `docsRoot`'s fallback; verify the "Unforeseen wiring value still passes" scenario, a wiring key given as a list failing with its `<group>.<key>`, and every existing wiring test passing unchanged
- [x] 3.3 Run `npm test`; verify every test passes and that, outside `readTraits`, no trait key is tested by hand any more (`git diff` review)

## 4. End to end

- [ ] 4.1 In a scratch consumer, install the tarball from `npm pack`, rule ADR-0015 with `guard: [gitleaks]`, and run `npx --no-install governance-check ADR-0015`; verify it exits non-zero naming `secrets.guard`, and that `zod` was installed with governance
- [ ] 4.2 Run `openspec validate validate-checks-with-zod --strict`; verify it passes

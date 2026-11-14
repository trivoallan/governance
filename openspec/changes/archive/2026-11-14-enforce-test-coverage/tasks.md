# Tasks

## 1. Coverage gate

- [x] 1.1 Confirm `migrate-checks-to-typescript` has landed (`checks/governance-check.ts` exists and `npm test` runs `checks/*.test.ts`); run `node --test --experimental-test-coverage --test-coverage-include='checks/*.ts' --test-coverage-exclude='checks/*.test.ts' checks/*.test.ts`; verify the report lists only `checks/governance-check.ts`, at 90 % lines or more
- [x] 1.2 Add those flags and `--test-coverage-lines=90` to the `test` script in `package.json`; verify `npm test` exits `0` and prints the report ("At or above the threshold", "Tests not counted")
- [x] 1.3 Temporarily raise the flag to `100` and run `npm test`; verify it exits non-zero with the "does not meet threshold" line ("Below the threshold"), then restore `90`

## 2. Threshold follows ADR-0007

- [x] 2.1 In `checks/governance-check.test.ts`, add a test comparing `--test-coverage-lines=<n>` in `package.json`'s `test` script with `coverage_target:` in `docs/adr/trivoallan/ADR-0007-tests.md`, failing with both values; verify it passes, and fails naming `95` and `90` when ADR-0007 is temporarily set to `95` ("ADR-0007 ruled higher than the script")

## 3. Wrap-up

- [x] 3.1 Run `npm test` and `openspec validate enforce-test-coverage --strict`; verify both pass

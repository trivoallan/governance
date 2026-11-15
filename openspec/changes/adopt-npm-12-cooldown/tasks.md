# Tasks

## 1. npm 12 locally

- [x] 1.1 Ask the person to run `npm install --global npm@12.2.2` on the machine (it changes a global install); verify `npm --version` prints `12.2.2` (already the case on 2026-11-15)
- [x] 1.2 On or after 2026-11-17 (cooldown on `@trivoallan/ontrack` 0.3.0, published 2026-11-14), replace the devDependency `ontrack: github:trivoallan/ontrack#v0.2.0` with `@trivoallan/ontrack` from the registry (`npm uninstall ontrack && npm install --save-dev @trivoallan/ontrack`); verify `package-lock.json` has no `github:trivoallan/ontrack` entry, `npx ontrack --help` runs, and `npm test` passes (done on 2026-11-15, the maintainer's choice not to wait: installed once with `--min-release-age=0`; lockfile pins 0.3.0 from the registry, no Git entry, `npx ontrack --help` and `npm test` pass)
- [x] 1.2b On or after 2026-11-17 (cooldown on `@trivoallan/ontrack-governance` 0.4.0, published 2026-11-14), replace the devDependency `trivoallan: github:trivoallan/governance` with the alias `"trivoallan": "npm:@trivoallan/ontrack-governance@^0.4.0"`; verify `package-lock.json` has no `git+` entry left, `node_modules/trivoallan/adr/` exists, and `npm ci` no longer fails with `EALLOWGIT` (done on 2026-11-15, same exception; `node_modules/trivoallan/adr/` holds the ADRs of 0.4.0, `npm ci` passes)
- [x] 1.3 Run `npm ci`, then `npm approve-scripts --allow-scripts-pending`; verify it completes, and record every package it lists and any diff in `package-lock.json` (2026-11-15: `npm ci` passes under the cooldown; `npm approve-scripts --allow-scripts-pending` prints "No packages with unreviewed install scripts.")
- [x] 1.4 For each listed package (expected: none after 1.2), put ADR-0020's declaration to the person; on a yes run `npm approve-scripts <pkg>` and verify `package.json` gains that `allowScripts` entry only, on a no leave it blocked; if one was admitted, correct ADR-0020's ruling sentence "No package in `package-lock.json` has an install script" to name it, and verify with `git diff` that no trait or `revision` changed (nothing listed, so nothing to admit; ADR-0020 unchanged)

## 2. Configuration

- [x] 2.1 Write `.npmrc` with `min-release-age=3` and comments naming ADR-0020 rule 2 and saying npm 10 ignores the key; verify `npm config get min-release-age` prints `3` and `grep -E '^(before|ignore-scripts)' .npmrc` prints nothing
- [x] 2.2 Add `"devEngines": { "packageManager": { "name": "npm", "version": ">=12.2.2", "onFail": "warn" } }` to `package.json`; verify `npm ci` on npm 12 prints no devEngines warning, and that it prints one naming the required version when `version` is set to `>=99` for the test (then restore `>=12.2.2`) (verified in a scratch project on 2026-11-15: no warning with `>=12.2.2`, `EBADDEVENGINES` naming the version with `>=99`; this repository's own `npm ci` waits for 1.2 and 1.2b)
- [x] 2.3 Verify the cooldown (2026-11-15: `@trivoallan/ontrack@0.3.0` refused with `ETARGET`, no version before 2026-11-12): pick a package version published less than three days ago (`npm view <name> time`), run `npm install --dry-run -D <name>@<version>`; verify npm refuses it

## 3. CI

- [x] 3.1 Check that `add-ci-gate` is merged and `.github/workflows/ci.yml` has its `npm ci` step; stop here if not (merged: `ci.yml` has the `npm ci` step)
- [x] 3.2 In `ci.yml`, add `npm install --global npm@12.2.2` before the install with a comment (why, and that nothing updates it), and change `npm ci` to `npm ci --strict-allow-scripts`; verify `actionlint` reports no error and `act -l` still lists the single job `test` (actionlint passes, `act -l` lists `test` only; zizmor flags the global install as `adhoc-packages`, so an inline ignore with its reason is proposed for the person to merge, per ADR-0011 rule 2)
- [ ] 3.3 Open the pull request (`build:` type, no scope); verify the `test` log shows npm `12.2.2` running `npm ci --strict-allow-scripts` and the check passes
- [x] 3.4 Run `openspec validate adopt-npm-12-cooldown --strict`; verify it passes

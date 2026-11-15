# Proposal

## Why

ADR-0020 rules `admission.install_scripts: ignored` and a three-day
cooldown on added versions, but this repository installs with npm 10.9.8,
which runs every dependency's install scripts, and has no `.npmrc` (issue
#42). Its own Consequences say rules 2 and 5 and `ignored` stay intentions
until npm 12, `min-release-age=3` and `npm ci` in CI are in place.

## What Changes

- `.npmrc` with `min-release-age=3` (rule 2), commented with the rule and
  the npm versions that honour it, as in ontrack.
- npm 12 required to install: `package.json` gains
  `devEngines.packageManager` (`npm`, `>=12.2.2`, `onFail: warn`), so an
  older npm says so on `npm install` and `npm ci`; the machine that works on
  this repository moves to npm 12.2.2.
- `.github/workflows/ci.yml` (from `add-ci-gate`): a step
  `npm install --global npm@12.2.2` before the install, and the existing
  `npm ci` line becomes `npm ci --strict-allow-scripts`, so a blocked
  install script fails CI instead of warning.
- The Git devDependency `ontrack` (`github:trivoallan/ontrack#v0.2.0`),
  whose `prepare` script npm runs on a Git install, is replaced by the
  registry package `@trivoallan/ontrack`. A registry tarball ships built, so
  npm runs no `prepare`, and ADR-0020's ruling ("no package has an install
  script") becomes true instead of being amended. `allowScripts` stays
  empty; any other script npm 12 blocks goes through
  `admission.approver: person` first.
- The Git devDependency `trivoallan` (`github:trivoallan/governance`, this
  repository importing itself as an ontrack source) becomes the npm alias
  `"trivoallan": "npm:@trivoallan/ontrack-governance@^0.4.0"`. npm 12
  refuses every Git dependency by default (`allow-git = "none"`), so
  `npm ci` fails on both Git devDependencies until they come from the
  registry. The alias keeps the installed name `trivoallan`, which the
  ontrack namespace reads. `allow-git` stays at its default.

**Ownership of the CI install:** `add-ci-gate` (#35) writes the `npm ci`
line (rule 5). This change adds no install of its own: it only changes the
npm that runs that line and adds `--strict-allow-scripts`.

## Capabilities

### New Capabilities

- `dependency-installs`: how dependencies are installed here, locally and
  in CI: npm 12, the cooldown, and which install scripts may run.

### Modified Capabilities

None. `ci` comes from `add-ci-gate` and is not yet in `openspec/specs/`;
what this change requires of the CI install is stated in
`dependency-installs`.

## Impact

- New file: `.npmrc`. Edited: `package.json` (`devEngines`,
  `ontrack` → `@trivoallan/ontrack`, `trivoallan` → the
  `@trivoallan/ontrack-governance` alias, `allowScripts` only if a person admits
  an exception), `package-lock.json`, `.github/workflows/ci.yml` (two lines).
- `.github/workflows/release.yml` is unchanged: its publish job installs
  nothing.
- **Depends on `add-ci-gate`** for the CI part (it edits `ci.yml`). The
  `.npmrc` and local npm 12 parts do not depend on it.
- Independent of `configure-dependabot`; Dependabot's own three-day
  cooldown and this `.npmrc` agree.

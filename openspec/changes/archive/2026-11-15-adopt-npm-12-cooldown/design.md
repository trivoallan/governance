# Design

## Context

Local npm is 10.9.8 (Node 22.23.2); CI, once `add-ci-gate` lands, runs
`npm ci` on Node 24, which ships npm 11. npm 12.2.2 is the latest release
(published 2026-11-04, older than the cooldown) and requires Node
`^22.22.2 || ^24.15.0 || >=26`, which both machines meet. There is no
`.npmrc`. `package-lock.json` has no `hasInstallScript` entry, but its Git
devDependency `ontrack` (`github:trivoallan/ontrack#v0.2.0`) declares
`prepare: npm run build`, which npm runs when it installs a Git dependency.
ontrack is also published to npm as `@trivoallan/ontrack` (0.3.0, published
2026-11-14; the unscoped `ontrack` name belongs to someone else).
ontrack already runs this setup (`.npmrc` with `min-release-age=3`,
`npm install --global npm@12.2.2` in its workflows).

## Goals / Non-Goals

**Goals:**
- No dependency code runs at install time here unless a person named it.
- No added version younger than three days, by configuration.

**Non-Goals:**
- `npm audit signatures` (ADR-0020 rule 4, a per-addition declaration).
- Changing `release.yml`, which installs nothing.
- Changing ADR-0020's traits or its check (it has no `check:` line).

## Decisions

**`npm install --global npm@12.2.2` in CI, exact version.** Same as ontrack.
setup-node installs the npm that comes with Node, and Node 24 ships npm 11,
which knows `allowScripts` but runs scripts anyway. A comment says the line
can go once the Node version used ships npm 12, and that nothing updates it
(Dependabot reads no `run:` line). *Alternative:* Node 26 if it ships npm
12. Rejected for now: it moves CI away from `release.yml`'s Node 24 for an
unrelated reason. *Alternative:* corepack. Rejected: Node no longer bundles it
from version 25.

**`npm ci --strict-allow-scripts` in CI only.** ADR-0020 names
`strict-allow-scripts` as the CI switch. Locally a blocked script stays a
warning, so `npm approve-scripts --allow-scripts-pending` can list it
before anyone decides. Never `ignore-scripts=true`: it would also stop the
named exceptions.

**`devEngines.packageManager` with `onFail: warn`.** An agent or a person
on npm 10 or 11 is told, on every install, that this repository expects
npm 12. *Alternative:* `onFail: error`. Rejected: Dependabot's npm updater
runs its own npm version to rewrite the lockfile, and an error there would
stop every npm update `configure-dependabot` proposes. *Alternative:*
nothing in `package.json`, as ontrack. Rejected: ADR-0020 is about the
agent's session, and that is where an old npm would go unnoticed.

**`.npmrc` holds `min-release-age=3` and nothing else.** No exclusion: the
packages from this owner (`@trivoallan/ontrack`, and
`@trivoallan/ontrack-governance` through the `trivoallan` alias) wait three
days like any other. The file explains, in comments,
the rule it serves and that npm 10 ignores the key silently.

**ontrack from the registry, not from Git** (maintainer's choice). The
devDependency becomes `"@trivoallan/ontrack": "<version>"`, exact or `^`
like the other devDependencies. A registry install runs no `prepare`, so
nothing needs `allowScripts`, and ADR-0020's ruling stands as written.
Rejected: admitting `ontrack`'s `prepare` in `allowScripts` (an install
script kept forever for a build the registry already did), and building on
`prepack` (does not touch the dependency side). Timing: 0.3.0 was published
on 2026-11-14, so `min-release-age=3` refuses it before 2026-11-17; the swap
is done on or after that date, or with an older-than-three-days release.
The `package.json` script names that call `ontrack` (if any) keep working:
the bin is still `ontrack`.

**`trivoallan` from the registry too, through an npm alias** (maintainer's
choice, after implementation found it). npm 12.2.2 ships
`allow-git = "none"`: `npm ci` refuses both Git devDependencies with
`EALLOWGIT`, not only their scripts. The second one, `trivoallan`
(`github:trivoallan/governance`), is governance importing itself as an
ontrack source. It becomes
`"trivoallan": "npm:@trivoallan/ontrack-governance@^0.4.0"`: the package
is installed as `node_modules/trivoallan`, the name the ontrack namespace
reads, from the registry. *Alternative:* `allow-git` in `.npmrc` for the
two repositories. Rejected: it reopens what npm 12 closes, and `.npmrc`
keeps one key. Timing: 0.4.0 was published on 2026-11-14 21:06 UTC, so the
cooldown admits it from 2026-11-17, the same day as `@trivoallan/ontrack`.

**One install outside the cooldown, decided by the maintainer.** On
2026-11-15 the maintainer chose not to wait for 2026-11-17. The two swaps
were installed once with `npm install --min-release-age=0`: both packages
are this owner's own releases, published from its own workflows with
provenance. `.npmrc` is unchanged, and `package-lock.json` now pins
`@trivoallan/ontrack` 0.3.0 and `@trivoallan/ontrack-governance` 0.4.0.
`npm ci` installs them under the cooldown, because it does not resolve
again. Any later addition waits three days.

**`trivoallan` now follows governance's releases, not its default branch.**
The Git dependency took `main`'s head on each install. The alias takes a
published version, so `ontrack plan` here compares against 0.4.0. It
reported 3 ADRs revised on 2026-11-15, and newer ADRs arrive with the next
release.

**Blocked scripts found on the move are admissions, not chores.** After
`npm ci` on npm 12, `npm approve-scripts --allow-scripts-pending` lists
what was blocked; after the swap the list is expected to be empty. Each package listed is
put to the person in ADR-0020's declaration form. On a yes,
`npm approve-scripts <pkg>` writes the `allowScripts` entry and the
ruling paragraph of ADR-0020, which says no package has an install script,
is corrected. On a no, the script stays blocked; that is the person's
call, not the agent's.

## Risks / Trade-offs

- [`@trivoallan/ontrack` behaves differently from the Git v0.2.0 build]
  → Run `npx ontrack check` (or the scripts that use it) after the swap and
  before the pull request; a diff in behaviour goes in the pull request.
- [The swap is tried before 2026-11-17] → `npm install` refuses 0.3.0 under
  the cooldown; wait, rather than lower `min-release-age`. CI does not use `ontrack` (the ADR-0006
  step runs `checks/governance-check.mjs` directly), so no other step breaks.
- [npm 12 handles Git dependencies differently, or rewrites the lockfile]
  → Run `npm ci` and `npm install` on npm 12 locally first; a lockfile diff
  goes in the same pull request.
- [The npm version in CI goes stale] → Accepted, as in ontrack; it is one
  line with a comment.
- [`devEngines` warns in Dependabot's logs] → Harmless; it does not stop the
  update.

## Migration Plan

1. Locally: `npm install --global npm@12.2.2`, then `npm ci`, then
   `npm approve-scripts --allow-scripts-pending`, and settle each listed
   package with the person.
2. Add `.npmrc` and `devEngines`; after `add-ci-gate` is merged, edit
   `ci.yml`; open one pull request.

Rollback: revert the pull request. The global npm on a machine stays at 12;
that is harmless.

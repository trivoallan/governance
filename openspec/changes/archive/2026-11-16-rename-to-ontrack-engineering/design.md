# Design

## Publishing under a new name

The release job publishes by npm trusted publishing (ADR-0012), declared on
npmjs per package. `@trivoallan/ontrack-engineering` has no version yet, so
its trusted publisher has to be declared before the first release that
carries the new name. If npmjs only lets a trusted publisher be declared on
an existing package, the person publishes that first version by hand, from
the release tag, then declares `release.yml`.

The commit that renames is `feat!`, so release-please cuts 0.6.0 (minor
before 1.0.0, `bump-minor-pre-major`), and the release notes' highlights say
what a consumer must do: change the alias's target.

## The self-import

This repository imports its own ADRs through the `trivoallan` devDependency.
It keeps `npm:@trivoallan/ontrack-governance@^0.5.1` until
`@trivoallan/ontrack-engineering` 0.6.0 is three days old: before that,
`.npmrc`'s `min-release-age=3` refuses it. Switching then is a task of this
change, not a separate one.

## Not changed

- The repository name `governance`, the `governance-check` binary and the
  ontrack namespace `trivoallan` (declared in `package.json`, not derived
  from the package name).
- The CHANGELOG and archived changes, which record history.
- The ADR-0009 test and scenario that use a release-please branch name with
  the old component: the check matches the `release-please--` prefix, so the
  example stays valid.

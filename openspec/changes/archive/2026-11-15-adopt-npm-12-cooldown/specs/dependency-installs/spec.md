# Spec Delta

## Purpose

Defines how this repository's npm dependencies are installed, locally and in
CI, so that ADR-0020's three-day cooldown and `install_scripts: ignored`
hold where code actually runs.

## ADDED Requirements

### Requirement: Release cooldown
The repository SHALL configure npm, in a tracked `.npmrc`, to install no
registry version published less than three days before the install. No
`before` date SHALL be set in the same file.

#### Scenario: Configuration read by npm
- **WHEN** `npm config get min-release-age` runs at the repository root with npm 12
- **THEN** it prints `3`

#### Scenario: Fresh release refused
- **WHEN** someone runs `npm install -D <name>@<version>` for a version published yesterday
- **THEN** npm refuses to install that version

### Requirement: Install scripts blocked
Dependencies SHALL be installed with npm 12 or later, locally and in CI. No
dependency's install script SHALL run unless the package is named in
`allowScripts` in `package.json`, and an entry SHALL be added there only
after a person approved it, as for a new package. `ignore-scripts` SHALL NOT
be set. An npm older than 12 SHALL be reported when it runs an install in
this repository.

#### Scenario: Older npm
- **WHEN** `npm ci` runs with npm 10.9.8
- **THEN** npm prints a warning naming the npm version this repository requires

#### Scenario: Unapproved script
- **WHEN** a dependency with a `postinstall` script, absent from `allowScripts`, is installed with npm 12
- **THEN** its script does not run

### Requirement: CI install on npm 12
The `test` check SHALL install with npm 12 or later, from the lockfile, and
SHALL fail when the install blocks a dependency's install script.

#### Scenario: npm version in CI
- **WHEN** the `test` check runs
- **THEN** its log shows npm 12 or later running the install

#### Scenario: Blocked script in CI
- **WHEN** a pull request adds a dependency whose install script is not in `allowScripts`
- **THEN** the `test` check fails at the install step and names the package

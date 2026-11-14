# Spec Delta

## ADDED Requirements

### Requirement: Shipped as JavaScript
governance's package SHALL ship `governance-check` as JavaScript that Node
22.18 or later runs from `node_modules` with no type stripping, loader or
build in the consuming repository. The installed package SHALL hold that
compiled script and no TypeScript source. It SHALL work installed from the
npm registry and installed from a git tag of governance, with the same
behaviour as every other requirement of this capability.

#### Scenario: Installed from the npm registry
- **WHEN** the package as `npm pack` builds it is installed in a repository holding a ruled ADR-0006, and `npx --no-install governance-check ADR-0006` runs there
- **THEN** the check runs and reports on ADR-0006, and no `.ts` file is in the installed package

#### Scenario: Installed from a git tag
- **WHEN** governance is installed with `npm i -D trivoallan@git+https://github.com/trivoallan/governance.git#<tag>` and `npx --no-install governance-check ADR-0006` runs
- **THEN** the check runs and reports on ADR-0006

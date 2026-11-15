# Spec Delta

## ADDED Requirements

### Requirement: ADR-0023 check
`governance-check ADR-0023` SHALL read `license.spdx` from ADR-0023.
- When it is absent or empty, the check SHALL exit non-zero and say it is not set.
- Otherwise it SHALL read the tracked root manifests: `package.json` (its `license` field) and `pyproject.toml` (its `[project] license`, as a string or as `{ text = "..." }`).
- It SHALL exit non-zero, naming the file and both values, when a tracked root manifest has no licence field or one that differs from the trait.
- When the value is not `UNLICENSED`, it SHALL also exit non-zero unless a tracked `LICENSE`, `LICENSE.md`, `LICENSE.txt` or `COPYING` exists at the root.
- When no root manifest is tracked, it SHALL check only the licence file and say no manifest was found.

The check SHALL NOT read the licence file's text, nor manifests outside the
root.

#### Scenario: Ruled and wired
- **WHEN** `license.spdx` is `MIT`, `package.json` has `"license": "MIT"` and `LICENSE` is tracked
- **THEN** the check exits `0` and names both files

#### Scenario: Manifest disagrees
- **WHEN** `license.spdx` is `MIT` and `package.json` has `"license": "ISC"`
- **THEN** the check exits non-zero and says `package.json` has `ISC` where ADR-0023 rules `MIT`

#### Scenario: No licence file
- **WHEN** `license.spdx` is `Apache-2.0`, `pyproject.toml` has `license = "Apache-2.0"` and no licence file is tracked
- **THEN** the check exits non-zero and names the file names it looked for

#### Scenario: Private repository
- **WHEN** `license.spdx` is `UNLICENSED`, `package.json` has `"license": "UNLICENSED"` and no licence file exists
- **THEN** the check exits `0`

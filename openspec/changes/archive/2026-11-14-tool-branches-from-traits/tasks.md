# Tasks

## 1. Check

- [x] 1.1 Exempt a tool branch only when ADR-0012 `delivery.release_tool` or ADR-0018 `dependencies.updater` names its tool; test the three scenarios and the edge cases, then run `npm test`

## 2. ADR

- [x] 2.1 In `adr/ADR-0009-branching.md`, say the exemption follows the ruled tools and to rule ADR-0012 and ADR-0018 with or before it; verify `revision` is unchanged

## 3. Validate

- [x] 3.1 Run `openspec validate tool-branches-from-traits --strict`; verify it passes

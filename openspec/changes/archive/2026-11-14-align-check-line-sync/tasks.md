# Tasks

## 1. ADR-0001

- [x] 1.1 Rewrite the last paragraph of rule 8 in `adr/ADR-0001-record-architecture-decisions.md` so it says that `ontrack plan` reports an ADR whose source `check:` line differs `check`, showing the line, and that `ontrack apply` reports it `synced` and writes only that line, ruled copies included; keep `revision` unchanged; verify `grep -n "by hand" adr/ADR-0001-record-architecture-decisions.md` finds no `check:` hand copy and rules 4 and 6 and the Consequences hold no contrary claim

## 2. Verification

- [x] 2.1 Run `openspec validate align-check-line-sync --strict` and `npm test`; verify both pass and `git diff --stat` touches nothing under `checks/`

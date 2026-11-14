# Tasks

Issue served: #71

## 1. ADRs

- [x] 1.1 ADR-0008 to `revision: 2`: scope to user documentation, drop the "moves with `docs.root`" sentence, reword the `docs.root` reason, warn under the `glob` snippet, reword `rejected`; verify the keys and values are unchanged
- [x] 1.2 ADR-0010 to `revision: 2`: drop "the path moves with it", say what it takes from ADR-0008, say the audience is the repository's visibility, update the check description; verify `grep -n "moves with" adr/ADR-0008* adr/ADR-0010*` prints nothing

## 2. Check

- [x] 2.1 Make the ADR-0010 arc42 row look under `docs/architecture/arc42/` only; replace the "arc42 under another root" test with one where `docs.root: site/` still reads `docs/`; verify `npm test` passes

## 3. Validation

- [x] 3.1 Run `openspec validate separate-user-and-architecture-docs --strict` and mdschema over `adr/`; verify both pass

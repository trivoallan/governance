# Tasks

## 1. ADR-0001 revision 4

- [ ] 1.1 In `adr/ADR-0001-record-architecture-decisions.md`, raise `revision` to 4 and add `directory: docs/adr` under `traits.record-architecture-decisions`. Verify the frontmatter parses and `format` is unchanged.
- [ ] 1.2 Rewrite rule 2: the ADRs a repository writes for itself live in the directory the `directory` trait names; governance ADRs are imported into `<directory>/trivoallan/`; ontrack reads `docs/adr` until it reads the trait, so change the value only once ontrack supports it. Verify against the adr-catalog delta scenarios.
- [ ] 1.3 Add `Revision 4:` to the Revisions list: `record-architecture-decisions.directory` added, shipped as `docs/adr`, nothing to re-answer unless your ADRs live elsewhere. Verify that the revisions test in `checks/` passes for ADR-0001.

## 2. Schema

- [ ] 2.1 Add `{ name: "traits.record-architecture-decisions.directory", type: string, optional: true }` under the ADR-0001 comment in `adr/.mdschema.yml`. Verify `npx @jackchuka/mdschema@0.15.1 check` accepts ADR-0001.

## 3. Verification

- [ ] 3.1 Run `npm test` and `openspec validate add-adr-directory-trait --strict`, and verify both pass, then that CI passes on the pull request.
- [ ] 3.2 After the release, take ADR-0001 revision 4 into ontrack with `ontrack plan` and `ontrack apply`, and verify `AGENTS.md` shows `directory: docs/adr`.

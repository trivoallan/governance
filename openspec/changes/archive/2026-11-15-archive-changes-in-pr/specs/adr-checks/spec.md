# Spec Delta

## MODIFIED Requirements

### Requirement: ADR-0016 check
When `changes.framework` is `openspec`, `governance-check ADR-0016` SHALL
check four things, report each, and exit non-zero when any fails:
1. `openspec/config.yaml` (or `openspec/config.yml` when it is absent) has a
   `schema:` equal to `changes.schema`; a missing file or a different value
   fails and names both values;
2. `openspec schema validate <changes.schema>` exits `0`;
3. `openspec validate --all --no-interactive` exits `0`;
4. no directory directly under `openspec/changes/`, `archive/` excluded,
   holds a `tasks.md` with at least one task and every task checked; each
   such change is named with the instruction to archive it. A change whose
   `tasks.md` is absent or holds no task is named as not checked, and does
   not fail. This step reads the files only and runs no command.

When `changes.schema` is absent or empty, the check SHALL exit non-zero and
say it is not set; when it is `none`, it SHALL exit non-zero and say that
`none` goes with `changes.framework: none`. When `changes.framework` is
`none` or another value, it SHALL print that there is nothing to check and
exit `0`. When it is absent or empty, it SHALL exit non-zero and say it is
not set.

#### Scenario: Ruled schema in use and valid
- **WHEN** `changes.schema` is `spec-driven`, `openspec/config.yaml` has `schema: spec-driven`, both openspec commands exit `0`, and no change is complete
- **THEN** the check exits `0`

#### Scenario: Config names another schema
- **WHEN** `changes.schema` is `spec-driven-with-adr` and `openspec/config.yaml` has `schema: spec-driven`
- **THEN** the check exits non-zero and its output names both schemas

#### Scenario: Invalid change
- **WHEN** `openspec validate --all --no-interactive` exits non-zero
- **THEN** the check exits non-zero with openspec's report in its output

#### Scenario: Complete change not archived
- **WHEN** `openspec/changes/add-x/tasks.md` holds `- [x] 1.1 Do it` and no unchecked task
- **THEN** the check exits non-zero and its output names `add-x` and says to archive it

#### Scenario: Change with an open task
- **WHEN** `openspec/changes/add-x/tasks.md` holds `- [x] 1.1 Do it` and `- [ ] 1.2 Merge the release pull request`
- **THEN** the archive step passes

#### Scenario: Change without tasks
- **WHEN** `openspec/changes/add-x/` has no `tasks.md`
- **THEN** the archive step passes and its output names `add-x` as not checked

#### Scenario: Archived change
- **WHEN** `openspec/changes/archive/2026-01-01-add-x/tasks.md` has every task checked
- **THEN** the archive step passes

#### Scenario: Framework none
- **WHEN** `changes.framework` is `none`
- **THEN** the check prints `ADR-0016: changes.framework is none, nothing to check` and exits `0`

#### Scenario: Schema none with openspec
- **WHEN** `changes.framework` is `openspec` and `changes.schema` is `none`
- **THEN** the check exits non-zero

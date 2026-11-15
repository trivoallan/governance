# Tasks

## 1. Archive what main left behind

- [x] 1.1 Run `openspec archive add-agent-identity-adr --yes`. Verify that `openspec/changes/archive/<date>-add-agent-identity-adr/` exists, that `openspec/specs/` holds its requirements, and that `openspec validate --all --no-interactive` passes.

## 2. ADR text

- [x] 2.1 Edit `adr/ADR-0016-changes.md`:
  - set `revision: 3`;
  - Decision: a bold paragraph "A change is archived in the pull request that checks its last task", with the case of tasks that wait for the merge, and a link to ADR-0012's definition of done;
  - Consequences, Negative: the hole (a done task left unchecked passes);
  - Alternatives: "Archive before each release" and "A `changes.archive` key", each refused with its reason;
  - References: one sentence on what the check reads for the archive rule (`tasks.md` of each change outside `archive/`, no command);
  - Revisions: `- Revision 3:` says no key changed and that a complete change left unarchived now fails the check.

  Verify by reading it against "ADR-0016 archives a change in the pull request that completes it". Verify that `npm test` passes `adr-revisions`.
- [x] 2.2 In `adr/ADR-0012-delivery.md`, after the list of last tasks under "A change is done in its own pull request", add one sentence: with ADR-0016's `changes.framework: openspec`, the change is archived in that same pull request. Leave `revision:` unchanged. Verify with `git diff adr/ADR-0012-delivery.md` that only that sentence changed.

## 3. Check

- [x] 3.1 Add the archive step to `changes()` in `checks/ontrack-engineering-check.ts`, as design.md says:
  - tasks read from `openspec/changes/*/tasks.md`, `archive` excluded, sorted;
  - the three output lines;
  - run after both openspec commands;
  - the `ponytail:` comment on the checkbox regex.

  Verify that the existing ADR-0016 tests pass unchanged.
- [x] 3.2 Add tests to `checks/ontrack-engineering-check.test.ts`:
  - "Complete change not archived" (the output names the change and `openspec archive`);
  - "Change with an open task";
  - "Change without tasks" (the output names it as not checked);
  - "Archived change" (complete, under `archive/`, passes);
  - `- [ x]` counts as done and `- [~]` as open.

  Verify that `npm test` passes, with coverage at or above 90 % (ADR-0007).

## 4. CI

- [x] 4.1 In `.github/workflows/ci.yml`, add `- run: node checks/ontrack-engineering-check.ts ADR-0016` after the ADR-0009 step, with a comment in the style of its neighbours. Verify that `node checks/ontrack-engineering-check.ts ADR-0016` exits `0` locally once 1.1 is done, and that `zizmor .github/workflows/ci.yml` reports nothing new.
- [x] 4.2 In the change summary step, add the loop over the archive directories the pull request adds (`--no-renames --diff-filter=A`), writing the heading, `proposal.md` and the fenced spec deltas. Update the comment above the step. Verify by running the loop's commands locally against `origin/main` once 1.1 is done: it prints `add-agent-identity-adr` as archived. Verify that `zizmor` reports nothing new.

## 5. Delivery

- [x] 5.1 Run `openspec validate archive-changes-in-pr --strict`, `npm test` and `npx tsc --noEmit`. Verify that all three pass.
- [x] 5.2 Rename the branch from `tritri/archive-changes-before-release-6cab2d` to `feat/archive-changes-in-pr` before its first push (ADR-0009). Open the pull request as `feat(adr)!: archive a change in the pull request that completes it`. In the description, say that inheritors with a complete, unarchived change fail ADR-0016 after the update, and that ontrack's apply routine should end with `openspec archive`. Do not change `docs/adr/trivoallan/` in this change.
- [x] 5.3 Check this task, then run `openspec archive archive-changes-in-pr --yes` and commit both together. Verify that `node checks/ontrack-engineering-check.ts ADR-0016` fails just before the archive, naming this change, and passes after it. Verify that the pull request's `test` check passes and that its job summary shows both archived changes.

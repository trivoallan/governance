# Design

## Context

See proposal.md for the motivation. Here is the current state:

- `changes()` in `checks/ontrack-engineering-check.ts` runs three steps
  (the config's schema, `openspec schema validate`,
  `openspec validate --all`). It runs each openspec command through
  `runTool`, which sends the tool's output straight to the check's output
  (`stdio: 'inherit'`) and returns only the exit code.
- The tests stub `openspec` with a script that logs its arguments and exits
  with `FAKE_EXIT_<arg>`. The stub prints nothing.
- `ci.yml` runs `npm test`, the ADR-0006 check and the ADR-0009 check. It
  does not run the ADR-0016 check. Its change summary step lists the
  changed paths under `openspec/changes/`, drops `archive`, and skips any
  directory missing at the head. So a change archived by the pull request
  is not shown (the ci spec says so on purpose).
- On `main` today: `add-agent-identity-adr` is complete and unarchived
  (8 of 8 tasks). `rename-to-ontrack-engineering` has 5 open tasks, all of
  them after its release.
- ADR-0012 already says "a change is done in its own pull request" and
  "nothing else waits for the release".

## Goals / Non-Goals

**Goals:**

- A complete, unarchived change fails the ADR-0016 check, on governance's
  pull requests and on every inheritor's.
- The reviewer of a pull request that archives a change still gets a
  summary of it.

**Non-Goals:**

- Detecting a task that was done but left unchecked.
- Archiving automatically, from CI or a bot. The agent or the person who
  finishes the change runs `openspec archive`.
- Changing ontrack's apply routine.

## Decisions

### Count the checkboxes in `tasks.md`, not `openspec list --json`

`openspec list --json` already reports `status: complete` per change.
Using it would mean capturing a tool's stdout, which `runTool` does not do.
It would also mean teaching the stub to print JSON, and depending on a JSON
shape that openspec does not document as stable. Reading
`openspec/changes/*/tasks.md` is a directory listing and a regex. The tests
only need files, and the step runs nothing, as the spec says.

The regex follows openspec's task rule: a task is a line matching
`^\s*- \[([^\]]*)\]`. It is done when the text between the brackets,
trimmed, is `x` or `X`, so `- [ x]` is done. Any other marker (`[ ]`,
`[~]`, `[-]`, `[]`) is an open task. Complete means at least one task and
no open task. A `ponytail:` comment names the ceiling: if openspec ever
counts another checkbox form (`*`, numbered lists), the two counts
diverge, and the fix is to switch to `openspec list --json`.

### Fourth step of `changes()`, run whatever the others give

The step runs after the two commands, so a single run shows every problem,
as the existing comment in `changes()` intends. Its output lines:

- `ADR-0016: change <name> has every task checked; archive it in this pull request (openspec archive <name>)`, on stderr, one per change, and the step fails;
- `ADR-0016: change <name> has no task, archive not checked`, on stdout;
- `ADR-0016: no complete change left in openspec/changes/`, on stdout, when nothing fails.

Directories are listed with `readdirSync(..., { withFileTypes: true })`,
directories only, `archive` excluded, sorted so the output is stable.

### ADR-0016 step in `ci.yml`

`node checks/ontrack-engineering-check.ts ADR-0016`, placed after the
ADR-0009 step. It uses the checkout's script, like the other two, so the
step under review is the one that runs. openspec comes from `node_modules`
(installed by `npm ci`), as `runTool` looks there first for a tool that
is not pinned. Dependabot's pull requests run it too: they touch no change,
so it costs one openspec run.

### Summary of archived changes

The summary step adds a second loop over
`git diff --name-only --no-renames --diff-filter=A "origin/${GITHUB_BASE_REF}...HEAD" -- openspec/changes/archive`,
cut to the archive directory name and made unique. `--no-renames` is
required: by default, git reports a moved file as a rename (`R`), not an
addition, and the moved change would be missed. For each directory, it
writes `## Change \`<dir>\` (archived)`, the `proposal.md` as is, and each
`specs/**/spec.md` delta in a fenced `markdown` block, so its `##` headings
do not merge into the summary's outline. `openspec show` is not used:
it reads active changes only. The step stays `continue-on-error`.

### Order of work inside this pull request

1. Archive `add-agent-identity-adr` first, with `openspec archive
   add-agent-identity-adr --yes`, so its deltas reach `openspec/specs/`
   before anything else touches them.
2. Write the ADR, the check and CI.
3. The last task archives this change itself. The ADR-0016 check fails
   between checking that task and running `openspec archive`, which shows
   that the step works. Both land in the same commit.

## Risks / Trade-offs

- [Inheritors get a red check after updating, without having changed
  anything] → revision 3 and its Revisions entry say why. The fix is one
  `openspec archive` per change, and the error message gives the command.
- [A change merged with a done but unchecked task stays unarchived
  forever] → stated in ADR-0016 as the known hole. It is visible in
  `openspec list`, and review covers it.
- [The archive date in the directory name becomes the date of the pull
  request's last commit, not the merge date] → accepted. With squash
  merges, the two are usually the same day.
- [A change split over several pull requests, with every task of the first
  checked, gets archived too early] → the tasks of the later pull requests
  must already be listed and open. That is the same discipline the
  rename change shows.

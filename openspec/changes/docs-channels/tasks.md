# Tasks

## 1. ADR text

- [x] 1.1 Edit `adr/ADR-0008-documentation.md`:
  - frontmatter: add `channels:` empty under `traits.docs` and set `revision: 3`;
  - Context: one sentence on the reader who installed the release and reads the pages of the default branch;
  - Decision: a `docs.channels` row in the recommendation table, stated per `delivery.target`;
  - Decision: the six rules (root and `next/`, no release yet, one workflow, own checkout, banner, pages written with the feature);
  - Decision: a short `on:` snippet with `push` `branches` and `tags`.
  - the filled-frontmatter example gains `channels: [release, main]`;
  - the "All three keys are required" sentence: `channels` is required unless `docs.tool` is `none`, and absent then.

  Verify by reading it against "ADR-0008 asks which versions the site publishes".
- [x] 1.2 In the same file:
  - how-to-rule block: what the check reads for `docs.channels` (the workflow holding `actions/deploy-pages` and its triggers, the default branch from `origin/HEAD`, and that other hosts are not checked);
  - keys table: a `docs.channels` row;
  - Alternatives: "Versioned copies", "Derived from ADR-0012" and "One enum value", each refused with its reason;
  - Docusaurus entry: drop versioning as a reason to choose it;
  - add `- Revision 3:` to the Revisions list.

  Verify that `npm test` passes `adr-revisions`.
- [x] 1.3 Add `- { name: "traits.docs.channels", type: array, optional: true }` under `# ADR-0008` in `adr/.mdschema.yml`. Verify with `cd adr && npx @jackchuka/mdschema@0.15.1 check '*.md'` that the shipped ADRs behave as before, and that a ruled copy with `channels: release` (a string) is refused.

## 2. Check

- [x] 2.1 In `checks/governance-check.ts`, replace the `'ADR-0008'` wiring entry with a `docs` check registered in `CHECKS`. It runs the existing `docs.tool` and `docs.root` rows through `wiring`, then the channels step, and returns non-zero when either fails. Verify that the existing ADR-0008 tests still pass unchanged once they hold `channels: [main]`, or `docs.tool: none` with no channels.
- [x] 2.2 Channels validation. Add a zod schema: a list of `release` and `main`, at least one, no duplicate. Implement the four outcomes for `docs.tool` / `docs.channels` presence. Add tests for:
  - "Channels without a site";
  - "Site without channels";
  - "Unknown channel";
  - a duplicate value;
  - `docs.tool: none` with no channels, which prints the no-channels line.
- [x] 2.3 Trigger reader. Write a function that takes a workflow's text and returns `{ tags, branches, bare }` from its top-level `on:` block. It handles:
  - `on: push`, `on: [push, …]`;
  - block `push:` with `branches:` / `tags:` as block lists or `[a, b]`.

  Mark the ceiling with a `ponytail:` comment. Unit-test each form, plus a `pull_request`-only workflow.
- [x] 2.4 Default branch. Read it with `git symbolic-ref --short refs/remotes/origin/HEAD`, strip `origin/`, and fall back to `main`. Add the "Default branch not main" test by setting `origin/HEAD` in the test repository.
- [x] 2.5 Wire the step. Among the tracked workflows, select those holding `actions/deploy-pages`:
  - none: print the "not checked" line and pass;
  - otherwise pass when one of them covers every listed channel, and name it;
  - else fail and name the missing trigger.

  Add tests for "ontrack today", "Both triggers", "Main only" and "Another host deploys the site".
- [x] 2.6 Run `npm test`, then `npx tsc --noEmit`. Verify that both pass and that coverage stays at or above 90 % (ADR-0007).

## 3. Specs and follow-up

- [x] 3.1 Run `openspec validate docs-channels --strict` and fix any finding.
- [x] 3.2 Open the pull request as `feat(adr)!:` on a `feat/` branch (ADR-0009). Before the first push, rename the branch from `tritri/multi-version-doc-df1884`. In the description, say:
  - governance's own copy takes revision 3 with no key;
  - trivoallan/ontrack must answer `[release, main]` and rebuild `docs.yml` after it imports the release.

  Do not change `docs/adr/trivoallan/` in this change.

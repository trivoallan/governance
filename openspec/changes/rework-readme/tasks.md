# Tasks

> Branch: rename `tritri/readme-optimization-update-d0abe1` to `docs/rework-readme` with `git branch -m` before the first push (AGENTS.md, Branches). Commits use the `readme` scope.

## 1. Test first

- [x] 1.1 Add `checks/readme.test.ts`. It reads `README.md` and each `adr/ADR-*.md`, and counts an ADR as checked only when its frontmatter, between the opening `---` and the next one, holds a `check:` line. It asserts that `/(\d+) questions/` equals the number of ADR files, that `/(\d+) of them come with a check/` equals the checked count, that every ADR file is linked from the README, and that every `adr/ADR-*.md` link resolves. Each failure names the values or the file. Run `npm test`, and verify it fails against the current README, which states no such phrases.
- [x] 1.2 Add a case where an ADR has a body-only `check:` line, using a throwaway directory or a fixture string passed to the counting function. Verify it is not counted, and that ADR-0001 is not counted in the real `adr/`.

## 2. CONTRIBUTING.md

- [x] 2.1 Create `CONTRIBUTING.md` from the README's "Work on it" and "Secret guard" sections: the plugin commands, the `claude-security` departure, turning off upstream copies, gitleaks, `core.hooksPath` and refused commits. Keep their links. Verify with `git diff` that no instruction was dropped.

## 3. README

- [x] 3.1 Rewrite the opening: the title, the bold pitch line, "The 21 questions I answer for every Python or TypeScript repository I keep on GitHub (commits, branching, delivery, supply chain, agent tooling), each with the answer I recommend and why; 11 of them come with a check.", and the sentence on what an ontrack source is. Remove every mention of surdesrails. Verify that `grep -i surdesrails README.md` prints nothing.
- [x] 3.2 Add the domain table (Domain / What you gain / What `governance-check` verifies). It has the rows Workflow, Delivery, Supply chain, Architecture (links to arc42, C4, LikeC4), Code ("nothing is verified"), Decisions & docs (the docs tool and root, plus the `.mdschema.yml` verdict attestation named as such) and Agents (the managed `AGENTS.md` block, `.claude/settings.json`). Close it with the "wiring is there, not that it is right" line. Verify each verified cell against `checks/governance-check.ts` and list the matching check per cell in the pull request.
- [x] 3.3 Add the list of all 21 ADRs under the table, as `[ADR-NNNN](adr/…) Title`, and drop the old Check column table. Verify that task 1.1's link assertions pass.
- [x] 3.3b Add "Not covered" after the ADR list, with the six items of design.md's table. Link ADR-0019, ADR-0004, ADR-0011, ADR-0019 and ADR-0020 where the table names them, and state no plans. Before writing, rerun `grep -rli` over `adr/` for each topic. Verify no shipped ADR decides a listed topic, and record the grep in the pull request.
- [x] 3.4 Add a short excerpt of `adr/ADR-0009-branching.md`: its question, its recommendation, and its `traits:` block. Verify it names no language-specific tool.
- [x] 3.5 Replace "Use it" with governance's install command and `npm audit signatures`, plus a link to <https://trivoallan.github.io/ontrack/> for installing ontrack and for `plan`, `apply`, `revision` and `check`. Remove the ontrack install command and the alias explanation, which ontrack documents. Verify that the README holds no `ontrack@git+` string.
- [x] 3.6 Add "See it in use", linking to ontrack's `docs/adr/trivoallan/`, its `AGENTS.md` and its `docs/architecture/`. Then replace "Work on it" and "Secret guard" with one link to `CONTRIBUTING.md`. Verify each external link of the README once (HTTP 200 with `curl -sI`, or `gh api` for repository paths).
- [x] 3.7 Run `npm test`. Verify every test passes, task 1.1's included, and that coverage still meets 90 %.

## 4. Package and ADR-0010

- [x] 4.1 Add `adr`, `ontrack`, `supply-chain`, `slsa`, `ci` and `coding-agents` to `keywords` in `package.json`, after `ontrack-source`. Verify with `npm pkg get keywords`.
- [x] 4.2 Add `- [C4 model](https://c4model.com/): the context, container and component levels LikeC4 views draw.` to the References of `adr/ADR-0010-architecture-documentation.md`. Verify with `git diff` that `revision: 1` is unchanged, and that `npx @jackchuka/mdschema@0.15.1 check` reports the same violations for the file before and after (a shipped question fails the ruled-ADR schema by design, see `adr/.mdschema.yml`).

## 5. Close

- [x] 5.1 Run `npm pack --dry-run`. Verify that `README.md` is in the package, and that `CONTRIBUTING.md` is not (it is not in `files`).
- [x] 5.2 Run `openspec validate rework-readme --strict`, and verify it passes.

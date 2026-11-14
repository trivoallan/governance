# Tasks

Every ADR edit below is written with `/pm-skills:develop-adr`, keeping the
Nygard sections and frontmatter of the `adr-format` spec.

## 1. Schema and ADR-0017

- [x] 1.1 Add `traits.agent.host` (enum `claude-code`, `none`, optional) to `adr/.mdschema.yml`; verify a ruled sample with `agent.host: claude-code` passes and one with an empty value is named by `npx @jackchuka/mdschema@0.15.1 check '*.md'`
- [x] 1.2 Write `adr/ADR-0017-agent-tooling.md` as a question ADR (`proposed`, empty `agent.host`, recommendation `claude-code`, how-to-rule block) with the plugins-first policy, vendoring as last resort, the repository marketplace, the forbidden forms, the install-command facts, and a link to ADR-0016 rule 3; verify `agent.host` is its only trait and the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 1.3 Put filled examples of `marketplace/.claude-plugin/marketplace.json` (entries pinned by a 40-character `sha`, one `git-subdir`) and `.claude/settings.json` (a `directory` source) in ADR-0017; verify both parse as JSON

## 2. ADR-0001 revision 2

- [x] 2.1 In `adr/ADR-0001-record-architecture-decisions.md`, clarify rule 4 (the freeze applies to a repository's verdict; governance revises shipped ADRs through `revision`) and add the rule that a `Suggested skills` line changes no `revision`; set `revision: 2`; verify it still passes the schema
- [x] 2.2 Check the revision bump in a scratch consumer: install `main` and this branch in turn and run `npx ontrack plan`; verify ADR-0001 is reported `revised` from 1 to 2 and ADR-0017 `new`

## 3. Suggested skills

- [x] 3.1 Re-check each plugin in design.md's table (`claude plugin marketplace list` or the marketplace's own repository) before writing; drop any line whose plugin cannot be confirmed
- [x] 3.2 Add the `Suggested skills` line to the References of ADR-0001, ADR-0007, ADR-0008 and ADR-0010; verify `grep -c '^- Suggested skills:' adr/*.md` lists exactly those four files and that none of their `revision` values changed except ADR-0001's

## 4. Catalog and delivery

- [x] 4.1 Run `openspec validate add-agent-tooling-adr --strict`; verify it passes
- [x] 4.2 Commit, push and open the pull request; verify its diff holds ADR-0017, ADR-0001, the four References lines, the schema line and this change, and nothing else

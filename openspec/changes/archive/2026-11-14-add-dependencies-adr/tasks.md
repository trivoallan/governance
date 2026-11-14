# Tasks

Every ADR edit below is written with `/pm-skills:develop-adr`, keeping the
Nygard sections and frontmatter of the `adr-format` spec.

## 1. Facts and schema

- [x] 1.1 Re-check each fact in design.md's Context against GitHub's Dependabot documentation (`dependabot.yml` options including `cooldown` and `groups`, SHA-pinned action updates, the `fetch-metadata` + `gh pr merge --auto` pattern, token and secrets for Dependabot-triggered workflows) and Renovate's (`automerge`, `minimumReleaseAge`, `helpers:pinGitHubActionDigests`); verify each sentence ADR-0018 will state has a source, and drop or correct any that does not
- [x] 1.2 Add `traits.dependencies.updater` (enum `dependabot`, `renovate`, `none`) and `traits.dependencies.automerge` (enum `none`, `patch`, `minor`), both optional, under an `# ADR-0018` comment in `adr/.mdschema.yml`; verify a ruled sample with both set passes and one with an empty `automerge` is named by `npx @jackchuka/mdschema@0.15.1 check '*.md'`

## 2. ADR-0018

- [x] 2.1 Write `adr/ADR-0018-dependencies.md` as a question ADR (`proposed`, `revision: 1`, both traits empty, recommendations `dependabot` and `patch`, how-to-rule block, key table in References) with the five fixed rules, the automerge workflow described under ADR-0011's rules, and "Original to governance" in References; verify the schema fails it only on `status`, `date`, the empty traits and the marker sentence
- [x] 2.2 Write its Alternatives Considered: `renovate` (native automerge, SHA pinning, regex managers, dashboard, at the cost of a third-party app), `none`, `minor` and `none` as automerge levels; verify each states its cost
- [x] 2.3 Add a `Suggested skills` line only if a plugin for Dependabot or Renovate configuration can be confirmed in a marketplace; verify by `claude plugin marketplace list` or the marketplace repository, and leave the line out otherwise

## 3. ADR-0011 and catalog

- [x] 3.1 In ADR-0011's Negative consequences, link "a tool such as Dependabot" to ADR-0018; verify `git diff adr/ADR-0011-forge-and-ci.md` changes that line only and `revision:` stays `1`
- [x] 3.2 Check in a scratch consumer: install `main` and this branch in turn and run `npx ontrack plan`; verify ADR-0018 is reported `new` and ADR-0011 `unchanged`
- [x] 3.3 Run `openspec validate add-dependencies-adr --strict`; verify it passes

## 4. Delivery

- [x] 4.1 Commit, push and open the pull request; verify its diff holds ADR-0018, the ADR-0011 line, the schema lines and this change, and nothing else

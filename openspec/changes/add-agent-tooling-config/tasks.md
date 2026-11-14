# Tasks

## 1. Ignore local state

- [ ] 1.1 Add `.claude/worktrees/` and `.claude/settings.local.json` to `.gitignore`; verify the "Ignored without personal excludes" scenario with `git -c core.excludesFile=/dev/null check-ignore` in a fresh clone

## 2. Vendored OpenSpec skills

- [ ] 2.1 In this worktree, run `openspec update` with OpenSpec 1.13.1; verify it generates the 12 `.claude/skills/openspec-*/SKILL.md` and 12 `.claude/commands/opsx/*.md` files, and that `diff -r` against the main checkout's untracked copies is empty
- [ ] 2.2 Review each file (instructions, `allowed-tools`, any script) and record in the pull request the CLI version and each file's `shasum -a 256`; verify every file carries `generatedBy: "1.13.1"` and `allowed-tools` is only `Bash(openspec:*)`
- [ ] 2.3 Run `openspec update` a second time; verify `git status --porcelain .claude/` prints nothing once the files are staged (the "Reproducible from the pinned CLI" scenario)

## 3. Marketplace and settings

- [ ] 3.1 Propose the plugin list to the maintainer, one ADR-0020 declaration per entry (source, tagged commit, why), and resolve each approved commit with `gh api repos/<owner>/<repo>/commits/<tag> -q .sha`; verify every approval is in the conversation before writing an entry
- [ ] 3.2 Write `marketplace/.claude-plugin/marketplace.json` (name `ontrack-trivoallan-tools`, owner, approved entries each with a `sha`); verify `claude plugin validate marketplace` reports no error and every `sha` matches `^[0-9a-f]{40}$`
- [ ] 3.3 Write `.claude/settings.json` with `extraKnownMarketplaces.ontrack-trivoallan-tools` as a `directory` source `./marketplace` and one `enabledPlugins` entry per marketplace plugin; verify the two plugin sets are equal and `npx --no-install governance-check ADR-0017` exits `0`
- [ ] 3.4 Run `claude plugin install <plugin>@ontrack-trivoallan-tools --scope project` for each plugin, then `/plugin`; verify each is reported installed

## 4. Documentation and rollout

- [ ] 4.1 Add a short README note: accept workspace trust, run the install command per plugin, turn off an upstream copy of the same plugin in `settings.local.json`; verify it links to ADR-0017
- [ ] 4.2 After merge, in the main checkout remove the untracked `.claude/skills/` and `.claude/commands/` and pull; verify `git status` is clean and a new worktree holds `.claude/skills/openspec-propose/SKILL.md`
- [ ] 4.3 Run `openspec validate add-agent-tooling-config --strict`; verify it passes

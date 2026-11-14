# Contributing

## Claude Code plugins

This repository is worked on with Claude Code
([ADR-0017](docs/adr/trivoallan/ADR-0017-agent-tooling.md)). Its plugins
come from its own marketplace, `marketplace/`, each pinned to a commit.
Accept the workspace trust dialog, then install each plugin once:

```bash
claude plugin install source-control@ontrack-trivoallan-tools --scope project
claude plugin install superpowers@ontrack-trivoallan-tools --scope project
claude plugin install claude-security@claude-plugins-official --scope project
```

`claude-security` comes from Anthropic's marketplace, unpinned: a departure
recorded in ADR-0017.

If you already have one of them from its upstream marketplace, turn that
copy off in your untracked `.claude/settings.local.json`
(`"superpowers@superpowers-marketplace": false`, say).

## Secret guard

Commits go through a pre-commit hook, `.githooks/pre-commit`, that runs
`gitleaks git --pre-commit --staged --redact`
([ADR-0015](docs/adr/trivoallan/ADR-0015-secrets.md)). It needs
[gitleaks](https://github.com/gitleaks/gitleaks) on your `PATH`
(`brew install gitleaks`, or a release binary); without it, the hook refuses
every commit.

`npm install` installs the hook, by setting `core.hooksPath` to `.githooks`
for the clone and all its worktrees. Without `npm install`, run:

```bash
git config core.hooksPath .githooks
```

This local setting overrides a `core.hooksPath` you may have set globally.

A refused commit means a secret is staged: remove it from the change, and
if it was ever pushed, revoke it at its provider. Never get past the hook
with `git commit --no-verify`.

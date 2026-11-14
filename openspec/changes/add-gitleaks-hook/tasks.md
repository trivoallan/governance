# Tasks

## 1. Hook

- [ ] 1.1 Add `.githooks/pre-commit` (`#!/bin/sh`, mode 755): refuse with an install hint when `command -v gitleaks` fails, else `exec gitleaks git --pre-commit --staged --redact`; verify `git ls-files -s .githooks/pre-commit` shows mode `100755`
- [ ] 1.2 Add `"prepare": "git rev-parse --git-dir >/dev/null 2>&1 && git config core.hooksPath .githooks || true"` to `package.json`; run `npm install` and verify `git config core.hooksPath` prints `.githooks`, and that `npm pack --dry-run` lists no `.githooks/` file

## 2. Tests

- [ ] 2.1 Add `checks/pre-commit-hook.test.mjs`, driving the hook in a throwaway repository, for the "Clean commit", "Staged secret refused" (no commit created, key absent from output), "Secret already in history, not staged" and "gitleaks missing" scenarios, the first three skipped when gitleaks is not on `PATH`; run `npm test` and verify every test passes
- [ ] 2.2 In a scratch directory that is not a git checkout, run the `prepare` command; verify it exits `0` and writes nothing

## 3. Documentation

- [ ] 3.1 Add a short contributing note to `README.md`: gitleaks is required, `npm install` sets the hook, the `git config core.hooksPath .githooks` line otherwise, and a refusal means removing the secret (and revoking it if pushed), never `--no-verify`; verify the README renders and links to ADR-0015

## 4. End to end

- [ ] 4.1 In a worktree of this repository, stage a file with a generated private key and run `git commit`; verify the commit is refused with the key redacted, then unstage it
- [ ] 4.2 Run `openspec validate add-gitleaks-hook --strict`; verify it passes

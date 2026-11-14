# Tool Branches From Traits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The ADR-0009 check exempts a tool branch only when ADR-0012 or ADR-0018 names that tool.

**Architecture:** `branching()` in `checks/governance-check.ts` reads two
traits from the other ADRs with the existing `findAdr` and `readTraits`. It
maps them to prefixes, and that map replaces the hard-coded `TOOL_BRANCHES`.

**Tech Stack:** TypeScript, `node:test`, zod (already installed).

**Spec:** `docs/superpowers/specs/2026-11-14-tool-branches-from-traits-design.md`

## Global Constraints

- Prefix map, exactly: `release-please` → `release-please--`, `releaser-pleaser` → `releaser-pleaser--` (from `delivery.release_tool`); `dependabot` → `dependabot/`, `renovate` → `renovate/` (from `dependencies.updater`). Any other value exempts nothing.
- No answer means no exemption. That covers a missing ADR file, an empty key, and no `traits:` block.
- No new trait, no ADR-0009 revision bump, no new dependency.
- Line coverage stays ≥ 90 (`npm test`).
- Commit scope `checks`, branch renamed to `feat/tool-branches-from-traits` before the first push.

## Review Focus

1. A Dependabot branch in a repository without ADR-0018 fails, and stderr names `ADR-0018` and `dependencies.updater`. Test: `ADR-0009: tool branch refused without its ADR`.
2. `updater: renovate` does not exempt `dependabot/…`, and vice versa. Test: `ADR-0009: tool branch refused when another tool is ruled`.
3. A rejected ADR-0018 (no `traits:`) behaves like a missing one. Test: `ADR-0009: rejected ADR exempts nothing`.
4. Two ADR-0018 files fail the check with `several files match`, instead of being treated as no answer. Test: `ADR-0009: duplicate tool ADR fails`.
5. The prefix still needs its separator: `dependabot-tweaks` fails even with `updater: dependabot`. This is covered by updating the existing test `tool prefix needs its separator`.

---

### Task 1: Derive tool branches from ADR-0012 and ADR-0018

**Files:**
- Modify: `checks/governance-check.ts:335-358` (`TOOL_BRANCHES`, `branching()`)
- Modify: `checks/governance-check.test.ts:479-504` (the tool-branch tests)
- Modify: `adr/ADR-0009-branching.md:122-126` (the tool-branch bullet)

**Interfaces:**
- Consumes: `findAdr(root, number): string` (throws `CheckError` on none or several matches), `readTraits(text, group): Traits | null`, `scalar`.
- Produces: `toolBranches(root: string): { prefix: string; source: string }[]`, local to the file. `source` is for messages, for example `ADR-0018 dependencies.updater: dependabot`.

- [ ] **Step 1: Write the failing tests**

Add the helpers next to `branchingAdr`:
`const releaseAdr = (tool: string) => ({ 'ADR-0012-delivery.md': \`  delivery:\n    release_tool: ${tool}\` })`
and reuse `deps(updater)`.

Rewrite and add these in `checks/governance-check.test.ts`:

```ts
test('ADR-0009: release tool branch', () => {
  // same as today, adrs: { ...branchingAdr('[feat]'), ...releaseAdr('release-please') }
  // stdout === 'ADR-0009: release-please--branches--main--components--ontrack-governance is a tool branch (ADR-0012 delivery.release_tool: release-please), nothing to check\n'
});
test('ADR-0009: releaser-pleaser branch', () => { /* releaseAdr('releaser-pleaser'), status 0, /tool branch/ */ });
test('ADR-0009: update tool branch', () => {
  // for [dependabot, 'dependabot/npm_and_yarn/zod-4.1.0'], [renovate, 'renovate/zod-4.x']:
  // adrs { ...branchingAdr('[feat]'), ...deps(updater) }, status 0, /tool branch/
});
test('ADR-0009: tool branch refused without its ADR', () => {
  // adrs branchingAdr('[feat]') only, --branch dependabot/npm_and_yarn/zod-4.1.0
  // status !== 0; stderr matches /dependabot\/npm_and_yarn\/zod-4\.1\.0 is not <prefix>/ and /ADR-0018 dependencies\.updater/
});
test('ADR-0009: tool branch refused when another tool is ruled', () => {
  // deps('renovate'), --branch dependabot/x -> status !== 0
  // releaseAdr('none'), --branch release-please--branches--main -> status !== 0, stderr /ADR-0012 delivery\.release_tool/
});
test('ADR-0009: rejected ADR exempts nothing', () => {
  // adrs { ...branchingAdr('[feat]'), 'ADR-0018-dependencies.md': '' } (empty traits block), --branch dependabot/x -> status !== 0
});
test('ADR-0009: duplicate tool ADR fails', () => {
  // ...deps('dependabot') plus a second docs/adr/other/ADR-0018-x.md via `files`, --branch dependabot/x
  // status !== 0, stderr /several files match/
});
```

In `tool prefix needs its separator`, add `...deps('dependabot')` so that it tests the separator and not the missing ADR.

- [ ] **Step 2: Run the tests and check that they fail**

Run: `npm test`
Expected: FAIL. The new "refused" tests pass a branch that the hard-coded list still exempts, and the `release tool branch` stdout differs.

- [ ] **Step 3: Implement `toolBranches(root)` and use it in `branching()`**

Delete `TOOL_BRANCHES`. Add a constant table
`[ADR number, group, key, { value: prefix }]` for the two traits.
`toolBranches` goes through the table:
- `findAdr` throws "no file matches": skip that row. Any other `CheckError` propagates.
- `readTraits(text, group)?.[key]` that is not a non-empty string: skip.
- A value not in the map: skip.

In `branching()`, exempt when `name.startsWith(prefix)`, and log
`ADR-0009: <name> is a tool branch (<source>), nothing to check`. When the
form check fails and the name starts with a known tool prefix that was not
exempted, append ` (not exempt: <ADR> <group>.<key> is not <tool>)` to the
existing error. Update the comment above the table: the list follows from
ADR-0012 and ADR-0018, and an unanswered ADR exempts nothing.

- [ ] **Step 4: Update the ADR-0009 bullet**

In `adr/ADR-0009-branching.md`, replace the tool-branch bullet with this one: a branch
opened by the release tool ruled in ADR-0012 (`release-please--`,
`releaser-pleaser--`) or the updater ruled in ADR-0018 (`dependabot/`,
`renovate/`) passes. One that no ruled answer names must follow the prefixes.
Leave `docs/adr/trivoallan/ADR-0009-branching.md` unchanged: it has no such
bullet (checked: only its `tritri/` lines mention tools).

- [ ] **Step 5: Run the tests and check that they pass**

Run: `npm test`
Expected: PASS, line coverage ≥ 90.
Run: `node checks/governance-check.ts ADR-0009 --branch dependabot/npm_and_yarn/x`
Expected: exit 0. This repository rules `dependabot`.

- [ ] **Step 6: Commit**

```bash
git branch -m feat/tool-branches-from-traits
git add checks/governance-check.ts checks/governance-check.test.ts adr/ADR-0009-branching.md docs/superpowers
git commit -m "feat(checks): exempt only the tool branches ADR-0012 and ADR-0018 name"
```

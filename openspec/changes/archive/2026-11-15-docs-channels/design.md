# Design

## Context

ADR-0008 (revision 2) asks `docs.tool`, `docs.root` and `docs.audience`.
Its check is a plain wiring entry in `checks/ontrack-engineering-check.ts`: one row
per key, presence only. Nothing asks which version of the pages the site
shows.

The real case is trivoallan/ontrack. Its ADR-0008 rules `docs.tool:
starlight`, its site lives in `site/`, and its `.github/workflows/docs.yml`
builds on `pull_request` and deploys GitHub Pages on `push: branches:
[main]`. The site config imports `../src`, so the site of one commit only
builds against the code of that same commit. ontrack is a `package` with
releases tagged `vX.Y.Z`.

Constraints:
- the package has two runtime dependencies (`zod`, `@jackchuka/mdschema`), and ADR-0020 makes any new one a person's decision. Nothing parses YAML today but `readTraits`, which reads ADR frontmatter only;
- the check runs locally and in CI and must never need a token. ADR-0022's ruleset read is the only exception, and it is skipped outside CI.

## Goals / Non-Goals

**Goals:**
- An agent that sets up or touches a documentation site knows which versions to publish, where each one goes, and that one workflow rebuilds them all.
- The check catches the one-branch deploy that every template ships when the ruling says `release`.

**Non-Goals:**
- Older majors served online, a version picker, or a support policy in ADR-0012. The list form leaves room for a later value.
- Checking hosts other than GitHub Pages, the `base` path, or the banner. These are review's job.
- Changing trivoallan/ontrack. Its workflow is rebuilt in its own repository once it imports revision 3.

## Decisions

### A list of `release` and `main`, not an enum

`docs.channels: [release, main]`. A later value (`majors`) adds to the list
without changing any existing answer. An enum (`release | main | both`)
would have to become a list then, which is one more breaking change.
`release` names what the reader gets, not the mechanism (`tag`). Order in
the list carries no meaning: rule 1 fixes which channel sits at the root.

### Not derived from ADR-0012

ontrack's `delivery.environments` are all `trigger: tag`, yet its ruling
wants `main` published too. What a reader of the documentation sees and
what a user receives are two questions. Deriving the key would answer the
second one for the first.

### Built from tags, never copied

Each channel is built from a checkout of its own commit, so `docs/` exists
once, on the default branch. A fix to the released pages goes through a
release, like a code fix. Copies per version (`versioned_docs/`) are
refused because an agent finds N copies of a page and edits the wrong one.

### One workflow, every channel, every run

GitHub Pages holds one site per repository, and each deploy replaces the
whole site. Two workflows (tags → root, `main` → `next/`) would each erase
the other's channel. The ADR describes one workflow, triggered by a push of
tags and a push to the default branch. On every run it:
1. resolves the latest release (`gh release view --json tagName`, or `git describe --tags --abbrev=0`);
2. checks out that tag and the default branch into two folders;
3. builds each in its own folder, `main` with its `base` set to `next/`;
4. assembles one artifact, with the release at the root and `main` under `next/`;
5. uploads it with one `actions/upload-pages-artifact` and deploys it.

With no release yet, it builds `main` alone at the root. Only the default
branch needs to know how to build under another `base`. Old tags keep
building at the root, as they always did. The ADR gives this as prose and
a short trigger snippet, not a full workflow: the build steps belong to the
site tool.

### Check reads triggers as text

The check finds tracked workflows containing `actions/deploy-pages`, then
reads the top-level `on:` block of each by indentation:
- the `push:` key and its `branches:` and `tags:` lists, in block or flow style;
- a bare `push` (`on: push`, `on: [push, …]`, or `push:` with no filter), which counts for both channels.

It does not evaluate glob patterns against branch names. `branches` passes
when it lists the default branch by name. `tags` passes when it is present
and non-empty.

The default branch comes from `git symbolic-ref --short
refs/remotes/origin/HEAD`, with the `origin/` prefix stripped, or `main`
when that fails. This is the same `origin/HEAD` the ADR-0006 check uses as
its default `--from`.

Alternative: add `yaml` as a dependency. It parses every form correctly,
but it is a new runtime dependency for one key, and needs a person's
approval under ADR-0020. The line reader is enough for the forms
workflows are written in. A `ponytail:` comment names the ceiling.

### ADR-0008 becomes a check of its own

`'ADR-0008'` moves from the generic `wiring` table to a `docs` check. That
check runs the two existing rows through the same `wiring` code, then runs
the channels step, and fails when either fails. The wiring spec's table is
unchanged.

## Risks / Trade-offs

- [The line reader misses an exotic `on:` form, such as anchors or a multi-line flow mapping] → it then reports the trigger missing, which is a false failure the user can see, never a false pass. The `ponytail:` comment names the upgrade path (`yaml`).
- [A branch glob such as `'**'` covers the default branch but is not recognised] → false failure with a message naming the default branch. It is rare in a deploy workflow.
- [Every repository with a site fails its ADR-0008 check until it answers] → intended, as with ADR-0022 revision 2. The Revisions entry says what to answer.
- [A site deployed by Netlify, Cloudflare or a custom script is never checked] → the check says so in its output and passes, in the spirit of "nothing to check".

## Migration Plan

1. Ship ADR-0008 revision 3 and the check in one `feat(adr)!` release.
2. Repositories re-import and answer at `ontrack plan`. governance's own copy (`docs.tool: none`) takes the new revision with no key.
3. trivoallan/ontrack answers `[release, main]` and rebuilds `docs.yml` in its own pull request. Its check fails until then.

## Open Questions

None blocking. Whether `release` should honour pre-releases (`gh release view` skips them by default) is left to the workflow: the ADR says "latest published release".

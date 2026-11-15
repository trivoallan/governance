# Proposal

## Why

A repository that ships a package publishes its documentation site from
its default branch. The site then describes features no released version
has, and someone who installed the latest release copies an option that
does not exist yet. trivoallan/ontrack does exactly this: its Starlight
site deploys to GitHub Pages on every push to `main`, while users run the
version published on npm. ADR-0008 asks where the pages live and who reads
them. It does not ask which version of them the site shows, so an agent
setting up the site copies the one-branch workflow every template ships.

## What Changes

- **BREAKING** ADR-0008 asks a fourth key, `docs.channels`: the versions of
  the documentation the site publishes. It is a list of `release` (the
  latest published release) and `main` (the default branch), holding at
  least one of them and each at most once.
  - It is required when `docs.tool` is not `none`, and must be absent when
    `docs.tool` is `none`. Without a site, the forge already shows `docs/`
    at every tag.
  - Recommendation: `[release, main]` with `delivery.target: package`, and
    `[main]` when every merge reaches users (`platform`, `container`
    deployed on merge). The recommendation is stated per target, since
    ADR-0008 cannot know which one applies.
  - ADR-0008 moves to revision 3, and its Revisions list says that a
    repository with a site must answer the new key.
- ADR-0008's Decision fixes how the site serves the channels:
  - `release` is served at the site root when listed, otherwise `main` is;
    the other channel lives under `next/`;
  - until a first release exists, `main` is served at the root and `next/`
    does not exist;
  - one workflow deploys the site and rebuilds every listed channel on each
    run, because GitHub Pages holds one site per repository and a second
    deploy replaces the first;
  - each channel builds from its own checkout, since a site often imports
    the code it documents;
  - when both channels are listed, pages of `main` carry a banner that
    points to the released documentation;
  - an agent writes a feature's pages in the pull request that adds the
    feature, whatever is released: the channels decide who sees them when.
- ADR-0008's Alternatives add:
  - copies of the pages per version (Docusaurus `versioned_docs/`), refused
    because an agent edits the wrong copy;
  - a value derived from ADR-0012's `delivery.environments`, refused
    because what a reader of the documentation sees is not what a user
    receives;
  - a single enum value, refused because a later value would break every
    answer. The Docusaurus entry stops presenting versioning as a reason to
    pick it.
- `governance-check ADR-0008` reads `docs.channels` beside the existing
  `docs.tool` and `docs.root` rows. When `docs.tool` is not `none`, it
  looks for the tracked workflows that hold `actions/deploy-pages`, and
  fails unless one of them is triggered:
  - by a push of tags, when `release` is listed;
  - by a push to the default branch, when `main` is listed.

  When no workflow holds `actions/deploy-pages`, it says the triggers are
  not checked and passes. It reads the files only and never the network.
- `adr/.mdschema.yml` adds `traits.docs.channels` as an optional array.
- Out of scope: older majors kept online, and a version picker. The list
  form leaves room for a later value without breaking answers.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`:
  - ADR-0008 asks `docs.channels`, states how the channels are served, and
    moves to revision 3;
  - the requirement that kept ADR-0008 at revision 2 with unchanged keys
    now says revision 3 and names the added key.
- `adr-checks`: the ADR-0008 check reads `docs.channels` and the triggers
  of the workflow that deploys GitHub Pages.

## Impact

- `adr/ADR-0008-documentation.md`, `adr/.mdschema.yml`.
- `checks/governance-check.ts` and its tests. The check gains no
  dependency: it reads the workflow's triggers as text.
- Repositories that inherit governance with `docs.tool` other than `none`
  must answer `docs.channels` at the next `ontrack plan`, or their ADR-0008
  check fails. trivoallan/ontrack is one of them, and its `docs.yml`
  (push to `main` only) fails with `[release, main]` until it is rebuilt
  as the Decision says. That rebuild is ontrack's own change.
- governance's own copy rules `docs.tool: none`, so it needs no answer.
  Re-importing it moves the copy to revision 3 and nothing else.

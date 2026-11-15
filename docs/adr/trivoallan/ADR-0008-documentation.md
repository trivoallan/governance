---
adr: ADR-0008
slug: documentation
title: Documentation
status: accepted
revision: 2
date: 2026-11-15
authors: [Tristan Rivoallan]
supersedes: []
check: npx --no-install governance-check ADR-0008
traits:
  docs:
    tool: none
    root: docs/
    audience: public
---

# Documentation

## Status

Accepted

## Context

While these keys are empty, an agent that has to write a page does not know
**where to put it**, whether **it has to touch a navigation file**, or **what
it may write in it**. It drops the file by guesswork, leaves a stale table
of contents behind, and may publish an internal URL in a page the world
reads. Once these three values are written, it knows.

**This ADR governs the documentation written for whoever uses the
product**: guides, tutorials, references. Two other readers have their own
documents, ruled elsewhere: whoever changes the product reads the
architecture document ([ADR-0010](ADR-0010-architecture-documentation.md)),
and whoever rules reads the ADRs in `docs/adr/`. `docs.root`,
`docs.audience` and Diátaxis apply to the user documentation only.

**The classification is not decided here.** governance requires
[Diátaxis](https://diataxis.fr/) (tutorial, how-to guide, explanation,
reference) and the Google developer documentation style for prose. What is
yours is the **tooling**, the **location** and the **audience**.

## Decision

**What governance recommends, and why.**

| Key | Recommended value | Reason |
| --- | --- | --- |
| `docs.tool` | `starlight` | the fastest build measured (see References), navigation **generated from the directory tree** so adding a page touches no table of contents, built-in search, and LikeC4 views (ADR-0010) embedded through its Vite plugin with no generation step |
| `docs.root` | `docs/` | an agent looking for where to put a page has nothing to guess, and sharing the directory with `docs/adr/` and `docs/architecture/` lets one site serve all three if you want it to; that is a convenience, not a constraint |
| `docs.audience` | `public` | governance's repositories are public on GitHub, so their documentation is read by anyone whether or not that was intended; writing for that audience from the start is the honest default |

**Starlight does not read `docs/` by default**: it expects
`src/content/docs/`. Point its `docs` collection at `docs/` with Astro's
`glob` loader, in `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './docs' }),
    schema: docsSchema(),
  }),
};
```

**This pattern also publishes `docs/adr/` and `docs/architecture/`.**
Whether that is right depends on who may read them, which is not
`docs.audience` (see ADR-0010). To publish the user documentation only,
exclude them in the pattern:

```ts
loader: glob({ pattern: ['**/*.{md,mdx}', '!adr/**', '!architecture/**'], base: './docs' }),
```

Each page then needs a `title:` in its frontmatter. Mermaid diagrams
(ADR-0010) need the `astro-mermaid` integration, which renders them in the
browser and adds nothing to the build.

**`public` is the strict end of the scale, and that is the point.** A page
read more widely than it was written for cannot be unpublished, while a
page written for the public is never wrong for a smaller audience. For a
private repository, `team` or `single-user` is a legitimate answer: it is
taken, not suffered.

**The audience is a scale, not a switch.** Three steps, from narrowest to
widest, and each widens who may read:

| Value | Who reads |
| --- | --- |
| `single-user` | one person, the one who opens the repository |
| `team` | the people who maintain this repository |
| `public` | anyone |

**This is not a vocabulary detail.** Each step decides what an agent may
write in a page: a customer name, an internal URL, an infrastructure detail,
a person's address. What passes at `team` does not pass at `public`, and
nothing catches it afterwards.

**Diátaxis quadrants are not a key of this ADR, on purpose.** The quadrants
a repository holds are **observed** once it has pages, and at adoption it has
none. Asking would force an invented answer or an empty key the schema
refuses. The classification still applies, page by page, when each is
written.

`root: docs/` and `audience: public` adopted as recommended. The
repository is public on GitHub, and its decision records live in
`docs/adr/`.

**Departure: `tool: none`, not `starlight`.** This repository has no site,
and there is nothing for one to add. What people read is `README.md` and the
shipped ADRs in `adr/`, which render on GitHub and are read mostly inside
the repositories that import them through ontrack. A Starlight site would
add a Node.js site build to publish about twenty pages that already render
on the forge. Revisit if governance grows guides beyond its ADRs.

Revision 2 changed no key. Taken again on 2026-11-15: `root` and `audience` hold for the user documentation alone, which is the README and the shipped ADRs.

## Consequences

### Positive

- No site to build, deploy or keep up to date.
- An agent never writes an internal URL, a customer name or an
  infrastructure detail in a page: everything here is public.

### Negative

- No search and no navigation beyond what GitHub shows for a directory.

### Neutral

- Diátaxis and the Google style still apply page by page; the language is
  ADR-0002's.

## Alternatives Considered

### Starlight

A generated site on Astro, automatic navigation. Recommended, for the
reasons above.

### Docusaurus

A generated site on React, automatic navigation. It reads `docs/` by
default, renders Mermaid through an official theme (which also needs
`@mermaid-js/layout-elk` installed), and versions documentation, which only
a library shipped in several versions needs. Its default build was the
slowest measured, about seven times Starlight's; with `future.faster` and
`future.v4` turned on it comes within about 25 % of Starlight. LikeC4 views
need `likec4 codegen webcomponent` before every build. A sound answer:
turn `future.faster` on if you choose it.

### MkDocs

A generated site in Python, for a repository with no Node.js at all.

### A generated site, hand-kept navigation

More control over order, and one more file to update with every page.

### No site

Pages are read on the forge. A tenable answer, frequent for a repository
with no outside readers; write `docs.tool: none`.

## References

- Suggested skills: `write-for-humans` from `docs-hygiene@melodic-software`.
- Adapted from surdesrails [SDR-0008](https://github.com/trivoallan/surdesrails/blob/main/resources/docs/adr/SDR-0008-documentation.md), revision 1 (audience scale reduced to three steps; recommends `public` rather than the team step, and `starlight` rather than `docusaurus`).
- Build times measured on 2026-11-14, Apple M1 Pro, Node 22, three cold
  builds each (outputs and caches removed), on 302 Markdown pages of which 30
  hold a Mermaid diagram, plus one page with a LikeC4 view. Medians:
  Docusaurus 3.10.2 default, 57.6 s (including 1.5 s of LikeC4 code
  generation); Docusaurus 3.10.2 with `future.faster`, 10.4 s (including
  1.6 s); Starlight 0.43.1 on Astro 7.4, 7.6 s (including the Pagefind
  index). The development server was not measured.
- [ADR-0001](ADR-0001-record-architecture-decisions.md): how governance ADRs are ruled on.
- [Diátaxis](https://diataxis.fr/) and the [Google developer documentation style guide](https://developers.google.com/style).

**The keys.**

| Key | What it holds | Allowed values |
| --- | --- | --- |
| `docs.tool` | what generates the site, if there is one | `starlight`, `docusaurus`, `mkdocs`, `none` |
| `docs.root` | the directory the pages live in | a path, for example `docs/` |
| `docs.audience` | how far this documentation reaches | `single-user`, `team`, `public`, as described above |

**`docs.audience` is not decorative.** `public` commits an agent to never
writing an internal URL, a customer name or an infrastructure detail in a
page. `single-user` says the opposite: nothing leaves the repository, and a
raw note belongs there. **Nothing checks it**: review does, which is why the
value must be written rather than assumed.

**Two of these keys are decided by looking at the repository**, not by
reading this file: does a site already exist, and where do the pages live.
Only `docs.audience` is decided by reading.

**`docs/adr/` does not move with `docs.root`.** It is where ontrack reads
the ADRs, not a documentation page; the architecture document stays where
ADR-0010 puts it.

**What these keys do not cover:** the Diátaxis classification, the prose
style, the language, the architecture document and the ADRs. **And Diátaxis
itself is not refused here**: `rejected` means you keep no user
documentation, whatever ADR-0010 answers, not that you classify it
differently.

**All three keys are required**: an empty key is not an answer. The value is
written in this file and nowhere else; whoever needs it links here. See
ADR-0001 for the check command.

**Revisions.** What changed in the question at each revision, and what
a repository that already ruled must re-answer.

- Revision 2: the ADR governs the user documentation only; the architecture document and the ADRs are ADR-0010's, and no path moves with `docs.root` any more. Keys and values are unchanged, but the scope of `docs.root` and `docs.audience` narrowed: check that your answers still hold for the user documentation alone.

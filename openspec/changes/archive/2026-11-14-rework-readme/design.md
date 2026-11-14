# Design

## Context

`README.md` is 110 lines and ships in the npm package, so npm shows it as
the package page. Its flat table of 21 ADRs marks 12 as checked. A
frontmatter `check:` line, which is what `ontrack check` runs, exists in 11:
0006, 0008, 0009, 0010, 0011, 0012, 0015, 0016, 0017, 0018 and 0021.
ADR-0001 has a `check:` line only as an example in its body. What
`governance-check` verifies per ADR is in `checks/governance-check.ts`. It
runs a tool for 0006, 0009, 0015 and 0016, and checks that files are present
(`WIRING`) for 0008, 0010, 0011, 0012, 0017, 0018 and 0021. ontrack's repo
depends on `"trivoallan": "npm:@trivoallan/ontrack-governance@^0.3.0"` and
holds the 21 ADRs in `docs/adr/trivoallan/`. Tests are `checks/*.test.ts`,
run by `node --test` in `npm test`.

## Goals / Non-Goals

**Goals:**
- Make every claim in the README checkable against `adr/` or
  `checks/governance-check.ts`, and make `npm test` hold the part that
  drifts most (the counts and the ADR links).

**Non-Goals:**
- Generating the README from the ADRs.
- Testing the wording of the gain and verified columns. Review covers them.
- A documentation site for governance.

## Decisions

**The counts are written in digits, in fixed phrases.** The pitch says "The
21 questions I answer…" and "11 of them come with a check". The test then
matches `/(\d+) questions/` and `/(\d+) of them come with a check/` and
compares the numbers with `adr/`. Spelling the numbers out ("Eleven") would
need a number-to-word table in the test, for no gain to the reader.

**A `check:` line counts only in frontmatter.** The test reads each
`adr/ADR-*.md` file between its opening `---` and the next one. A
whole-file grep is what produced the wrong count of 12: ADR-0001's body
holds an example line.

**The 21 links sit in a plain list under the domain table**, ordered by
number, as "ADR-0006 Commits". Putting links inside the domain table would
add a fourth column to a table whose cells are already sentences. A domain
row names its ADRs by number only.

**The excerpt comes from ADR-0009 (Branching).** ADR-0006's recommendation
is `commitlint`, a Node tool, which would read as TypeScript-only to a
Python visitor. ADR-0009's traits (`github-flow`, `squash`, prefixes) name
no language. The excerpt is copied, not included, so it can drift from the
ADR. It is short, and it shows the shape of an ADR, not its current answer.

**What the Decisions & docs row says is verified.** `governance-check`
checks only ADR-0008's docs tool and root. That a ruled ADR carries its
verdict is attested by the `.mdschema.yml` shipped beside the ADRs, run by
hand (ADR-0001, rule 7). The row says so, under its own name, so that it
does not count as a `governance-check` claim.

**What "Not covered" lists, and where each item comes from.** It sits right
after the ADR list, so a visitor reads what is in and what is out together.
Every item is sourced:

| Item | Source |
| --- | --- |
| Static analysis of your own code (SAST) and licence compliance | ADR-0019, "Not concerned" |
| Which linter or formatter, and which test runner | ADR-0004, "What this key does not cover"; ADR-0011 runs the lint command the repository already has |
| Forges other than GitHub | ADR-0011 assumes GitHub |
| CI/CD workflow files | governance ships none: your agent writes them from the rules |
| Infrastructure as code, hosting and operations (logging, monitoring, incidents) | no ADR |
| Code review rules and ownership (`CODEOWNERS`) | no ADR, except a person's review of dependencies (ADR-0020) and of ignore rules (ADR-0019) |

A grep of `adr/` for these topics found no decision on them. The apply step
reruns that grep before writing the section. The section states no plans,
because a promise in a showcase is a claim nobody checks.

**CONTRIBUTING.md at the repository root**, not under `docs/`. GitHub links
it from the pull request and issue pages only there or in `.github/`. Its
text is the current "Work on it" and "Secret guard" sections, moved with
their links kept.

**The C4 link goes into ADR-0010's References as a link fix.** It adds
context to a reference list and changes no trait, enum or recommendation,
so `revision` stays at 1 (ADR-0001, rule 6).

## Risks / Trade-offs

- [ontrack's documentation site or its `AGENTS.md` moves] → the apply step
  checks each external link once. A dead link is a docs fix, not a test
  failure: the test does not fetch the network.
- [The gain column overclaims again as checks change] → each "verified"
  cell names the check it rests on, so a review of a check change can find
  the cell. This is a review rule, not a test.
- [npm resolves relative links differently from GitHub] → relative links
  to `adr/` and `CONTRIBUTING.md` resolve through the `repository` field on
  npm. The apply step checks one after the next release.

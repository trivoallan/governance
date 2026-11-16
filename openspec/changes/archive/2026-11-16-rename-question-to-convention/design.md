# Design

## Context

The vocabulary is decided in ontrack's repository, by its
`local/ADR-0027` ("A track ships conventions"). This change applies it to
the track. It decides nothing about the words themselves.

Where they live here: about 170 "question" and 175 "answer" in the 26 ADRs
of `adr/`, most of them in the block every ADR opens with and in the
Decision sections; the README; the specs `adr-format`, `adr-checks`,
`adr-catalog` and `readme`; three messages and a few identifiers in
`checks/`.

"surdesrails" or "SDR" appears in the 26 ADRs and in
`adr/.mdschema.yml`: 14 source lines, 12 sentences saying there is no
source, and about 20 mentions in ADR-0001 and in Alternatives. Two specs
require them: `adr-format` ("Source line") and `adr-catalog`.

`adr-format` says: "`revision` SHALL increase by one when, and only when,
the question an ADR asks changes […]. Wording, typo and link fixes SHALL
NOT change `revision`."

## Goals / Non-Goals

**Goals:**

- A reader of a shipped ADR, of the README or of ontrack's catalogue meets
  the words ontrack uses.
- No repository that imported the track has anything to do.

**Non-Goals:**

- Change what an ADR asks.
- Rewrite the copies repositories already hold.
- Rename the package, its command or its checks.
- Remove surdesrails from `CHANGELOG.md`, the archived changes or the
  track's own rulings under `docs/adr/`.

## Decisions

**No revision moves.** The traits, the allowed values and the
recommendations are the same; only words change. Raising 26 revisions
would tell every repository to rule again on conventions that did not
change. Alternative: raise them so that copies are refreshed; rejected,
ontrack never rewrites a ruled ADR, so a ruled copy would keep its text
anyway.

**"Value" for what an ADR recommends.** "The answer it recommends" becomes
"the value it recommends" where it is about a trait, and "ruling" where it
is about what the repository holds. A recommendation is not a ruling: only
a repository rules.

**The opening block is rewritten once, the same in every ADR.** It is the
text ontrack's catalogue shows first:

> **What is this file?** A convention ontrack-engineering proposes to your
> repository, with the values it recommends. While it says
> `status: proposed`, you may edit it freely. `revision:` dates the
> convention, not the file: you do not fill it, and it only moves when the
> convention changes. `rejected` is a full ruling: when the convention
> does not apply here, rule `rejected`, remove the whole `traits:` block,
> and say what stands in for it.

**surdesrails is no longer named, and no revision moves for it either.**
The source lines and the comparisons are provenance, not part of what an
ADR asks: no trait, value or recommendation depends on them. ADR-0001
loses one Negative consequence, its two Neutral ones and the alternative
"Importing surdesrails directly"; none of its nine rules changes, so it
stays at revision 4. An Alternative that cited surdesrails keeps its
reason and loses the name. Alternative: keep the source lines as credit;
rejected, a reader of an imported ADR cannot follow them to anything it
uses.

**A test keeps the name out.** `npm test` fails when a file of `adr/`
matches `surdesrails` or `SDR`. Without it the next ADR adapted by hand
brings the line back.

**The check messages follow, and break once.** They are read by a person
in a terminal or a CI log. Keeping "answer it there" would leave the old
word in the one place a failing repository reads.

**Scenario titles keep their words in the deltas.** A delta cannot rename
a scenario, nor drop one. They are renamed in place once the change is
archived, the three of `adr-catalog` whose content changed included:
"No service baseline", "Drift is written down" and "Same keys as the
source".

**The bodies are read, not replaced by pattern.** "Answer" is a verb and a
noun, and each ADR uses "question" in the everyday sense too. Each file is
edited and read.

## Risks / Trade-offs

- [Two wordings of one ADR exist for a while: the track's, and the copies
  imported before] → Expected and harmless: `plan` compares revisions, not
  text. ADR-0001 says once that "question" in an older copy means
  "convention".
- [A pattern replaces an everyday "question" or "answer"] → Each file is
  read after the edit.
- [The checks' messages change under a script that matches them] → Named
  as breaking in the release notes.
- [ADR-0001 changes with no revision, against "changes only through
  `revision`"] → No rule and no key changes; the format counts that as
  wording. A repository's ruled copy keeps its text.
- [This change lands before ontrack's] → The order is in the proposal;
  the README and the ADRs would name words ontrack does not print yet.

## Open Questions

- ADR-0014 (work tracking) does not say that its ruling tells the agent
  where to open the issues a review proposes. That is a change of what the
  ADR says, so a revision, and a change of its own.

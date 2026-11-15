# Tasks

## 1. Facts and schema

- [x] 1.1 Check design.md's Context against GitHub's documentation (self-approval refused, ruleset bypass modes and eligible actors in a personal repository, the approval rule's options, GitHub App installation tokens, commit verification for bots, the machine account terms) and Claude Code's sandbox documentation for credential isolation; verify by dropping every sentence ADR-0026 cannot source, and record the reading date for References
- [x] 1.2 Add `traits.agent.identity` (enum `maintainer`, `own`, optional) under `# ADR-0026` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty `identity` fails

## 2. ADR-0026

- [x] 2.1 Write `adr/ADR-0026-agent-identity.md` as a question ADR: `proposed`, `revision: 1`, one empty trait, no `check:` line, the four rules fixed under `own` (with ADR-0022 ruled `peer` and one approval), the admin role as extra bypass actor for pull requests only and its cost, what `own` with `maintainer` leaves, the statement of what is not verified, a how-to-rule block, the key table in References and "Original to governance"; verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 2.2 Write its comparison of a GitHub App and a machine account, and its Alternatives Considered (`maintainer`, the agent approving the maintainer's pull requests, every change through the agent, `Co-Authored-By` alone, `CODEOWNERS` with a required code owner review), each with its cost; verify each one names what it costs a one-person repository

## 3. Related ADRs and README

- [x] 3.1 In ADR-0022 (revision 2), link ADR-0026 from the Context sentence on telling an agent's act apart, name the repository admin role under ADR-0026's `own` beside Dependabot in the bypass sentence, and add to "One required approval for a single maintainer" that ADR-0026 makes it workable; in ADR-0018, name the same exception where it says no other actor goes in the bypass list; verify neither `revision:` moves and `npm test` (ADR revisions test) passes
- [x] 3.2 Update `README.md`: the pitch count (26 decisions, 16 with a check), ADR-0026 in the question list, and the Agents row (ADR-0026, with nothing verified for it); verify `npm test` (README counts and links) passes

## 4. Delivery

- [x] 4.1 Run `openspec validate add-agent-identity-adr --strict` and `npm test`; verify both pass
- [x] 4.2 Commit the merge of `main` and push to the pull request; verify its diff against `main` holds only the files listed in proposal.md's Impact and this change

# Tasks

## 1. Facts and schema

- [x] 1.1 Check design.md's Context against GitHub's documentation (self-approval refused, ruleset bypass modes "always" and "for pull requests only", auto-merge waiting for a required approval, the setting that lets GitHub Actions approve pull requests, GitHub App installation tokens, the machine account terms) and Claude Code's sandbox documentation for credential isolation; verify by dropping every sentence ADR-0026 cannot source, and record the reading date for References
- [x] 1.2 Add `traits.agent.identity` (enum `maintainer`, `own`, optional) under `# ADR-0026` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty `identity` fails

## 2. ADR-0026

- [x] 2.1 Write `adr/ADR-0026-agent-identity.md` as a question ADR: `proposed`, `revision: 1`, one empty trait, no `check:` line, the four rules fixed under `own`, the ruleset with the maintainer as sole bypass actor for pull requests only, the Dependabot automerge consequence, the statement that nothing is verified, a how-to-rule block, the key table in References and "Original to governance"; verify the schema fails it only on `status`, `date`, the empty trait and the marker sentence
- [x] 2.2 Write its comparison of a GitHub App and a machine account, and its Alternatives Considered (`maintainer`, machine account, GitHub App, `Co-Authored-By` alone, `CODEOWNERS` with a required code owner review), each with its cost; verify each one names what it costs a one-person repository

## 3. Related ADR and README

- [x] 3.1 In ADR-0022, link ADR-0026 from the Context sentence on telling an agent's merge apart, add to the ruleset paragraph that ADR-0026's ruleset replaces it under `agent.identity: own`, and add to the "One required approval" alternative that ADR-0026 makes it workable; verify `revision:` stays `1` and `npm test` (ADR revisions test) passes
- [x] 3.2 Update `README.md`: the pitch count (26 questions, 14 with a check), ADR-0026 in the question list, the Agents row (ADR-0026, with nothing verified for it), and the code review item in "Not covered" reduced to `CODEOWNERS` and review among several people, linking ADR-0022 and ADR-0026; verify `npm test` (README counts and links) passes

## 4. Delivery

- [x] 4.1 Run `openspec validate add-agent-identity-adr --strict` and `npm test`; verify both pass
- [x] 4.2 Commit, push and open the pull request; verify its diff holds only the files listed in proposal.md's Impact and this change

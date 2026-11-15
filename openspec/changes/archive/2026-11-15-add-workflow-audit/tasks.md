# Tasks

## 1. Facts and schema

- [x] 1.1 Check against zizmor's documentation (measured with zizmor 1.32.0 instead; recorded in design.md): the default `unpinned-uses` policy, the hash-pin policy syntax, that `--config` replaces config discovery, how inline ignores work, which audits are online-only, and `zizmorcore/zizmor-action`'s inputs. Record each in design.md's Context, and verify each has a link in ADR-0011's References
- [x] 1.2 Add `traits.forge.audit` (string, optional) under `# ADR-0011` in `adr/.mdschema.yml`; verify a ruled sample passes and one with an empty value fails

## 2. ADR-0011 revision 2

- [x] 2.1 Update `adr/ADR-0011-forge-and-ci.md`:
  - `revision: 2`, and an empty `forge.audit` in `traits:`;
  - the recommendation row and the three fixed rules;
  - the `audit` stage row;
  - zizmor in the "what the tools do not catch" section;
  - the how-to-rule check paragraph (tool run, shipped config, offline);
  - Consequences, with the "no tool enforces rules 3 to 5" line rewritten;
  - Alternatives: actionlint only, CodeQL's `actions` language, honouring the repository's config;
  - the key table and a Revisions list.

  Verify `npm test` (ADR revisions test) passes
- [x] 2.2 Measure the new "what the tools do not catch" section on a sample workflow, as the actionlint list was measured: a tag pin, `echo ${{ secrets.X }}`, `pull_request_target`, a workflow-level `contents: write`. Verify each line of the section matches the run

## 3. Check

- [x] 3.1 Write failing tests for each scenario of the ADR-0011 audit check: clean workflows, tag pin refused, repository config ignored, inline ignore honoured, audit none, zizmor missing, value not set, and gate plus audit both failing. Use a stub zizmor where the real one is absent, as the gitleaks tests do. Verify they fail
- [x] 3.2 Move ADR-0011 from `WIRING` to a check that runs the wiring row and then `zizmor --offline --no-config` on the tracked workflows; verify `npm test` passes with line coverage at or above 90 %

## 4. README and delivery

- [x] 4.1 Update the Delivery row of `README.md` to say what the audit verifies, without claiming rules 1 and 4; verify `npm test` passes
- [x] 4.2 Run `openspec validate add-workflow-audit --strict` and run the check against governance's own workflows with zizmor installed; verify it exits `0`. Then commit, push and open the pull request; verify its diff holds only the files in proposal.md's Impact and this change

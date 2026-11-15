# Proposal

Issue served: trivoallan/governance#75

## Why

Several ADRs name a tool that is neither an npm dependency nor a GitHub
Action (gitleaks in ADR-0015, the scanners in ADR-0019). No ADR says where
such a tool's version and checksum are recorded, nor how the same version
reaches a workstation, a CI runner and a remote agent session. In the
repository that raised this, one binary was handled three ways: pinned with
a checksum by a script on the runner, installed unpinned by a hook message
on a workstation, and missing in an agent session, where a commit went
through without the hook. Each repository that imports governance would
improvise its own answer.

## What Changes

- Add **ADR-0023 "Tools outside the package manager"**, a question ADR
  original to governance. Its question: *where do the tools that no package
  manager installs get their version, and how does one list reach every
  place they run?* One trait:
  - `tools.manager` (`mise`, `aqua`, `script`, `none`).
- Its Decision fixes, whatever the repository rules:
  1. every tool an accepted ADR names has one place holding its version and
     checksum;
  2. the same list serves the workstation, the runner and an agent session;
  3. a tool manager is itself installed pinned, being a dependency under
     ADR-0020;
  4. what keeps the pins current is stated, since Dependabot is not known
     to read these files (to verify).
- The ADR says that `script` (one pinned script in the repository) can be
  the right answer for a repository with a single tool, and that managers
  fetching unreviewed third-party scripts (asdf plugins) conflict with
  ADR-0011 rule 3 and ADR-0020's `install_scripts: ignored`.
- Add the trait to `adr/.mdschema.yml`.
- Whether to ship a check that each tool named by a ruled trait is pinned is
  decided in design.md: not in this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `adr-catalog`: the catalog gains ADR-0023 and its trait.

## Impact

- `adr/ADR-0023-tools.md`: new; consumers see it `new`.
- `adr/.mdschema.yml`: one trait.
- ADR-0011, ADR-0015, ADR-0018 and ADR-0020 are not revised; at most one
  link each, so `revision:` stays 1 (ADR-0001 rule 6).
- Depends on `add-review-merge-adr` landing first: both change the shipped
  ADR table, and this change assumes ADR-0022 is in it.
- governance rules ADR-0023 itself only after a release ships it.

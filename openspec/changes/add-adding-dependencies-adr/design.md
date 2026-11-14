# Design

## Context

`main` holds ADR-0001 to ADR-0018 and the schema `adr/.mdschema.yml`.
ADR-0018 fixes a three-day cooldown on updates (rule 2), and its "Not
concerned" paragraph covers only security alerts. See proposal.md (Why) for
the gap.

Facts checked on 2026-11-14, mostly from secondary sources (vendor blogs,
release write-ups). Task 1.1 confirms each one against official
documentation before the ADR states it. Sources are listed at the end of
this file.

**npm**
- npm 12 (released July 2026) no longer runs the `preinstall`, `install`
  and `postinstall` scripts of dependencies by default. A project allows
  them by name in an `allowScripts` field of `package.json`, written by
  `npm approve-scripts` and `npm deny-scripts`.
  `npm approve-scripts --allow-scripts-pending` lists what is blocked.
  The allowlist already exists from npm 11.16, as warnings.
  `strict-allow-scripts` turns a blocked script into an error, for CI.
- `ignore-scripts=true` in `.npmrc` takes precedence over `allowScripts`
  and silently disables the allowlist. The ADR does **not** recommend it on
  npm 12.
- `approve-scripts` reads `node_modules`. A new package is only listed
  after it is installed, with its scripts blocked.
- `min-release-age=<days>` in `.npmrc` refuses versions younger than N
  days (documented in npm 11 and 12; the version that added it is not
  stated). If `before` is also set in the same source, `before` wins.
- `npm audit signatures` verifies the registry signatures and the
  provenance attestations of downloaded packages.
- pnpm refuses the build scripts of packages not listed in `allowBuilds`,
  a map in `pnpm-workspace.yaml` (`esbuild: true`, `core-js: false`). It
  replaced `onlyBuiltDependencies` in pnpm 11. `minimumReleaseAge` is
  counted **in minutes**, with a default of `1440`, so three days is
  `4320`.

**Python** (ADR-0004 recommends it alongside TypeScript)
- A wheel runs no code when installed. A source distribution (sdist) runs
  its build backend with the installer's rights: this is Python's install
  script.
- uv refuses every sdist with `no-build = true`, or one package's sdist
  with `no-build-package` (a deny list). The workspace's own packages and
  editable requirements are still built. **No documented form refuses all
  sdists except one**: `no-build` has no allow list, and how
  `no-binary-package` interacts with it is not documented.
- pip refuses sdists with `--only-binary :all:`. Its docs do not say how a
  package-level `--no-binary` combines with it, so pip has **no documented
  per-package exception** either.
- uv's `exclude-newer` accepts a friendly duration (`"3 days"`) or an ISO
  8601 one (`P3D`). `exclude-newer-package = { name = "30 days" }` sets a
  per-package window, and `false` exempts a package. The uv version that
  added durations is not stated in its docs.
- pip 26.0 added `--uploaded-prior-to`, and pip 26.1 accepts `P<n>D`
  (`P3D`). It is only effective when the index serves upload times.
- Lockfiles: `uv.lock` with `uv sync --locked` in CI. With pip, a
  hash-pinned `requirements.txt` with `--require-hashes`, which requires
  every requirement to be pinned and hashed. pip's docs mark `pylock.toml`
  (PEP 751) support as experimental, so the ADR does not recommend it
  yet.
- Provenance: PyPI serves PEP 740 attestations for packages published
  through Trusted Publishing, on the project page and through its
  Integrity API. **No installer verifies them at install time.**
  `pypi-attestations verify pypi` is a separate manual step.
- Many import names differ from their distribution name
  (`yaml`/`PyYAML`, `sklearn`/`scikit-learn`, `cv2`/`opencv-python`).

## Goals / Non-Goals

**Goals:**
- One answer to "may I install this package now?" that an agent reads
  without interpreting.
- The same cooldown for additions as for updates, so the two ADRs cannot
  disagree.

**Non-Goals:**
- Requiring provenance or SLSA levels from dependencies: ADR-0020 (build
  provenance) concerns what a repository **publishes**, not what it admits.
- A list of allowed or forbidden packages, a minimum download count, or a
  required licence: each of these goes stale, and a licence policy is a
  separate question.
- Shipping a `.npmrc` or an allowlist file: governance ships questions, not
  configuration.

## Decisions

### Two keys: who decides, and what runs

Asking first and switching scripts off answer two different threats. Asking
first catches a wrong name before anything happens. Switching scripts off
makes installing a wrong name harmless until someone imports it. They are
independent, as `storage` and `guard` are in ADR-0015, so they are two keys.
Alternative considered: a single `admission.policy` key. Not chosen, for
the same reason as ADR-0018's two keys: it multiplies combined values.

### `person` recommended over `agent`

Review sees the diff **after** `npm install` ran, so reviewing a
`package.json` change is too late for the threat this ADR names. Asking
costs one message. A wrong name, once installed, can cost every secret the
session can reach (see ADR-0015 on the active leak). `agent` remains a
legitimate answer when `install_scripts: ignored` and the fixed rules hold.
It is stated in Alternatives Considered with that condition.

### Namespace `admission`, not `dependencies`

`dependencies.*` belongs to ADR-0018. Keeping one namespace per ADR means
that a key's prefix tells an agent which file to read. The slug is
`adding-dependencies`, so the filename reads next to `dependencies`.

### Fixed rules rather than more keys

The name check, the cooldown, the declaration, reporting provenance and
the committed lockfile are the same for every repository. A repository that
wants otherwise departs in its own ADR. The declaration's "why not the
standard library" line is deliberate: the cheapest dependency to admit is
the one not added.

### Provenance reported, not required

Few packages publish provenance today. A requirement would push agents to
route around the rule. Reporting it costs one command and makes its
absence visible to the person who approves.

### npm 12 makes `ignored` the default, not the decision

On npm 12 and pnpm 10, `ignored` is what the tool already does, so the
key could look redundant. It is not. The decision has moved: from "switch
scripts off" to "**who adds a name to `allowScripts`**". An agent that
runs `npm approve-scripts` on everything pending has ruled `allowed`
without anyone noticing. With `ignored`, each `allowScripts` or
`allowBuilds` entry is an admission and goes through `admission.approver`,
the same as a new package. On npm 11, `ignored` is applied through the
allowlist and `strict-allow-scripts` where available, not with
`ignore-scripts=true`, which would defeat the allowlist after the upgrade.

### `install_scripts` as an enum, ecosystem-neutral

`[ignored, allowed]`. The key names the principle: no code runs at
install time. It does not name npm's mechanism, so a Python repository
rules the same key. "Scripts" is kept because it is the word agents and
npm users already use. The ADR states that for Python it means building
an sdist. Packages that need install code are allowed by name, through the
mechanism the ecosystem offers, and that list is reviewed like code.

### No per-package exception in Python

uv and pip both refuse all sdists, but neither documents a way to refuse
all except one. The ADR does not invent one. Under `ignored`, a Python
package with no wheel for the platform is **not admitted**: the person
picks another package, or the repository rules `allowed` and names the
cost in its Consequences. Two alternatives were considered and not chosen,
by the maintainer's decision on 2026-11-14:
- applying `ignored` through `no-build-package` (a deny list), which
  leaves every new package unblocked;
- showing `no-build = true` plus `no-binary-package` as the exception,
  which is an undocumented interaction that might not work.

### npm and Python side by side, uv first

ADR-0004 recommends Python or TypeScript, so both appear in the ADR. Each
fixed rule and the `install_scripts` key get one table with an npm column
and a Python column. A repository then reads its own column without
translating. In the Python column, uv comes first because it covers the
lockfile, the cooldown and the build refusal in one tool and one
`pyproject.toml` section. pip appears where its mechanism differs, because
many repositories still use it. Alternative considered: npm only, with "the
ecosystem's equivalent" for the rest. Not chosen: that equivalent is where
an agent guesses, and the import/distribution name trap has no npm
counterpart to translate from. Other ecosystems (Go, Rust, Ruby) are not
tabulated. The ADR states the principle and leaves them to it, since no
governance ADR recommends them.

### The import-name trap is part of rule 1

Rule 1 already says the name comes from a source. In Python the usual
source of error is the import statement the agent is trying to satisfy.
The ADR says so explicitly, with two examples, because it is the most
common way an agent installs the wrong Python package.

## Risks / Trade-offs

- [`ignored` breaks packages that compile or download a binary at install
  time] → the ADR says so in Negative consequences and names the
  allow-by-name path (`allowScripts`, `allowBuilds`). Python has no
  such path (see Context). Many such packages now ship prebuilt binaries as optional
  dependencies.
- [`approve-scripts` lists a package only after installing it] → the
  package is installed with its scripts blocked, which is harmless. The
  approval then comes before any script runs.
- [No Python installer verifies attestations] → rule 4 only asks that the
  declaration report them, from the PyPI page or the Integrity API.
- [`person` slows an agent down on every new package] → accepted. Additions
  are rarer than updates, and the declaration is the message the agent
  sends anyway.
- [The name check relies on the agent reading a real source] → the
  declaration in the pull request names that source, so review can follow
  it.
- [npm, uv and pip facts drift, especially around release age and
  per-package build exceptions] → task 1.1 re-checks them. The ADR names
  features, not versions, and a mechanism that cannot be confirmed is left
  out of the table rather than guessed.
- [Refusing sdists in Python breaks packages published without wheels for
  the platform] → stated in Negative consequences. The allow-by-name path
  is the same as for npm.

## Migration Plan

One pull request containing ADR-0019, the schema lines, the ADR-0018 line
and this change. Consumers see ADR-0019 `new` in `ontrack plan`. Rollback
is a revert of the pull request.

## Sources

Read on 2026-11-14. Official documentation, checked by tasks 1.1 and 1.2:

- [npm config v12](https://docs.npmjs.com/cli/v12/using-npm/config), [npm approve-scripts](https://docs.npmjs.com/cli/v12/commands/npm-approve-scripts), [npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit)
- [pnpm build settings](https://pnpm.io/settings/build), [pnpm dependency resolution](https://pnpm.io/settings/dependency-resolution)
- [uv settings](https://docs.astral.sh/uv/reference/settings/), [uv CLI](https://docs.astral.sh/uv/reference/cli/), [uv resolution](https://docs.astral.sh/uv/concepts/resolution/)
- [pip install](https://pip.pypa.io/en/stable/cli/pip_install/), [pip secure installs](https://pip.pypa.io/en/stable/topics/secure-installs/), [pip news](https://pip.pypa.io/en/stable/news/)

Secondary sources read first:

- npm 12 and `allowScripts`: [GitHub changelog, upcoming breaking changes for npm v12](https://github.blog/changelog/2026-06-09-upcoming-breaking-changes-for-npm-v12/), [InfoQ](https://www.infoq.com/news/2026/08/npm-12-released/), [Socket](https://socket.dev/blog/npm-12), [Semgrep](https://semgrep.dev/blog/2026/rip-npm-postinstall-scripts-npm-v12-default-change/)
- npm `min-release-age`: [Socket](https://socket.dev/blog/npm-introduces-minimumreleaseage-and-bulk-oidc-configuration), [Classmethod](https://dev.classmethod.jp/articles/npm-v11-min-release-age/), [npm/cli#9199](https://github.com/npm/cli/issues/9199)
- pnpm: [pnpm in 2025](https://pnpm.io/blog/2025/12/29/pnpm-in-2025), [pnpm 10.0.0 release](https://newreleases.io/project/npm/pnpm/release/10.0.0), [pnpm 11 defaults](https://doolpa.com/news/pnpm-11-released-esm-node-22-supply-chain-defaults-april-28-2026)
- uv: [uv CLI build options](https://docs.rs/uv-cli/0.0.8/uv_cli/struct.BuildOptionsArgs.html), [pydevtools, supply chain attacks with uv](https://pydevtools.com/handbook/how-to/how-to-protect-against-python-supply-chain-attacks-with-uv/)
- pip: [What's new in pip 26.0](https://ichard26.github.io/blog/2026/01/whats-new-in-pip-26.0), [relative cooldowns in pip 26.0](https://buttondown.com/sethmlarson/archive/relative-dependency-cooldowns-in-pip-v260-with/), [pip news](https://pip.pypa.io/en/stable/news/)
- pylock.toml: [PEP 751](https://peps.python.org/pep-0751/), [pydevtools, installing pylock.toml with pip](https://pydevtools.com/handbook/how-to/how-to-install-from-a-pylock-toml-lockfile-with-pip/)
- PEP 740: [pypi-attestations](https://github.com/pypi/pypi-attestations), [pydevtools, pylock.toml and attestations](https://pydevtools.com/handbook/explanation/why-pylock-toml-includes-digital-attestations/)

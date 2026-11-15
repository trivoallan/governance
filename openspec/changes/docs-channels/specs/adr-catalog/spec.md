# Spec Delta

## ADDED Requirements

### Requirement: ADR-0008 asks which versions the site publishes
ADR-0008 SHALL ask `docs.channels`, the versions of the user documentation
the site publishes, as a list of `release` and `main`:
- `release` is the latest published release;
- `main` is the default branch.

The list SHALL hold at least one value and each value at most once. The key
SHALL be required when `docs.tool` is not `none`, and SHALL be absent when
`docs.tool` is `none`. ADR-0008 SHALL recommend:
- `[release, main]` when ADR-0012's `delivery.target` is `package`;
- `[main]` when every merge reaches users.

ADR-0008's Decision SHALL fix these rules:
1. `release` is served at the site root when listed, otherwise `main` is; the other listed channel is served under `next/`.
2. Until the repository has a first release, `main` is served at the root and `next/` does not exist.
3. One workflow deploys the site, and every run rebuilds every listed channel, because GitHub Pages holds one site per repository.
4. Each channel builds from its own checkout of its own commit.
5. When both channels are listed, the pages of `main` carry a banner that points to the released documentation.
6. An agent writes a feature's pages in the pull request that adds the feature, whatever has been released.

ADR-0008's how-to-rule block SHALL say what the check reads for this key.
Its Alternatives SHALL weigh and refuse three options:
- copies of the pages per version;
- a value derived from ADR-0012's `delivery.environments`;
- a single enum value instead of a list.

Its Docusaurus alternative SHALL NOT present versioning as a reason to
choose it. Older majors and a version picker SHALL stay out of the key.

#### Scenario: Package with a site
- **WHEN** an agent rules ADR-0008 with `docs.tool: starlight` in a repository whose ADR-0012 has `delivery.target: package`
- **THEN** ADR-0008 recommends `docs.channels: [release, main]`

#### Scenario: No site
- **WHEN** an agent rules ADR-0008 with `docs.tool: none`
- **THEN** ADR-0008 tells it to leave `docs.channels` out of `traits:`

#### Scenario: Unreleased repository
- **WHEN** a repository rules `docs.channels: [release, main]` and has no release yet
- **THEN** ADR-0008 says `main` is served at the root and `next/` does not exist

#### Scenario: Two deploy workflows
- **WHEN** an agent plans one workflow that deploys `release` on tags and another that deploys `main` on pushes
- **THEN** ADR-0008's rule 3 tells it that the second deploy replaces the first, and to rebuild both channels in one workflow

#### Scenario: Feature not yet released
- **WHEN** an agent adds a feature and its pages while the latest release lacks the feature
- **THEN** ADR-0008 tells it to write the pages in the same pull request, not after the release

## MODIFIED Requirements

### Requirement: User documentation and architecture documentation are ruled apart
ADR-0008 SHALL govern only the documentation written for whoever uses the
product: `docs.root`, `docs.audience`, `docs.channels` and Diátaxis SHALL
apply to it alone, and its `rejected` SHALL mean "no user documentation",
whatever ADR-0010 answers. ADR-0010 SHALL take nothing from ADR-0008 but a
possible shared site, and SHALL say that the audience of the architecture
document and of the ADRs is the repository's visibility, observed rather
than asked. Neither ADR SHALL say that a path moves with `docs.root`: the
ADRs stay in `docs/adr/`, the architecture document in
`docs/architecture/arc42/` and the model in `docs/architecture/model/`.
ADR-0010 SHALL be at `revision: 2`. ADR-0008 SHALL be at `revision: 3`,
whose Revisions entry says that `docs.channels` was added and that a
repository whose `docs.tool` is not `none` must answer it.

#### Scenario: No path follows docs.root
- **WHEN** ADR-0008 and ADR-0010 are searched for a path said to move with `docs.root`
- **THEN** none is found

#### Scenario: The glob snippet warns of what it publishes
- **WHEN** ADR-0008 shows the Starlight `glob` loader over `./docs`
- **THEN** it says the pattern also publishes `adr/` and `architecture/`, and shows how to exclude them

#### Scenario: Revision 3 entry
- **WHEN** ADR-0008's Revisions list is read
- **THEN** its `Revision 3:` entry names `docs.channels` and says who must answer it

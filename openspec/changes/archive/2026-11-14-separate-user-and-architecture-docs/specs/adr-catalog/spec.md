## ADDED Requirements

### Requirement: User documentation and architecture documentation are ruled apart
ADR-0008 SHALL govern only the documentation written for whoever uses the
product: `docs.root`, `docs.audience` and Diátaxis SHALL apply to it alone,
and its `rejected` SHALL mean "no user documentation", whatever ADR-0010
answers. ADR-0010 SHALL take nothing from ADR-0008 but a possible shared
site, and SHALL say that the audience of the architecture document and of
the ADRs is the repository's visibility, observed rather than asked.
Neither ADR SHALL say that a path moves with `docs.root`: the ADRs stay in
`docs/adr/`, the architecture document in `docs/architecture/arc42/` and
the model in `docs/architecture/model/`. Both ADRs SHALL be at
`revision: 2`, with their keys and values unchanged.

#### Scenario: No path follows docs.root
- **WHEN** ADR-0008 and ADR-0010 are searched for a path said to move with `docs.root`
- **THEN** none is found

#### Scenario: The glob snippet warns of what it publishes
- **WHEN** ADR-0008 shows the Starlight `glob` loader over `./docs`
- **THEN** it says the pattern also publishes `adr/` and `architecture/`, and shows how to exclude them

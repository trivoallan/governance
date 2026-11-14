# Spec Delta

## ADDED Requirements

### Requirement: Revisions list
Every ADR governance ships with a `revision` above 1 SHALL end with a
paragraph that starts with `**Revisions.**`, followed by one list item per
revision from 2 up to the current one, in increasing order. Each item
SHALL start with `Revision N:`. It SHALL say what changed in the question
and what a repository that already ruled must re-answer, or say that it
has nothing to re-answer. An ADR at revision 1 SHALL carry no such list.
The list SHALL sit after the References section's content, so a
repository's ruled copy keeps it. ADR-0001 SHALL say that a repository
reads this list when `ontrack plan` reports an ADR `revised`. `npm test`
SHALL fail when a shipped ADR's `revision` and its list disagree.

#### Scenario: Revision without its entry
- **WHEN** a shipped ADR has `revision: 3` and its Revisions list holds only `Revision 2:`
- **THEN** `npm test` fails and names that ADR and the missing revision 3

#### Scenario: Entry for a revision that does not exist
- **WHEN** a shipped ADR has `revision: 2` and its Revisions list holds `Revision 3:`
- **THEN** `npm test` fails and names that ADR

#### Scenario: First revision
- **WHEN** a shipped ADR has `revision: 1`
- **THEN** it carries no Revisions list and `npm test` passes

#### Scenario: Consumer reads what to re-answer
- **WHEN** `ontrack plan` reports ADR-0012 `revised` from revision 2 to 3
- **THEN** ADR-0012's `Revision 3:` entry names `delivery.release_notes` as the one key to answer

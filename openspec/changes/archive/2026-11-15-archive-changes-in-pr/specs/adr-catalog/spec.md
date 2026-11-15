# Spec Delta

## ADDED Requirements

### Requirement: ADR-0016 archives a change in the pull request that completes it
ADR-0016 SHALL state, without a key, that with `changes.framework: openspec`
a change is archived in the pull request that checks its last task. A
change whose remaining tasks can only be done after the merge SHALL stay in
`openspec/changes/` until the pull request that checks them, which archives
it. ADR-0016 SHALL state the hole this leaves: a change merged with a task
done but left unchecked is not caught by the check, and is seen in review.
Its Alternatives SHALL weigh and refuse:
- archiving before each release, because it blocks the release pull
  request, cannot hold for a change whose tasks need the release, and has
  no meaning without a release tool;
- a `changes.archive` key with a `manual` value, because it only keeps the
  specs behind the code.

ADR-0016 SHALL be at `revision: 3`, whose Revisions entry says that no key
changed and that the ADR-0016 check now fails on a complete change left
unarchived. ADR-0012's definition of done SHALL point to this rule, and
ADR-0012's `revision:` SHALL NOT move.

#### Scenario: Last task checked
- **WHEN** an agent checks the last task of a change in its pull request
- **THEN** ADR-0016 tells it to archive the change in that same pull request

#### Scenario: Tasks that wait for the release
- **WHEN** a change's remaining tasks are to merge the release pull request and act after it
- **THEN** ADR-0016 lets the change stay in `openspec/changes/` after its first pull request, and archive it in the pull request that checks those tasks

#### Scenario: Revision 3 entry
- **WHEN** ADR-0016's Revisions list is read
- **THEN** its `Revision 3:` entry says that no key changed and that a complete change left unarchived fails the check

#### Scenario: ADR-0012 points to the rule
- **WHEN** ADR-0012's definition of done is read
- **THEN** it names ADR-0016's archive rule for repositories that rule `changes.framework: openspec`

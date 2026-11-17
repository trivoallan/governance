# Tasks

## 1. README

- [x] 1.1 Title the README `@trivoallan/ontrack-engineering`, open it with the new pitch, its scope and counts, then the ontrack track sentence; verify the first screen matches the `readme` delta
- [x] 1.2 Sort the domain table alphabetically; verify the row order reads Agents to Workflow
- [x] 1.3 Change the install command to `npm i -D trivoallan@npm:@trivoallan/ontrack-engineering`
- [x] 1.4 Make `checks/readme.test.ts` read the count from "N decisions"; verify `npm test` passes its readme tests

## 2. Package and records

- [x] 2.1 Set `name` in `package.json` and `package-lock.json` to `@trivoallan/ontrack-engineering`, keeping the `trivoallan` devDependency on the old name (design: the self-import)
- [x] 2.2 Name the new package in `.github/workflows/release.yml`'s header comment
- [x] 2.3 In ADR-0012's ruling, name the new package and why it was renamed, with the deprecated old name as a consequence; in ADR-0021, name the new package; verify with `git diff` that no trait or `revision` changed
- [x] 2.4 Run `openspec validate rename-to-ontrack-engineering --strict`; verify it passes

## 3. First release under the new name (the person)

- [x] 3.1 Declare `release.yml` as trusted publisher of `@trivoallan/ontrack-engineering` on npmjs, publishing the first version by hand if npmjs requires an existing package (design)
- [x] 3.2 Merge the release pull request for 0.6.0; verify `npm view @trivoallan/ontrack-engineering version` prints `0.6.0` and `npm audit signatures` passes on an install of it
- [x] 3.3 Run `npm deprecate @trivoallan/ontrack-governance "Renamed @trivoallan/ontrack-engineering"`; verify `npm view @trivoallan/ontrack-governance deprecated` prints that message
- [x] 3.4 On or after three days after 0.6.0, point the `trivoallan` devDependency at `npm:@trivoallan/ontrack-engineering@^0.6.0`; verify `npm ci` passes and `node_modules/trivoallan/adr/` exists
- [x] 3.5 Tell tambouille's maintainer the alias target changed

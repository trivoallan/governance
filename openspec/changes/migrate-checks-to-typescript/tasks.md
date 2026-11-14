# Tasks

## 1. Toolchain

- [x] 1.1 Ask before installing, in ADR-0020's form, for `typescript` and `@types/node@22` (versions at least three days old, source, why, provenance from `npm audit signatures`); on a yes, `npm install -D` both; verify `package-lock.json` lists them and neither has an install script
- [x] 1.2 Add `tsconfig.json` (`rootDir: checks`, `outDir: dist`, `nodenext`, `strict`, `erasableSyntaxOnly`) and `dist/` to `.gitignore`; verify `git status` does not show `dist/` after a build

## 2. Migration

- [x] 2.1 `git mv` `checks/governance-check.mjs` to `checks/governance-check.ts` and add types (trait records, wiring rows, `CHECKS`, option object) without changing behaviour or messages; verify `npx tsc --noEmit` passes and `node checks/governance-check.ts ADR-0003` prints `governance ships no check for ADR-0003`
- [x] 2.2 `git mv` `checks/governance-check.test.mjs` to `checks/governance-check.test.ts`, type it, and point `script` at `governance-check.ts`; verify `node --test checks/*.test.ts` passes with the same number of tests as before

## 3. Package

- [x] 3.1 In `package.json`, set `bin` and `files` to `dist/governance-check.js`, add `build: tsc` and `prepare: npm run build`, and set `test` to `tsc --noEmit && node --test checks/*.test.ts`; verify `npm test` passes and `npm pack --dry-run` lists `dist/governance-check.js` and no `.ts` or test file
- [x] 3.2 In `.github/workflows/release.yml`, add `npm ci` before `npm publish` and replace the "No install" comment; verify `npm publish --dry-run` in a clean clone after `npm ci` lists `dist/governance-check.js`

## 4. End to end

- [x] 4.1 In a scratch consumer with a ruled ADR-0006, install the tarball from `npm pack` and run `npx --no-install governance-check ADR-0006`; verify the "Installed from the npm registry" scenario
- [x] 4.2 In a scratch consumer, install this branch as a git dependency (`git+file://` or the pushed branch) and run the same command; verify the "Installed from a git tag" scenario
- [x] 4.3 Run `openspec validate migrate-checks-to-typescript --strict`; verify it passes

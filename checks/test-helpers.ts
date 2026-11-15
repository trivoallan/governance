// Helpers shared by the tests under checks/. Not a test file itself, so
// `node --test checks/*.test.ts` does not run it; not shipped (package.json
// "files" lists dist/ontrack-engineering-check.js only).
import { dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

// A private key that gitleaks' private-key rule finds; random, so it is no real key.
export const privateKey = () => `-----BEGIN RSA PRIVATE KEY-----\n${randomBytes(600).toString('base64').match(/.{1,64}/g)!.join('\n')}\n-----END RSA PRIVATE KEY-----\n`; // gitleaks:allow

// A pattern matching the key's first body line, to assert it was redacted.
export const keyLine = (key: string) => new RegExp(key.split('\n')[1].replace(/[+/]/g, '\\$&'));

export const onPath = (name: string) => spawnSync('sh', ['-c', `command -v ${name}`]).status === 0;

// A PATH with git and node but neither gitleaks nor openspec.
export const barePath = [dirname(process.execPath), '/usr/bin', '/bin'].join(':');

# governance

My governance: the ADRs I apply to my own repositories, shared as an
[ontrack](https://github.com/trivoallan/ontrack) source.

It is real, not a demo. ADRs change when my practice changes; a new
`revision:` means the question itself moved.

## Use it

```bash
npm i -D trivoallan@git+https://github.com/trivoallan/governance.git
npx ontrack plan
```

The alias (`trivoallan` here) is yours: it becomes the namespace, and the
ADRs land in `docs/adr/<alias>/`. Rename it if you like.

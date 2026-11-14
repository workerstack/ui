# workerstack/ui

Bun workspace for the `@workerstack/ui` packages.

| Package | Path | |
| --- | --- | --- |
| `@workerstack/ui` | [`packages/core`](packages/core) | Styled Solid 2 components on UI SDK and Tailwind v4 |
| `@workerstack/playground` | [`packages/playground`](packages/playground) | Private. Every component on one page, imported as an app imports them |

Bugs found upstream are written up in [`docs/upstream/`](docs/upstream), one file per dependency, ready to turn into PRs.

Shared dependency versions live in the root `package.json` `catalog`; packages refer to them as `"catalog:"`, which `bun publish` / `bun pm pack` replace with the exact version. Compiler options are in `tsconfig.base.json`.

```sh
bun install
bunx playwright install chromium   # once, for the browser tests
bun run dev                        # playground on http://localhost:5180, rebuilds the library on save
bun run typecheck                  # every package
bun run test
bun run build
```

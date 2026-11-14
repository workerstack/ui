# @workerstack/repo findings

Bugs and gaps in [`@workerstack/repo`](https://github.com/workerstack/repo) found while adopting it in this repo. Version: `0.2.0-rc.0` unless noted.

| ID | Summary | Area | Severity | Status | PR |
| --- | --- | --- | --- | --- | --- |
| [REPO-1](#repo-1) | `lint --fix` turns a module augmentation's `interface` into a `type`, which breaks the augmentation | standards: oxlint config | Medium: the fix breaks the typecheck | open | — |
| [REPO-3](#repo-3) | `lint --fix` rewrites `toHaveBeenCalled()` to `toHaveBeenCalledWith()`, which asserts a call with no arguments | standards: oxlint config (rule from oxlint's vitest plugin) | High: the fix silently changes what a test asserts | open | — |
| [REPO-2](#repo-2) | The published docs name `repo.config.ts`; `init` and `sync` use `workerstack.config.ts` | docs | Low | open | — |

---

## REPO-1

**`typescript/consistent-type-definitions` autofixes an `interface` inside `declare module` to a `type`.**

- **Repro:** `bun repo lint --fix` on
  ```ts
  declare module "vitest/browser" {
    interface BrowserCommands {
      serverRender: (fixture: string, name: string) => Promise<ServerRendered>
    }
  }
  ```
  It rewrites the block to `type BrowserCommands = { … }`. A type alias can't merge into the module's interface, so TypeScript reports `Duplicate identifier 'BrowserCommands'` and every `commands.serverRender` call fails to typecheck.
- **Where:** the generated `.oxlintrc.json` sets `typescript/consistent-type-definitions` to `type`. The rule doesn't exempt declaration merging.
- **Fix idea:** exempt interfaces inside `declare module` / `declare global` (they exist to merge) in the preset, or report them without the autofix.
- **Workaround here:** a `lint.skip` entry for `packages/core/vitest.hydration.commands.ts` in `workerstack.config.ts`. `respectEslintDisableDirectives` is off, so a disable comment doesn't work.
- **Pinned by:** no test yet. A pinning test would run `oxlint --fix` on a fixture with the block above and expect it unchanged.

## REPO-3

**The autofix of `vitest/prefer-called-with` changes what a test asserts.**

- **Repro:** `bun repo lint --fix` on `expect(onChange).toHaveBeenCalled()`. It becomes `expect(onChange).toHaveBeenCalledWith()`, which passes only for a call with zero arguments. Here it turned four passing tests into failures (`input.test.tsx`, `select.test.tsx`, `menu.test.tsx`, `menu.browser.test.tsx`). A test that once checked nothing more specific would fail too. One where the mock really is called with no arguments would pass, while the edit still goes unseen in a big fix run.
- **Where:** the rule and its fixer come from oxlint's vitest plugin. The standards preset turns the rule on, and `bun repo lint --fix` / `turn` / the pre-commit hook apply its fix.
- **Fix idea:** report the rule without applying its fix: the right arguments can't be inferred. Either set it as a suggestion only in the preset, or report the unsafe fixer to oxlint.
- **Fixed here by hand:** each site now asserts the real arguments (`toHaveBeenLastCalledWith("Ada", expect.anything())`, …).
- **Pinned by:** no test yet (same as REPO-1).

## REPO-2

**Docs name the wrong config file.** `references/exports.md` (`## Config`) and `references/workflow.md` say `repo.config.ts` at the root. `bun repo init` writes `workerstack.config.ts`, and `bun repo sync` reads only that name.

- **Also:** the docs in the `workerstack/repo` checkout describe a `workflow` key (`"worktree" | "pull-request" | "main"`) that `0.2.0-rc.0` rejects (`unknown key "workflow"`). That's expected until the next release, but this repo can't set `workflow: "main"` until then, so it runs without the `agents` pack (which in rc.0 enforces worktrees).

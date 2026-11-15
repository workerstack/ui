# @workerstack/repo findings

Bugs and gaps in [`@workerstack/repo`](https://github.com/workerstack/repo) found while adopting it in this repo. Version: `0.2.0-rc.0` unless noted.

| ID | Summary | Area | Severity | Status | PR |
| --- | --- | --- | --- | --- | --- |
| [REPO-1](#repo-1) | `lint --fix` turns a module augmentation's `interface` into a `type`, which breaks the augmentation | standards: oxlint config | Medium: the fix breaks the typecheck | open | — |
| [REPO-3](#repo-3) | `lint --fix` rewrites `toHaveBeenCalled()` to `toHaveBeenCalledWith()`, which asserts a call with no arguments | standards: oxlint config (rule from oxlint's vitest plugin) | High: the fix silently changes what a test asserts | open | — |
| [REPO-4](#repo-4) | A root that holds only config files cannot type check them: every rule path ends in a refusal or an empty program | standards: tsconfig checks | Medium: root configs go unchecked | open | — |
| [REPO-5](#repo-5) | A public manifest's `author` may be written as `\u` escapes (`Lovro \u017dagar`); check passes it and nothing rewrites it as text | public package checks | Low: the published package.json shows the escape | open | — |
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

## REPO-4

**A repo root whose only TypeScript files are `repo.config.ts` and `vitest.config.ts` cannot type check them.** Version: `link:../repo` at 2026-11-15.

- **Repro:** add a root `tsconfig.json` that includes `*.ts`. Then:
  - `bun repo check` requires a root `tsconfig.src.json` that extends `@workerstack/repo/tsconfig/strict`.
  - The strict config has `isolatedDeclarations`, so `export default defineConfig(...)` fails with TS9037.
  - Typing the export (`const config: RepoConfig = defineConfig(...)`) fails `repo(config-file)`, and `RepoConfig` without its pack parameters does not accept the narrowed config (TS2322 on `nightly`).
  - Excluding `*.config.ts`, as the sibling repos do, leaves the strict config with no inputs (TS18003), and `"files": []` is refused because it drops the base's `reset.d.ts`.
  - Overriding `isolatedDeclarations: false` is refused.
- **Where:** the tsconfig checks in `bun repo check` assume every tsconfig has source beyond its configs.
- **Fix idea:** do not require a strict sibling when the plain config holds only `*.config.ts`, or let the strict sibling be skipped when it would have no inputs.
- **Here:** no root tsconfig, so the two root configs are not type checked. The editor checks them with its default settings.
- **Pinned by:** no test yet (same as REPO-1).

## REPO-5

**`bun repo check` passes an `author` written with `\u` escapes, and no command writes it as text.** Version: `link:../repo` at 2026-11-15.

- **Repro:** set `"author": "Lovro \u017dagar"` in a public package.json whose `owner.name` in `repo.config.ts` is `Lovro Žagar`. `bun repo check` passes, because `check-public.ts` (`authorLines`) compares the parsed value with the owner's name. The escape stays in the published manifest. Here a tool that writes JSON as ASCII only (Python's `json.dump`) turned the name into the escape, and it went back and forth across three commits.
- **Where:** the `author` and owner checks in `cli/check-public.ts`. The owner's name lives in `repo.config.ts`, but only a check reads it; `bun repo sync` writes nothing into a public manifest.
- **Fix idea:** let `bun repo sync` own the fields it already derives from `owner` (`author`, and the others `check-public.ts` judges), writing them as text; `bun repo sync --check` then reports a manifest whose text differs, escaped or not.
- **Here:** the author is written as text by hand, and `packages/core/scripts/sync-exports.ts` writes package.json as `JSON.stringify` gives it (no escapes). No check of our own: the repo tool owns this field.
- **Pinned by:** no test yet (same as REPO-1). A pinning test would run `bun repo sync --check` on a fixture repo with the escaped author and expect drift.

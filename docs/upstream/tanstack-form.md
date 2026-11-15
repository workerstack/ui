# TanStack Form findings

Bugs and gaps in [TanStack Form](https://github.com/TanStack/form) (`@tanstack/solid-form`, `@tanstack/solid-store`) found while building `@workerstack/ui/form`. A runtime bug is pinned by a test marked `it.fails`; a workaround is pinned by a test that fails once it is no longer needed or no longer works. When an upgrade fixes a finding, drop its workaround and set it to **fixed**.

Version: `@tanstack/solid-form` from `https://pkg.pr.new/@tanstack/solid-form@1db6f68`, `@tanstack/solid-store` `0.9.3`, on `solid-js` `2.0.0-rc.20`. Source locations are in the published `dist` (`node_modules/@tanstack/…`).

| ID | Summary | Area | Severity | Status | PR |
| --- | --- | --- | --- | --- | --- |
| [TF-1](#tf-1) | The Solid 2 build is only a pkg.pr.new preview | solid-form: release | High: no published version to pin | open | [#2464](https://github.com/TanStack/form/pull/2464) |
| [TF-2](#tf-2) | `useStore` writes its signal from `subscribe` without `ownedWrite` | solid-store: useStore | None on rc.20: no warning found | not reproduced | — |
| [TF-3](#tf-3) | A form with an array field is not assignable to `AnyFormApi` | form-core: types | Low: types only, worked around | open | — |
| [TF-4](#tf-4) | `useStore` reads its own signal untracked in `subscribe` | solid-store: useStore | Low: a dev warning per subscriber when the store changes inside an effect | open | — |
| [TF-5](#tf-5) | `createField` reads its options untracked on setup | solid-form: createField | Low: a dev warning per field whose name is reactive, worked around | open | — |

---

## TF-1

**The Solid 2 build is only a preview.** `@tanstack/solid-form` for Solid 2 exists only as a pkg.pr.new build of an open PR.

- **Where:** PR [TanStack/form#2464](https://github.com/TanStack/form/pull/2464), commit `1db6f68`. The catalog pins `@tanstack/solid-form` to `https://pkg.pr.new/@tanstack/solid-form@1db6f68`.
- **Effect:** the preview can be removed or rebuilt at any time; nothing on npm carries it. `@workerstack/ui` lists solid-form as an optional peer, so an app has to pin the same URL.
- **Fix idea:** none on our side. When the PR is released, pin the npm version and rerun `src/form`'s tests (`engine.test.tsx` is the contract the engine must keep).

## TF-2

**`useStore` writes its bridge signal from the store's subscription without `ownedWrite`.** The monorepo patched solid-store to pass `ownedWrite: true`, because Solid 2's dev build warns when a signal is written from an owned scope.

- **Where:** `@tanstack/solid-store` `0.9.3`, `useStore`: it creates a signal for the selected slice and writes it from `store.subscribe(...)`.
- **Effect on rc.20:** none found. Solid skips the owned-write check while a cleanup runs, so unmounting a field or a form never warns. We ran the whole `src/form` suite and probes for late fields, array rows, async validators and reactive defaults without the patch: no owned-write warning.
- **Decision:** no patch. A root `patchedDependencies` entry only reaches this repo, never an app that installs `@workerstack/ui`. `engine.test.tsx` keeps the unmount and row tests, so a warning that comes back fails them.
- **Fix idea:** create the signal with `{ ownedWrite: true }` upstream anyway; it is written only from the store's subscription.

## TF-3

**A form whose values hold an array is not assignable to `AnyFormApi`.** `FormApi<{ tags: string[] }>` fails against `AnyFormApi` on `pushFieldValue` (and the other array methods).

- **Where:** form-core's array methods type their value through `DeepKeysOfType<TFormData, any[]>`; for `AnyFormApi` (`TFormData = any`) the value resolves to `never`, and a typed form's value is not assignable to `never`.
- **Effect:** a component that takes "any form" as `AnyFormApi` rejects every form with an array field at compile time.
- **Workaround:** `FormFor<TFormData>` (`packages/core/src/form/form-field.ts`) leaves the array methods out of its type, and `anyForm(form)` widens it back for the calls that take `AnyFormApi`. `engine.test.tsx`'s array-row test compiles only while the workaround holds.
- **Fix idea:** type the array methods of `FormApi<any>` so they take `any` values (for example by checking `0 extends 1 & TFormData` before `DeepKeysOfType`).

## TF-4

**`useStore` reads its own signal, untracked, inside the store's subscription.** It compares the new slice with `signal()` before writing it.

- **Where:** `@tanstack/solid-store` `0.9.3`, `useStore`, the `store.subscribe(...)` callback.
- **Effect:** when the form store changes inside an effect callback (for example `createForm` applying new `defaultValues` from a signal), each subscriber logs `STRICT_READ_UNTRACKED` in Solid's dev build. Values stay right; only the warning is wrong.
- **Pin:** `packages/core/src/form/tanstack-upstream.test.tsx` (`it.fails`).
- **Workaround:** our code writes the form store from event handlers, or wraps a write made inside an effect in `untrack`.
- **Fix idea:** keep the last slice in a plain variable, or read it with `untrack(signal)`.

## TF-5

**`createField` reads its options once, untracked, in the component body.** `const options = opts()` runs before its render effect starts tracking them.

- **Where:** `@tanstack/solid-form` `1db6f68`, `createField`, first line.
- **Effect:** a field whose `name` is reactive (an array row's index) logs `STRICT_READ_UNTRACKED` in Solid's dev build when it mounts.
- **Pin:** `packages/core/src/form/tanstack-upstream.test.tsx` (`it.fails`).
- **Workaround:** the engine calls `createField` inside `untrack` (`packages/core/src/form/define-field-module.tsx`). `engine.test.tsx`'s late-field and pushed-row test fails without it.
- **Fix idea:** `const options = untrack(opts)`.

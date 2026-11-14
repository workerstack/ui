# UI SDK findings

Bugs and gaps in [UI SDK](https://github.com/vercel-labs/ui) (`@ui-sdk/core`, `@ui-sdk/solid`) found while building `@workerstack/ui`. Each one is pinned by a test marked `it.fails`. When an upgrade fixes the bug, that test starts failing: drop the `.fails` and set the finding to **fixed**.

Version: `0.1.0-beta.2` unless noted. Source locations are in the published `dist` (`node_modules/@ui-sdk/…`). Map them to `packages/core/src` / `packages/solid/src` upstream when opening the PR.

| ID | Summary | Area | Severity | Status | PR |
| --- | --- | --- | --- | --- | --- |
| [UISDK-1](#uisdk-1) | Content parts write a signal while rendering (`SERVER_WRITE`) | solid: select, menu, combobox, autocomplete, command, trigger-menu | High: Solid says this becomes an error | open | — |
| [UISDK-2](#uisdk-2) | Open Select with `items` and its own SelectContent renders two listboxes on the server, same id | solid: select | High: duplicate id, hydration drops nodes | open | — |
| [UISDK-3](#uisdk-3) | Select with items as children: server shows the raw value; client adds the closed popup on hydration | solid: select | Medium | open | — |
| [UISDK-4](#uisdk-4) | Field control's `aria-describedby` names a description that isn't rendered (before binding / on the server) | core: field | Medium: a11y, dangling idref | open | — |
| [UISDK-5](#uisdk-5) | FieldError with `match` isn't in the control's `aria-describedby` until mount | core: field | Medium: a11y before hydration | open | — |
| [UISDK-6](#uisdk-6) | Open Dialog's server HTML has no `aria-describedby` | core: dialog | Medium: a11y before hydration | open | — |
| [UISDK-7](#uisdk-7) | InputClear is missing from the server HTML of a filled InputGroup, and appears on hydration | core: input | Low: layout shift | open | — |

---

## UISDK-1

**Content parts write a signal while rendering.** Solid 2 warns `[SERVER_WRITE] Writing a signal on the server is deprecated and will become an error`.

- **Where:** `@ui-sdk/solid/dist/solid/select.jsx:188-190`:
  ```js
  const register = useContext(OwnContentContext);
  register?.(true);              // = setHasContent(true), during render
  onCleanup(() => register?.(false));
  ```
  The same pattern is at `menu.jsx:218-219`, `combobox.jsx:121-122`, `autocomplete.jsx:101-102`, `command.jsx:129` and `trigger-menu.jsx:78`.
- **Why it exists:** the root renders a default content part for `items` only when the user didn't render one (`select.jsx:94`: `<Show when={props.items && !hasContent()}>`).
- **Effect:** a warning on every server render today, an error in a later Solid 2 release. On the server the write is inert, which causes [UISDK-2](#uisdk-2).
- **Fix idea:** don't decide this through a signal written during render. Options:
  - the root inspects whether content was given (an explicit prop or slot);
  - the content part registers through a plain, non-reactive context object that the root reads after its children;
  - the root's default content checks a server-safe flag set synchronously before the `Show` reads it.
- **Pinned by:** `packages/core/src/select/select.server.test.tsx` and `packages/core/src/menu/menu.server.test.tsx` ("renders without warnings").

## UISDK-2

**An open Select with `items` and its own SelectContent renders two listboxes on the server, both `id="…-content"`.**

- **Repro:**
  ```tsx
  <Select items={roles} defaultValue="editor" defaultOpen>
    <SelectTrigger aria-label="Role"><SelectValue /></SelectTrigger>
    <SelectContent />
  </Select>
  ```
  The server HTML has two `role="listbox"` elements with the same id. Hydration claims one and throws the other away, along with its items.
- **Cause:** [UISDK-1](#uisdk-1). `setHasContent(true)` is inert on the server, so `!hasContent()` stays true and the default `SelectContent` renders next to the user's. It probably applies to Combobox and Autocomplete with `items` too (not yet verified).
- **Pinned by:** `packages/core/src/select/select.hydration.test.tsx` ("renders one listbox on the server for an open select", "claims the server's nodes of an open select").

## UISDK-3

**Select with items as JSX children doesn't match between server and client.**

- **Symptoms:**
  - On the server, `SelectValue` renders the raw value (`editor`), not the item's label (`Editor`). The label only appears after hydration.
  - On the client, the closed `SelectContent` is rendered (items register through it), but the server doesn't render it, so hydration adds a hidden popup. Nothing shows or shifts, but the two renders disagree.
- **Workaround:** pass `items` to the Select. The server then renders the label (tested).
- **Fix idea:** render the closed content on the server too, so items register in both places. Or document `items` as the way to get SSR labels.
- **Pinned by:**
  - `packages/core/src/select/select.server.test.tsx` ("renders the selected item's label from children");
  - `packages/core/src/select/select.hydration.test.tsx` ("claims the server's nodes and adds none (items as children)").

## UISDK-4

**The Field control points `aria-describedby` at a description that isn't rendered.**

- **Repro:** `<Field><FieldLabel>Email</FieldLabel><Input /></Field>` renders `<input aria-describedby="ui-sdk-0-description">`, but there is no element with that id.
- **Where:** `@ui-sdk/core/dist/components/field/field-attrs.js:41-50`. Before the field is bound to the DOM (on the server, and on the client before mount), `references()` guesses `descriptions: [\`${api.id}-description\`]` whether or not a FieldDescription exists.
- **Fix idea:** have FieldDescription register while rendering (in the same server-safe way as the UISDK-1 fix), or leave out the guess when there is no description.
- **Pinned by:** `packages/core/src/field/field.server.test.tsx` ("describes the control only by parts that are in the HTML").

## UISDK-5

**A FieldError with `match` isn't linked to the control until mount.**

- **Repro:** `<Field invalid>… <FieldError match>Taken</FieldError></Field>`. The error renders with its own id (`createUniqueId()`, `@ui-sdk/solid/dist/solid/field.jsx:99-113`). The control's `aria-describedby` instead names `ui-sdk-0-error`, the unmatched error's id, which isn't in the page.
- **Where:** the same pre-binding guess in `field-attrs.js` `references()`: `errors: errorShown(...) ? [\`${api.id}-error\`] : []`.
- **Effect:** until hydration, screen readers don't announce the error with the input. The client fixes it after mount (tested in `field.test.tsx` and `field.hydration.test.tsx`).
- **Pinned by:** `packages/core/src/field/field.server.test.tsx` ("describes the control by a matched error in the HTML").

## UISDK-6

**An open Dialog's server HTML has no `aria-describedby`.**

- **Repro:** `<Dialog defaultOpen><DialogContent><DialogTitle/><DialogDescription/></DialogContent></Dialog>`. The content gets `aria-labelledby` but no `aria-describedby`. The client adds it after mount (tested in `dialog.hydration.test.tsx`).
- **Where:** `@ui-sdk/core/dist/components/dialog/dialog-primitive.js:29` (`described: false`). It becomes true only when the description part connects. The attribute is set at `dialog-parts.js:108`.
- **Fix idea:** treat the description the way the title is treated, or have DialogDescription mark `described` while rendering (server-safe, see UISDK-1).
- **Pinned by:** `packages/core/src/dialog/dialog.server.test.tsx` ("describes an open dialog by its description in the HTML").

## UISDK-7

**InputClear is missing from the server HTML of a filled InputGroup.**

- **Repro:** `<InputGroup><Input defaultValue="solid" /><InputClear /></InputGroup>`. The server renders no clear button. It appears on hydration, so the field changes after load.
- **Where:** `@ui-sdk/core/dist/components/input/input.js`. The group's `filled` starts as `false` (line 179) and is set by `find()`, which locates the input in the DOM after mount (lines ~224-255). `clear.present` is `state.filled && …` (line 267).
- **Fix idea:** the Input tells its group its initial value while rendering (through context, server-safe), so `filled` is right on the first render.
- **Pinned by:**
  - `packages/core/src/input/input.server.test.tsx` ("renders the clear button of a filled group");
  - `packages/core/src/input/input.hydration.test.tsx` ("adds nothing the server didn't render").

---

## Other upstreams (to confirm before reporting)

- **`@solidjs/vite-plugin` 3.0.0-next.55:** its docs say `ssr: true` gives hydratable client code. In vitest browser mode the client compiled non-hydratable (`template()`, no `getNextElement`); `solid: { hydratable: true }` was needed. We still need to check whether this also happens in a normal Vite client build or only under vitest. See `packages/core/vitest.hydration.config.ts`.
- **Solid 2 rc.20 (not a bug, worth knowing):** `SERVER_WRITE` warns once per kind of write per process. A test that checks for it has to come first in its file (see `packages/core/src/test/server.ts`).

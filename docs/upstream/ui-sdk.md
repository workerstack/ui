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
| [UISDK-8](#uisdk-8) | Combobox create option treats `minLength: 0` as 1, so it can't be offered with no text | core: combobox | Low: no way to start "create new…" from an empty box | open | — |
| [UISDK-9](#uisdk-9) | Open Popover's server HTML names it by its trigger, not its title | core: popover | Medium: a11y name changes on hydration | open | — |
| [UISDK-10](#uisdk-10) | FieldSet's `aria-describedby` and `aria-labelledby` appear only after mount | core: field | Medium: a11y before hydration | open | — |
| [UISDK-11](#uisdk-11) | FieldError leaves at once when the field turns valid, with no ending style | core: field | Low: no exit animation | open | — |
| [UISDK-12](#uisdk-12) | A read-only Select still opens on a click and on keys | core: select | Medium: read-only control looks editable | open | — |
| [UISDK-13](#uisdk-13) | Input ignores a fill that sends only `change` (no `input`) | core: input | Medium: autofilled value never reaches state or validity | open | — |
| [UISDK-14](#uisdk-14) | Menu has no public call to highlight an item | core: menu | Low: feature request | open | — |

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
- **Pinned by:** `packages/core/src/components/select/select.server.test.tsx`, `packages/core/src/components/menu/menu.server.test.tsx` and `packages/core/src/components/combobox/combobox.server.test.tsx` ("renders without warnings").

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
- **Pinned by:** `packages/core/src/components/select/select.hydration.test.tsx` ("renders one listbox on the server for an open select", "claims the server's nodes of an open select").

## UISDK-3

**Select with items as JSX children doesn't match between server and client.**

- **Symptoms:**
  - On the server, `SelectValue` renders the raw value (`editor`), not the item's label (`Editor`). The label only appears after hydration.
  - On the client, the closed `SelectContent` is rendered (items register through it), but the server doesn't render it, so hydration adds a hidden popup. Nothing shows or shifts, but the two renders disagree.
- **Workaround:** pass `items` to the Select. The server then renders the label (tested).
- **Fix idea:** render the closed content on the server too, so items register in both places. Or document `items` as the way to get SSR labels.
- **Pinned by:**
  - `packages/core/src/components/select/select.server.test.tsx` ("renders the selected item's label from children");
  - `packages/core/src/components/select/select.hydration.test.tsx` ("claims the server's nodes and adds none (items as children)").

## UISDK-4

**The Field control points `aria-describedby` at a description that isn't rendered.**

- **Repro:** `<Field><FieldLabel>Email</FieldLabel><Input /></Field>` renders `<input aria-describedby="ui-sdk-0-description">`, but there is no element with that id.
- **Where:** `@ui-sdk/core/dist/components/field/field-attrs.js:41-50`. Before the field is bound to the DOM (on the server, and on the client before mount), `references()` guesses `descriptions: [\`${api.id}-description\`]` whether or not a FieldDescription exists.
- **Fix idea:** have FieldDescription register while rendering (in the same server-safe way as the UISDK-1 fix), or leave out the guess when there is no description.
- **Pinned by:** `packages/core/src/components/field/field.server.test.tsx` ("describes the control only by parts that are in the HTML").

## UISDK-5

**A FieldError with `match` isn't linked to the control until mount.**

- **Repro:** `<Field invalid>… <FieldError match>Taken</FieldError></Field>`. The error renders with its own id (`createUniqueId()`, `@ui-sdk/solid/dist/solid/field.jsx:99-113`). The control's `aria-describedby` instead names `ui-sdk-0-error`, the unmatched error's id, which isn't in the page.
- **Where:** the same pre-binding guess in `field-attrs.js` `references()`: `errors: errorShown(...) ? [\`${api.id}-error\`] : []`.
- **Effect:** until hydration, screen readers don't announce the error with the input. The client fixes it after mount (tested in `field.test.tsx` and `field.hydration.test.tsx`).
- **Pinned by:** `packages/core/src/components/field/field.server.test.tsx` ("describes the control by a matched error in the HTML").

## UISDK-6

**An open Dialog's server HTML has no `aria-describedby`.**

- **Repro:** `<Dialog defaultOpen><DialogContent><DialogTitle/><DialogDescription/></DialogContent></Dialog>`. The content gets `aria-labelledby` but no `aria-describedby`. The client adds it after mount (tested in `dialog.hydration.test.tsx`).
- **Where:** `@ui-sdk/core/dist/components/dialog/dialog-primitive.js:29` (`described: false`). It becomes true only when the description part connects. The attribute is set at `dialog-parts.js:108`.
- **Fix idea:** treat the description the way the title is treated, or have DialogDescription mark `described` while rendering (server-safe, see UISDK-1).
- **Pinned by:**
  - `packages/core/src/components/dialog/dialog.server.test.tsx` ("describes an open dialog by its description in the HTML");
  - `packages/core/src/components/alert-dialog/alert-dialog.server.test.tsx` ("describes an open alert dialog by its description in the HTML").

## UISDK-7

**InputClear is missing from the server HTML of a filled InputGroup.**

- **Repro:** `<InputGroup><Input defaultValue="solid" /><InputClear /></InputGroup>`. The server renders no clear button. It appears on hydration, so the field changes after load.
- **Where:** `@ui-sdk/core/dist/components/input/input.js`. The group's `filled` starts as `false` (line 179) and is set by `find()`, which locates the input in the DOM after mount (lines ~224-255). `clear.present` is `state.filled && …` (line 267).
- **Fix idea:** the Input tells its group its initial value while rendering (through context, server-safe), so `filled` is right on the first render.
- **Pinned by:**
  - `packages/core/src/components/input/input.server.test.tsx` ("renders the clear button of a filled group");
  - `packages/core/src/components/input/input.hydration.test.tsx` ("adds nothing the server didn't render").

## UISDK-8

**The combobox create option reads `minLength={0}` as 1.**

- **Repro:** `<ComboboxCreate minLength={0} onCreate={…} />` inside a Combobox with an empty box. No create row is offered. The prop is documented as the minimum text length, so 0 should offer the row with no text, for a flow that asks for the name itself ("Create new…").
- **Where:** `@ui-sdk/core/dist/components/combobox/combobox-api.js:483`: `if (query.length < Math.max(1, props.minLength ?? 1))`. The `Math.max(1, …)` clamp makes 0 the same as 1. `@ui-sdk/solid/dist/combobox.js:211` passes the prop through unchanged.
- **Fix idea:** drop the clamp and use `props.minLength ?? 1`, so 0 is honored and the default stays 1. Or document 1 as the lowest value and clamp the type.
- **Pinned by:** `packages/core/src/components/combobox/combobox-create.test.tsx` ("offers to create with no text when minLength is 0").

## UISDK-9

**An open Popover's server HTML names it by its trigger, not its title.**

- **Repro:** `<Popover defaultOpen><PopoverTrigger/><PopoverContent><PopoverTitle/></PopoverContent></Popover>`. The server HTML gives the content `aria-labelledby` pointing at the trigger's id. After mount it points at the title, so screen readers hear a different name before and after hydration.
- **Where:** `@ui-sdk/core/dist/foundation/popups/popup-slots.js:149-153`. `popupTitle` sets the `titled` flag only in `bind` (`flagWhileBound(store, "titled", { now: true })`), which runs after mount. Same root cause as UISDK-6.
- **Fix idea:** mark `titled` and `described` while rendering, when the title and description parts render (server-safe, see UISDK-1).
- **Pinned by:** `packages/core/src/components/popover/popover.server.test.tsx` ("names an open popover by its title in the HTML").

## UISDK-10

**A FieldSet's `aria-describedby` and `aria-labelledby` appear only after mount.**

- **Repro:** `<FieldSet><FieldSetLegend/><FieldSetDescription/>…</FieldSet>` rendered on the server. The `<fieldset>` has no `aria-describedby`, so the group is not tied to its description until scripts run.
- **Where:** `@ui-sdk/core/dist/components/field/field-set.js:40-62`. Legends and descriptions add their ids in `register`, inside a `queueMicrotask` after they bind. The set's attrs (lines 71-72) read those lists, which are empty while rendering.
- **Fix idea:** register the part ids while rendering (server-safe, see UISDK-1), and keep the microtask only for parts that bind late.
- **Pinned by:** `packages/core/src/components/field/fieldset.server.test.tsx` ("describes the group by its description in the HTML").

## UISDK-11

**A FieldError leaves the page at once when the field turns valid.**

- **Repro:** a Field with a FieldError shown after a failed check. Fix the value. The error is removed in the same frame, and it never gets `data-ending-style`, so a closing transition cannot run. Opening does get `data-starting-style`.
- **Where:** `@ui-sdk/core/dist/components/field/field.js:375`. The error's `present` is `errorShown(…)` only, with no exit phase like the popups have.
- **Fix idea:** give the error part the same presence lifecycle as popups: keep it mounted with `data-ending-style` until its transitions end.
- **Pinned by:** `packages/core/src/components/field/field-motion.browser.test.tsx` ("FieldError animates out when the field turns valid").

## UISDK-12

**A read-only Select still opens on a click and on keys.**

- **Repro:** `<Select readOnly defaultValue="admin">…`. Click the trigger or press ArrowDown. The list opens. `readOnly` keeps the value from changing, but an open list tells the user they can pick.
- **Where:** `@ui-sdk/core/dist/components/select/select-api.js:204-214`. `open()` returns early for `isDisabled(…)` only. Value changes check `state.readOnly` (lines 270, 283, 289), but opening does not.
- **Fix idea:** return early in `open()` when `state.readOnly` too, like a native `<select>` with `aria-readonly`. Our Select holds the list closed until then.
- **Pinned by:** `packages/core/src/components/select/select.test.tsx` ("UI SDK's read-only Select does not open on a click").

## UISDK-13

**Input ignores a fill that sends only `change`.**

- **Repro:** some password managers and engines fill a text box and dispatch only `change`, with no `input`. UI SDK's Input (`@ui-sdk/core/dist/components/input/input.js`) hears typing only through `input`, so the filled value never reaches `onValueChange`, the group's `filled` state or the Field's validity.
- **Fix idea:** on `change`, if the value differs from the last value seen through `input`, treat it as an input.
- **Workaround:** `packages/core/src/components/input/input-autofill.ts` sends the missing `input` (as `insertReplacementText`).
- **Pinned by:** `packages/core/src/components/input/input.autofill.browser.test.tsx`. It tests our relay, so it passes. It is not an `it.fails`: there is no way to make UI SDK alone pass it from our side.

## UISDK-14

**Menu has no public call to highlight an item.** (Feature request.)

- **Need:** a filter box in a menu should highlight the first match, so Enter runs it. The menu API has `highlight(key)`, but only under `internal` (`@ui-sdk/core/dist/components/menu/menu-api.js:268`, `:426`).
- **Fix idea:** expose `highlight(key)` (or `highlightFirst()`) on the menu API and through Solid's menu context.
- **Workaround:** `packages/core/src/components/menu/wire-filter-input.ts` sends the menu a synthetic `Home` keydown, which highlights its first item.
- **Pinned by:** no test; this is a missing feature, not a wrong one.

---

## Other upstreams (to confirm before reporting)

- **`@solidjs/vite-plugin` 3.0.0-next.55:** its docs say `ssr: true` gives hydratable client code. In vitest browser mode the client compiled non-hydratable (`template()`, no `getNextElement`); `solid: { hydratable: true }` was needed. We still need to check whether this also happens in a normal Vite client build or only under vitest. See `packages/core/vitest.hydration.config.ts`.
- **Vitest 5.0.5 browser locators:** `page.getByRole(..., { name })` counts a pseudo-element's `content` in the accessible name even with an empty alternative (`content: attr(data-mark-text) / ""`). Chromium's own tree and Playwright's `getByRole` both give "Name"; Vitest gives "Name *". Our required marks are fine for screen readers. Tests find a marked box by the start of its name (`packages/core/src/components/form/tanstack/form/form.browser.test.tsx`).
- **Solid 2 rc.20 (not a bug, worth knowing):** `SERVER_WRITE` warns once per kind of write per process. A test that checks for it has to come first in its file (see `packages/core/src/test/server.ts`).

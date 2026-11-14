import { createEffect, onCleanup, onSettled, type Accessor } from "solid-js";

// Keys the menu hears from the filter. Arrows move through the items, Enter runs the highlighted
// one, Escape closes and Tab leaves; the rest are the input's own.
const MENU_KEYS: ReadonlySet<string> = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"]);

/**
 * Keeps a typed key in the input. The menu's typeahead jumps to the item that starts with a typed
 * letter, Space and Home or End would move through items, and the side arrows would open or close
 * a submenu; none of that should happen while someone types a query. A key with Ctrl, Alt or Meta
 * still reaches a shortcut.
 */
function keepKeysInInput(event: KeyboardEvent): void {
  if (MENU_KEYS.has(event.key) || event.ctrlKey || event.altKey || event.metaKey) return;

  event.stopPropagation();
}

/**
 * Highlights the first item that is left once there is a query, so Enter runs it. UI SDK has no
 * call to highlight an item, so this asks for what Home does: the menu highlights its first item,
 * which also moves focus there, and the input takes it back.
 */
function highlightFirst(input: HTMLInputElement, query: string): void {
  const menu = input.closest('[role="menu"]');

  if (query.trim() === "" || menu === null) return;

  menu.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Home" }));
  input.focus({ preventScroll: true });
}

/**
 * Moves the focus UI SDK gives a popup when it opens, to the popup or to its first item, on to the
 * input, so typing starts the filter at once. Only that first focus moves; after it, the arrow
 * keys take focus to the items as in any menu.
 */
function takeOpeningFocus(input: HTMLInputElement): void {
  const menu = input.closest('[role="menu"]');

  menu?.addEventListener("focusin", () => input.focus({ preventScroll: true }), { once: true });
}

/**
 * Sets up the filter's input: it keeps typed keys, takes the opening focus and highlights the
 * first match when the query changes. Call it in the filter's body, so the menu's owner disposes
 * the effect and the listener; `input` is the element its `ref` stored.
 */
export function wireFilterInput(input: Accessor<HTMLInputElement | undefined>, query: Accessor<string>): void {
  onSettled(() => {
    const element = input();

    if (element === undefined) return;
    element.addEventListener("keydown", keepKeysInInput);
    takeOpeningFocus(element);
  });
  onCleanup(() => input()?.removeEventListener("keydown", keepKeysInInput));
  createEffect(query, (value) => {
    const element = input();

    if (element !== undefined) highlightFirst(element, value);
  });
}

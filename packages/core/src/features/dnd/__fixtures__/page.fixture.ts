// Page readers for the dnd browser tests: test ids and what a harness prints.

/** The element with `data-testid={id}`; throws if there is none. */
export function byTestId(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-testid="${CSS.escape(id)}"]`);
  if (el === null) throw new Error(`no element with test id ${id}`);
  return el;
}

/** The text a harness prints in `[data-order={list}]`. */
export function order(list: string): string {
  return document.querySelector(`[data-order="${CSS.escape(list)}"]`)?.textContent ?? "";
}

/** The text a harness prints in `[data-outcome={list}]`. */
export function outcome(list: string): string {
  return document.querySelector(`[data-outcome="${CSS.escape(list)}"]`)?.textContent ?? "";
}

/** The page's polite live region's text. */
export function live(root: ParentNode = document): string {
  return root.querySelector("[data-dnd-live]")?.textContent ?? "";
}

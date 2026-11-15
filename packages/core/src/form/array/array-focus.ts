// Where focus goes after an array changes: into the item now at a position, else the Add button.

const TABBABLE =
  'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), ' +
  'button:not([disabled]), [tabindex="0"]';

/** The item element at `index` in the array under `root`. */
export function itemAt(root: ParentNode, index: number): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[data-slot="form-array-item"][data-index="${index}"]`);
}

/** The first enabled of the buttons named `parts` in `item`, in the order given. */
function partOf(item: HTMLElement | null, parts: readonly string[]): HTMLElement | undefined {
  for (const part of parts) {
    const found = item?.querySelector<HTMLElement>(`[data-form-array="${part}"]:not([disabled])`);

    if (found !== null && found !== undefined) return found;
  }

  return undefined;
}

/** What takes focus for the item at `index`: the first enabled of `parts`, its first control, or Add. */
function focusTarget(root: ParentNode, index: number, parts: readonly string[]): HTMLElement | null {
  const item = itemAt(root, index);

  return (
    partOf(item, parts) ??
    item?.querySelector<HTMLElement>(TABBABLE) ??
    root.querySelector<HTMLElement>('[data-form-array="add"]:not([disabled])')
  );
}

/** Focuses the item at `index` after Solid has written the change to the DOM (a microtask later). */
export function focusLater(root: () => ParentNode | undefined, index: number, parts: readonly string[] = []): void {
  queueMicrotask(() => {
    const node = root();

    if (node !== undefined) focusTarget(node, index, parts)?.focus();
  });
}

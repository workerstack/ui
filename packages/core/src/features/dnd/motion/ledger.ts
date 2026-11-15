// Every inline style the engine writes goes through a ledger, so rest restores exactly what the app had, priority
// included.

/** Inline style writes that can be put back. */
export type Ledger = {
  /** Writes inline styles, remembering each property's value from before the first write. */
  set: (el: HTMLElement, styles: Readonly<Record<string, string>>) => void;
  /** Puts back what was saved: one element, or all of them. */
  restore: (el?: HTMLElement) => void;
};

/** A property's inline value and priority before the first write. */
type Saved = Map<string, [string, string]>;

/** Puts back what `props` saved on `el`. */
function restoreOne(el: HTMLElement, props: Saved): void {
  for (const [prop, [value, priority]] of props) {
    if (value === "") el.style.removeProperty(prop);
    else el.style.setProperty(prop, value, priority);
  }

  if (el.getAttribute("style") === "") el.removeAttribute("style");
}

/** Saves every property of `styles` on `el` not saved yet. */
function save(el: HTMLElement, props: Saved, styles: Readonly<Record<string, string>>): void {
  for (const prop of Object.keys(styles))
    if (!props.has(prop)) props.set(prop, [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)]);
}

/** An empty ledger. */
export function createLedger(): Ledger {
  const saved = new Map<HTMLElement, Saved>();

  return {
    restore(el) {
      for (const [node, props] of saved) {
        if (el !== undefined && node !== el) continue;
        restoreOne(node, props);
        saved.delete(node);
      }
    },
    set(el, styles) {
      const props = saved.get(el) ?? new Map<string, [string, string]>();
      saved.set(el, props);
      // Save every property before writing any: a shorthand would change the longhands read later.
      save(el, props, styles);

      for (const [prop, value] of Object.entries(styles)) el.style.setProperty(prop, value);
    },
  };
}

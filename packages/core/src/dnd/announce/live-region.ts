// One polite live region per container (the document, or an open modal: a modal makes everything outside it inert,
// so a region in body would go silent). Safari drops messages written right after a region appears, so a new region
// waits before speaking; only the latest message waits, so messages never land out of order. The region itself holds
// that state: its waiting message in `data-dnd-pending`, which of two forms it last spoke in its text.

const READY_MS = 100;
const REGION = ":scope > [data-dnd-live]";

// A trailing no-break space, alternating, makes a repeated message read again.
const NBSP = " ";

const HIDDEN =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);" +
  "clip-path:inset(50%);white-space:nowrap";

/** Writes `message` into a region, alternating the trailing no-break space. */
function write(region: HTMLElement, message: string): void {
  region.textContent = region.textContent.endsWith(NBSP) ? message : `${message}${NBSP}`;
}

/** Speaks the message that waited while the region was new. */
function release(region: HTMLElement): void {
  const message = region.dataset.dndPending ?? "";
  delete region.dataset.dndPending;

  if (message !== "") write(region, message);
}

/** The container's region, created (and waiting) on first use. */
function regionOf(container: Element): HTMLElement {
  const found = container.querySelector<HTMLElement>(REGION);

  if (found !== null) return found;
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");
  el.dataset.dndLive = "";
  el.dataset.dndPending = "";
  el.style.cssText = HIDDEN;
  container.append(el);
  setTimeout(() => release(el), READY_MS);

  return el;
}

/** Creates the document's region ahead of the first message. */
export function prepareRegion(): void {
  regionOf(document.body);
}

/** The modal the element sits in, whose region must speak for it. */
export function modalOf(el: Element): Element | undefined {
  const dialog = el.closest("dialog");

  if (dialog?.matches(":modal") === true) return dialog;

  return el.closest('[aria-modal="true"]') ?? undefined;
}

/** Speaks `text` through the region of `container` (the document by default). */
export function say(text: string, container: Element = document.body): void {
  const el = regionOf(container);

  if (el.dataset.dndPending === undefined) write(el, text);
  else el.dataset.dndPending = text;
}

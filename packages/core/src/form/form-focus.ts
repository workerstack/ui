import { flush } from "solid-js";

import type { FormReveal } from "./form-engine.ts";
import type { QueryRoot } from "./visibility.ts";

const TABBABLE =
  '[tabindex="0"], input:not([type="hidden"]):not([tabindex="-1"]):not([aria-hidden="true"]), ' +
  'button:not([tabindex="-1"]):not([disabled]), select, textarea';

const MARKED_INVALID = '[aria-invalid="true"]:not([aria-hidden="true"])';

/** A marked element itself when focusable; otherwise (a group marks the group) its tab stop. */
function focusable(element: HTMLElement | null): HTMLElement | null {
  if (element === null || element.tabIndex >= 0) return element;

  return element.querySelector<HTMLElement>(TABBABLE);
}

/**
 * The control to focus after an invalid submit: in the first invalid field (or element marked
 * invalid), the element marked `aria-invalid`, else the field's explicit tab stop, else its first
 * tabbable element.
 */
export function firstInvalidControl(root: QueryRoot): HTMLElement | null {
  const first = root.querySelector<HTMLElement>(`[data-slot="field"][data-invalid], ${MARKED_INVALID}`);

  if (first === null) return null;

  if (!first.matches('[data-slot="field"]')) return focusable(first);

  return (
    focusable(first.querySelector<HTMLElement>(MARKED_INVALID)) ??
    first.querySelector<HTMLElement>('[tabindex="0"]') ??
    first.querySelector<HTMLElement>(TABBABLE)
  );
}

/** Lets the reveal handlers show `field`; flushes when one changed what is shown. */
function reveal(field: HTMLElement, reveals: readonly FormReveal[]): void {
  if (reveals.some((handler) => handler(field))) flush();
}

/** Shows (through the reveal handlers) and focuses the first invalid control under `root`. */
export function focusFirstInvalid(root: HTMLElement, reveals: readonly FormReveal[]): void {
  const control = firstInvalidControl(root);
  const field = control?.closest<HTMLElement>('[data-slot="field"]') ?? control;

  if (field !== null) reveal(field, reveals);
  firstInvalidControl(root)?.focus();
}

/** Shows and focuses a field's control, as a link of the error summary does. */
export function focusField(field: HTMLElement, reveals: readonly FormReveal[]): void {
  reveal(field, reveals);
  (firstInvalidControl(field) ?? focusable(field.querySelector<HTMLElement>(TABBABLE)))?.focus();
}

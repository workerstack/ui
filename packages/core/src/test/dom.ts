import { fireEvent } from "@solidjs/testing-library";

/** Waits until UI SDK has attached its behavior: parts connect after mount, a task later. */
export function mounted(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Types into a text field as a person would. UI SDK watches the element's `value` setter to tell
 * code writes from typing, so this sets the value through the prototype's setter, as the browser
 * does, and then fires `input`.
 */
export function type(el: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, text);
  fireEvent.input(el);
}

/** The element as an `<input>`; throws if it is something else. */
export function inputElement(el: Element | null | undefined): HTMLInputElement {
  if (!(el instanceof HTMLInputElement)) throw new Error(`expected an <input>, found ${el?.tagName ?? "nothing"}`);

  return el;
}

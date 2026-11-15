import { fireEvent } from "@solidjs/testing-library";
import { flush } from "solid-js";

import { required } from "../../../../../test/required.ts";

// Helpers for tests of forms and field modules: let TanStack's validation and store updates land,
// run a person's events one task each, submit, and read what the fields show.

/** Enough task turns for TanStack's validation, its store and Solid's effects to land. */
const SETTLE_ROUNDS = 5;

function nextTask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Lets microtask validation and store updates land: a few tasks, each followed by a flush. */
export async function settle(): Promise<void> {
  for (let round = 0; round < SETTLE_ROUNDS; round += 1) {
    await nextTask();
    flush();
  }
}

/**
 * Runs a person's events one after another with a flush between them, as a browser gives each
 * event its own task (Solid 2 batches writes until a flush).
 */
export function userSteps(...steps: (() => unknown)[]): void {
  for (const step of steps) {
    step();
    flush();
  }
}

/** The `<form>` the Form rendered in `container`. */
export function formElement(container: Element): HTMLFormElement {
  return required(container.querySelector("form"), "a <form>");
}

/** Submits the Form in `container` and lets its submit flow finish. */
export async function submit(container: Element): Promise<void> {
  fireEvent.submit(formElement(container));
  await settle();
}

/** The text of every field error showing in `container`, in page order. */
export function errorTexts(container: Element): string[] {
  return [...container.querySelectorAll("[data-slot=field-error]")].map((error) => error.textContent);
}

/** Types into a text box as a person does: focus, the new text, then leaving it. */
export function typeInto(box: HTMLInputElement | HTMLTextAreaElement, text: string): void {
  userSteps(
    () => fireEvent.focus(box),
    () => fireEvent.input(box, { target: { value: text } }),
    () => fireEvent.blur(box),
  );
}

/** A value made inside a render (a form from `createForm`), kept for the test to reach. */
export type Captured<T> = {
  /** Keeps the value and returns it, for use inside the render. */
  set: (value: T) => T;
  /** The value; throws before the render made it. */
  get: () => T;
};

/** A holder for a value a render makes, such as its form. */
export function captured<T>(): Captured<T> {
  const holder: { value?: T } = {};

  return {
    get: () => required(holder.value, "the rendered value"),
    set: (value) => {
      holder.value = value;

      return value;
    },
  };
}

/** The text of the elements that describe `element` (its `aria-describedby`). */
export function descriptionOf(element: Element): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter((id) => id !== "")
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

/** A promise and the function that resolves it, for a submit a test lets finish. */
export type Deferred = {
  /** Settles once `resolve` is called. */
  promise: Promise<void>;
  /** Resolves `promise`. */
  resolve: () => void;
};

/** A promise the test resolves when it chooses. */
export function deferred(): Deferred {
  const holder: { resolve?: () => void } = {};
  const promise = new Promise<void>((resolve) => {
    holder.resolve = resolve;
  });

  return { promise, resolve: () => holder.resolve?.() };
}

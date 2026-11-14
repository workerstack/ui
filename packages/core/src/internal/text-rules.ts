import type { UiMessages } from "../provider/index.ts";
import { callRef, type RefLike } from "./ref.ts";
import { createRequiredText, type RequiredText } from "./validity.ts";

/** What `createTextRules` reads from a text box's props. */
export type TextRulesProps<T extends HTMLInputElement | HTMLTextAreaElement> = {
  /** The consumer's own `ref`. */
  ref?: RefLike<T> | undefined;
  /** The controlled value. */
  value?: string | undefined;
  /** Whether the box is required. */
  required?: boolean | "" | undefined;
  /** The most characters a person sees. */
  maxLength?: number | undefined;
};

/** True for a text input element. */
export function isInputElement(element: unknown): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

/** True for a textarea element. */
export function isTextareaElement(element: unknown): element is HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement;
}

/**
 * The required and length rules of a text box (Input, Textarea), reading its props as they change.
 * `isBox` tells the box's element from any other, so the consumer's `ref` only gets its own kind.
 */
export function createTextRules<T extends HTMLInputElement | HTMLTextAreaElement>(
  props: TextRulesProps<T>,
  isBox: (element: unknown) => element is T,
  messages: UiMessages,
): RequiredText {
  return createRequiredText(
    {
      // No limit is an infinite one: the rules take a number or leave the key out.
      get maxLength() {
        return props.maxLength ?? Number.POSITIVE_INFINITY;
      },
      ref: (element) => {
        if (isBox(element)) callRef(props.ref, element);
      },
      get required() {
        return props.required ?? false;
      },
      get value() {
        return props.value;
      },
    },
    messages,
  );
}

import type { JSX } from "@solidjs/web";
import { Textarea as TextareaPart } from "@ui-sdk/solid/textarea";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { cleanOnBlur } from "../internal/index.ts";
import { cleanText } from "../text-hygiene/index.ts";

const CONTROL = [
  "min-h-16 w-full min-w-0 field-sizing-content rounded-md border border-input bg-transparent px-3 py-2 text-base",
  "shadow-xs outline-none transition-[color,box-shadow] delay-0 placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
  "disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm",
];

/** UI SDK's textarea props, plus `clean`; `onValueChange` hears every edit. */
export type TextareaProps = Omit<ComponentProps<typeof TextareaPart>, "onBlur"> & {
  /**
   * The text as stored, applied when the person leaves the box (never while typing, so a trailing
   * space can be typed and an input method's composition is left alone). When it changes the text,
   * the textarea takes the cleaned text as an edit: `onValueChange` and `onChange` fire and a
   * controlled value updates. A read-only textarea is left as it is. Pass `false` to store the text
   * as typed.
   *
   * @default cleanText: lines kept, blank lines around them trimmed, invisible characters gone
   */
  clean?: ((text: string) => string) | false;
  /** Runs when the textarea loses focus, after the text is cleaned. */
  onBlur?: JSX.FocusEventHandler<HTMLTextAreaElement, FocusEvent>;
};

function cleaned(clean: TextareaProps["clean"], text: string): string {
  if (clean === false) return text;

  return (clean ?? cleanText)(text);
}

/**
 * A multi-line text box that grows with its text and never gets shorter than 4rem (`min-h-16`).
 * Inside a Field it takes the field's label, description, name and validation.
 */
export function Textarea(props: TextareaProps): JSX.Element {
  const rest = omit(props, "class", "clean", "onBlur");

  return (
    <TextareaPart
      {...rest}
      onBlur={cleanOnBlur({ clean: (text) => cleaned(props.clean, text), onBlur: props.onBlur })}
      class={cnState(CONTROL, props.class)}
    />
  );
}

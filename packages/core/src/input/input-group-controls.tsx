import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { cnState } from "../cn/index.ts";
import { Textarea, type TextareaProps } from "../textarea/index.ts";
import { Input, type InputProps } from "./input.tsx";

// The group draws the border and the rings, so the control inside draws none of its own.
const BARE = [
  "rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0",
  "data-readonly:bg-transparent",
];

/** An Input made to sit in an `InputGroup`: it fills the space between the addons and draws no box. */
export function InputGroupInput(props: InputProps): JSX.Element {
  const rest = omit(props, "class");

  return <Input {...rest} class={cnState([BARE, "h-full flex-1 px-0"], props.class)} />;
}

/** A Textarea made to sit in an `InputGroup`: it fills the group, never resizes and draws no box. */
export function InputGroupTextarea(props: TextareaProps): JSX.Element {
  const rest = omit(props, "class");

  return <Textarea {...rest} class={cnState([BARE, "flex-1 resize-none px-0 py-2"], props.class)} />;
}

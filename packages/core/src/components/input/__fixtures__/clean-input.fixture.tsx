import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { Input, type InputProps } from "../index.ts";

export type CleanInputProps = {
  onValueChange?: InputProps["onValueChange"];
  onChange?: InputProps["onChange"];
};

/** The cleaning rule the fixtures use: upper case, so a clean value is easy to tell. */
export function shout(text: string): string {
  return text.toUpperCase();
}

/** A controlled Input that cleans to upper case; the held value shows beside it. */
export function CleanInput(props: CleanInputProps): JSX.Element {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <Input
        aria-label="Name"
        clean={shout}
        value={value()}
        onValueChange={(next, event) => {
          setValue(next);
          props.onValueChange?.(next, event);
        }}
        onChange={props.onChange}
      />
      <output>{`[${value()}]`}</output>
    </div>
  );
}

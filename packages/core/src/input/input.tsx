import type { JSX } from "@solidjs/web";
import { Input as InputPart, InputClear as InputClearPart, InputGroup as InputGroupPart } from "@ui-sdk/solid/input";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { useUiMessages } from "../provider/index.ts";

const CONTROL = [
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none",
  "transition-[color,box-shadow] placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm",
  "file:font-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  "aria-invalid:ring-destructive/20 md:text-sm",
];

/** UI SDK's input props; `onValueChange` hears every edit. */
export type InputProps = ComponentProps<typeof InputPart>;

/** A text input. Inside a Field it takes the field's label, description, name and validation. */
export function Input(props: InputProps): JSX.Element {
  const rest = omit(props, "class");

  return <InputPart {...rest} class={cnState(CONTROL, props.class)} />;
}

/** UI SDK's input group props. */
export type InputGroupProps = ComponentProps<typeof InputGroupPart>;

/** Holds text or buttons around an Input (a prefix, a clear button), drawn as one control. */
export function InputGroup(props: InputGroupProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <InputGroupPart
      {...rest}
      class={cnState(
        [
          "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-base",
          "shadow-xs transition-[color,box-shadow] has-[input:focus-visible]:border-ring",
          "has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
          "has-[input[aria-invalid=true]]:border-destructive md:text-sm [&>input]:h-full [&>input]:min-w-0",
          "[&>input]:flex-1 [&>input]:border-0 [&>input]:bg-transparent [&>input]:p-0 [&>input]:shadow-none",
          "[&>input]:ring-0 [&>span]:text-muted-foreground",
        ],
        props.class,
      )}
    />
  );
}

/** UI SDK's input clear props; children replace the × icon. */
export type InputClearProps = ComponentProps<typeof InputClearPart>;

/**
 * Empties the Input in its group and returns focus to it. Shows an × unless given children. Its
 * accessible name defaults to the provider's `clear` string ("Clear" in English); pass `aria-label`
 * to override it.
 */
export function InputClear(props: InputClearProps): JSX.Element {
  const messages = useUiMessages();
  const rest = omit(props, "class", "aria-label");

  return (
    <InputClearPart
      data-icon="x"
      {...rest}
      aria-label={props["aria-label"] ?? messages.clear}
      class={cnState(
        [
          "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center [--ui-icon-size:0.875rem]",
          "rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3",
          "focus-visible:ring-ring/50",
        ],
        props.class,
      )}
    />
  );
}

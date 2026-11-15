import type { JSX } from "@solidjs/web";
import { Input as InputPart, InputClear as InputClearPart } from "@ui-sdk/solid/input";
import { omit, type ComponentProps } from "solid-js";

import { CLEAR_MESSAGES_EN } from "../../internal/clear.messages.ts";
import { cleanOnBlur } from "../../internal/index.ts";
import { cnState } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";
import { createInputRules } from "./input-rules.ts";

const CONTROL = [
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none",
  "transition-[color,box-shadow] placeholder:text-muted-foreground file:border-0 file:bg-transparent file:text-sm",
  "file:font-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
  // Read-only shows the value, not a box to type in: no border or fill, the same size.
  "data-readonly:border-transparent data-readonly:bg-transparent data-readonly:shadow-none",
  "aria-invalid:ring-destructive/20 md:text-sm",
];

/** UI SDK's input props, plus `clean`; `onValueChange` hears every edit. */
export type InputProps = Omit<ComponentProps<typeof InputPart>, "onBlur"> & {
  /**
   * The text as stored, applied when the person leaves the box (never while typing, so a trailing
   * space can be typed and an input method's composition is left alone). When it changes the text,
   * the input takes the cleaned text as an edit: `onValueChange` and `onChange` fire and a
   * controlled value updates. A read-only input is left as it is. Pass `false` to store the text as typed.
   */
  clean?: ((text: string) => string) | false;
  /**
   * The most characters a person sees (emoji and accented letters count once, unlike the native
   * `maxlength`); past it the text stays and the Field reports it.
   */
  maxLength?: number;
  /** Runs when the input loses focus, after the text is cleaned. */
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
};

function cleaned(clean: InputProps["clean"], text: string): string {
  return clean === false ? text : (clean?.(text) ?? text);
}

/** A text input. Inside a Field it takes the field's label, description, name and validation. */
export function Input(props: InputProps): JSX.Element {
  const rest = omit(props, "class", "clean", "maxLength", "maxlength", "onBlur", "placeholder", "ref");
  const ref = createInputRules(props);

  return (
    <InputPart
      {...rest}
      ref={ref}
      onBlur={cleanOnBlur({ clean: (text) => cleaned(props.clean, text), onBlur: props.onBlur })}
      placeholder={props.readonly === true || props.readonly === "" ? undefined : props.placeholder}
      class={cnState(CONTROL, props.class)}
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
  const messages = useUiMessages(CLEAR_MESSAGES_EN);
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

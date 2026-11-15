import type { JSX } from "@solidjs/web";
import { Textarea as TextareaPart } from "@ui-sdk/solid/textarea";
import { createEffect, createSignal, omit, Show, untrack, type ComponentProps } from "solid-js";

import { cleanOnBlur, createTextRules, isTextareaElement } from "../../internal/index.ts";
import { cn, cnState } from "../../utils/cn/index.ts";
import { cleanText, textLength } from "../../utils/text-hygiene/index.ts";
import { useUiMessages } from "../provider/index.ts";

const CONTROL = [
  "min-h-16 w-full min-w-0 field-sizing-content rounded-md border border-input bg-transparent px-3 py-2 text-base",
  "shadow-xs outline-none transition-[color,box-shadow] delay-0 placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed",
  "disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm",
  // Read-only: no border, fill or resize handle, the size unchanged; it stays focusable and submits.
  "[&[readonly]]:resize-none [&[readonly]]:border-transparent [&[readonly]]:shadow-none",
];

/** UI SDK's textarea props, plus `clean`; `onValueChange` hears every edit. */
export type TextareaProps = Omit<ComponentProps<typeof TextareaPart>, "onBlur" | "ref"> & {
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
  /**
   * The most characters a person sees (emoji and accented letters count once). A counter under the
   * box shows them; past the limit the text stays and the field reports it, so a paste can be
   * trimmed rather than cut. No counter shows while read-only.
   */
  maxLength?: number;
  /** Runs when the textarea loses focus, after the text is cleaned. */
  onBlur?: JSX.FocusEventHandler<HTMLTextAreaElement, FocusEvent>;
};

function cleaned(clean: TextareaProps["clean"], text: string): string {
  if (clean === false) return text;

  return (clean ?? cleanText)(text);
}

// The graphemes of the text, following a controlled `value` and each input.
function createLength(props: TextareaProps) {
  const [length, setLength] = createSignal(textLength(untrack(() => props.value ?? props.defaultValue ?? "")));

  createEffect(
    () => props.value,
    (value) => {
      if (value !== undefined) setLength(textLength(value));
    },
  );

  return { length, set: (text: string) => setLength(textLength(text)) };
}

/** What `Counter` shows. */
type CounterProps = {
  /** The graphemes in the box. */
  length: number;
  /** The limit. */
  max: number | undefined;
};

function Counter(props: CounterProps): JSX.Element {
  return (
    <span
      data-slot="textarea-counter"
      class={cn(
        "self-end text-xs text-muted-foreground tabular-nums",
        props.length > (props.max ?? 0) && "text-destructive",
      )}
    >
      {`${props.length}/${props.max}`}
    </span>
  );
}

// The ref to give the box: its rules, and a listener on the element, so the consumer's `onInput` stays theirs.
function createRef(props: TextareaProps, count: { set: (text: string) => void }) {
  const rules = createTextRules(props, isTextareaElement, useUiMessages());

  return (element: HTMLTextAreaElement | null): void => {
    rules.ref(element);
    element?.addEventListener("input", () => {
      rules.sync();
      count.set(element.value);
    });
  };
}

/**
 * A multi-line text box that grows with its text and never gets shorter than 4rem (`min-h-16`).
 * Inside a Field it takes the field's label, description, name and validation. `required` counts
 * blank or invisible text as missing and `maxLength` as too long, in the UI's words (the Field's
 * error shows them). Read-only, it drops the border and the placeholder.
 */
export function Textarea(props: TextareaProps): JSX.Element {
  const rest = omit(props, "class", "clean", "onBlur", "maxLength", "placeholder");
  const count = createLength(props);
  const ref = createRef(props, count);

  const blur = cleanOnBlur({ clean: (text) => cleaned(props.clean, text), onBlur: props.onBlur });

  const box = (
    <TextareaPart
      {...rest}
      class={cnState(CONTROL, props.class)}
      onBlur={blur}
      placeholder={props.readonly === true ? undefined : props.placeholder}
      ref={ref}
    />
  );

  return (
    <Show when={props.maxLength !== undefined && props.readonly !== true} fallback={box}>
      <div class="flex w-full flex-col gap-1">
        {box}
        <Counter length={count.length()} max={props.maxLength} />
      </div>
    </Show>
  );
}

import type { JSX } from "@solidjs/web";
import { FieldControl, useFieldControl } from "@ui-sdk/solid/field";
import { Show } from "solid-js";

import { cn } from "../../utils/cn/index.ts";
import { useUiMessages } from "../provider/index.ts";

const OUTPUT = [
  "inline-flex min-w-0 items-center gap-1.5 text-sm text-foreground outline-none",
  "focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 data-empty:text-muted-foreground",
];

/** What `View` takes. */
export type ViewProps = {
  /** The value as text; empty text shows the empty marker. */
  text?: string | null;
  /** Content in place of `text` (a badge, a link, icons); `empty` then says whether it is empty. */
  children?: JSX.Element;
  /** Whether `children` is empty, so the empty marker shows in its place. */
  empty?: boolean;
  /** Extra classes; they win over the view's own. */
  class?: string | undefined;
  /** The output's id. Inside a Field it defaults to the id the field's label points at. */
  id?: string | undefined;
  /** The value's own reading direction, for text that is not in the page's (a phone number). */
  dir?: "ltr" | "rtl" | "auto";
};

/** The output's own attributes: what the Field hands its control, or nothing outside a Field. */
type OutputProps = {
  view: ViewProps;
  own: JSX.OutputHTMLAttributes<HTMLOutputElement>;
  isInField: boolean;
};

function isBlank(text: string | null | undefined): boolean {
  return text === null || text === undefined || text === "";
}

function Output(props: OutputProps): JSX.Element {
  const messages = useUiMessages();
  // Content is read once (an element prop read twice is created twice): whether there is any
  // comes from the prop's presence, not its value.
  const hasContent = "children" in props.view;

  function isEmpty(): boolean {
    return hasContent ? props.view.empty === true : isBlank(props.view.text);
  }

  return (
    <output
      {...props.own}
      tabindex={props.isInField ? 0 : undefined}
      dir={props.view.dir}
      data-slot="view"
      data-empty={isEmpty() ? "" : undefined}
      class={cn(OUTPUT, props.view.class)}
    >
      <Show when={!isEmpty()} fallback={messages.viewEmpty}>
        {hasContent ? props.view.children : props.view.text}
      </Show>
    </output>
  );
}

/**
 * A form value shown, not edited: the base of every control's view (a table cell, a detail page,
 * a read-only field). It is an `<output>`. Inside a Field it is the field's control, so the label
 * names it and it sits in the tab order; outside one it is a plain output. Empty, it shows the
 * provider's `viewEmpty` message in the muted color.
 */
export function View(props: ViewProps): JSX.Element {
  const isInField = useFieldControl() !== null;

  return (
    <Show when={isInField} fallback={<Output view={props} own={{ id: props.id }} isInField={false} />}>
      <FieldControl
        id={props.id}
        render={(own: JSX.OutputHTMLAttributes<HTMLOutputElement>) => <Output view={props} own={own} isInField />}
      />
    </Show>
  );
}

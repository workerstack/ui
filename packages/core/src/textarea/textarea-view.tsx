import type { JSX } from "@solidjs/web";

import { cn } from "../cn/index.ts";
import { View } from "../view/index.ts";

/** What `TextareaView` takes. */
export type TextareaViewProps = {
  /** The text; its line breaks are kept. Empty or missing shows the empty marker. */
  value?: string | null;
  /** Extra classes; they win over the view's own. */
  class?: string | undefined;
  /** The output's id. Inside a Field it defaults to the id the field's label points at. */
  id?: string | undefined;
};

/** `Textarea` shown, not edited: the text with its line breaks, or the provider's empty marker. */
export function TextareaView(props: TextareaViewProps): JSX.Element {
  return <View class={cn("block whitespace-pre-line", props.class)} id={props.id} text={props.value ?? null} />;
}

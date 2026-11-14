import type { JSX } from "@solidjs/web";

import { View } from "../view/index.ts";

/** What `TextInputView` takes. */
export type TextInputViewProps = {
  /** The text as typed; empty or missing shows the empty marker. */
  value?: string | null;
  /** Extra classes; they win over the view's own. */
  class?: string | undefined;
  /** The output's id. Inside a Field it defaults to the id the field's label points at. */
  id?: string | undefined;
};

/** `TextInput` shown, not edited: the text as typed, or the provider's empty marker. */
export function TextInputView(props: TextInputViewProps): JSX.Element {
  return <View class={props.class} id={props.id} text={props.value ?? null} />;
}

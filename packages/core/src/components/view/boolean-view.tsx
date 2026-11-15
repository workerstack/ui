import type { JSX } from "@solidjs/web";

import { useUiMessages } from "../provider/index.ts";
import { View } from "./view.tsx";

/** What `BooleanView` takes. */
export type BooleanViewProps = {
  /** The value; `true` reads "Yes", anything else "No". */
  value?: boolean | null;
  /** Extra classes for the view. */
  class?: string | undefined;
  /** The view's id. */
  id?: string | undefined;
};

/** A yes-or-no value read only: a Checkbox's or Switch's view, in the provider's `viewYes` and `viewNo`. */
export function BooleanView(props: BooleanViewProps): JSX.Element {
  const messages = useUiMessages();

  return <View text={props.value === true ? messages.viewYes : messages.viewNo} class={props.class} id={props.id} />;
}

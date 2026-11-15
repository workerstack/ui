import type { JSX } from "@solidjs/web";

import { cn } from "../../utils/cn/index.ts";
import { View, type ViewProps } from "../view/index.ts";

/** What the views of an input take: `View`'s props. */
export type InputViewProps = ViewProps;

/** An Input's value shown, not edited: its text, or the provider's empty marker. */
export function InputView(props: InputViewProps): JSX.Element {
  return <View {...props} />;
}

/** An Input's value shown in place of the control inside an `InputGroup`, padded as the control is. */
export function InputGroupView(props: InputViewProps): JSX.Element {
  return <View {...props} class={cn("flex-1", props.class)} />;
}

/** A Textarea's value shown in an `InputGroup`: its lines kept, padded as the control is. */
export function InputGroupTextareaView(props: InputViewProps): JSX.Element {
  return <View {...props} class={cn("flex-1 py-2 whitespace-pre-wrap", props.class)} />;
}

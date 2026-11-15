import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import { cn } from "../../cn/index.ts";
import { useFormArray } from "./array-context.ts";

const MESSAGE = "text-sm leading-normal text-destructive";

/** What `formArray.Error` takes. */
export type FormArrayErrorProps = {
  /** Classes on the message. */
  class?: string;
};

/** The array's own errors (its count, uniqueness), shown by the form's error rule; it describes the group. */
export function FormArrayError(props: FormArrayErrorProps): JSX.Element {
  const array = useFormArray("Error");

  return (
    <Show when={array.invalid() && array.messages().length > 0}>
      <p id={array.errorId} data-slot="form-array-error" class={cn(MESSAGE, props.class)}>
        {array.messages().join(" ")}
      </p>
    </Show>
  );
}

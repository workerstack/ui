import type { JSX } from "@solidjs/web";
import { Show } from "solid-js";

import { FieldError, type FieldErrorProps } from "../../../field/index.ts";
import { useUiMessages } from "../../../provider/index.ts";
import type { BoundField } from "./bound-field-types.ts";
import { FIELD_MODULE_ERROR_MESSAGES_EN } from "./field-module-error.messages.ts";

const CHECKING = "flex items-center gap-1.5 text-sm leading-normal text-muted-foreground";
const RING = "size-3 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none";

/** What a module's `Error` takes: the Field error's props, without what the field decides. */
export type ModuleErrorProps = Omit<FieldErrorProps, "children" | "match">;

/** What `ModuleError` renders from. */
type ModuleErrorSource = {
  /** The error's own props. */
  props: ModuleErrorProps;
  /** The enclosing Root's field. */
  field: Pick<BoundField<unknown>, "invalid" | "messages" | "validating">;
};

/**
 * The field's messages through UI SDK's FieldError, so the control gets `aria-invalid` and is
 * described by them; "Checking…" in their place while an async check runs.
 */
export function ModuleError(source: ModuleErrorSource): JSX.Element {
  const messages = useUiMessages(FIELD_MODULE_ERROR_MESSAGES_EN);

  return (
    <>
      <Show when={source.field.validating()}>
        <output data-slot="field-checking" class={CHECKING}>
          <span aria-hidden="true" class={RING} />
          {messages.fieldChecking}
        </output>
      </Show>
      <FieldError {...source.props} match={!source.field.validating() && source.field.invalid()}>
        {source.field.messages().join(" ")}
      </FieldError>
    </>
  );
}

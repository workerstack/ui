import type { JSX } from "@solidjs/web";
import { FieldError as FieldErrorPart } from "@ui-sdk/solid/field";
import { createSignal, omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { isStateFunction } from "../internal/index.ts";
import { useUiMessages } from "../provider/index.ts";

/** UI SDK's field error props: `match` picks the validity problem. */
export type FieldErrorProps = Omit<ComponentProps<typeof FieldErrorPart>, "ref">;

const CONTROLS = "input, select, textarea";

// Whether a control in the error's field holds nothing and carries no message of the UI's own: the
// browser alone found it missing, so its words are not ours to show.
function missingByBrowser(error: Element | undefined): boolean {
  const field = error?.closest('[data-slot="field"]');
  const controls = field?.querySelectorAll<HTMLInputElement>(CONTROLS) ?? [];

  return [...controls].some((control) => control.validity.valueMissing && !control.validity.customError);
}

/**
 * Shows when the control is invalid. `match` picks which validity problem it is for. Without
 * children it shows the control's message; where the browser alone found a value missing (a
 * select, a radio group) that is the UI's own `requiredField`, never the browser's. A control
 * that sets its own message (`createRequiredText`, `setValidity`) keeps it. It opens from nothing,
 * the Field's gap included, as the Field's description collapses; UI SDK removes it at once, so it
 * does not animate out.
 */
export function FieldError(props: FieldErrorProps): JSX.Element {
  const rest = omit(props, "class", "children");
  const messages = useUiMessages();
  const [element, setElement] = createSignal<HTMLElement>();

  return (
    <FieldErrorPart
      {...rest}
      ref={(node: HTMLDivElement) => {
        // Once the element is in the page, so its field can be found.
        queueMicrotask(() => setElement(node));
      }}
      class={cnState(
        [
          "overflow-hidden text-sm leading-normal text-destructive transition-[height,margin,opacity] duration-150",
          "ease-out [interpolate-size:allow-keywords] starting:-mt-2 starting:h-0 starting:opacity-0",
          "motion-reduce:transition-none",
        ],
        props.class,
      )}
    >
      {(state) => {
        if (props.children !== undefined)
          return isStateFunction(props.children) ? props.children(state) : props.children;

        return missingByBrowser(element()) ? messages.requiredField : state.message;
      }}
    </FieldErrorPart>
  );
}

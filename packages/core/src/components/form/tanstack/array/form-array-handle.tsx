import type { JSX } from "@solidjs/web";
import { Show, untrack } from "solid-js";

import { cn } from "../../../../utils/cn/index.ts";
import { useUiMessages } from "../../../provider/index.ts";
import { useFormArray, useFormArrayItems } from "./array-context.ts";
import { GripIcon } from "./array-icons.tsx";
import { ARRAY_MESSAGES_EN } from "./array.messages.ts";

/** What `formArray.Handle` takes. */
export type FormArrayHandleProps = {
  /** The item's index, as Items hands it to its children. */
  index: number;
  /** Classes on the grip. */
  class?: string;
};

const GRIP =
  "inline-flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground " +
  "hover:text-foreground";

/** Binds the grip and, once it sits in the page, the item element it sits in. */
function GripPart(props: FormArrayHandleProps): JSX.Element {
  const sortable = useFormArrayItems();
  const messages = useUiMessages(ARRAY_MESSAGES_EN);
  const index = untrack(() => props.index);
  const item = sortable.item({ id: String(index), label: () => messages.arrayItem(index + 1) });

  return (
    <span
      ref={(element: HTMLSpanElement) => {
        item.handle(element);
        // Refs run before insertion: the item element is known once the grip sits in it.
        queueMicrotask(() => {
          const owner = element.closest<HTMLElement>('[data-slot="form-array-item"]');

          if (owner !== null) item.ref(owner);
        });
      }}
      aria-hidden="true"
      data-slot="form-array-handle"
      // A press on the grip keeps focus where it is, so focus inside the moved item follows it.
      onMouseDown={(event) => event.preventDefault()}
      class={cn(GRIP, props.class)}
    >
      <GripIcon />
    </span>
  );
}

/**
 * Drags its item to a new position: pointer only and hidden from assistive technology, as MoveUp
 * and MoveDown are the keyboard path. A touch on it drags at once. Nothing in a read-only Form.
 */
export function FormArrayHandle(props: FormArrayHandleProps): JSX.Element {
  const array = useFormArray("Handle");

  return (
    <Show when={!array.readOnly()}>
      <GripPart {...props} />
    </Show>
  );
}

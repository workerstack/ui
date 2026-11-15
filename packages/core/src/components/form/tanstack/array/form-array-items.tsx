import type { JSX } from "@solidjs/web";
import { Repeat } from "solid-js";

import { createSortable, type SortableMove } from "../../../../features/dnd/sortable/core/index.ts";
import { cn } from "../../../../utils/cn/index.ts";
import { useUiMessages } from "../../../provider/index.ts";
import { FORM_ARRAY_ITEMS_CONTEXT, useFormArray, type FormArrayState } from "./array-context.ts";
import { arrayDndMessages } from "./array-dnd-messages.ts";
import { itemAt } from "./array-focus.ts";
import { ARRAY_MESSAGES_EN } from "./array.messages.ts";

/** What `formArray.Items` takes. */
export type FormArrayItemsProps = {
  /** One item's fields and buttons, by its index. */
  children: (index: number) => JSX.Element;
  /** Names an item's group. @default the provider's `arrayItem`, e.g. “Item 2” */
  label?: (index: number) => string;
  /** Classes on the list. */
  class?: string;
};

const LIST = "flex flex-col gap-3";

const ITEM = [
  "m-0 flex min-w-0 flex-wrap items-start gap-2 border-0 p-0 transition-[box-shadow,background-color] duration-200",
  "data-dnd-dragging:rounded-lg data-dnd-dragging:not-data-dnd-dropping:bg-background",
  "data-dnd-dragging:not-data-dnd-dropping:shadow-popup",
];

/** Applies a drop to the array; focus inside the moved item follows it. */
function applyMove(array: FormArrayState, list: () => HTMLElement | undefined, move: SortableMove): void {
  const node = list();
  const isFocused = node !== undefined && itemAt(node, move.from.index)?.contains(document.activeElement) === true;
  array.field().moveValue(move.from.index, move.to.index);

  if (isFocused) array.focusItem(move.to.index);
}

/** One item's group, named by its position. */
function ItemGroup(props: { index: number; items: FormArrayItemsProps }): JSX.Element {
  const messages = useUiMessages(ARRAY_MESSAGES_EN);

  return (
    <fieldset
      aria-label={props.items.label?.(props.index) ?? messages.arrayItem(props.index + 1)}
      data-slot="form-array-item"
      data-index={props.index}
      class={cn(ITEM)}
    >
      {props.items.children(props.index)}
    </fieldset>
  );
}

/**
 * One group per item, named by its position. Items are positional (rendered by index, their
 * fields bound by path), so a move rewrites the values and the rows stay. An item with a Handle
 * drags to reorder.
 */
export function FormArrayItems(props: FormArrayItemsProps): JSX.Element {
  const array = useFormArray("Items");
  let list: HTMLElement | undefined;

  const sortable = createSortable({
    messages: arrayDndMessages(useUiMessages(ARRAY_MESSAGES_EN)),
    onMove: (move) => applyMove(array, () => list, move),
    positional: true,
  });

  const bindList = sortable.list({ id: "items", keyboard: false });

  return (
    <FORM_ARRAY_ITEMS_CONTEXT value={sortable}>
      <div
        ref={(element: HTMLDivElement) => {
          list = element;
          bindList(element);
        }}
        data-slot="form-array-items"
        class={cn(LIST, props.class)}
      >
        <Repeat count={array.length()}>{(index) => <ItemGroup index={index} items={props} />}</Repeat>
      </div>
    </FORM_ARRAY_ITEMS_CONTEXT>
  );
}

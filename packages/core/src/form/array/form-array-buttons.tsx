import type { JSX } from "@solidjs/web";
import { omit, Show, untrack } from "solid-js";

import { Button, type ButtonProps } from "../../button/index.ts";
import { cn } from "../../cn/index.ts";
import { useUiMessages, type UiMessages } from "../../provider/index.ts";
import { useFormArray } from "./array-context.ts";
import { ChevronIcon, RemoveIcon } from "./array-icons.tsx";

// The array's buttons, its click and keyboard path: Add appends, Remove and the move buttons act on
// one item, and focus follows each change. None renders in a read-only Form. A Button keeps its
// own `data-slot`, so each names its part in `data-form-array`.

/** What `formArray.Add` takes: a Button's props and the item it appends. */
export type FormArrayAddProps<TItem> = Omit<ButtonProps, "onClick" | "type" | "value"> & {
  /** The new item: a value, or a function that makes a fresh one. */
  value: TItem | (() => TItem);
};

/** What `formArray.Remove`, `MoveUp` and `MoveDown` take: a Button's props and the item's index. */
export type FormArrayItemButtonProps = Omit<ButtonProps, "onClick" | "type" | "children"> & {
  /** The item's index, as Items hands it to its children. */
  index: number;
  /** The button's content. @default its icon */
  children?: JSX.Element;
};

/** An item is data, never a function: a function value is what makes one. */
function isMaker<TItem>(value: TItem | (() => TItem)): value is () => TItem {
  return typeof value === "function";
}

/** Appends an item and focuses its first control; disabled at `max`. */
export function FormArrayAdd<TItem>(props: FormArrayAddProps<TItem>): JSX.Element {
  const array = useFormArray("Add");
  const rest = omit(props, "class", "disabled", "value");

  function add(): void {
    const source = props.value;
    array.field().pushValue(isMaker(source) ? source() : source);
    array.focusItem(array.length() - 1);
  }

  return (
    <Show when={!array.readOnly()}>
      <Button
        variant="secondary"
        size="sm"
        {...rest}
        type="button"
        data-form-array="add"
        disabled={props.disabled === true || array.length() >= array.max()}
        onClick={add}
        class={cn("w-fit", props.class)}
      />
    </Show>
  );
}

/** Removes the item at `index` and focuses the item now there; disabled at `min`. */
export function FormArrayRemove(props: FormArrayItemButtonProps): JSX.Element {
  const array = useFormArray("Remove");
  const messages = useUiMessages();
  const rest = omit(props, "children", "disabled", "index");

  function remove(): void {
    const { index } = props;
    array.field().removeValue(index);
    array.focusItem(Math.min(index, array.length() - 1));
  }

  return (
    <Show when={!array.readOnly()}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={messages.arrayRemove(props.index + 1)}
        {...rest}
        type="button"
        data-form-array="remove"
        disabled={props.disabled === true || array.length() <= array.min()}
        onClick={remove}
      >
        {props.children ?? <RemoveIcon />}
      </Button>
    </Show>
  );
}

/** One way a move button moves: up (−1) or down (+1), its part, its twin's, and its name for people. */
type Direction = {
  by: -1 | 1;
  part: "MoveUp" | "MoveDown";
  slot: string;
  twin: string;
  label: (messages: UiMessages, position: number) => string;
};

const UP: Direction = {
  by: -1,
  label: (messages, position) => messages.arrayMoveUp(position),
  part: "MoveUp",
  slot: "move-up",
  twin: "move-down",
};

const DOWN: Direction = {
  by: 1,
  label: (messages, position) => messages.arrayMoveDown(position),
  part: "MoveDown",
  slot: "move-down",
  twin: "move-up",
};

/** What a move button takes: an item button's props and the way it moves. */
type MoveButtonProps = FormArrayItemButtonProps & { direction: Direction };

/** The index the item moves to. */
function targetOf(props: MoveButtonProps): number {
  return props.index + props.direction.by;
}

/** Moves the item at `index` one step; disabled at the array's end that way. */
function MoveButton(props: MoveButtonProps): JSX.Element {
  const array = useFormArray(untrack(() => props.direction.part));
  const messages = useUiMessages();
  const rest = omit(props, "children", "direction", "disabled", "index");

  function step(): void {
    const to = targetOf(props);
    array.field().moveValue(props.index, to);
    // The same button at the item's new position, or its twin once that one is disabled at an end.
    array.focusItem(to, [props.direction.slot, props.direction.twin]);
  }

  return (
    <Show when={!array.readOnly()}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={props.direction.label(messages, props.index + 1)}
        {...rest}
        type="button"
        data-form-array={props.direction.slot}
        disabled={props.disabled === true || targetOf(props) < 0 || targetOf(props) >= array.length()}
        onClick={step}
      >
        {props.children ?? <ChevronIcon up={props.direction.by < 0} />}
      </Button>
    </Show>
  );
}

/** Moves the item at `index` up one place, with focus; disabled on the first item. */
export function FormArrayMoveUp(props: FormArrayItemButtonProps): JSX.Element {
  return <MoveButton {...props} direction={UP} />;
}

/** Moves the item at `index` down one place, with focus; disabled on the last item. */
export function FormArrayMoveDown(props: FormArrayItemButtonProps): JSX.Element {
  return <MoveButton {...props} direction={DOWN} />;
}

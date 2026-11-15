import type { JSX } from "@solidjs/web";
import { FieldSet } from "@ui-sdk/solid/field";
import { For, Show } from "solid-js";

import { type OptionColor, type OptionItems, optionColor, optionLabel, optionLabels } from "../../internal/index.ts";
import { OptionBadge } from "./option-color.tsx";
import { View } from "./view.tsx";

/** What `ChoiceView` takes. */
export type ChoiceViewProps<Value> = {
  /** The chosen value, or values for a multiple choice. */
  value?: Value | readonly Value[] | null;
  /** The options, as the control takes them (a list of values, or items). */
  items?: OptionItems<Value>;
  /** A value's label, when `items` can't tell it (an object value). */
  itemToStringLabel?: (value: Value) => string;
  /** A value's color, when `items` can't tell it (a combobox's items are bare values). */
  itemToColor?: (value: Value) => OptionColor | undefined;
  /** A group control's legend; it puts the view in a fieldset the legend names. */
  legend?: JSX.Element;
  /** Extra classes for the view. */
  class?: string | undefined;
  /** The view's id. */
  id?: string | undefined;
};

// Several chosen values (a multiple choice), not one.
function isMany<Value>(value: Value | readonly Value[]): value is readonly Value[] {
  return Array.isArray(value);
}

/** The text a choice shows: one label, or several joined with commas. */
export function choiceText<Value>(
  value: Value | readonly Value[] | null | undefined,
  items?: OptionItems<Value>,
  itemToStringLabel?: (value: Value) => string,
): string {
  if (isMany(value)) return optionLabels(items, value, itemToStringLabel).join(", ");

  return optionLabel(items, value, itemToStringLabel);
}

// The chosen values as a list: none for no value.
function chosenValues<Value>(value: Value | readonly Value[] | null | undefined): Value[] {
  if (value === null || value === undefined || value === "") return [];

  return isMany(value) ? [...value] : [value];
}

/**
 * A group control's view under its legend: a fieldset the legend names when the props carry one,
 * otherwise the view alone.
 */
function withLegend(props: { legend?: JSX.Element }, view: () => JSX.Element): JSX.Element {
  // Decided by the prop's presence: reading an element prop twice creates it twice.
  if (!("legend" in props)) return view();

  return (
    <FieldSet class="flex min-w-0 flex-col gap-2">
      {props.legend}
      {view()}
    </FieldSet>
  );
}

function ChoiceBody<Value>(props: ChoiceViewProps<Value>): JSX.Element {
  function colorOf(value: Value): OptionColor | undefined {
    return props.itemToColor?.(value) ?? optionColor(props.items, value);
  }

  function chosen(): Value[] {
    return chosenValues(props.value);
  }

  return (
    <Show
      when={chosen().some((value) => colorOf(value) !== undefined)}
      fallback={
        <View id={props.id} class={props.class} text={choiceText(props.value, props.items, props.itemToStringLabel)} />
      }
    >
      <View id={props.id} class={props.class}>
        <span class="inline-flex max-w-full flex-wrap gap-1">
          <For each={chosen()}>
            {(value) => (
              <OptionBadge color={colorOf(value)}>
                {optionLabel(props.items, value, props.itemToStringLabel)}
              </OptionBadge>
            )}
          </For>
        </span>
      </View>
    </Show>
  );
}

/**
 * The read-only view of a choice control (a select, a combobox, a radio or checkbox group): the
 * chosen value's label, or the chosen values' labels joined, looked up in the same `items` the
 * control renders from. When a chosen option has a color, the choice reads as badges (a plain one
 * among them neutral). With a `legend` it sits in a fieldset the legend names.
 */
export function ChoiceView<Value>(props: ChoiceViewProps<Value>): JSX.Element {
  return (
    <>
      {withLegend(props, () => (
        <ChoiceBody {...props} />
      ))}
    </>
  );
}

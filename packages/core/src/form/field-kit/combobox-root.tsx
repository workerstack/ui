import type { JSX } from "@solidjs/web";
import type { DeepKeys } from "@tanstack/solid-form";
import type { ListData } from "@ui-sdk/solid/combobox";
import { merge } from "solid-js";

import { ComboboxView, type ComboboxProps } from "../../combobox/index.ts";
import type { ValueBindings } from "../bound-field-types.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { RootProps, ValueCheck } from "../field-module-types.ts";
import { listValues } from "./list-values.ts";
import type { OptionValue } from "./option-value.ts";
import { presentProps } from "./present-props.ts";
import { stringLabel } from "./string-label.ts";
import type { ViewSlot } from "./view-slot.ts";

// What the combobox fields' Roots keep for their parts: the items and the props typed by their
// values, which the Root takes so it can check the field against them.

/** The combobox's props typed by its items' values: they go on a field's Root with the items. */
type ComboboxItemProps =
  | "filter"
  | "isItemEqualToValue"
  | "itemToColor"
  | "itemToLabel"
  | "itemToValue"
  | "onHighlight";

/** What a combobox field's Root keeps for its parts, one value or several. */
export type ComboboxRootData<TMultiple extends boolean> = Pick<
  ComboboxProps<unknown, TMultiple>,
  ComboboxItemProps | "items"
>;

/** What a combobox field's Root takes: the field, by `form` and `name`, and the items it holds. */
export type ComboboxRootProps<
  TFormData,
  TName extends DeepKeys<TFormData>,
  TItems,
  TMultiple extends boolean,
> = RootProps<TFormData, TName> &
  Pick<ComboboxProps<OptionValue<TItems>, TMultiple>, ComboboxItemProps> & {
    /** The items; the field holds one of their values (or null), or a list of them. */
    items: TItems;
  };

/** What the field holds: one of the items' values or null, or a list of them. */
type Chosen<TItems, TMultiple extends boolean> = TMultiple extends true
  ? OptionValue<TItems>[]
  : OptionValue<TItems> | null;

/** A combobox field's typed Root: a Field bound to a field it checks against the items' values. */
export type ComboboxRoot<TMultiple extends boolean> = <
  TFormData,
  TName extends DeepKeys<TFormData>,
  const TItems extends ListData<unknown>,
>(
  props: ComboboxRootProps<TFormData, TName, TItems, TMultiple> &
    ValueCheck<TFormData, TName, Chosen<TItems, TMultiple>, Chosen<TItems, TMultiple>>,
) => JSX.Element;

/** A combobox field's module with its Root typed by the items' values. */
export type ComboboxModule<TShows, TMultiple extends boolean> = Omit<
  FieldModule<unknown, TShows, ComboboxRootData<TMultiple>>,
  "Root"
> & {
  /** The field and the items it holds one or several of. */
  Root: ComboboxRoot<TMultiple>;
  /** The chosen items' labels, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A combobox field's base module. Unchecked at the base (it writes `unknown`): the field's typed
 * Root checks the field against its items.
 */
export function defineComboboxModule<TShows, TMultiple extends boolean>(
  empty: TShows,
  name: string,
): FieldModule<unknown, TShows, ComboboxRootData<TMultiple>> {
  return defineFieldModule<unknown, TShows, ComboboxRootData<TMultiple>>({ empty, name });
}

/** What a combobox field's Control takes: Combobox's props, without what the field and the Root decide. */
export type ComboboxControlProps<TMultiple extends boolean> = Omit<
  ComboboxProps<unknown, TMultiple>,
  ComboboxItemProps | "defaultValue" | "items" | "multiple" | "name" | "onValueChange" | "value"
>;

/** What the Control reads off the Root: the items and the props typed by their values. */
const ROOT_KEYS = [
  "filter",
  "isItemEqualToValue",
  "items",
  "itemToColor",
  "itemToLabel",
  "itemToValue",
  "onHighlight",
] as const;

/** The Root's items and item props as the Combobox takes them, each read when the Combobox reads it. */
function comboboxItems<TMultiple extends boolean>(root: ComboboxRootData<TMultiple>): ComboboxRootData<TMultiple> {
  return presentProps(root, ROOT_KEYS);
}

/** What a combobox field's Control hands its Combobox: the Root's items and the field's value bindings. */
type ComboboxBindings<TMultiple extends boolean, TBindings> = ComboboxRootData<TMultiple> &
  Omit<TBindings, "readOnly"> & { readonly readOnly: boolean };

/** The Combobox's items and item props from the Root, and the field's value bindings, for its Control. */
export function comboboxBindings<TMultiple extends boolean, TBindings extends ValueBindings<unknown, unknown>>(
  root: ComboboxRootData<TMultiple>,
  bound: TBindings,
): ComboboxBindings<TMultiple, TBindings> {
  const bindings = merge(comboboxItems(root), listValues(bound));

  return bindings /* merge's Override of generic sources, which TypeScript cannot reduce */ as ComboboxBindings<
    TMultiple,
    TBindings
  >;
}

/** What a combobox field's View reads off its Root: the items, and what labels and colors them. */
type ComboboxViewRoot = Pick<ComboboxRootData<false>, "items" | "itemToColor" | "itemToLabel">;

/** What `ComboboxRootView` takes. */
type ComboboxRootViewProps = {
  /** The View's class and id. */
  slot: ViewSlot;
  /** The Root's items and what labels and colors them. */
  root: ComboboxViewRoot;
  /** The chosen value, or values. */
  value: unknown;
};

/** The chosen labels, read from the Root's items. */
function ComboboxRootView(props: ComboboxRootViewProps): JSX.Element {
  return (
    <ComboboxView
      class={props.slot.class}
      id={props.slot.id}
      {...presentProps(props.root, ["items", "itemToColor"])}
      {...stringLabel(props.root)}
      value={props.value}
    />
  );
}

/** A combobox field's View: the chosen labels, read from the Root's items. */
export function comboboxView<TShows, TRoot extends ComboboxViewRoot>(
  module: FieldModule<unknown, TShows, TRoot>,
): (props: ViewSlot) => JSX.Element {
  return module.view((props: ViewSlot, field) => (
    <ComboboxRootView slot={props} root={field.root} value={field.value()} />
  ));
}

import type { JSX } from "@solidjs/web";
import type { DeepKeys } from "@tanstack/solid-form";
import type { ListData } from "@ui-sdk/solid/select";

import { Select, SelectTrigger, SelectView, type SelectProps, type SelectTriggerProps } from "../../select/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { RootProps, ValueCheck } from "../field-module-types.ts";
import { listValues } from "./list-values.ts";
import type { OptionValue } from "./option-value.ts";
import { presentProps } from "./present-props.ts";
import { stringLabel } from "./string-label.ts";
import type { ViewSlot } from "./view-slot.ts";

// A select bound to a field that holds one of its options' values, or null before one is picked.
// The Root takes the options (`items`), so it checks the field against their values and the View
// reads their labels; the Control is the select's root, composed with this module's Trigger (it
// reports blur) and the plain SelectValue, SelectContent and SelectItem.

/** The select's props typed by its options' values: they go on the Root with the options. */
type ItemProps = "isItemEqualToValue" | "itemToLabel" | "itemToValue";

/** What the Control reads off the Root: the items and the props typed by their values. */
const ROOT_KEYS = ["isItemEqualToValue", "items", "itemToLabel", "itemToValue"] as const;

/** What the Root keeps for its parts: the options and the props typed by their values. */
type SelectRootData = Pick<SelectProps<unknown>, ItemProps | "items">;

// Unchecked at the base (it writes `unknown`): the typed Root checks the field against its items.
const select = /* @__PURE__ */ defineFieldModule<unknown, unknown, SelectRootData>({ empty: null, name: "FormSelect" });

/** What `formSelect.Root` takes: the field, by `form` and `name`, and the options it holds one of. */
export type FormSelectRootProps<TFormData, TName extends DeepKeys<TFormData>, TItems> = RootProps<TFormData, TName> &
  Pick<SelectProps<OptionValue<TItems>>, ItemProps> & {
    /** The options; the field holds one of their values, or null before one is picked. */
    items: TItems;
  };

/** `formSelect.Root`: a Field bound to a field that holds one of `items`' values. */
export type FormSelectRoot = <TFormData, TName extends DeepKeys<TFormData>, const TItems extends ListData<unknown>>(
  props: FormSelectRootProps<TFormData, TName, TItems> &
    ValueCheck<TFormData, TName, OptionValue<TItems> | null, OptionValue<TItems> | null>,
) => JSX.Element;

/** What `formSelect.Control` takes: Select's props, without what the field and the Root decide. */
export type FormSelectControlProps = Omit<
  SelectProps<unknown>,
  ItemProps | "defaultValue" | "items" | "multiple" | "name" | "onValueChange" | "value"
>;

/** What `formSelect.Trigger` takes: SelectTrigger's props, its `onBlur` a plain handler. */
export type FormSelectTriggerProps = Omit<SelectTriggerProps, "onBlur"> & {
  /** Runs when the trigger loses focus, after the field is blurred. */
  onBlur?: JSX.FocusEventHandler<HTMLButtonElement, FocusEvent>;
};

const view = /* @__PURE__ */ select.view((props: ViewSlot, field) => (
  <SelectView
    class={props.class}
    id={props.id}
    {...presentProps(field.root, ["items"])}
    {...stringLabel(field.root)}
    value={field.value()}
  />
));

const control = /* @__PURE__ */ select.control(
  (props: FormSelectControlProps, field) => (
    <Select {...props} {...presentProps(field.root, ROOT_KEYS)} {...listValues(field.values(props))} />
  ),
  { view: () => view({}) },
);

const trigger = /* @__PURE__ */ select.part("Trigger", (props: FormSelectTriggerProps, field) => (
  <SelectTrigger {...props} onBlur={field.blurring(props.onBlur)} />
));

/** `formSelect`: the module, its typed Root, its Control, Trigger and View. */
export type FormSelect = Omit<FieldModule<unknown, unknown, SelectRootData>, "Root"> & {
  /** The field and the options it holds one of. */
  Root: FormSelectRoot;
  /** The select's root, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormSelectControlProps) => JSX.Element;
  /** The button that opens the list; it reports blur. */
  Trigger: (props: FormSelectTriggerProps) => JSX.Element;
  /** The chosen option's label, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A select bound to a field that holds one of its options' values:
 *
 *     <formSelect.Root form={form} name="role" items={ROLES}>
 *       <formSelect.Label>Role</formSelect.Label>
 *       <formSelect.Control placeholder="Pick a role">
 *         <formSelect.Trigger><SelectValue /></formSelect.Trigger>
 *         <SelectContent>…</SelectContent>
 *       </formSelect.Control>
 *       <formSelect.Error />
 *     </formSelect.Root>
 */
export const formSelect: FormSelect = {
  ...select,
  Control: control,
  // The typed Root is the base Root: its items' values only narrow what the base takes as `unknown`.
  Root: select.Root /* narrowed by the items' values, checked by ValueCheck */ as FormSelectRoot,
  Trigger: trigger,
  View: view,
};

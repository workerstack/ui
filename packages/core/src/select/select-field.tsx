import type { JSX } from "@solidjs/web";
import type { DeepKeys } from "@tanstack/solid-form";
import type { ListData } from "@ui-sdk/solid/select";

import { defineFieldModule } from "../form/define-field-module.tsx";
import { listValues } from "../form/field-kit/list-values.ts";
import type { OptionValue } from "../form/field-kit/option-value.ts";
import { presentProps } from "../form/field-kit/present-props.ts";
import { stringLabel } from "../form/field-kit/string-label.ts";
import type { ViewSlot } from "../form/field-kit/view-slot.ts";
import type { FieldModule } from "../form/field-module-shape.ts";
import type { RootProps, ValueCheck } from "../form/field-module-types.ts";
import { Select, SelectTrigger, SelectView, type SelectProps, type SelectTriggerProps } from "./index.ts";

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
const select = /* @__PURE__ */ defineFieldModule<unknown, unknown, SelectRootData>({
  empty: null,
  name: "SelectField",
});

/** What `selectField.Root` takes: the field, by `form` and `name`, and the options it holds one of. */
export type SelectFieldRootProps<TFormData, TName extends DeepKeys<TFormData>, TItems> = RootProps<TFormData, TName> &
  Pick<SelectProps<OptionValue<TItems>>, ItemProps> & {
    /** The options; the field holds one of their values, or null before one is picked. */
    items: TItems;
  };

/** `selectField.Root`: a Field bound to a field that holds one of `items`' values. */
export type SelectFieldRoot = <TFormData, TName extends DeepKeys<TFormData>, const TItems extends ListData<unknown>>(
  props: SelectFieldRootProps<TFormData, TName, TItems> &
    ValueCheck<TFormData, TName, OptionValue<TItems> | null, OptionValue<TItems> | null>,
) => JSX.Element;

/** What `selectField.Control` takes: Select's props, without what the field and the Root decide. */
export type SelectFieldControlProps = Omit<
  SelectProps<unknown>,
  ItemProps | "defaultValue" | "items" | "multiple" | "name" | "onValueChange" | "value"
>;

/** What `selectField.Trigger` takes: SelectTrigger's props, its `onBlur` a plain handler. */
export type SelectFieldTriggerProps = Omit<SelectTriggerProps, "onBlur"> & {
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
  (props: SelectFieldControlProps, field) => (
    <Select {...props} {...presentProps(field.root, ROOT_KEYS)} {...listValues(field.values(props))} />
  ),
  { view: () => view({}) },
);

const trigger = /* @__PURE__ */ select.part("Trigger", (props: SelectFieldTriggerProps, field) => (
  <SelectTrigger {...props} onBlur={field.blurring(props.onBlur)} />
));

/** `selectField`: the module, its typed Root, its Control, Trigger and View. */
export type SelectField = Omit<FieldModule<unknown, unknown, SelectRootData>, "Root"> & {
  /** The field and the options it holds one of. */
  Root: SelectFieldRoot;
  /** The select's root, bound to the Root's field; read-only it renders the View. */
  Control: (props: SelectFieldControlProps) => JSX.Element;
  /** The button that opens the list; it reports blur. */
  Trigger: (props: SelectFieldTriggerProps) => JSX.Element;
  /** The chosen option's label, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A select bound to a field that holds one of its options' values:
 *
 *     <selectField.Root form={form} name="role" items={ROLES}>
 *       <selectField.Label>Role</selectField.Label>
 *       <selectField.Control placeholder="Pick a role">
 *         <selectField.Trigger><SelectValue /></selectField.Trigger>
 *         <SelectContent>…</SelectContent>
 *       </selectField.Control>
 *       <selectField.Error />
 *     </selectField.Root>
 */
export const selectField: SelectField = {
  ...select,
  Control: control,
  // The typed Root is the base Root: its items' values only narrow what the base takes as `unknown`.
  Root: select.Root /* narrowed by the items' values, checked by ValueCheck */ as SelectFieldRoot,
  Trigger: trigger,
  View: view,
};

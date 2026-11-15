import type { JSX } from "@solidjs/web";
import type { DeepKeys } from "@tanstack/solid-form";

import { Combobox, ComboboxInput, type ComboboxInputProps } from "../../combobox/index.ts";
import {
  comboboxItems,
  defineComboboxModule,
  ComboboxRootView,
  type ComboboxControlProps,
  type ComboboxRoot,
  type ComboboxModule,
  type ComboboxRootProps,
} from "./combobox-root.tsx";
import { listValues } from "./list-values.ts";
import type { ViewSlot } from "./view-slot.ts";

// A combobox bound to a field that holds one of its items' values, or null. The Root takes the
// items (and the props typed by their values), so it checks the field against them and the View
// reads their labels; the Control is the combobox's root, composed with this module's Input (it
// reports blur) and the plain ComboboxContent.

const combobox = /* @__PURE__ */ defineComboboxModule<unknown, false>(null, "FormCombobox");

/** What `formCombobox.Root` takes: the field, by `form` and `name`, and the items it holds one of. */
export type FormComboboxRootProps<TFormData, TName extends DeepKeys<TFormData>, TItems> = ComboboxRootProps<
  TFormData,
  TName,
  TItems,
  false
>;

/** `formCombobox.Root`: a Field bound to a field that holds one of `items`' values. */
export type FormComboboxRoot = ComboboxRoot<false>;

/** What `formCombobox.Control` takes: Combobox's props, without what the field and the Root decide. */
export type FormComboboxControlProps = ComboboxControlProps<false>;

/** What `formCombobox.Input` takes: ComboboxInput's props, its `onBlur` a plain handler. */
export type FormComboboxInputProps = Omit<ComboboxInputProps, "onBlur"> & {
  /** Runs when the input loses focus, after the field is blurred. */
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
};

const view = /* @__PURE__ */ combobox.view((props: ViewSlot, field) => (
  <ComboboxRootView slot={props} root={field.root} value={field.value()} />
));

const control = /* @__PURE__ */ combobox.control(
  (props: FormComboboxControlProps, field) => (
    <Combobox {...props} {...comboboxItems(field.root)} {...listValues(field.values(props))} />
  ),
  { view: () => view({}) },
);

const input = /* @__PURE__ */ combobox.part("Input", (props: FormComboboxInputProps, field) => (
  <ComboboxInput {...props} onBlur={field.blurring(props.onBlur)} />
));

/** `formCombobox`: the module, its typed Root, its Control, Input and View. */
export type FormCombobox = ComboboxModule<unknown, false> & {
  /** The combobox's root, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormComboboxControlProps) => JSX.Element;
  /** The text box; it reports blur. */
  Input: (props: FormComboboxInputProps) => JSX.Element;
  /** The chosen item's label, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A combobox bound to a field that holds one of its items' values:
 *
 *     <formCombobox.Root form={form} name="fruit" items={FRUITS}>
 *       <formCombobox.Label>Fruit</formCombobox.Label>
 *       <formCombobox.Control>
 *         <formCombobox.Input placeholder="Pick a fruit" />
 *         <ComboboxContent />
 *       </formCombobox.Control>
 *       <formCombobox.Error />
 *     </formCombobox.Root>
 */
export const formCombobox: FormCombobox = {
  ...combobox,
  Control: control,
  Input: input,
  Root: combobox.Root /* narrowed by the items' values, checked by ValueCheck */ as FormComboboxRoot,
  View: view,
};

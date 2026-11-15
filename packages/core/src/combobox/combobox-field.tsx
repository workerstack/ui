import type { JSX } from "@solidjs/web";
import type { DeepKeys } from "@tanstack/solid-form";

import {
  comboboxBindings,
  comboboxView,
  defineComboboxModule,
  type ComboboxControlProps,
  type ComboboxRoot,
  type ComboboxModule,
  type ComboboxRootProps,
} from "../form/field-kit/combobox-root.tsx";
import { Combobox, ComboboxInput, type ComboboxInputProps } from "./index.ts";

// A combobox bound to a field that holds one of its items' values, or null. The Root takes the
// items (and the props typed by their values), so it checks the field against them and the View
// reads their labels; the Control is the combobox's root, composed with this module's Input (it
// reports blur) and the plain ComboboxContent.

const combobox = /* @__PURE__ */ defineComboboxModule<unknown, false>(null, "ComboboxField");

/** What `comboboxField.Root` takes: the field, by `form` and `name`, and the items it holds one of. */
export type ComboboxFieldRootProps<TFormData, TName extends DeepKeys<TFormData>, TItems> = ComboboxRootProps<
  TFormData,
  TName,
  TItems,
  false
>;

/** `comboboxField.Root`: a Field bound to a field that holds one of `items`' values. */
export type ComboboxFieldRoot = ComboboxRoot<false>;

/** What `comboboxField.Control` takes: Combobox's props, without what the field and the Root decide. */
export type ComboboxFieldControlProps = ComboboxControlProps<false>;

/** What `comboboxField.Input` takes: ComboboxInput's props, its `onBlur` a plain handler. */
export type ComboboxFieldInputProps = Omit<ComboboxInputProps, "onBlur"> & {
  /** Runs when the input loses focus, after the field is blurred. */
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
};

const view = /* @__PURE__ */ comboboxView(combobox);

const control = /* @__PURE__ */ combobox.control(
  (props: ComboboxFieldControlProps, field) => (
    <Combobox {...props} {...comboboxBindings(field.root, field.values(props))} />
  ),
  { view: () => view({}) },
);

const input = /* @__PURE__ */ combobox.part("Input", (props: ComboboxFieldInputProps, field) => (
  <ComboboxInput {...props} onBlur={field.blurring(props.onBlur)} />
));

/** `comboboxField`: the module, its typed Root, its Control, Input and View. */
export type ComboboxField = ComboboxModule<unknown, false> & {
  /** The combobox's root, bound to the Root's field; read-only it renders the View. */
  Control: (props: ComboboxFieldControlProps) => JSX.Element;
  /** The text box; it reports blur. */
  Input: (props: ComboboxFieldInputProps) => JSX.Element;
};

/**
 * A combobox bound to a field that holds one of its items' values:
 *
 *     <comboboxField.Root form={form} name="fruit" items={FRUITS}>
 *       <comboboxField.Label>Fruit</comboboxField.Label>
 *       <comboboxField.Control>
 *         <comboboxField.Input placeholder="Pick a fruit" />
 *         <ComboboxContent />
 *       </comboboxField.Control>
 *       <comboboxField.Error />
 *     </comboboxField.Root>
 */
export const comboboxField: ComboboxField = {
  ...combobox,
  Control: control,
  Input: input,
  Root: combobox.Root /* narrowed by the items' values, checked by ValueCheck */ as ComboboxFieldRoot,
  View: view,
};

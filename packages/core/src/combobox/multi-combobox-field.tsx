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
import { Combobox, ComboboxChipsInput, type ComboboxChipsInputProps } from "./index.ts";

// A multiple combobox bound to a field that holds a list of its items' values, shown as chips. The
// Root takes the items (and the props typed by their values), so it checks the field against them
// and the View reads their labels; the Control is the combobox's root, composed with ComboboxChips,
// this module's ChipsInput (it reports blur) and the plain ComboboxContent.

// It writes a new list on each pick.
const multiple = /* @__PURE__ */ defineComboboxModule<unknown[], true>([], "MultiComboboxField");

/** What `multiComboboxField.Root` takes: the field, by `form` and `name`, and the items it holds several of. */
export type MultiComboboxFieldRootProps<TFormData, TName extends DeepKeys<TFormData>, TItems> = ComboboxRootProps<
  TFormData,
  TName,
  TItems,
  true
>;

/** `multiComboboxField.Root`: a Field bound to a field that holds a list of `items`' values. */
export type MultiComboboxFieldRoot = ComboboxRoot<true>;

/** What `multiComboboxField.Control` takes: Combobox's props, without what the field and the Root decide. */
export type MultiComboboxFieldControlProps = ComboboxControlProps<true>;

/** What `multiComboboxField.ChipsInput` takes: ComboboxChipsInput's props, its `onBlur` a plain handler. */
export type MultiComboboxFieldChipsInputProps = Omit<ComboboxChipsInputProps, "onBlur"> & {
  /** Runs when the input loses focus, after the field is blurred. */
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
};

const view = /* @__PURE__ */ comboboxView(multiple);

const control = /* @__PURE__ */ multiple.control(
  (props: MultiComboboxFieldControlProps, field) => (
    <Combobox {...props} multiple {...comboboxBindings(field.root, field.values(props))} />
  ),
  { view: () => view({}) },
);

const chipsInput = /* @__PURE__ */ multiple.part("ChipsInput", (props: MultiComboboxFieldChipsInputProps, field) => (
  <ComboboxChipsInput {...props} onBlur={field.blurring(props.onBlur)} />
));

/** `multiComboboxField`: the module, its typed Root, its Control, ChipsInput and View. */
export type MultiComboboxField = ComboboxModule<unknown[], true> & {
  /** The combobox's root, bound to the Root's field; read-only it renders the View. */
  Control: (props: MultiComboboxFieldControlProps) => JSX.Element;
  /** The input after the chips; it reports blur. */
  ChipsInput: (props: MultiComboboxFieldChipsInputProps) => JSX.Element;
};

/**
 * A multiple combobox bound to a field that holds a list of its items' values:
 *
 *     <multiComboboxField.Root form={form} name="tags" items={TAGS}>
 *       <multiComboboxField.Label>Tags</multiComboboxField.Label>
 *       <multiComboboxField.Control>
 *         <ComboboxChips>…<multiComboboxField.ChipsInput placeholder="Add a tag" /></ComboboxChips>
 *         <ComboboxContent />
 *       </multiComboboxField.Control>
 *       <multiComboboxField.Error />
 *     </multiComboboxField.Root>
 */
export const multiComboboxField: MultiComboboxField = {
  ...multiple,
  ChipsInput: chipsInput,
  Control: control,
  Root: multiple.Root /* narrowed by the items' values, checked by ValueCheck */ as MultiComboboxFieldRoot,
  View: view,
};

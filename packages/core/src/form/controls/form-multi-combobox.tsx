import type { JSX } from "@solidjs/web";
import type { DeepKeys } from "@tanstack/solid-form";

import { Combobox, ComboboxChipsInput, type ComboboxChipsInputProps } from "../../combobox/index.ts";
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

// A multiple combobox bound to a field that holds a list of its items' values, shown as chips. The
// Root takes the items (and the props typed by their values), so it checks the field against them
// and the View reads their labels; the Control is the combobox's root, composed with ComboboxChips,
// this module's ChipsInput (it reports blur) and the plain ComboboxContent.

// It writes a new list on each pick.
const multiple = /* @__PURE__ */ defineComboboxModule<unknown[], true>([], "FormMultiCombobox");

/** What `formMultiCombobox.Root` takes: the field, by `form` and `name`, and the items it holds several of. */
export type FormMultiComboboxRootProps<TFormData, TName extends DeepKeys<TFormData>, TItems> = ComboboxRootProps<
  TFormData,
  TName,
  TItems,
  true
>;

/** `formMultiCombobox.Root`: a Field bound to a field that holds a list of `items`' values. */
export type FormMultiComboboxRoot = ComboboxRoot<true>;

/** What `formMultiCombobox.Control` takes: Combobox's props, without what the field and the Root decide. */
export type FormMultiComboboxControlProps = ComboboxControlProps<true>;

/** What `formMultiCombobox.ChipsInput` takes: ComboboxChipsInput's props, its `onBlur` a plain handler. */
export type FormMultiComboboxChipsInputProps = Omit<ComboboxChipsInputProps, "onBlur"> & {
  /** Runs when the input loses focus, after the field is blurred. */
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
};

const view = /* @__PURE__ */ multiple.view((props: ViewSlot, field) => (
  <ComboboxRootView slot={props} root={field.root} value={field.value()} />
));

const control = /* @__PURE__ */ multiple.control(
  (props: FormMultiComboboxControlProps, field) => (
    <Combobox {...props} multiple {...comboboxItems(field.root)} {...listValues(field.values(props))} />
  ),
  { view: () => view({}) },
);

const chipsInput = /* @__PURE__ */ multiple.part("ChipsInput", (props: FormMultiComboboxChipsInputProps, field) => (
  <ComboboxChipsInput {...props} onBlur={field.blurring(props.onBlur)} />
));

/** `formMultiCombobox`: the module, its typed Root, its Control, ChipsInput and View. */
export type FormMultiCombobox = ComboboxModule<unknown[], true> & {
  /** The combobox's root, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormMultiComboboxControlProps) => JSX.Element;
  /** The input after the chips; it reports blur. */
  ChipsInput: (props: FormMultiComboboxChipsInputProps) => JSX.Element;
  /** The chosen items' labels, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A multiple combobox bound to a field that holds a list of its items' values:
 *
 *     <formMultiCombobox.Root form={form} name="tags" items={TAGS}>
 *       <formMultiCombobox.Label>Tags</formMultiCombobox.Label>
 *       <formMultiCombobox.Control>
 *         <ComboboxChips>…<formMultiCombobox.ChipsInput placeholder="Add a tag" /></ComboboxChips>
 *         <ComboboxContent />
 *       </formMultiCombobox.Control>
 *       <formMultiCombobox.Error />
 *     </formMultiCombobox.Root>
 */
export const formMultiCombobox: FormMultiCombobox = {
  ...multiple,
  ChipsInput: chipsInput,
  Control: control,
  Root: multiple.Root /* narrowed by the items' values, checked by ValueCheck */ as FormMultiComboboxRoot,
  View: view,
};

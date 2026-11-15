import type { JSX } from "@solidjs/web";

import { Checkbox, CheckboxView, type CheckboxProps } from "../../checkbox/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { ViewSlot } from "./view-slot.ts";

// A single checkbox bound to a boolean field. Its Root lays the box and its label on one row, the
// box first; a description and an error sit under the label.

const checkbox = /* @__PURE__ */ defineFieldModule<boolean>({ empty: false, inline: true, name: "FormCheckbox" });

/** What `formCheckbox.Control` takes: Checkbox's props, without what the field decides. */
export type FormCheckboxControlProps = Omit<
  CheckboxProps,
  "checked" | "class" | "defaultChecked" | "id" | "name" | "onBlur" | "onCheckedChange"
> &
  ViewSlot & {
    /** Runs when the control loses focus, after the field is blurred. */
    onBlur?: JSX.FocusEventHandler<HTMLButtonElement, FocusEvent>;
  };

const view = /* @__PURE__ */ checkbox.view((props: ViewSlot, field) => (
  <CheckboxView class={props.class} id={props.id} value={field.value()} />
));

const control = /* @__PURE__ */ checkbox.control(
  (props: FormCheckboxControlProps, field) => (
    <Checkbox
      {...props}
      checked={field.value()}
      onCheckedChange={(checked) => field.change(checked === true)}
      onBlur={field.blurring(props.onBlur)}
    />
  ),
  { view },
);

/** `formCheckbox`: the module, its Control and its View. */
export type FormCheckbox = FieldModule<boolean> & {
  /** The checkbox, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormCheckboxControlProps) => JSX.Element;
  /** "Yes" or "No", read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A single checkbox bound to a boolean field, its label beside it:
 *
 *     <formCheckbox.Root form={form} name="terms">
 *       <formCheckbox.Control />
 *       <formCheckbox.Label>I accept the terms</formCheckbox.Label>
 *       <formCheckbox.Error />
 *     </formCheckbox.Root>
 */
export const formCheckbox: FormCheckbox = { ...checkbox, Control: control, View: view };

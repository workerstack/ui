import type { JSX } from "@solidjs/web";

import { Checkbox, CheckboxView, type CheckboxProps } from "../../../checkbox/index.ts";
import type { ViewSlot } from "../field-kit/view-slot.ts";
import { defineFieldModule } from "../form/define-field-module.tsx";
import type { FieldModule } from "../form/field-module-shape.ts";
import { withParts } from "../form/with-parts.ts";

// A single checkbox bound to a boolean field. Its Root lays the box and its label on one row, the
// box first; a description and an error sit under the label.

const checkbox = /* @__PURE__ */ defineFieldModule<boolean>({ empty: false, inline: true, name: "CheckboxField" });

/** What `checkboxField.Control` takes: Checkbox's props, without what the field decides. */
export type CheckboxFieldControlProps = Omit<
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
  (props: CheckboxFieldControlProps, field) => (
    <Checkbox
      {...props}
      checked={field.value()}
      onCheckedChange={(checked) => field.change(checked === true)}
      onBlur={field.blurring(props.onBlur)}
    />
  ),
  { view },
);

/** `checkboxField`: the module, its Control and its View. */
export type CheckboxField = FieldModule<boolean> & {
  /** The checkbox, bound to the Root's field; read-only it renders the View. */
  Control: (props: CheckboxFieldControlProps) => JSX.Element;
  /** "Yes" or "No", read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A single checkbox bound to a boolean field, its label beside it:
 *
 *     <checkboxField.Root form={form} name="terms">
 *       <checkboxField.Control />
 *       <checkboxField.Label>I accept the terms</checkboxField.Label>
 *       <checkboxField.Error />
 *     </checkboxField.Root>
 */
export const checkboxField: CheckboxField = /* @__PURE__ */ withParts(checkbox, { Control: control, View: view });

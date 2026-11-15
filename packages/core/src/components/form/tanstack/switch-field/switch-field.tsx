import type { JSX } from "@solidjs/web";

import { Switch, SwitchView, type SwitchProps } from "../../../switch/index.ts";
import type { ViewSlot } from "../field-kit/view-slot.ts";
import { defineFieldModule } from "../form/define-field-module.tsx";
import type { FieldModule } from "../form/field-module-shape.ts";
import { withParts } from "../form/with-parts.ts";

// A switch bound to a boolean field. Its Root lays the switch and its label on one row, the
// switch first; a description and an error sit under the label.

const toggle = /* @__PURE__ */ defineFieldModule<boolean>({ empty: false, inline: true, name: "SwitchField" });

/** What `switchField.Control` takes: Switch's props, without what the field decides. */
export type SwitchFieldControlProps = Omit<
  SwitchProps,
  "checked" | "class" | "defaultChecked" | "id" | "name" | "onBlur" | "onCheckedChange"
> &
  ViewSlot & {
    /** Runs when the control loses focus, after the field is blurred. */
    onBlur?: JSX.FocusEventHandler<HTMLButtonElement, FocusEvent>;
  };

const view = /* @__PURE__ */ toggle.view((props: ViewSlot, field) => (
  <SwitchView class={props.class} id={props.id} value={field.value()} />
));

const control = /* @__PURE__ */ toggle.control(
  (props: SwitchFieldControlProps, field) => (
    <Switch {...props} checked={field.value()} onCheckedChange={field.change} onBlur={field.blurring(props.onBlur)} />
  ),
  { view },
);

/** `switchField`: the module, its Control and its View. */
export type SwitchField = FieldModule<boolean> & {
  /** The switch, bound to the Root's field; read-only it renders the View. */
  Control: (props: SwitchFieldControlProps) => JSX.Element;
  /** "Yes" or "No", read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A switch bound to a boolean field, its label beside it:
 *
 *     <switchField.Root form={form} name="alerts">
 *       <switchField.Control />
 *       <switchField.Label>Email me alerts</switchField.Label>
 *       <switchField.Error />
 *     </switchField.Root>
 */
export const switchField: SwitchField = /* @__PURE__ */ withParts(toggle, { Control: control, View: view });

import type { JSX } from "@solidjs/web";

import { Switch, SwitchView, type SwitchProps } from "../../switch/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { ViewSlot } from "./view-slot.ts";

// A switch bound to a boolean field. Its Root lays the switch and its label on one row, the
// switch first; a description and an error sit under the label.

const toggle = /* @__PURE__ */ defineFieldModule<boolean>({ empty: false, inline: true, name: "FormSwitch" });

/** What `formSwitch.Control` takes: Switch's props, without what the field decides. */
export type FormSwitchControlProps = Omit<
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
  (props: FormSwitchControlProps, field) => (
    <Switch {...props} checked={field.value()} onCheckedChange={field.change} onBlur={field.blurring(props.onBlur)} />
  ),
  { view },
);

/** `formSwitch`: the module, its Control and its View. */
export type FormSwitch = FieldModule<boolean> & {
  /** The switch, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormSwitchControlProps) => JSX.Element;
  /** "Yes" or "No", read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A switch bound to a boolean field, its label beside it:
 *
 *     <formSwitch.Root form={form} name="alerts">
 *       <formSwitch.Control />
 *       <formSwitch.Label>Email me alerts</formSwitch.Label>
 *       <formSwitch.Error />
 *     </formSwitch.Root>
 */
export const formSwitch: FormSwitch = { ...toggle, Control: control, View: view };

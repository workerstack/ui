import type { JSX } from "@solidjs/web";

import { defineFieldModule } from "../form/define-field-module.tsx";
import {
  GroupFieldset,
  groupView,
  type GroupControlProps,
  type GroupViewProps,
} from "../form/field-kit/group-fieldset.tsx";
import type { FieldModule } from "../form/field-module-shape.ts";
import { CheckboxGroup, CheckboxGroupView, type CheckboxGroupProps } from "./index.ts";

// Checkboxes sharing a list of checked values. The Control is the group as its own fieldset, named
// by `legend` (the module's Legend), with a Checkbox and its label per option as children; it
// reports blur once focus leaves the whole group. Read-only, the View shows the checked labels.

const group = /* @__PURE__ */ defineFieldModule<string[]>({ empty: [], name: "CheckboxGroupField" });

/** What `checkboxGroupField.View` takes: the options' labels, the legend, a class and an id. */
export type CheckboxGroupFieldViewProps = GroupViewProps;

/** What `checkboxGroupField.Control` takes: CheckboxGroup's props, the legend and the options' labels. */
export type CheckboxGroupFieldControlProps = GroupControlProps<CheckboxGroupProps>;

const view = /* @__PURE__ */ group.view((props: CheckboxGroupFieldViewProps, field) => (
  <CheckboxGroupView {...groupView(props)} value={field.value()} />
));

const control = /* @__PURE__ */ group.control(
  (props: CheckboxGroupFieldControlProps, field) => (
    <GroupFieldset<CheckboxGroupProps> group={CheckboxGroup} control={props} bound={field.bindLeaving(props)} />
  ),
  { view },
);

/** `checkboxGroupField`: the module, its Control and its View. */
export type CheckboxGroupField = FieldModule<string[]> & {
  /** The group, bound to the Root's field; read-only it renders the View. */
  Control: (props: CheckboxGroupFieldControlProps) => JSX.Element;
  /** The checked options' labels, read-only. */
  View: (props: CheckboxGroupFieldViewProps) => JSX.Element;
};

/**
 * Checkboxes bound to a list of the checked values:
 *
 *     <checkboxGroupField.Root form={form} name="toppings">
 *       <checkboxGroupField.Control
 *         items={TOPPINGS}
 *         legend={<checkboxGroupField.Legend>Toppings</checkboxGroupField.Legend>}
 *       >
 *         <label><Checkbox value="ham" />Ham</label>
 *       </checkboxGroupField.Control>
 *       <checkboxGroupField.Error />
 *     </checkboxGroupField.Root>
 */
export const checkboxGroupField: CheckboxGroupField = { ...group, Control: control, View: view };

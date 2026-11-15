import type { JSX } from "@solidjs/web";

import { CheckboxGroup, CheckboxGroupView, type CheckboxGroupProps } from "../../checkbox/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import { GroupFieldset, groupView, type GroupControlProps, type GroupViewProps } from "./group-fieldset.tsx";

// Checkboxes sharing a list of checked values. The Control is the group as its own fieldset, named
// by `legend` (the module's Legend), with a Checkbox and its label per option as children; it
// reports blur once focus leaves the whole group. Read-only, the View shows the checked labels.

const group = /* @__PURE__ */ defineFieldModule<string[]>({ empty: [], name: "FormCheckboxGroup" });

/** What `formCheckboxGroup.View` takes: the options' labels, the legend, a class and an id. */
export type FormCheckboxGroupViewProps = GroupViewProps;

/** What `formCheckboxGroup.Control` takes: CheckboxGroup's props, the legend and the options' labels. */
export type FormCheckboxGroupControlProps = GroupControlProps<CheckboxGroupProps>;

const view = /* @__PURE__ */ group.view((props: FormCheckboxGroupViewProps, field) => (
  <CheckboxGroupView {...groupView(props)} value={field.value()} />
));

const control = /* @__PURE__ */ group.control(
  (props: FormCheckboxGroupControlProps, field) => (
    <GroupFieldset<CheckboxGroupProps> group={CheckboxGroup} control={props} bound={field.bindLeaving(props)} />
  ),
  { view },
);

/** `formCheckboxGroup`: the module, its Control and its View. */
export type FormCheckboxGroup = FieldModule<string[]> & {
  /** The group, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormCheckboxGroupControlProps) => JSX.Element;
  /** The checked options' labels, read-only. */
  View: (props: FormCheckboxGroupViewProps) => JSX.Element;
};

/**
 * Checkboxes bound to a list of the checked values:
 *
 *     <formCheckboxGroup.Root form={form} name="toppings">
 *       <formCheckboxGroup.Control
 *         items={TOPPINGS}
 *         legend={<formCheckboxGroup.Legend>Toppings</formCheckboxGroup.Legend>}
 *       >
 *         <label><Checkbox value="ham" />Ham</label>
 *       </formCheckboxGroup.Control>
 *       <formCheckboxGroup.Error />
 *     </formCheckboxGroup.Root>
 */
export const formCheckboxGroup: FormCheckboxGroup = { ...group, Control: control, View: view };

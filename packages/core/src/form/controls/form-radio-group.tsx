import type { JSX } from "@solidjs/web";

import { RadioGroup, RadioGroupView, type RadioGroupProps } from "../../radio-group/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import { GroupFieldset, groupView, type GroupControlProps, type GroupViewProps } from "./group-fieldset.tsx";

// One choice of several, bound to the chosen value (null before one is chosen). The Control is the
// group as its own fieldset, named by `legend` (the module's Legend), with a Radio per option as
// children; it reports blur once focus leaves the whole group. Read-only, the View shows the
// chosen option's label.

const group = /* @__PURE__ */ defineFieldModule<string, string | null>({ empty: null, name: "FormRadioGroup" });

/** What `formRadioGroup.View` takes: the options' labels, the legend, a class and an id. */
export type FormRadioGroupViewProps = GroupViewProps;

/** What `formRadioGroup.Control` takes: RadioGroup's props, the legend and the options' labels. */
export type FormRadioGroupControlProps = GroupControlProps<RadioGroupProps>;

const view = /* @__PURE__ */ group.view((props: FormRadioGroupViewProps, field) => (
  <RadioGroupView {...groupView(props)} value={field.value()} />
));

const control = /* @__PURE__ */ group.control(
  (props: FormRadioGroupControlProps, field) => (
    <GroupFieldset<RadioGroupProps> group={RadioGroup} control={props} bound={field.bindLeaving(props)} />
  ),
  { view },
);

/** `formRadioGroup`: the module, its Control and its View. */
export type FormRadioGroup = FieldModule<string, string | null> & {
  /** The group, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormRadioGroupControlProps) => JSX.Element;
  /** The chosen option's label, read-only. */
  View: (props: FormRadioGroupViewProps) => JSX.Element;
};

/**
 * Radios bound to the chosen value:
 *
 *     <formRadioGroup.Root form={form} name="plan">
 *       <formRadioGroup.Control items={PLANS} legend={<formRadioGroup.Legend>Plan</formRadioGroup.Legend>}>
 *         <Radio value="pro">Pro</Radio>
 *       </formRadioGroup.Control>
 *       <formRadioGroup.Error />
 *     </formRadioGroup.Root>
 */
export const formRadioGroup: FormRadioGroup = { ...group, Control: control, View: view };

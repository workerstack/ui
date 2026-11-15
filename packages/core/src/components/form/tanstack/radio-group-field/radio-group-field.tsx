import type { JSX } from "@solidjs/web";

import { RadioGroup, RadioGroupView, type RadioGroupProps } from "../../../radio-group/index.ts";
import { GroupFieldset, groupView, type GroupControlProps, type GroupViewProps } from "../field-kit/group-fieldset.tsx";
import { defineFieldModule } from "../form/define-field-module.tsx";
import type { FieldModule } from "../form/field-module-shape.ts";
import { withParts } from "../form/with-parts.ts";

// One choice of several, bound to the chosen value (null before one is chosen). The Control is the
// group as its own fieldset, named by `legend` (the module's Legend), with a Radio per option as
// children; it reports blur once focus leaves the whole group. Read-only, the View shows the
// chosen option's label.

const group = /* @__PURE__ */ defineFieldModule<string, string | null>({ empty: null, name: "RadioGroupField" });

/** What `radioGroupField.View` takes: the options' labels, the legend, a class and an id. */
export type RadioGroupFieldViewProps = GroupViewProps;

/** What `radioGroupField.Control` takes: RadioGroup's props, the legend and the options' labels. */
export type RadioGroupFieldControlProps = GroupControlProps<RadioGroupProps>;

const view = /* @__PURE__ */ group.view((props: RadioGroupFieldViewProps, field) => (
  <RadioGroupView {...groupView(props)} value={field.value()} />
));

const control = /* @__PURE__ */ group.control(
  (props: RadioGroupFieldControlProps, field) => (
    <GroupFieldset<RadioGroupProps> group={RadioGroup} control={props} bound={field.bindLeaving(props)} />
  ),
  { view },
);

/** `radioGroupField`: the module, its Control and its View. */
export type RadioGroupField = FieldModule<string, string | null> & {
  /** The group, bound to the Root's field; read-only it renders the View. */
  Control: (props: RadioGroupFieldControlProps) => JSX.Element;
  /** The chosen option's label, read-only. */
  View: (props: RadioGroupFieldViewProps) => JSX.Element;
};

/**
 * Radios bound to the chosen value:
 *
 *     <radioGroupField.Root form={form} name="plan">
 *       <radioGroupField.Control items={PLANS} legend={<radioGroupField.Legend>Plan</radioGroupField.Legend>}>
 *         <Radio value="pro">Pro</Radio>
 *       </radioGroupField.Control>
 *       <radioGroupField.Error />
 *     </radioGroupField.Root>
 */
export const radioGroupField: RadioGroupField = /* @__PURE__ */ withParts(group, { Control: control, View: view });

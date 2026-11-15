import type { JSX } from "@solidjs/web";
import { FieldSet } from "@ui-sdk/solid/field";
import { merge, omit } from "solid-js";

import type { ChoiceViewProps } from "../../view/index.ts";
import { presentProps } from "./present-props.ts";
import type { ViewSlot } from "./view-slot.ts";

// What the group fields (checkbox group, radio group) share: the group is its own fieldset, named
// by a legend, and its View sits in a fieldset under the same legend.

/** A group control's own props its View reads: the legend that names it. */
export type GroupLegend = {
  /** The module's `Legend`: it names the group. */
  legend?: JSX.Element;
};

/** What a group field's View takes: the options' labels, the legend, a class and an id. */
export type GroupViewProps = GroupLegend &
  ViewSlot & {
    /** The options, for their labels. */
    items?: NonNullable<ChoiceViewProps<string>["items"]>;
  };

/** The group's props a field's Control sets itself, or takes in its own shape. */
type GroupBound = "children" | "class" | "defaultValue" | "id" | "name" | "onFocusOut" | "onValueChange" | "value";

/** What a group field's Control takes: the group's props, the legend and the options' labels. */
export type GroupControlProps<TGroupProps> = Omit<TGroupProps, GroupBound> &
  GroupViewProps & {
    /** The options: a control and its label each. */
    children?: JSX.Element;
    /** Runs when focus leaves the whole group, after the field is blurred. */
    onFocusOut?: JSX.FocusEventHandler<HTMLDivElement, FocusEvent>;
  };

/**
 * The View's legend, options, class and id, each read when the View reads it. Only those given
 * pass on: the view puts itself in a fieldset by the legend's presence.
 */
export function groupView(props: GroupViewProps): GroupViewProps {
  return presentProps(props, ["class", "id", "items", "legend"]);
}

/** What `GroupFieldset` takes: the group, the Control's props and the field's bindings. */
type GroupFieldsetProps<TGroupProps> = {
  /** The field's bindings for the group: its value, read-only and focusout handler. */
  bound: object;
  /** The Control's props: the legend, the options and the group's own. */
  control: NoInfer<GroupControlProps<TGroupProps>>;
  /** The group component the fieldset renders as. */
  group: (props: TGroupProps) => JSX.Element;
};

/** A group control as its own fieldset, named by the legend: the legend first, then the options. */
export function GroupFieldset<TGroupProps extends object>(props: GroupFieldsetProps<TGroupProps>): JSX.Element {
  return (
    <FieldSet
      render={(fieldset) => (
        <props.group
          {...(merge(
            fieldset,
            omit(props.control, "children", "items", "legend"),
            props.bound,
          ) /* the group's own props minus what the field binds, which `bound` adds back */ as TGroupProps)}
        />
      )}
    >
      {props.control.legend}
      {props.control.children}
    </FieldSet>
  );
}

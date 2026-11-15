import type { JSX } from "@solidjs/web";
import { Field as FieldPart, FieldDescription as FieldDescriptionPart } from "@ui-sdk/solid/field";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../../utils/cn/index.ts";
import { createFieldRequired, FIELD_REQUIRED_CONTEXT } from "./field-marks.tsx";

/** How a Field lays out its label and control; `responsive` is vertical until the `md` width. */
export type FieldOrientation = "vertical" | "horizontal" | "responsive";

/** UI SDK's field props (`name`, `invalid`, `disabled`, validation), plus `orientation`. */
export type FieldProps = ComponentProps<typeof FieldPart> & {
  /** How the label and control sit; the label column is `10rem`. @default "vertical" */
  orientation?: FieldOrientation;
  /** Marks the label as required in a form that marks fields, whatever the control says. */
  required?: boolean;
  /** A read-only field shows no mark. */
  readOnly?: boolean;
};

// Orientation is an attribute, so the layout follows it without rebuilding the class. A horizontal
// field puts the label (and its group) in a left column and everything else under the control.
const ORIENTATION = [
  "data-[orientation=horizontal]:grid data-[orientation=horizontal]:grid-cols-[10rem_minmax(0,1fr)]",
  "data-[orientation=horizontal]:items-center data-[orientation=horizontal]:gap-x-3",
  "data-[orientation=horizontal]:[&>:not([data-slot=field-label],[data-slot=field-label-group])]:col-start-2",
  "data-[orientation=responsive]:md:grid data-[orientation=responsive]:md:grid-cols-[10rem_minmax(0,1fr)]",
  "data-[orientation=responsive]:md:items-center data-[orientation=responsive]:md:gap-x-3",
  "data-[orientation=responsive]:md:[&>:not([data-slot=field-label],[data-slot=field-label-group])]:col-start-2",
];

/** Connects a control (Input, Select, …) to its label, description and errors. */
export function Field(props: FieldProps): JSX.Element {
  const rest = omit(props, "class", "orientation", "required", "readOnly");
  const required = createFieldRequired({ readOnly: () => props.readOnly, required: () => props.required });

  return (
    <FIELD_REQUIRED_CONTEXT value={required}>
      <FieldPart
        {...rest}
        data-orientation={props.orientation ?? "vertical"}
        class={cnState(["group/field flex min-w-0 flex-col gap-2", ...ORIENTATION], props.class)}
      />
    </FIELD_REQUIRED_CONTEXT>
  );
}

/** UI SDK's field description props. */
export type FieldDescriptionProps = ComponentProps<typeof FieldDescriptionPart>;

/**
 * Muted help text that describes the field's control. While the field's error is in the page it
 * collapses (height, the gap, opacity) in the same frames the error opens, so what follows stays
 * put, and it leaves the accessibility tree; it comes back as the error goes.
 */
export function FieldDescription(props: FieldDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <FieldDescriptionPart
      {...rest}
      class={cnState(
        [
          "overflow-hidden text-sm leading-normal text-muted-foreground transition-[height,margin,opacity,visibility]",
          "duration-150 ease-out [interpolate-size:allow-keywords] motion-reduce:transition-none",
          "group-has-[[data-slot=field-error]]/field:invisible",
          "group-has-[[data-slot=field-error]]/field:-mt-2",
          "group-has-[[data-slot=field-error]]/field:h-0",
          "group-has-[[data-slot=field-error]]/field:opacity-0",
        ],
        props.class,
      )}
    />
  );
}

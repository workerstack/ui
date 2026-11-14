import type { JSX } from "@solidjs/web";
import {
  Field as FieldPart,
  FieldDescription as FieldDescriptionPart,
  FieldError as FieldErrorPart,
  FieldLabel as FieldLabelPart,
} from "@ui-sdk/solid/field";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";

/** UI SDK's field props: `name`, `invalid`, `disabled` and validation. */
export type FieldProps = ComponentProps<typeof FieldPart>;

/** Connects a control (Input, Select, …) to its label, description and errors. */
export function Field(props: FieldProps): JSX.Element {
  const rest = omit(props, "class");

  return <FieldPart {...rest} class={cnState("flex flex-col gap-2", props.class)} />;
}

/** UI SDK's field label props. */
export type FieldLabelProps = ComponentProps<typeof FieldLabelPart>;

/** Names the field's control; turns red while the field is invalid. */
export function FieldLabel(props: FieldLabelProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <FieldLabelPart
      {...rest}
      class={cnState(
        [
          "flex select-none items-center gap-2 text-sm font-medium leading-none data-disabled:cursor-not-allowed",
          "data-disabled:opacity-50 data-invalid:text-destructive",
        ],
        props.class,
      )}
    />
  );
}

/** UI SDK's field description props. */
export type FieldDescriptionProps = ComponentProps<typeof FieldDescriptionPart>;

/** Muted help text that describes the field's control. */
export function FieldDescription(props: FieldDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return <FieldDescriptionPart {...rest} class={cnState("text-sm text-muted-foreground", props.class)} />;
}

/** UI SDK's field error props: `match` picks the validity problem. */
export type FieldErrorProps = ComponentProps<typeof FieldErrorPart>;

/** Shows when the control is invalid. `match` picks which validity problem it is for. */
export function FieldError(props: FieldErrorProps): JSX.Element {
  const rest = omit(props, "class");

  return <FieldErrorPart {...rest} class={cnState("text-sm text-destructive", props.class)} />;
}

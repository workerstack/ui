import type { JSX } from "@solidjs/web";
import { FieldLabel as FieldLabelPart } from "@ui-sdk/solid/field";
import { omit, type ComponentProps } from "solid-js";

import { cn, cnState } from "../../utils/cn/index.ts";
import { useMarkAttributes } from "./field-marks.tsx";

/** UI SDK's field label props, without `render`: the label's own element carries the mark. */
export type FieldLabelProps = Omit<ComponentProps<typeof FieldLabelPart>, "render">;

/**
 * Names the field's control; turns red while the field is invalid. In a form that marks fields it
 * carries `data-mark` and `data-mark-text`, which the theme draws after the text.
 */
export function FieldLabel(props: FieldLabelProps): JSX.Element {
  const rest = omit(props, "class");
  const marks = useMarkAttributes();

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
      render={(labelProps, state) => <label {...labelProps} {...marks(state)} />}
    />
  );
}

/** What `FieldLabelGroup` takes: a div's props. */
export type FieldLabelGroupProps = JSX.HTMLAttributes<HTMLDivElement>;

/** A label with a trailing slot (a hint, a link) on one row. */
export function FieldLabelGroup(props: FieldLabelGroupProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <div
      {...rest}
      data-slot="field-label-group"
      class={cn("flex w-full items-end justify-between gap-2", props.class)}
    />
  );
}

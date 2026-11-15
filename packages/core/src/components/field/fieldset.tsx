import type { JSX } from "@solidjs/web";
import {
  FieldDescription as FieldDescriptionPart,
  FieldGroup as FieldGroupPart,
  FieldLegend as FieldLegendPart,
  FieldSet as FieldSetPart,
} from "@ui-sdk/solid/field";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../../utils/cn/index.ts";
import { useMarkAttributes } from "./field-marks.tsx";

/** UI SDK's field set props, without `render`: `disabled` reaches every control inside. */
export type FieldsetProps = Omit<ComponentProps<typeof FieldSetPart>, "render">;

/**
 * A group of fields under one legend: `disabled` reaches every control inside, and a
 * FieldsetDescription describes the group.
 *
 *     <Fieldset>
 *       <FieldsetLegend>Shipping address</FieldsetLegend>
 *       <FieldsetDescription>Where we send the order.</FieldsetDescription>
 *       <Field name="street">…</Field>
 *     </Fieldset>
 */
export function Fieldset(props: FieldsetProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <FieldSetPart
      {...rest}
      render={(setProps) => <fieldset {...setProps} data-slot="fieldset" />}
      class={cnState("m-0 flex min-w-0 flex-col gap-4 border-0 p-0 data-disabled:opacity-50", props.class)}
    />
  );
}

/** UI SDK's field legend props, plus `variant` and `required`. */
export type FieldsetLegendProps = Omit<ComponentProps<typeof FieldLegendPart>, "render"> & {
  /** `legend` titles a section; `label` sizes it as a field label (a group of checkboxes). */
  variant?: "legend" | "label";
  /** Marks a group that is no single field (a list) as required or optional in a form. */
  required?: boolean;
};

/** Names the group. Keep it the Fieldset's first child. */
export function FieldsetLegend(props: FieldsetLegendProps): JSX.Element {
  const rest = omit(props, "class", "variant", "required");
  const marks = useMarkAttributes(() => props.required);

  return (
    <FieldLegendPart
      {...rest}
      {...marks()}
      render={(legendProps) => <legend {...legendProps} data-slot="fieldset-legend" />}
      data-variant={props.variant ?? "legend"}
      class={cnState(
        [
          "font-medium text-foreground data-[variant=label]:text-sm",
          "data-[variant=legend]:mb-1 data-[variant=legend]:text-base",
        ],
        props.class,
      )}
    />
  );
}

/** UI SDK's field description props. */
export type FieldsetDescriptionProps = Omit<ComponentProps<typeof FieldDescriptionPart>, "render">;

/** Describes its Fieldset, so screen readers say it as focus enters the group. Place it after the legend. */
export function FieldsetDescription(props: FieldsetDescriptionProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <FieldDescriptionPart
      {...rest}
      render={(descriptionProps) => <p {...descriptionProps} data-slot="fieldset-description" />}
      class={cnState("text-sm leading-normal text-muted-foreground", props.class)}
    />
  );
}

/** UI SDK's field group props. */
export type FieldGroupProps = ComponentProps<typeof FieldGroupPart>;

/** Lays fields out in a column. It names and disables nothing: a Fieldset does. */
export function FieldGroup(props: FieldGroupProps): JSX.Element {
  const rest = omit(props, "class");

  return <FieldGroupPart {...rest} class={cnState("flex w-full min-w-0 flex-col gap-4", props.class)} />;
}

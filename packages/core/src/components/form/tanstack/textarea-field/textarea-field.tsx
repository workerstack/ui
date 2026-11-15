import type { JSX } from "@solidjs/web";

import { Textarea, TextareaView, type TextareaProps } from "../../../textarea/index.ts";
import type { ViewSlot } from "../field-kit/view-slot.ts";
import { defineFieldModule } from "../form/define-field-module.tsx";
import type { FieldModule } from "../form/field-module-shape.ts";
import { withParts } from "../form/with-parts.ts";

// A textarea bound to a string field. Textarea cleans the text as the person leaves it (blank
// lines around it trimmed, invisible characters gone), so the field keeps what the box shows.

const textarea = /* @__PURE__ */ defineFieldModule<string>({ empty: "", name: "TextareaField" });

/** What `textareaField.Control` takes: Textarea's props, without what the field decides. */
export type TextareaFieldControlProps = Omit<
  TextareaProps,
  "class" | "defaultValue" | "id" | "name" | "onValueChange" | "readonly" | "value"
> &
  ViewSlot;

const view = /* @__PURE__ */ textarea.view((props: ViewSlot, field) => (
  <TextareaView class={props.class} id={props.id} value={field.value()} />
));

const control = /* @__PURE__ */ textarea.control(
  (props: TextareaFieldControlProps, field) => {
    const bound = field.bind(props);

    return (
      <Textarea
        {...props}
        value={bound.value}
        onValueChange={bound.onValueChange}
        onBlur={bound.onBlur}
        readonly={bound.readOnly}
      />
    );
  },
  { view },
);

/** `textareaField`: the module, its Control and its View. */
export type TextareaField = FieldModule<string> & {
  /** The textarea, bound to the Root's field; read-only it renders the View. */
  Control: (props: TextareaFieldControlProps) => JSX.Element;
  /** The field's text with its line breaks, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A textarea bound to a string field:
 *
 *     <textareaField.Root form={form} name="bio">
 *       <textareaField.Label>Bio</textareaField.Label>
 *       <textareaField.Control />
 *       <textareaField.Error />
 *     </textareaField.Root>
 */
export const textareaField: TextareaField = /* @__PURE__ */ withParts(textarea, { Control: control, View: view });

import type { JSX } from "@solidjs/web";

import { Textarea, TextareaView, type TextareaProps } from "../../textarea/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { ViewSlot } from "./view-slot.ts";

// A textarea bound to a string field. Textarea cleans the text as the person leaves it (blank
// lines around it trimmed, invisible characters gone), so the field keeps what the box shows.

const textarea = /* @__PURE__ */ defineFieldModule<string>({ empty: "", name: "FormTextarea" });

/** What `formTextarea.Control` takes: Textarea's props, without what the field decides. */
export type FormTextareaControlProps = Omit<
  TextareaProps,
  "class" | "defaultValue" | "id" | "name" | "onValueChange" | "readonly" | "value"
> &
  ViewSlot;

const view = /* @__PURE__ */ textarea.view((props: ViewSlot, field) => (
  <TextareaView class={props.class} id={props.id} value={field.value()} />
));

const control = /* @__PURE__ */ textarea.control(
  (props: FormTextareaControlProps, field) => {
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

/** `formTextarea`: the module, its Control and its View. */
export type FormTextarea = FieldModule<string> & {
  /** The textarea, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormTextareaControlProps) => JSX.Element;
  /** The field's text with its line breaks, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A textarea bound to a string field:
 *
 *     <formTextarea.Root form={form} name="bio">
 *       <formTextarea.Label>Bio</formTextarea.Label>
 *       <formTextarea.Control />
 *       <formTextarea.Error />
 *     </formTextarea.Root>
 */
export const formTextarea: FormTextarea = { ...textarea, Control: control, View: view };

import type { JSX } from "@solidjs/web";

import { defineFieldModule } from "../form/define-field-module.tsx";
import type { ViewSlot } from "../form/field-kit/view-slot.ts";
import type { FieldModule } from "../form/field-module-shape.ts";
import { TextInput, TextInputView, type TextInputProps } from "./index.ts";

// A line of plain text bound to a string field. TextInput cleans the line as the person leaves it
// (ends trimmed, invisible characters gone), so the field keeps what the box shows; inside an
// InputGroup use inputGroupField instead.

const textInput = /* @__PURE__ */ defineFieldModule<string>({ empty: "", name: "TextInputField" });

/** What `textInputField.Control` takes: TextInput's props, without what the field decides. */
export type TextInputFieldControlProps = Omit<
  TextInputProps,
  "class" | "defaultValue" | "id" | "name" | "onValueChange" | "readonly" | "value"
> &
  ViewSlot;

const view = /* @__PURE__ */ textInput.view((props: ViewSlot, field) => (
  <TextInputView class={props.class} id={props.id} value={field.value()} />
));

const control = /* @__PURE__ */ textInput.control(
  (props: TextInputFieldControlProps, field) => {
    const bound = field.bind(props);

    return (
      <TextInput
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

/** `textInputField`: the module, its Control and its View. */
export type TextInputField = FieldModule<string> & {
  /** The text box, bound to the Root's field; read-only it renders the View. */
  Control: (props: TextInputFieldControlProps) => JSX.Element;
  /** The field's text, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A line of plain text bound to a string field:
 *
 *     <textInputField.Root form={form} name="name">
 *       <textInputField.Label>Name</textInputField.Label>
 *       <textInputField.Control />
 *       <textInputField.Error />
 *     </textInputField.Root>
 */
export const textInputField: TextInputField = { ...textInput, Control: control, View: view };

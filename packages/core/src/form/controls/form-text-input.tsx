import type { JSX } from "@solidjs/web";

import { TextInput, TextInputView, type TextInputProps } from "../../text-input/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { ViewSlot } from "./view-slot.ts";

// A line of plain text bound to a string field. TextInput cleans the line as the person leaves it
// (ends trimmed, invisible characters gone), so the field keeps what the box shows; inside an
// InputGroup use formInputGroup instead.

const textInput = /* @__PURE__ */ defineFieldModule<string>({ empty: "", name: "FormTextInput" });

/** What `formTextInput.Control` takes: TextInput's props, without what the field decides. */
export type FormTextInputControlProps = Omit<
  TextInputProps,
  "class" | "defaultValue" | "id" | "name" | "onValueChange" | "readonly" | "value"
> &
  ViewSlot;

const view = /* @__PURE__ */ textInput.view((props: ViewSlot, field) => (
  <TextInputView class={props.class} id={props.id} value={field.value()} />
));

const control = /* @__PURE__ */ textInput.control(
  (props: FormTextInputControlProps, field) => {
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

/** `formTextInput`: the module, its Control and its View. */
export type FormTextInput = FieldModule<string> & {
  /** The text box, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormTextInputControlProps) => JSX.Element;
  /** The field's text, read-only. */
  View: (props: ViewSlot) => JSX.Element;
};

/**
 * A line of plain text bound to a string field:
 *
 *     <formTextInput.Root form={form} name="name">
 *       <formTextInput.Label>Name</formTextInput.Label>
 *       <formTextInput.Control />
 *       <formTextInput.Error />
 *     </formTextInput.Root>
 */
export const formTextInput: FormTextInput = { ...textInput, Control: control, View: view };

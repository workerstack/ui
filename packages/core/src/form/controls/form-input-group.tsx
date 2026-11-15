import type { JSX } from "@solidjs/web";

import {
  InputGroupInput,
  InputGroupTextarea,
  InputGroupTextareaView,
  InputGroupView,
  type InputProps,
} from "../../input/index.ts";
import { cleanLine } from "../../text-hygiene/index.ts";
import type { TextareaProps } from "../../textarea/index.ts";
import { defineFieldModule } from "../define-field-module.tsx";
import type { FieldModule } from "../field-module-shape.ts";
import type { ViewSlot } from "./view-slot.ts";

// The controls of an InputGroup bound to a string field: put Control (or TextareaControl) inside an
// InputGroup with its addons. Both clean the text as the person leaves the box (the input as a line,
// as TextInput does, unless given its own `clean`), so the field keeps what the box shows;
// read-only each renders its View in the group.

const group = /* @__PURE__ */ defineFieldModule<string>({ empty: "", name: "FormInputGroup" });

/** A box's props, without what the field decides. */
type Bound<TProps> = Omit<TProps, "class" | "defaultValue" | "id" | "name" | "onValueChange" | "readonly" | "value"> &
  ViewSlot;

/** What `formInputGroup.Control` takes: InputGroupInput's props, without what the field decides. */
export type FormInputGroupControlProps = Bound<InputProps>;

/** What `formInputGroup.TextareaControl` takes: InputGroupTextarea's props, without what the field decides. */
export type FormInputGroupTextareaControlProps = Bound<TextareaProps>;

const view = /* @__PURE__ */ group.view((props: ViewSlot, field) => (
  <InputGroupView class={props.class} id={props.id} text={field.value()} />
));

const textareaView = /* @__PURE__ */ group.part("TextareaView", (props: ViewSlot, field) => (
  <InputGroupTextareaView class={props.class} id={props.id} text={field.value()} />
));

const control = /* @__PURE__ */ group.control(
  (props: FormInputGroupControlProps, field) => {
    const bound = field.bind(props);

    return (
      <InputGroupInput
        clean={cleanLine}
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

const textareaControl = /* @__PURE__ */ group.control(
  (props: FormInputGroupTextareaControlProps, field) => {
    const bound = field.bind(props);

    return (
      <InputGroupTextarea
        {...props}
        value={bound.value}
        onValueChange={bound.onValueChange}
        onBlur={bound.onBlur}
        readonly={bound.readOnly}
      />
    );
  },
  { part: "TextareaControl", view: textareaView },
);

/** `formInputGroup`: the module, its two controls and their Views. */
export type FormInputGroup = FieldModule<string> & {
  /** The group's input, bound to the Root's field; read-only it renders the View. */
  Control: (props: FormInputGroupControlProps) => JSX.Element;
  /** The group's textarea, bound to the Root's field; read-only it renders the TextareaView. */
  TextareaControl: (props: FormInputGroupTextareaControlProps) => JSX.Element;
  /** The input's text, read-only, padded as the input is. */
  View: (props: ViewSlot) => JSX.Element;
  /** The textarea's text with its line breaks, read-only. */
  TextareaView: (props: ViewSlot) => JSX.Element;
};

/**
 * An InputGroup's input or textarea bound to a string field:
 *
 *     <formInputGroup.Root form={form} name="site">
 *       <formInputGroup.Label>Website</formInputGroup.Label>
 *       <InputGroup>
 *         <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
 *         <formInputGroup.Control />
 *       </InputGroup>
 *       <formInputGroup.Error />
 *     </formInputGroup.Root>
 */
export const formInputGroup: FormInputGroup = {
  ...group,
  Control: control,
  TextareaControl: textareaControl,
  TextareaView: textareaView,
  View: view,
};

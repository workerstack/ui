import type { JSX } from "@solidjs/web";

import { TextInput, TextInputView, type TextInputProps } from "../../text-input/index.ts";
import { defineFieldModule, type FieldModule } from "../index.ts";

// A test-only field module over TextInput, built as the control fields beside each control are:
// the control binds the field's value, change and blur; read-only it renders TextInputView.

const textModule = defineFieldModule<string>({ empty: "", name: "FormText" });

/** What the control takes: TextInput's props, without what the field decides. */
export type FormTextControlProps = Omit<TextInputProps, "value" | "defaultValue" | "onValueChange" | "readonly">;

const view = textModule.view((_props: FormTextControlProps, field) => <TextInputView value={field.value()} />);

const control = textModule.control((props: FormTextControlProps, field) => {
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
}, { view });

/** The module and its Control: `<formText.Root form={form} name="email">…<formText.Control /></formText.Root>`. */
export const formText: FieldModule<string> & { Control: (props: FormTextControlProps) => JSX.Element } = {
  ...textModule,
  Control: control,
};

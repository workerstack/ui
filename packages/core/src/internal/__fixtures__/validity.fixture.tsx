import { createRequiredText, type RequiredTextProps } from "../validity.ts";
import { UI_MESSAGES_EN } from "../../provider/index.ts";

/** A text box with the required and length rules wired, on a plain `<input>`. */
export function ValidityInput(props: RequiredTextProps & { defaultValue?: string; type?: string }) {
  const rules = createRequiredText(props, UI_MESSAGES_EN);

  return (
    <input
      aria-label="Box"
      defaultValue={props.defaultValue}
      onInput={rules.sync}
      ref={rules.ref}
      required={Boolean(props.required)}
      type={props.type}
    />
  );
}

/** The same rules on a `<textarea>`. */
export function ValidityTextarea(props: RequiredTextProps & { defaultValue?: string }) {
  const rules = createRequiredText(props, UI_MESSAGES_EN);

  return (
    <textarea
      aria-label="Notes"
      defaultValue={props.defaultValue}
      onInput={rules.sync}
      ref={rules.ref}
      required={Boolean(props.required)}
    />
  );
}

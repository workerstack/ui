import type { JSX } from "@solidjs/web";

import { cleanLine } from "../../utils/text-hygiene/index.ts";
import { Input, type InputProps } from "../input/index.ts";

/**
 * A line of plain text: a name, a title, a handle. Other kinds of text get their own control; `Input`
 * is the primitive they are made of.
 *
 * ```tsx
 * <Field name="name"><FieldLabel>Name</FieldLabel><TextInput /></Field>
 * ```
 */
export type TextInputProps = Omit<InputProps, "type">;

/** Leaving the box stores the line as it reads: ends trimmed, invisible characters gone. */
export function TextInput(props: TextInputProps): JSX.Element {
  return <Input clean={cleanLine} {...props} type="text" />;
}

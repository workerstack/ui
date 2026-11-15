import { createSignal } from "solid-js"
import { Input } from "../../input/index.ts"
import { Field, FieldDescription, FieldError, FieldLabel } from "../index.ts"

export function FieldFixture() {
  const [value, setValue] = createSignal("")
  return (
    <div>
      <Field name="email" invalid>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" onValueChange={setValue} />
        <FieldDescription>We never share it.</FieldDescription>
        <FieldError match>That email is taken.</FieldError>
      </Field>
      <output>{value()}</output>
    </div>
  )
}

export function BareFieldFixture() {
  return (
    <Field>
      <FieldLabel>Name</FieldLabel>
      <Input />
    </Field>
  )
}

import { createSignal } from "solid-js"
import { Input, InputClear, InputGroup } from "../index.ts"

export function InputGroupFixture() {
  const [value, setValue] = createSignal("solid")
  return (
    <div>
      <InputGroup>
        <Input aria-label="Search" defaultValue="solid" onValueChange={setValue} />
        <InputClear aria-label="Clear search" />
      </InputGroup>
      <output>{value()}</output>
    </div>
  )
}

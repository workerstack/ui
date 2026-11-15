import { UiProvider, type UiMessages } from "../../provider/index.ts"
import { Input, InputClear, InputGroup } from "../index.ts"

export type ClearInputProps = {
  ariaLabel?: string
  messages?: Partial<UiMessages>
}

/** An input group with a clear button, optionally under a `UiProvider` and with its own label. */
export function ClearInput(props: ClearInputProps) {
  return (
    <UiProvider messages={props.messages}>
      <InputGroup>
        <Input aria-label="Search" defaultValue="solid" />
        <InputClear aria-label={props.ariaLabel} />
      </InputGroup>
    </UiProvider>
  )
}

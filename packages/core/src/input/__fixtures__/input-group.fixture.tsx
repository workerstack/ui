import type { JSX } from "@solidjs/web";

import { Input, InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "../index.ts";

/** A group with a text addon before the input and a button after it. */
export function AddonGroup(): JSX.Element {
  return (
    <InputGroup data-testid="group">
      <InputGroupAddon>
        <InputGroupText>$</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="Amount" defaultValue="12" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Copy</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

/** A group with an addon above and one below a textarea. */
export function BlockGroup(): JSX.Element {
  return (
    <InputGroup data-testid="group">
      <InputGroupAddon align="block-start">Notes</InputGroupAddon>
      <InputGroupTextarea aria-label="Notes" defaultValue="hello" />
      <InputGroupAddon align="block-end">
        <InputGroupButton size="sm">Send</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

/** A read-only group, and a plain read-only Input beside it. */
export function ReadOnlyGroup(): JSX.Element {
  return (
    <div>
      <InputGroup data-testid="group">
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Handle" defaultValue="ada" readonly />
      </InputGroup>
      <Input aria-label="Plan" defaultValue="Pro" readonly />
    </div>
  );
}

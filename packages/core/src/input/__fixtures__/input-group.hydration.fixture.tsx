import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "../index.ts";

/** A group with addons on both sides, and the input's value shown beside it. */
export function AddonGroupFixture(): JSX.Element {
  const [value, setValue] = createSignal("12");

  return (
    <div>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>$</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="Amount" defaultValue="12" onValueChange={setValue} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Copy</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <output>{value()}</output>
    </div>
  );
}

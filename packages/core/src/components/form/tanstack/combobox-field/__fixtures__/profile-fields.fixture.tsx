import type { JSX } from "@solidjs/web";

import { ComboboxContent } from "../../../../combobox/index.ts";
import { FRUITS, needs, PROFILE_ERRORS, type ProfileFieldProps } from "../../form/__fixtures__/profile.fixture.ts";
import { comboboxField } from "../index.ts";

// The profile's combobox field: one item picked, the items as data.

/** Fruit: a combobox of FRUITS, one picked. */
export function FruitField(props: ProfileFieldProps): JSX.Element {
  return (
    <comboboxField.Root
      form={props.form}
      name="fruit"
      items={FRUITS}
      validators={{ onChange: needs((value: unknown) => value === null, PROFILE_ERRORS.fruit) }}
    >
      <comboboxField.Label>Fruit</comboboxField.Label>
      <comboboxField.Control>
        <comboboxField.Input placeholder="Pick a fruit" />
        <ComboboxContent />
      </comboboxField.Control>
      <comboboxField.Error />
    </comboboxField.Root>
  );
}

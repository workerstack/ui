import type { JSX } from "@solidjs/web";
import { Field, FieldLabel } from "@workerstack/ui/field";
import { Radio, RadioGroup } from "@workerstack/ui/radio-group";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { ControlStates } from "./states.tsx";

type Plan = "free" | "pro" | "team";

function Plans(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Default and a disabled option">
      <Field name="plan">
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup<Plan> defaultValue="free" onValueChange={(value) => log("RadioGroup", value)}>
          <Radio value="free">Free</Radio>
          <Radio value="pro" disabled>
            Pro (sold out)
          </Radio>
          <Radio value="team">Team</Radio>
        </RadioGroup>
      </Field>
    </Example>
  );
}

function States(): JSX.Element {
  return (
    <ControlStates
      control={(state) => (
        <RadioGroup defaultValue="a" readOnly={state === "read-only"}>
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      )}
    />
  );
}

/** Radios that share one value, with arrow keys between them. */
export function RadioGroups(): JSX.Element {
  return (
    <Section
      id="radio-group"
      title="Radio group"
      description="Radios that share one value, with arrow keys between them."
    >
      <Plans />
      <States />
    </Section>
  );
}

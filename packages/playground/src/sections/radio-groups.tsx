import type { JSX } from "@solidjs/web";
import { Field, FieldError, FieldLabel } from "@workerstack/ui/field";
import { Radio, RadioGroup, RadioGroupView } from "@workerstack/ui/radio-group";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";
import { RequiredForm } from "./required-form.tsx";
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

const PLANS = [
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Team", value: "team" },
];

function Required(): JSX.Element {
  return (
    <RequiredForm>
      <Field name="plan-required" required>
        <FieldLabel>Plan</FieldLabel>
        <RadioGroup required>
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
        </RadioGroup>
        <FieldError />
      </Field>
    </RequiredForm>
  );
}

function Views(): JSX.Element {
  return (
    <Example align="start" label="Read-only group and view">
      <RadioGroup aria-label="Plan" defaultValue="pro" readOnly>
        <For each={PLANS}>{(plan) => <Radio value={plan.value}>{plan.label}</Radio>}</For>
      </RadioGroup>
      <RadioGroupView legend={<span class="text-sm font-medium">Plan</span>} items={PLANS} value="pro" />
    </Example>
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
      <Required />
      <Views />
    </Section>
  );
}

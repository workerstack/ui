import type { JSX } from "@solidjs/web";
import { Field, FieldDescription, FieldError, FieldLabel } from "@workerstack/ui/field";
import { Input, InputClear, InputGroup } from "@workerstack/ui/input";
import { createSignal } from "solid-js";

import { useLog } from "../log.tsx";
import { TAKEN_EMAIL } from "../playground.constants.ts";
import { Example, Section } from "../section.tsx";

function Plain(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Plain">
      <div class="w-72">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input placeholder="Ada Lovelace" onValueChange={(value) => log("Input", value)} />
        </Field>
      </div>
      <div class="w-72">
        <Field>
          <FieldLabel>Bio</FieldLabel>
          <Input placeholder="Short and sweet" />
          <FieldDescription>Shown on your profile.</FieldDescription>
        </Field>
      </div>
    </Example>
  );
}

function Validation(): JSX.Element {
  const [email, setEmail] = createSignal("");

  return (
    <Example align="start" label={`Validation (type ${TAKEN_EMAIL})`}>
      <div class="w-72">
        <Field invalid={email() === TAKEN_EMAIL}>
          <FieldLabel>Email</FieldLabel>
          <Input type="email" placeholder="you@example.com" onValueChange={setEmail} />
          <FieldDescription>We never share it.</FieldDescription>
          <FieldError match>That email is taken.</FieldError>
        </Field>
      </div>
      <div class="w-72">
        <Field invalid>
          <FieldLabel>Always invalid</FieldLabel>
          <Input defaultValue="nope" />
          <FieldError>Something is wrong.</FieldError>
        </Field>
      </div>
    </Example>
  );
}

function DisabledAndReadOnly(): JSX.Element {
  return (
    <Example align="start" label="Disabled and read-only">
      <div class="w-72">
        <Field disabled>
          <FieldLabel>Disabled</FieldLabel>
          <Input defaultValue="Can't touch this" />
        </Field>
      </div>
      <div class="w-72">
        <Field>
          <FieldLabel>Read-only</FieldLabel>
          <Input defaultValue="ws_live_1234" readonly />
        </Field>
      </div>
    </Example>
  );
}

function WithClear(): JSX.Element {
  const log = useLog();

  return (
    <Example align="start" label="Input group with clear">
      <div class="w-72">
        <Field>
          <FieldLabel>Search</FieldLabel>
          <InputGroup>
            <Input defaultValue="solid" onValueChange={(value) => log("InputGroup", value)} />
            <InputClear />
          </InputGroup>
        </Field>
      </div>
    </Example>
  );
}

/** Label, description and error wiring, plus the input group. */
export function Fields(): JSX.Element {
  return (
    <Section
      id="field"
      title="Field and Input"
      description="Label, description and error wiring, plus the input group."
    >
      <Plain />
      <Validation />
      <DisabledAndReadOnly />
      <WithClear />
    </Section>
  );
}

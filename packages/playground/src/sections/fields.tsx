import type { JSX } from "@solidjs/web";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLabelGroup,
  FieldMarksProvider,
  Fieldset,
  FieldsetDescription,
  FieldsetLegend,
} from "@workerstack/ui/components/field";
import { Input, InputClear, InputGroup } from "@workerstack/ui/components/input";
import { createSignal } from "solid-js";

import { useLog } from "../log.tsx";
import { TAKEN_EMAIL } from "../playground.constants.ts";
import { Example, Section } from "../section.tsx";
import { InputGroups, MaxLength, Views } from "./fields-groups.tsx";
import { RequiredForm } from "./required-form.tsx";

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

function Fieldsets(): JSX.Element {
  return (
    <Example align="start" label="Fieldset, field group and horizontal fields">
      <div class="w-full max-w-xl">
        <Fieldset>
          <FieldsetLegend>Shipping address</FieldsetLegend>
          <FieldsetDescription>Where we send the order.</FieldsetDescription>
          <FieldGroup>
            <Field name="street" orientation="horizontal">
              <FieldLabel>Street</FieldLabel>
              <Input placeholder="1 Main St" />
            </Field>
            <Field name="city" orientation="horizontal">
              <FieldLabel>City</FieldLabel>
              <Input placeholder="Springfield" />
            </Field>
            <Field name="zip" orientation="responsive">
              <FieldLabel>Postal code (responsive)</FieldLabel>
              <Input placeholder="12345" />
            </Field>
          </FieldGroup>
        </Fieldset>
      </div>
    </Example>
  );
}

function Marks(): JSX.Element {
  return (
    <Example align="start" label="Required and optional marks, label group">
      <div class="w-72">
        <FieldMarksProvider marks="both">
          <FieldGroup>
            <Field required>
              <FieldLabelGroup>
                <FieldLabel>Full name</FieldLabel>
                <span class="text-xs text-muted-foreground">Public</span>
              </FieldLabelGroup>
              <Input required />
            </Field>
            <Field>
              <FieldLabel>Nickname</FieldLabel>
              <Input />
            </Field>
          </FieldGroup>
        </FieldMarksProvider>
      </div>
    </Example>
  );
}

function RequiredError(): JSX.Element {
  return (
    <RequiredForm>
      <Field name="company" required>
        <FieldLabel>Company</FieldLabel>
        <Input required />
        <FieldError />
      </Field>
    </RequiredForm>
  );
}

/** Labels, marks, fieldsets, errors, input groups and views. */
export function Fields(): JSX.Element {
  return (
    <Section id="field" title="Field and Input" description="Labels, marks, fieldsets, errors, input groups and views.">
      <Plain />
      <Validation />
      <DisabledAndReadOnly />
      <WithClear />
      <Fieldsets />
      <Marks />
      <RequiredError />
      <MaxLength />
      <InputGroups />
      <Views />
    </Section>
  );
}

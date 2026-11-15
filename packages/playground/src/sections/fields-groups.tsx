import type { JSX } from "@solidjs/web";
import { Field, FieldDescription, FieldLabel } from "@workerstack/ui/components/field";
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  InputView,
} from "@workerstack/ui/components/input";

import { useLog } from "../log.tsx";
import { Example } from "../section.tsx";

const NAME_MAX = 12;
const BIO_MAX = 80;

/** An Input with a character limit, reported by its Field once passed. */
export function MaxLength(): JSX.Element {
  return (
    <Example align="start" label={`maxLength (${NAME_MAX} characters)`}>
      <div class="w-72">
        <Field>
          <FieldLabel>Handle</FieldLabel>
          <Input maxLength={NAME_MAX} defaultValue="ada_lovelace_1815" />
          <FieldDescription>Past the limit the text stays and the field says so.</FieldDescription>
        </Field>
      </div>
    </Example>
  );
}

function Website(): JSX.Element {
  const log = useLog();

  return (
    <div class="w-72">
      <Field>
        <FieldLabel>Website</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => log("InputGroupButton", "copy")}>Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}

function Price(): JSX.Element {
  return (
    <div class="w-72">
      <Field>
        <FieldLabel>Read-only</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput defaultValue="42.00" readonly />
        </InputGroup>
      </Field>
    </div>
  );
}

function Message(): JSX.Element {
  return (
    <div class="w-72">
      <Field>
        <FieldLabel>Message</FieldLabel>
        <InputGroup>
          <InputGroupTextarea placeholder="Write a message" maxLength={BIO_MAX} />
          <InputGroupAddon align="block-end">
            <InputGroupText>Markdown is supported</InputGroupText>
            <InputGroupButton variant="secondary" class="ml-auto">
              Send
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}

/** Input groups with text, a button, a read-only input and a textarea. */
export function InputGroups(): JSX.Element {
  return (
    <Example align="start" label="Input group addons">
      <Website />
      <Price />
      <Message />
    </Example>
  );
}

/** An input's value shown, not edited. */
export function Views(): JSX.Element {
  return (
    <Example align="start" label="Input view">
      <div class="w-72">
        <Field>
          <FieldLabel>Key</FieldLabel>
          <InputView text="ws_live_1234" />
        </Field>
      </div>
      <div class="w-72">
        <Field>
          <FieldLabel>Empty</FieldLabel>
          <InputView text="" />
        </Field>
      </div>
    </Example>
  );
}

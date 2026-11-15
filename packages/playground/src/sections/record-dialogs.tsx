import type { JSX } from "@solidjs/web";
import { Button } from "@workerstack/ui/components/button";
import { FormDialog, FormDrawer, type FormDialogProps } from "@workerstack/ui/components/form/tanstack/dialog";
import { textInputField } from "@workerstack/ui/components/form/tanstack/text-input-field";

import { useLog } from "../log.tsx";
import { SAVE_DELAY, TAKEN_NAME } from "../playground.constants.ts";
import { Example } from "../section.tsx";

type Record = { name: string };

function recordProps(log: (source: string, ...args: unknown[]) => void): FormDialogProps<Record> {
  return {
    children: (form) => (
      <textInputField.Root form={form} name="name">
        <textInputField.Label>Name</textInputField.Label>
        <textInputField.Control />
        <textInputField.Error />
      </textInputField.Root>
    ),
    description: `Change the name. The server refuses "${TAKEN_NAME}".`,
    onSubmit: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY));

      if (values.name.toLowerCase() === TAKEN_NAME) return { name: ["That name is taken."] };
      log("Record saved", values.name);

      return {};
    },
    title: "Edit record",
    values: { name: "Ada" },
  };
}

/** Opens the record's dialog or drawer. */
function EditButton(props: { open: () => void; label: string }): JSX.Element {
  return (
    <Button variant="outline" onClick={() => props.open()}>
      {props.label}
    </Button>
  );
}

/** A dialog and a drawer that edit a small record, and stay open on a server error. */
export function RecordDialogs(): JSX.Element {
  const props = recordProps(useLog());

  return (
    <Example label="Form dialog and form drawer">
      <FormDialog {...props} trigger={(open) => <EditButton open={open} label="Edit in a dialog" />} />
      <FormDrawer {...props} side="right" trigger={(open) => <EditButton open={open} label="Edit in a drawer" />} />
    </Example>
  );
}

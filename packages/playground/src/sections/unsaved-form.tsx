import type { JSX } from "@solidjs/web";
import { Button } from "@workerstack/ui/components/button";
import { createForm, Form, SubmitButton } from "@workerstack/ui/components/form/tanstack/form";
import { textInputField } from "@workerstack/ui/components/form/tanstack/text-input-field";
import {
  FormDraftNotice,
  FormSaveBar,
  FormUnsaved,
  FormUnsavedStatus,
  UnsavedChangesProvider,
  useConfirmLeave,
} from "@workerstack/ui/components/form/tanstack/unsaved";
import { createSignal } from "solid-js";

import { useLog } from "../log.tsx";
import { SAVE_DELAY } from "../playground.constants.ts";
import { Example } from "../section.tsx";

function LeaveButton(): JSX.Element {
  const confirmLeave = useConfirmLeave();
  const [answer, setAnswer] = createSignal("", { ownedWrite: true });

  async function leave(): Promise<void> {
    setAnswer((await confirmLeave()) ? "You left." : "You stayed.");
  }

  return (
    <div class="flex items-center gap-3">
      <Button variant="outline" onClick={leave}>
        Leave
      </Button>
      <output class="text-sm text-muted-foreground">{answer()}</output>
    </div>
  );
}

function SettingsForm(): JSX.Element {
  const log = useLog();

  const form = createForm(() => ({
    defaultValues: { email: "", name: "" },
    onSubmit: async ({ value }) => {
      await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY));
      log("Settings saved", value.name);
    },
  }));

  return (
    <Form form={form} aria-label="Settings">
      <FormUnsaved draftKey="playground:settings">
        <FormSaveBar />
        <FormDraftNotice />
        <textInputField.Root form={form} name="name">
          <textInputField.Label>Name</textInputField.Label>
          <textInputField.Control />
        </textInputField.Root>
        <textInputField.Root form={form} name="email">
          <textInputField.Label>Email</textInputField.Label>
          <textInputField.Control />
        </textInputField.Root>
        <FormUnsavedStatus />
        <SubmitButton>Save</SubmitButton>
      </FormUnsaved>
    </Form>
  );
}

/** A form that tracks its unsaved changes, keeps a draft, and asks before the page is left. */
export function UnsavedForm(): JSX.Element {
  return (
    <Example align="start" label="Unsaved changes, a draft and a Leave button (edit, reload, then Leave)">
      <UnsavedChangesProvider scope="playground">
        <div class="flex w-full max-w-md flex-col gap-4">
          <SettingsForm />
          <LeaveButton />
        </div>
      </UnsavedChangesProvider>
    </Example>
  );
}

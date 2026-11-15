import type { JSX } from "@solidjs/web";
import { createForm } from "@tanstack/solid-form";
import { createSignal, Show } from "solid-js";

import { formText } from "../../form/__fixtures__/form-text.fixture.tsx";
import { Form, SubmitButton, useFormEngine, type FormEngine, type FormValues } from "../../form/index.ts";
import {
  FormArrivingValues,
  FormDraftNotice,
  FormSaveBar,
  FormUnsaved,
  FormUnsavedStatus,
  UnsavedChangesProvider,
  useConfirmLeave,
} from "../index.ts";

// A profile form of three text fields inside FormUnsaved, with every unsaved part, and a page of
// two of them under UnsavedChangesProvider with a link that asks before it leaves.

/** The profile form's values. */
export type Profile = { name: string; email: string; password: string };

/** What `ProfileForm` takes. */
export type ProfileFormProps = {
  /** The values the form starts from. */
  defaults?: Partial<Profile>;
  /** The Form's `aria-label`. @default "Profile" */
  name?: string;
  /** FormUnsaved's `label`. */
  label?: string;
  /** Keeps a draft under this key. */
  draftKey?: string;
  /** The draft's time to live. */
  draftTtl?: number;
  /** Paths the draft never keeps. */
  draftOmit?: readonly string[];
  /** Shows the form read-only. */
  readOnly?: boolean;
  /** Shows the save bar. */
  saveBar?: boolean;
  /** Values that arrive after mount, and their record. */
  arriving?: FormValues;
  record?: unknown;
  /** Called with what a submit sends. */
  onSubmit?: (values: Profile) => void | Promise<void>;
  /** Receives the Form's engine, for a test to drive it. */
  keep?: (engine: FormEngine) => void;
};

function KeepEngine(props: { keep: ((engine: FormEngine) => void) | undefined }): JSX.Element {
  props.keep?.(useFormEngine("KeepEngine"));

  return <></>;
}

function ProfileField(props: { form: ReturnType<typeof profileForm>; name: keyof Profile; label: string }) {
  return (
    <formText.Root form={props.form} name={props.name}>
      <formText.Label>{props.label}</formText.Label>
      <formText.Control />
    </formText.Root>
  );
}

function profileForm(props: ProfileFormProps) {
  return createForm(() => ({
    defaultValues: { email: "", name: "", password: "", ...props.defaults },
    onSubmit: async ({ value }: { value: Profile }) => props.onSubmit?.(value),
  }));
}

/** The profile form: Name, Email and Password, the draft notice, the status and Save. */
export function ProfileForm(props: ProfileFormProps): JSX.Element {
  const form = profileForm(props);

  return (
    <Form form={form} aria-label={props.name ?? "Profile"} readOnly={props.readOnly}>
      <FormUnsaved label={props.label} draftKey={props.draftKey} draftTtl={props.draftTtl} draftOmit={props.draftOmit}>
        <KeepEngine keep={props.keep} />
        <Show when={props.saveBar}>
          <FormSaveBar />
        </Show>
        <FormDraftNotice />
        <FormArrivingValues values={props.arriving} record={props.record} />
        <ProfileField form={form} name="name" label="Name" />
        <ProfileField form={form} name="email" label="Email" />
        <ProfileField form={form} name="password" label="Password" />
        <FormUnsavedStatus />
        <SubmitButton>Save</SubmitButton>
      </FormUnsaved>
    </Form>
  );
}

/** A link that asks before it leaves, as an app's router does, and shows the answer. */
function LeaveLink(): JSX.Element {
  const confirmLeave = useConfirmLeave();
  const [answer, setAnswer] = createSignal("", { ownedWrite: true });

  async function leave(): Promise<void> {
    setAnswer((await confirmLeave()) ? "left" : "stayed");
  }

  return (
    <>
      <button type="button" onClick={leave}>
        Go to settings
      </button>
      <output data-testid="answer">{answer()}</output>
    </>
  );
}

/** What `UnsavedPage` takes. */
export type UnsavedPageProps = {
  /** Whose drafts these are. */
  scope?: string;
  /** The second form keeps a draft under this key instead of asking. */
  billingDraftKey?: string;
};

/** A page of two forms, Profile and Billing, and a link that asks before it leaves. */
export function UnsavedPage(props: UnsavedPageProps): JSX.Element {
  return (
    <UnsavedChangesProvider scope={props.scope}>
      <ProfileForm />
      <ProfileForm name="Billing" draftKey={props.billingDraftKey} />
      <LeaveLink />
    </UnsavedChangesProvider>
  );
}

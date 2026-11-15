import type { JSX } from "@solidjs/web";

import { buttonClass } from "../../../button/index.ts";
import { formText } from "../../__fixtures__/form-text.fixture.tsx";
import type { FormFor } from "../../form-field.ts";
import { FormDialog } from "../form-dialog.tsx";
import type { FormDialogProps, FormDialogResult } from "../form-dialog-props.ts";
import { FormDrawer } from "../form-drawer.tsx";

/** The values the test dialogs edit. */
export type Profile = { name: string };

/** What the test dialogs take. */
export type ProfileDialogProps = {
  /** Saves the values. */
  onSubmit?: (values: Profile) => FormDialogResult<Profile> | Promise<FormDialogResult<Profile>>;
  /** Hears each change of whether it is open. */
  onOpenChange?: (open: boolean) => void;
  /** Starts open. */
  defaultOpen?: boolean;
};

function ProfileFields(form: FormFor<Profile>): JSX.Element {
  return (
    <formText.Root form={form} name="name">
      <formText.Label>Name</formText.Label>
      <formText.Control />
      <formText.Error />
    </formText.Root>
  );
}

function profileProps(props: ProfileDialogProps): FormDialogProps<Profile> {
  return {
    children: ProfileFields,
    defaultOpen: props.defaultOpen ?? false,
    description: "Change how you appear.",
    ...(props.onOpenChange === undefined ? {} : { onOpenChange: props.onOpenChange }),
    ...(props.onSubmit === undefined ? {} : { onSubmit: props.onSubmit }),
    title: "Edit profile",
    trigger: (open) => (
      <button type="button" class={buttonClass()} onClick={open}>
        Edit
      </button>
    ),
    values: { name: "Ada" },
  };
}

/** A dialog editing a profile's name. */
export function ProfileDialog(props: ProfileDialogProps = {}): JSX.Element {
  return <FormDialog {...profileProps(props)} />;
}

/** A drawer editing a profile's name. */
export function ProfileDrawer(props: ProfileDialogProps = {}): JSX.Element {
  return <FormDrawer {...profileProps(props)} side="right" />;
}

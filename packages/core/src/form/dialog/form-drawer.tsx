import type { JSX } from "@solidjs/web";

import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "../../drawer/index.ts";
import type { FormDrawerProps } from "./form-dialog-props.ts";
import { FormOverlay, type OverlayShellProps } from "./form-overlay.tsx";

function DrawerShell(props: OverlayShellProps): JSX.Element {
  return (
    <Drawer open={props.open} onOpenChange={props.onOpenChange} side={props.side ?? "bottom"}>
      <DrawerContent class={props.class}>{props.children}</DrawerContent>
    </Drawer>
  );
}

/**
 * A drawer holding a form, with the same save and discard behavior as `FormDialog`: record
 * details beside a list, or a bottom sheet on a phone.
 */
export function FormDrawer<TFormData>(props: FormDrawerProps<TFormData>): JSX.Element {
  return <FormOverlay {...props} shell={DrawerShell} Title={DrawerTitle} Description={DrawerDescription} />;
}

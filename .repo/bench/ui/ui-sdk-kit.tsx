import type { JSX } from "@solidjs/web";
import { Button } from "@ui-sdk/solid/button";
import { Checkbox as CheckboxPart, CheckboxIndicator } from "@ui-sdk/solid/checkbox";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@ui-sdk/solid/combobox";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent as DialogContentPart,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/solid/dialog";
import { Field, FieldLabel } from "@ui-sdk/solid/field";
import { Input } from "@ui-sdk/solid/input";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/solid/menu";
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/solid/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui-sdk/solid/select";
import { Switch as SwitchPart, SwitchThumb } from "@ui-sdk/solid/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/solid/tabs";
import { Toast, ToastRegion, ToastTitle, toast } from "@ui-sdk/solid/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/solid/tooltip";

import { ChildFruitList, type Kit } from "./app.tsx";

function FruitList(): JSX.Element {
  return <ChildFruitList item={ComboboxItem} list={ComboboxList} />;
}

// Bare parts draw nothing on their own: these add the markup a styling layer adds for the same
// result, a checkbox's indicator, a switch's thumb, a dialog's backdrop and a toast's title.

function Checkbox(): JSX.Element {
  return (
    <CheckboxPart>
      <CheckboxIndicator />
    </CheckboxPart>
  );
}

function Switch(): JSX.Element {
  return (
    <SwitchPart>
      <SwitchThumb />
    </SwitchPart>
  );
}

function DialogContent(props: { children?: JSX.Element }): JSX.Element {
  return (
    <>
      <DialogBackdrop />
      <DialogContentPart>{props.children}</DialogContentPart>
    </>
  );
}

function TextInput(): JSX.Element {
  return <Input type="text" />;
}

function Toaster(): JSX.Element {
  return (
    <ToastRegion>
      {() => (
        <Toast>
          <ToastTitle />
        </Toast>
      )}
    </ToastRegion>
  );
}

/** Bare @ui-sdk/solid parts with no styling layer: the floor our layer builds on. */
export const uiSdkKit: Kit = {
  Button,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxInput,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  FruitList,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  TextInput,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  showToast: (title) => toast({ title }),
};

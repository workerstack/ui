import type { JSX } from "@solidjs/web";
import { For } from "solid-js";

import { ACTIONS, type Choice, FRUITS, ROLES, SECTIONS, TEXT } from "./content.ts";

/** The props the app passes a part, each as the library documents it. */
export type PartProps = {
  "aria-label"?: string;
  children?: JSX.Element;
  defaultValue?: string;
  items?: Choice[];
  label?: string;
  onClick?: () => void;
  placeholder?: string;
  value?: string;
};

/** Any library's part. */
export type Part = (props: PartProps) => JSX.Element;

/**
 * One library's parts for the benchmark app. Most are the library's own exports; a kit wraps a
 * part only where the library needs more markup for the same visible result.
 */
export type Kit = {
  Button: Part;
  Checkbox: Part;
  Combobox: Part;
  ComboboxContent: Part;
  ComboboxInput: Part;
  Dialog: Part;
  DialogClose: Part;
  DialogContent: Part;
  DialogDescription: Part;
  DialogTitle: Part;
  DialogTrigger: Part;
  Field: Part;
  FieldLabel: Part;
  /** The combobox's list of FRUITS, as the library takes its items. */
  FruitList: Part;
  Menu: Part;
  MenuContent: Part;
  MenuItem: Part;
  MenuTrigger: Part;
  Popover: Part;
  PopoverContent: Part;
  PopoverDescription: Part;
  PopoverTitle: Part;
  PopoverTrigger: Part;
  Select: Part;
  SelectContent: Part;
  SelectItem: Part;
  SelectTrigger: Part;
  SelectValue: Part;
  Switch: Part;
  Tabs: Part;
  TabsList: Part;
  TabsPanel: Part;
  TabsTab: Part;
  TextInput: Part;
  Toaster: Part;
  TooltipContent: Part;
  Tooltip: Part;
  TooltipTrigger: Part;
  /** Shows a toast with this title, through the library's own queue. */
  showToast: (title: string) => void;
};

/** The combobox list for a library that takes its items as children. */
export function ChildFruitList(props: { item: Part; list: Part }): JSX.Element {
  const parts = { Item: props.item, List: props.list };

  return (
    <parts.List>
      <For each={FRUITS}>
        {(fruit) => (
          <parts.Item value={fruit.value} label={fruit.label}>
            {fruit.label}
          </parts.Item>
        )}
      </For>
    </parts.List>
  );
}

function Toggles(props: { kit: Kit }): JSX.Element {
  const kit = props.kit;

  return (
    <>
      <kit.Button>{TEXT.button}</kit.Button>
      <kit.Field>
        <kit.FieldLabel>{TEXT.checkbox}</kit.FieldLabel>
        <kit.Checkbox />
      </kit.Field>
      <kit.Field>
        <kit.FieldLabel>{TEXT.switch}</kit.FieldLabel>
        <kit.Switch />
      </kit.Field>
      <kit.Tabs defaultValue={SECTIONS[0]?.value}>
        <kit.TabsList aria-label={TEXT.tabs}>
          <For each={SECTIONS}>{(section) => <kit.TabsTab value={section.value}>{section.label}</kit.TabsTab>}</For>
        </kit.TabsList>
        <For each={SECTIONS}>{(section) => <kit.TabsPanel value={section.value}>{section.content}</kit.TabsPanel>}</For>
      </kit.Tabs>
    </>
  );
}

function Overlays(props: { kit: Kit }): JSX.Element {
  const kit = props.kit;

  return (
    <>
      <kit.Dialog>
        <kit.DialogTrigger>{TEXT.dialogTrigger}</kit.DialogTrigger>
        <kit.DialogContent>
          <kit.DialogTitle>{TEXT.dialogTitle}</kit.DialogTitle>
          <kit.DialogDescription>{TEXT.dialogBody}</kit.DialogDescription>
          <kit.DialogClose>{TEXT.dialogClose}</kit.DialogClose>
        </kit.DialogContent>
      </kit.Dialog>
      <kit.Popover>
        <kit.PopoverTrigger>{TEXT.popoverTrigger}</kit.PopoverTrigger>
        <kit.PopoverContent>
          <kit.PopoverTitle>{TEXT.popoverTitle}</kit.PopoverTitle>
          <kit.PopoverDescription>{TEXT.popoverBody}</kit.PopoverDescription>
        </kit.PopoverContent>
      </kit.Popover>
      <kit.Tooltip>
        <kit.TooltipTrigger>{TEXT.tooltipTrigger}</kit.TooltipTrigger>
        <kit.TooltipContent>{TEXT.tooltip}</kit.TooltipContent>
      </kit.Tooltip>
    </>
  );
}

function Actions(props: { kit: Kit }): JSX.Element {
  const kit = props.kit;

  return (
    <kit.Menu>
      <kit.MenuTrigger>{TEXT.menuTrigger}</kit.MenuTrigger>
      <kit.MenuContent>
        <For each={ACTIONS}>{(action) => <kit.MenuItem>{action}</kit.MenuItem>}</For>
      </kit.MenuContent>
    </kit.Menu>
  );
}

function Pickers(props: { kit: Kit }): JSX.Element {
  const kit = props.kit;

  return (
    <>
      <kit.Field>
        <kit.FieldLabel>{TEXT.select}</kit.FieldLabel>
        <kit.Select items={ROLES} defaultValue={ROLES[0]?.value}>
          <kit.SelectTrigger>
            <kit.SelectValue />
          </kit.SelectTrigger>
          <kit.SelectContent>
            <For each={ROLES}>{(role) => <kit.SelectItem value={role.value}>{role.label}</kit.SelectItem>}</For>
          </kit.SelectContent>
        </kit.Select>
      </kit.Field>
      <kit.Field>
        <kit.FieldLabel>{TEXT.combobox}</kit.FieldLabel>
        <kit.Combobox>
          <kit.ComboboxInput placeholder={TEXT.comboboxPlaceholder} />
          <kit.ComboboxContent>
            <kit.FruitList />
          </kit.ComboboxContent>
        </kit.Combobox>
      </kit.Field>
    </>
  );
}

/** The benchmark app on one library's parts: every part closed, as a page first shows it. */
export function createApp(kit: Kit): () => JSX.Element {
  return () => (
    <main>
      <Toggles kit={kit} />
      <Overlays kit={kit} />
      <Actions kit={kit} />
      <Pickers kit={kit} />
      <kit.Field>
        <kit.FieldLabel>{TEXT.textField}</kit.FieldLabel>
        <kit.TextInput />
      </kit.Field>
      <kit.Button onClick={() => kit.showToast(TEXT.toast)}>{TEXT.toastTrigger}</kit.Button>
      <kit.Toaster />
    </main>
  );
}

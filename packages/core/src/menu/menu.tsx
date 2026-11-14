import type { JSX } from "@solidjs/web";
import {
  Menu as MenuPart,
  MenuCheckboxItem as MenuCheckboxItemPart,
  MenuContent as MenuContentPart,
  MenuGroup as MenuGroupPart,
  MenuGroupLabel as MenuGroupLabelPart,
  MenuItem as MenuItemPart,
  MenuItemIndicator,
  MenuRadioGroup as MenuRadioGroupPart,
  MenuRadioItem as MenuRadioItemPart,
  MenuSeparator as MenuSeparatorPart,
  MenuShortcut as MenuShortcutPart,
  MenuSub as MenuSubPart,
  MenuSubContent as MenuSubContentPart,
  MenuSubTrigger as MenuSubTriggerPart,
  MenuTrigger as MenuTriggerPart,
} from "@ui-sdk/solid/menu";
import { omit, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";
import { popupMotion, withBefore } from "../internal/index.ts";

/** A dropdown menu of actions. Holds state; renders no element. `onAction` hears every chosen item. */
export { MenuPart as Menu };

export type { MenuProps, MenuSubProps } from "@ui-sdk/solid/menu";

/** UI SDK's menu trigger props. */
export type MenuTriggerProps = ComponentProps<typeof MenuTriggerPart>;

/** Opens the menu. Unstyled: give it `class={buttonClass()}` or render your own Button. */
export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
  return <MenuTriggerPart {...props} />;
}

const content = [
  "z-50 max-h-(--available-height) min-w-32 overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1",
  "text-popover-foreground shadow-popup outline-none",
  popupMotion,
];

/** UI SDK's menu content props. */
export type MenuContentProps = ComponentProps<typeof MenuContentPart>;

/** The popup with the items. */
export function MenuContent(props: MenuContentProps): JSX.Element {
  const rest = omit(props, "class");

  return <MenuContentPart {...rest} class={cnState(content, props.class)} />;
}

const ITEM = [
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
  "data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent",
  "data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  "[&_svg:not([class*='size-'])]:size-4",
];

/** UI SDK's menu item props, plus a destructive variant. */
export type MenuItemProps = ComponentProps<typeof MenuItemPart> & {
  /** Red, for actions that delete or can't be undone. */
  variant?: "default" | "destructive";
};

/** An action. `value` names it in `onAction`; `shortcut` (like "mod+k") shows and binds its keys. */
export function MenuItem(props: MenuItemProps): JSX.Element {
  const rest = omit(props, "class", "variant");

  return (
    <MenuItemPart
      {...rest}
      data-variant={props.variant ?? "default"}
      class={cnState(
        [
          ITEM,
          "data-[variant=destructive]:text-destructive",
          "data-[variant=destructive]:data-highlighted:bg-destructive/10",
          "data-[variant=destructive]:data-highlighted:text-destructive",
        ],
        props.class,
      )}
    />
  );
}

const INDICATOR = "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center";

/** UI SDK's checkbox item props: `checked`, `onCheckedChange`. */
export type MenuCheckboxItemProps = ComponentProps<typeof MenuCheckboxItemPart>;

/** A setting that toggles on and off. Shows a check while on; the menu stays open. */
export function MenuCheckboxItem(props: MenuCheckboxItemProps): JSX.Element {
  const rest = omit(props, "class", "children");

  return (
    <MenuCheckboxItemPart {...rest} class={cnState([ITEM, "pl-8"], props.class)}>
      {withBefore(<MenuItemIndicator class={INDICATOR} />, props.children)}
    </MenuCheckboxItemPart>
  );
}

/** UI SDK's radio group props: `value`, `onValueChange`. */
export type MenuRadioGroupProps = ComponentProps<typeof MenuRadioGroupPart>;

/** Radio items, one of which is chosen. */
export function MenuRadioGroup(props: MenuRadioGroupProps): JSX.Element {
  return <MenuRadioGroupPart {...props} />;
}

/** UI SDK's radio item props. */
export type MenuRadioItemProps = ComponentProps<typeof MenuRadioItemPart>;

/** One choice in a MenuRadioGroup. Shows a check while chosen. */
export function MenuRadioItem(props: MenuRadioItemProps): JSX.Element {
  const rest = omit(props, "class", "children");

  return (
    <MenuRadioItemPart {...rest} class={cnState([ITEM, "pl-8"], props.class)}>
      {withBefore(<MenuItemIndicator class={INDICATOR} />, props.children)}
    </MenuRadioItemPart>
  );
}

/** UI SDK's menu group props. */
export type MenuGroupProps = ComponentProps<typeof MenuGroupPart>;

/** Groups related items, named by a MenuGroupLabel. */
export function MenuGroup(props: MenuGroupProps): JSX.Element {
  return <MenuGroupPart {...props} />;
}

/** UI SDK's menu group label props. */
export type MenuGroupLabelProps = ComponentProps<typeof MenuGroupLabelPart>;

/** A muted heading for a MenuGroup. */
export function MenuGroupLabel(props: MenuGroupLabelProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <MenuGroupLabelPart
      {...rest}
      class={cnState("px-2 py-1.5 text-xs font-medium text-muted-foreground", props.class)}
    />
  );
}

/** UI SDK's menu separator props. */
export type MenuSeparatorProps = ComponentProps<typeof MenuSeparatorPart>;

/** A line between groups of items. */
export function MenuSeparator(props: MenuSeparatorProps): JSX.Element {
  const rest = omit(props, "class");

  return <MenuSeparatorPart {...rest} class={cnState("-mx-1 my-1 h-px bg-border", props.class)} />;
}

/** UI SDK's menu shortcut props. */
export type MenuShortcutProps = ComponentProps<typeof MenuShortcutPart>;

/** Keys shown at the end of an item. A MenuItem's `shortcut` adds one for you. */
export function MenuShortcut(props: MenuShortcutProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <MenuShortcutPart
      {...rest}
      class={cnState("ml-auto pl-4 text-xs tracking-widest text-muted-foreground", props.class)}
    />
  );
}

/** A nested menu: a MenuSubTrigger and a MenuSubContent. */
export { MenuSubPart as MenuSub };

/** UI SDK's submenu trigger props. */
export type MenuSubTriggerProps = ComponentProps<typeof MenuSubTriggerPart>;

/** The item that opens a submenu. UI SDK draws a chevron after its content. */
export function MenuSubTrigger(props: MenuSubTriggerProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <MenuSubTriggerPart
      {...rest}
      class={cnState([ITEM, "data-open:bg-accent data-open:text-accent-foreground"], props.class)}
    />
  );
}

/** UI SDK's submenu content props. */
export type MenuSubContentProps = ComponentProps<typeof MenuSubContentPart>;

/** The submenu's popup, styled like MenuContent. */
export function MenuSubContent(props: MenuSubContentProps): JSX.Element {
  const rest = omit(props, "class");

  return <MenuSubContentPart {...rest} class={cnState(content, props.class)} />;
}

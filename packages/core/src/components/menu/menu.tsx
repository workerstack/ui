import type { JSX } from "@solidjs/web";
import {
  Menu as MenuPart,
  MenuContent as MenuContentPart,
  type MenuContentState,
  MenuSeparator as MenuSeparatorPart,
  MenuShortcut as MenuShortcutPart,
  MenuSub as MenuSubPart,
  MenuSubContent as MenuSubContentPart,
  MenuTrigger as MenuTriggerPart,
} from "@ui-sdk/solid/menu";
import { omit, type ComponentProps } from "solid-js";

import { isStateFunction, popupMotion } from "../../internal/index.ts";
import { cnState } from "../../utils/cn/index.ts";
import { createFilterState, FILTER_CONTEXT } from "./menu-filter-state.ts";
import { CONTENT } from "./menu.constants.ts";

/** A dropdown menu of actions. Holds state; renders no element. `onAction` hears every chosen item. */
export { MenuPart as Menu };

export type { MenuProps, MenuSubProps } from "@ui-sdk/solid/menu";

/** UI SDK's menu trigger props. */
export type MenuTriggerProps = ComponentProps<typeof MenuTriggerPart>;

/** Opens the menu. Unstyled: give it `class={buttonClass()}` or render your own Button. */
export function MenuTrigger(props: MenuTriggerProps): JSX.Element {
  return <MenuTriggerPart {...props} />;
}

/** UI SDK's menu content props. */
export type MenuContentProps = ComponentProps<typeof MenuContentPart>;

// One filter state for each time the popup shows, so a reopened menu starts with no query.
function FilterScope(props: { children?: JSX.Element }): JSX.Element {
  const state = createFilterState();

  return <FILTER_CONTEXT value={state}>{props.children}</FILTER_CONTEXT>;
}

// The children are read inside the scope, so the items they make find its state.
function scoped(props: MenuContentProps): (state: MenuContentState) => JSX.Element {
  return (state) => (
    <FilterScope>{isStateFunction(props.children) ? props.children(state) : props.children}</FilterScope>
  );
}

/** The popup with the items. It holds the filter that a MenuFilter, a MenuList and a MenuEmpty share. */
export function MenuContent(props: MenuContentProps): JSX.Element {
  const rest = omit(props, "children", "class");

  return (
    <MenuContentPart {...rest} class={cnState([CONTENT, popupMotion], props.class)}>
      {scoped(props)}
    </MenuContentPart>
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

/**
 * Keys shown at the end of an item. A MenuItem's `shortcut` adds one for you. The item styles it,
 * muted until the item is highlighted, then in the foreground.
 */
export { MenuShortcutPart as MenuShortcut };

/** A nested menu: a MenuSubTrigger and a MenuSubContent. */
export { MenuSubPart as MenuSub };

/** UI SDK's submenu content props. */
export type MenuSubContentProps = ComponentProps<typeof MenuSubContentPart>;

/** The submenu's popup, styled like MenuContent. It filters on its own query. */
export function MenuSubContent(props: MenuSubContentProps): JSX.Element {
  const rest = omit(props, "children", "class");

  return (
    <MenuSubContentPart {...rest} class={cnState([CONTENT, popupMotion], props.class)}>
      {scoped(props)}
    </MenuSubContentPart>
  );
}

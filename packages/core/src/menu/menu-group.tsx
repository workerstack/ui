import type { JSX } from "@solidjs/web";
import { MenuGroup as MenuGroupPart, MenuGroupLabel as MenuGroupLabelPart } from "@ui-sdk/solid/menu";
import { omit, type ComponentProps } from "solid-js";

import { cn, cnState } from "../cn/index.ts";
import { createMatchRegistry, GROUP_CONTEXT } from "./menu-filter-state.ts";
import { INSET, LABEL } from "./menu.constants.ts";

/** UI SDK's menu group props. */
export type MenuGroupProps = ComponentProps<typeof MenuGroupPart>;

/** Groups related items, named by a MenuGroupLabel. In a filtered MenuList it hides when none of its items match. */
export function MenuGroup(props: MenuGroupProps): JSX.Element {
  const rest = omit(props, "hidden");
  const items = createMatchRegistry();

  return (
    <GROUP_CONTEXT value={items}>
      <MenuGroupPart {...rest} hidden={items.none() ? true : props.hidden} />
    </GROUP_CONTEXT>
  );
}

/** UI SDK's menu group label props. */
export type MenuGroupLabelProps = ComponentProps<typeof MenuGroupLabelPart> & {
  /** Lines the text up with items that have a check or an icon. */
  inset?: boolean;
};

/** A muted heading that names its MenuGroup. Valid only inside one: a heading for no group is a MenuLabel. */
export function MenuGroupLabel(props: MenuGroupLabelProps): JSX.Element {
  const rest = omit(props, "class", "inset");

  return <MenuGroupLabelPart {...rest} class={cnState([LABEL, props.inset === true && INSET], props.class)} />;
}

/** UI SDK's div props, plus `inset`. */
export type MenuLabelProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  /** Classes added to the element. */
  class?: string;
  /** Lines the text up with items that have a check or an icon. */
  inset?: boolean;
};

/**
 * A heading valid anywhere in a menu's content. An account menu's email above a separator and two
 * unrelated sets of items names no group; to name one, which makes it the group's accessible name,
 * use MenuGroupLabel.
 */
export function MenuLabel(props: MenuLabelProps): JSX.Element {
  const rest = omit(props, "class", "inset");

  return <div {...rest} data-slot="menu-label" class={cn(LABEL, props.inset === true && INSET, props.class)} />;
}

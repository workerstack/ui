import type { JSX } from "@solidjs/web";
import {
  MenuCheckboxItem as MenuCheckboxItemPart,
  MenuItem as MenuItemPart,
  MenuItemIndicator,
  MenuRadioGroup as MenuRadioGroupPart,
  MenuRadioItem as MenuRadioItemPart,
  MenuSubTrigger as MenuSubTriggerPart,
} from "@ui-sdk/solid/menu";
import { omit, Show, type ComponentProps } from "solid-js";

import { withBefore } from "../../internal/index.ts";
import { cnState } from "../../utils/cn/index.ts";
import { useItemFilter } from "./menu-filter-item.ts";
import { INDICATOR, INSET, ITEM } from "./menu.constants.ts";

/** UI SDK's menu item props, plus a destructive variant. */
export type MenuItemProps = ComponentProps<typeof MenuItemPart> & {
  /** Lines the text up with items that have a check or an icon. */
  inset?: boolean;
  /** Red, for actions that delete or can't be undone. */
  variant?: "default" | "destructive";
};

/**
 * An action. `value` names it in `onAction`; `shortcut` (like "mod+k") shows and binds its keys.
 * In a MenuList it follows the filter, by its text or `label`.
 */
export function MenuItem(props: MenuItemProps): JSX.Element {
  const rest = omit(props, "children", "class", "inset", "variant");
  const filter = useItemFilter(props);

  return (
    <Show when={filter.visible()}>
      <MenuItemPart
        {...rest}
        data-variant={props.variant ?? "default"}
        class={cnState(
          [
            ITEM,
            props.inset === true && INSET,
            "data-[variant=destructive]:text-destructive",
            "data-[variant=destructive]:data-highlighted:bg-destructive/10",
            "data-[variant=destructive]:data-highlighted:text-destructive",
          ],
          props.class,
        )}
      >
        {filter.content}
      </MenuItemPart>
    </Show>
  );
}

/** UI SDK's menu item props, plus the link's own: `href`, `target`, `rel` and `download`. */
export type MenuLinkItemProps = Omit<MenuItemProps, "render" | "variant"> &
  Pick<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "download" | "href" | "rel" | "target">;

/**
 * An item that is a link, an `<a>` with the menu item's role. Like the monorepo's link item it
 * keeps the menu open when chosen, unlike an action; pass `closeOnSelect` to close it.
 */
export function MenuLinkItem(props: MenuLinkItemProps): JSX.Element {
  const rest = omit(props, "children", "class", "download", "href", "inset", "rel", "target");
  const filter = useItemFilter(props);

  return (
    <Show when={filter.visible()}>
      <MenuItemPart
        {...rest}
        closeOnSelect={props.closeOnSelect ?? false}
        class={cnState([ITEM, props.inset === true && INSET, "no-underline"], props.class)}
        render={(item) => (
          <a {...item} download={props.download} href={props.href} rel={props.rel} target={props.target} />
        )}
      >
        {filter.content}
      </MenuItemPart>
    </Show>
  );
}

/** UI SDK's checkbox item props: `checked`, `onCheckedChange`. */
export type MenuCheckboxItemProps = ComponentProps<typeof MenuCheckboxItemPart>;

/** A setting that toggles on and off. Shows a check while on; the menu stays open. */
export function MenuCheckboxItem(props: MenuCheckboxItemProps): JSX.Element {
  const rest = omit(props, "class", "children");
  const filter = useItemFilter(props);

  return (
    <Show when={filter.visible()}>
      <MenuCheckboxItemPart {...rest} class={cnState([ITEM, INSET], props.class)}>
        {withBefore(<MenuItemIndicator class={INDICATOR} />, filter.content)}
      </MenuCheckboxItemPart>
    </Show>
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
  const filter = useItemFilter(props);

  return (
    <Show when={filter.visible()}>
      <MenuRadioItemPart {...rest} class={cnState([ITEM, INSET], props.class)}>
        {withBefore(<MenuItemIndicator class={INDICATOR} />, filter.content)}
      </MenuRadioItemPart>
    </Show>
  );
}

/** UI SDK's submenu trigger props, plus `inset`. */
export type MenuSubTriggerProps = ComponentProps<typeof MenuSubTriggerPart> & {
  /** Lines the text up with items that have a check or an icon. */
  inset?: boolean;
};

/** The item that opens a submenu. UI SDK draws a chevron after its content. */
export function MenuSubTrigger(props: MenuSubTriggerProps): JSX.Element {
  const rest = omit(props, "class", "inset");

  return (
    <MenuSubTriggerPart
      {...rest}
      class={cnState(
        [ITEM, props.inset === true && INSET, "data-open:bg-accent data-open:text-accent-foreground"],
        props.class,
      )}
    />
  );
}

import type { JSX } from "@solidjs/web";
import {
  Tabs as TabsPart,
  TabsList as TabsListPart,
  TabsPanel as TabsPanelPart,
  TabsTab as TabsTabPart,
  type TabsListState,
  type TabsPanelState,
  type TabsState,
  type TabsTabState,
} from "@ui-sdk/solid/tabs";
import { createContext, omit, useContext, type ComponentProps } from "solid-js";

import { cnState } from "../cn/index.ts";

/** How the tab list looks: `default` is a muted pill with a filled active tab, `line` underlines it. */
export type TabsVariant = "default" | "line";

// The list tells its tabs which variant it has, so they draw the active mark to match.
const VARIANT_CONTEXT = /* @__PURE__ */ createContext<() => TabsVariant>(() => "default");

const LIST_BASE = [
  "inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
  "data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col",
];

const LIST_VARIANTS: Record<TabsVariant, string> = {
  default: "bg-muted",
  line: "gap-1 rounded-none bg-transparent",
};

const TAB_BASE = [
  "relative inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5",
  "whitespace-nowrap rounded-md border border-transparent px-2 py-1 text-sm font-medium",
  "text-muted-foreground outline-none transition-[color,background-color,box-shadow] delay-0",
  "hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:text-foreground",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  "data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
];

const TAB_VARIANTS: Record<TabsVariant, string[]> = {
  default: ["data-selected:bg-background data-selected:shadow-sm"],
  line: [
    "bg-transparent after:absolute after:bg-foreground after:opacity-0 after:transition-opacity after:delay-0",
    "data-selected:after:opacity-100",
    "data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:-bottom-1",
    "data-[orientation=horizontal]:after:h-0.5",
    "data-[orientation=vertical]:after:inset-y-0 data-[orientation=vertical]:after:-end-1",
    "data-[orientation=vertical]:after:w-0.5",
  ],
};

/** UI SDK's tabs props: `value`, `defaultValue`, `onValueChange`, `orientation`, `activation`, `loop`. */
export type TabsProps = ComponentProps<typeof TabsPart>;

/**
 * Layered sections of content, one shown at a time. Put a TabsList of TabsTab parts and one
 * TabsPanel per tab inside it. Horizontal by default; `orientation="vertical"` stacks the tabs.
 */
export function Tabs(props: TabsProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <TabsPart {...rest} class={cnState<TabsState>("flex gap-2 data-[orientation=horizontal]:flex-col", props.class)} />
  );
}

/** UI SDK's tab list props, plus how it looks. */
export type TabsListProps = ComponentProps<typeof TabsListPart> & {
  /** Defaults to `default`. */
  variant?: TabsVariant;
};

/** The row (or column) of tabs: one tab stop, with arrow keys between its tabs. */
export function TabsList(props: TabsListProps): JSX.Element {
  const rest = omit(props, "class", "variant", "children");

  function variant(): TabsVariant {
    return props.variant ?? "default";
  }

  return (
    <VARIANT_CONTEXT value={variant}>
      <TabsListPart {...rest} class={cnState<TabsListState>([LIST_BASE, LIST_VARIANTS[variant()]], props.class)}>
        {props.children}
      </TabsListPart>
    </VARIANT_CONTEXT>
  );
}

/** UI SDK's tab props: `value`, `disabled`. */
export type TabsTabProps = ComponentProps<typeof TabsTabPart>;

/** A tab. Selecting it shows the TabsPanel with the same `value`. */
export function TabsTab(props: TabsTabProps): JSX.Element {
  const rest = omit(props, "class");
  const variant = useContext(VARIANT_CONTEXT);

  return <TabsTabPart {...rest} class={cnState<TabsTabState>([TAB_BASE, TAB_VARIANTS[variant()]], props.class)} />;
}

/** UI SDK's tab panel props: `value`, `keepMounted`. */
export type TabsPanelProps = ComponentProps<typeof TabsPanelPart>;

/** The content of the tab with the same `value`, shown while that tab is selected. */
export function TabsPanel(props: TabsPanelProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <TabsPanelPart
      {...rest}
      class={cnState<TabsPanelState>(
        "flex-1 rounded-md text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        props.class,
      )}
    />
  );
}

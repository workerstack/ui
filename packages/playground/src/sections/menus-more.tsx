import type { JSX } from "@solidjs/web";
import { buttonClass } from "@workerstack/ui/components/button";
import {
  Menu,
  MenuContent,
  MenuEmpty,
  MenuFilter,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  MenuList,
  MenuSeparator,
  MenuTrigger,
} from "@workerstack/ui/components/menu";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example } from "../section.tsx";

const TEAMS = ["Design", "Engineering", "Marketing", "Operations", "Sales", "Support"];

/** A label, inset items that line up under it, and link items. */
export function LabelsAndLinks(): JSX.Element {
  const log = useLog();

  return (
    <Example label="Label, inset items and links">
      <Menu onAction={(value) => log("Menu", value)}>
        <MenuTrigger class={buttonClass({ variant: "outline" })}>Account</MenuTrigger>
        <MenuContent>
          <MenuLabel>Signed in as ada</MenuLabel>
          <MenuItem value="profile" inset>
            Profile
          </MenuItem>
          <MenuItem value="billing" inset>
            Billing
          </MenuItem>
          <MenuSeparator />
          <MenuLinkItem href="https://example.com/docs" target="_blank" rel="noreferrer">
            Documentation
          </MenuLinkItem>
          <MenuLinkItem href="https://example.com/support" target="_blank" rel="noreferrer">
            Support
          </MenuLinkItem>
        </MenuContent>
      </Menu>
    </Example>
  );
}

/** A menu with a search box that narrows its list, and an empty state. */
export function Filterable(): JSX.Element {
  const log = useLog();

  return (
    <Example label="Filter, list and empty state (type to narrow)">
      <Menu onAction={(value) => log("Menu team", value)}>
        <MenuTrigger class={buttonClass({ variant: "outline" })}>Teams</MenuTrigger>
        <MenuContent>
          <MenuFilter />
          <MenuList>
            <For each={TEAMS}>{(team) => <MenuItem value={team}>{team}</MenuItem>}</For>
          </MenuList>
          <MenuEmpty />
        </MenuContent>
      </Menu>
    </Example>
  );
}

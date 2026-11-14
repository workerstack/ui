import type { JSX } from "@solidjs/web";

import {
  Menu,
  MenuContent,
  MenuEmpty,
  MenuFilter,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  type MenuProps,
  MenuList,
  MenuTrigger,
} from "../index.ts";

/** A filterable menu: two groups, one item that matches by its `label`, one by an accent. */
export function ProjectMenu(props: { defaultOpen?: boolean; onAction?: MenuProps["onAction"] }): JSX.Element {
  return (
    <Menu defaultOpen={props.defaultOpen} onAction={props.onAction}>
      <MenuTrigger>Move to project</MenuTrigger>
      <MenuContent>
        <MenuFilter />
        <MenuEmpty />
        <MenuList>
          <MenuGroup data-testid="active">
            <MenuGroupLabel>Active</MenuGroupLabel>
            <MenuItem value="cafe">Café redesign</MenuItem>
            <MenuItem value="payments" label="Billing">
              Payments
            </MenuItem>
          </MenuGroup>
          <MenuGroup data-testid="archived">
            <MenuGroupLabel>Archived</MenuGroupLabel>
            <MenuItem value="onboarding">Onboarding</MenuItem>
          </MenuGroup>
        </MenuList>
      </MenuContent>
    </Menu>
  );
}

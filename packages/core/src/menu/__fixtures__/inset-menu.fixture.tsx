import type { JSX } from "@solidjs/web";

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLabel,
  MenuLinkItem,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "../index.ts";

/** Items that show a check next to items that line up with it by `inset`, and some that don't. */
export function InsetMenu(): JSX.Element {
  return (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuLabel inset>Account</MenuLabel>
        <MenuGroup>
          <MenuGroupLabel inset>View</MenuGroupLabel>
          <MenuCheckboxItem value="pin" defaultChecked>
            Pinned
          </MenuCheckboxItem>
          <MenuItem value="rename" inset>
            Rename
          </MenuItem>
          <MenuLinkItem href="#docs" inset>
            Docs
          </MenuLinkItem>
          <MenuSub>
            <MenuSubTrigger inset>Share</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem value="email">Email</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuItem value="plain" shortcut="mod+k">
            Plain
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  );
}

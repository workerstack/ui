import { Menu, type MenuProps, MenuContent, MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "../index.ts"

/** Actions with a submenu and a destructive item. */
export function FileMenu(props: { onAction?: MenuProps["onAction"] }) {
  return (
    <Menu onAction={props.onAction}>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="rename">Rename</MenuItem>
        <MenuItem value="duplicate">Duplicate</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Share</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="link">Copy link</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem value="delete" variant="destructive">
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}

import { createSignal } from "solid-js"
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../index.ts"

function FileMenu(props: { defaultOpen?: boolean }) {
  const [action, setAction] = createSignal("none")
  return (
    <div>
      <Menu defaultOpen={props.defaultOpen} onAction={(value) => setAction(String(value))}>
        <MenuTrigger>Actions</MenuTrigger>
        <MenuContent>
          <MenuItem value="rename">Rename</MenuItem>
          <MenuCheckboxItem value="pin" defaultChecked>
            Pinned
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuItem value="delete" variant="destructive">
            Delete
          </MenuItem>
        </MenuContent>
      </Menu>
      <output>{action()}</output>
    </div>
  )
}

export const MenuFixture = () => <FileMenu />
export const MenuOpenFixture = () => <FileMenu defaultOpen />

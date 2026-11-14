import { createSignal } from "solid-js"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "../index.ts"

function ShareDrawer(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = createSignal(props.defaultOpen ?? false)
  return (
    <div>
      <Drawer defaultOpen={props.defaultOpen} onOpenChange={setOpen}>
        <DrawerTrigger>Share</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Share link</DrawerTitle>
          <DrawerDescription>Anyone with the link can view.</DrawerDescription>
          <DrawerClose>Done</DrawerClose>
        </DrawerContent>
      </Drawer>
      <output>{open() ? "open" : "closed"}</output>
    </div>
  )
}

export const DrawerFixture = () => <ShareDrawer />
export const DrawerOpenFixture = () => <ShareDrawer defaultOpen />

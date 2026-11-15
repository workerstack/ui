import type { DrawerOpenChangeReason } from "@ui-sdk/solid/drawer"

import { buttonClass } from "../../button/index.ts"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerSide,
} from "../index.ts"

export type ShareDrawerProps = {
  defaultOpen?: boolean
  side?: DrawerSide
  showHandle?: boolean
  onOpenChange?: (open: boolean, details: { reason: DrawerOpenChangeReason }) => void
}

/** A drawer with every part: trigger, header, a focusable field and a footer close. */
export function ShareDrawer(props: ShareDrawerProps) {
  return (
    <Drawer defaultOpen={props.defaultOpen} side={props.side} onOpenChange={props.onOpenChange}>
      <DrawerTrigger class={buttonClass({ variant: "outline" })}>Share</DrawerTrigger>
      <DrawerContent showHandle={props.showHandle}>
        <DrawerHeader>
          <DrawerTitle>Share link</DrawerTitle>
          <DrawerDescription>Anyone with the link can view.</DrawerDescription>
        </DrawerHeader>
        <input aria-label="Link" value="https://example.com" readonly />
        <DrawerFooter>
          <DrawerClose class={buttonClass()}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

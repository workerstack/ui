import { buttonClass } from "../../button/index.ts"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../index.ts"

export interface ShareDialogProps {
  defaultOpen?: boolean
  showClose?: boolean
  onOpenChange?: (open: boolean) => void
}

/** A dialog with every part: trigger, header, a focusable field, a footer close and the corner ×. */
export function ShareDialog(props: ShareDialogProps) {
  return (
    <Dialog defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
      <DialogTrigger class={buttonClass({ variant: "outline" })}>Share</DialogTrigger>
      <DialogContent showClose={props.showClose}>
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>Anyone with the link can view.</DialogDescription>
        </DialogHeader>
        <input aria-label="Link" value="https://example.com" readonly />
        <DialogFooter>
          <DialogClose class={buttonClass()}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

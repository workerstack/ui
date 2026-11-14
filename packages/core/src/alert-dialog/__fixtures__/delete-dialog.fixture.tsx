import { buttonClass } from "../../button/index.ts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../index.ts"

export type DeleteDialogProps = {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onDelete?: () => void
}

/** An alert dialog with every part: trigger, header, a destructive action and a cancel. */
export function DeleteDialog(props: DeleteDialogProps) {
  return (
    <AlertDialog defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
      <AlertDialogTrigger class={buttonClass({ variant: "outline" })}>Delete</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete file?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep</AlertDialogCancel>
          <AlertDialogAction variant="destructive" action={props.onDelete}>
            Delete it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

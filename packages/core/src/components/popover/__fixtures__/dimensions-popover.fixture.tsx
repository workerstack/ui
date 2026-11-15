import { buttonClass } from "../../button/index.ts";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  type PopoverProps,
} from "../index.ts";

export type DimensionsPopoverProps = {
  defaultOpen?: boolean;
  onOpenChange?: PopoverProps["onOpenChange"];
};

/** A popover with every part: trigger, header, a focusable field and a close button. */
export function DimensionsPopover(props: DimensionsPopoverProps) {
  return (
    <>
      <button type="button">Before</button>
      <Popover defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}>
        <PopoverTrigger class={buttonClass({ variant: "outline" })}>Dimensions</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Set dimensions</PopoverTitle>
            <PopoverDescription>Set the size of the layer.</PopoverDescription>
          </PopoverHeader>
          <input aria-label="Width" value="100%" readonly />
          <PopoverClose class={buttonClass()}>Done</PopoverClose>
        </PopoverContent>
      </Popover>
      <button type="button">After</button>
    </>
  );
}

import type { JSX } from "@solidjs/web";
import { buttonClass } from "@workerstack/ui/components/button";
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
} from "@workerstack/ui/components/drawer";
import { For } from "solid-js";

import { useLog } from "../log.tsx";
import { Example, Section } from "../section.tsx";

const SIDES: DrawerSide[] = ["bottom", "top", "left", "right"];

function SideDrawer(props: { side: DrawerSide }): JSX.Element {
  const log = useLog();

  return (
    <Drawer side={props.side} onOpenChange={(isOpen, details) => log("Drawer", `${isOpen} ${details.reason}`)}>
      <DrawerTrigger class={buttonClass({ variant: "outline" })}>{props.side}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move goal</DrawerTitle>
          <DrawerDescription>Swipe toward the edge or press Escape to close.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose class={buttonClass()}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/** A panel that slides in from an edge. */
export function Drawers(): JSX.Element {
  return (
    <Section id="drawer" title="Drawer" description="A panel that slides in from an edge.">
      <Example label="Sides">
        <For each={SIDES}>{(side) => <SideDrawer side={side} />}</For>
      </Example>
    </Section>
  );
}

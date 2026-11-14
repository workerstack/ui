import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";

import { cn } from "../cn/index.ts";

/** A div's props; `class` is a string that wins over the part's own classes. */
export type CardPartProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  /** Extra classes; they win over the part's own. */
  class?: string;
};

/** A card's props. */
export type CardProps = CardPartProps;

/** A bordered surface that groups a header, content and a footer. */
export function Card(props: CardProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <div
      {...rest}
      data-slot="card"
      class={cn("flex flex-col gap-6 rounded-xl border bg-background py-6 text-foreground shadow-sm", props.class)}
    />
  );
}

/** The top of a card: a title and description, with an optional `CardAction` at the end. */
export function CardHeader(props: CardPartProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <div
      {...rest}
      data-slot="card-header"
      class={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        props.class,
      )}
    />
  );
}

/** What the card is about. */
export function CardTitle(props: CardPartProps): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} data-slot="card-title" class={cn("leading-none font-semibold", props.class)} />;
}

/** Muted text under the title. */
export function CardDescription(props: CardPartProps): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} data-slot="card-description" class={cn("text-sm text-muted-foreground", props.class)} />;
}

/** A control at the end of the header, such as a button or a menu. */
export function CardAction(props: CardPartProps): JSX.Element {
  const rest = omit(props, "class");

  return (
    <div
      {...rest}
      data-slot="card-action"
      class={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", props.class)}
    />
  );
}

/** The card's body. */
export function CardContent(props: CardPartProps): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} data-slot="card-content" class={cn("px-6", props.class)} />;
}

/** The bottom of a card, for actions or notes. */
export function CardFooter(props: CardPartProps): JSX.Element {
  const rest = omit(props, "class");

  return <div {...rest} data-slot="card-footer" class={cn("flex items-center px-6", props.class)} />;
}

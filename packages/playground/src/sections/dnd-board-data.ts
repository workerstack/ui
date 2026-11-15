import type { SortableMove } from "@workerstack/ui/features/dnd/sortable";

/** One column of the board. */
export type Column = { id: string; name: string };

/** The cards of each column by column id. */
export type Cards = Map<string, string[]>;

export const COLUMNS: Column[] = [
  { id: "todo", name: "To do" },
  { id: "doing", name: "In progress" },
  { id: "done", name: "Done" },
];

/** The cards before any move. */
export function boardStart(): Cards {
  return new Map([
    ["todo", ["Card 1", "Card 2"]],
    ["doing", ["Card 3"]],
    ["done", ["Card 4"]],
  ]);
}

/** The cards after a move, within a column or across two. */
export function moveCard(all: Cards, { from, to }: SortableMove): Cards {
  const source = [...(all.get(from.list) ?? [])];
  const [card] = source.splice(from.index, 1);
  const target = from.list === to.list ? source : [...(all.get(to.list) ?? [])];

  if (card !== undefined) target.splice(to.index, 0, card);

  return new Map(all).set(from.list, source).set(to.list, target);
}

import { expect, it, vi } from "vitest";

import { createLabelCache } from "./search.ts";

type Row = { id: string; name: string };

const ACME: Row = { id: "1", name: "Acme" };
const GLOBEX: Row = { id: "2", name: "Globex" };
const INITECH: Row = { id: "3", name: "Initech" };
const ROWS: Row[] = [ACME, GLOBEX, INITECH];

function byId(row: Row): string {
  return row.id;
}

it("Combobox label cache remembers searched items and resolves only the keys it has not seen", async () => {
  const resolve = vi.fn<(keys: readonly string[]) => Promise<Row[]>>((keys) =>
    Promise.resolve(ROWS.filter((row) => keys.includes(row.id))),
  );

  const cache = createLabelCache(resolve, byId);

  cache.remember([ACME]);
  expect(cache.get("1")).toStrictEqual(ACME);
  await cache.ensure(["1", "3"]);
  expect(resolve).toHaveBeenCalledWith(["3"]);
  expect(cache.get("3")).toStrictEqual(INITECH);
  await cache.ensure(["1", "3"]);
  expect(resolve).toHaveBeenCalledTimes(1);
  expect(cache.get("9")).toBeUndefined();
});

it("Combobox label cache keeps a label after a later search no longer returns it", () => {
  const cache = createLabelCache(() => Promise.resolve([]), byId);

  cache.remember([ACME, GLOBEX]);
  cache.remember([INITECH]);
  expect(cache.get("1")).toStrictEqual(ACME);
  expect(cache.get("3")).toStrictEqual(INITECH);
});

it("Combobox label cache asks for nothing when every key is known", async () => {
  const resolve = vi.fn<(keys: readonly string[]) => Promise<Row[]>>(() => Promise.resolve([]));
  const cache = createLabelCache(resolve, byId);

  cache.remember(ROWS);
  await cache.ensure(["1", "2"]);
  expect(resolve).not.toHaveBeenCalled();
});

it("Combobox label cache passes a failed resolve on and keeps what it had", async () => {
  const cache = createLabelCache(() => Promise.reject(new Error("offline")), byId);

  cache.remember([ACME]);
  await expect(cache.ensure(["1", "2"])).rejects.toThrow("offline");
  expect(cache.get("1")).toStrictEqual(ACME);
});

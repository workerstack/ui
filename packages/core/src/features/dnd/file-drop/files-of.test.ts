import { describe, expect, it } from "vitest";

import type { DroppedItems } from "./file-drop.types.ts";
import { filesOf } from "./files-of.ts";

/** A DataTransfer stand-in: browsers can't put a folder into a synthetic one. */
function transfer(items: { kind: string; name: string; isFolder?: boolean }[]): DroppedItems {
  return {
    items: items.map((item) => ({
      getAsFile: () => (item.kind === "file" ? new File([], item.name) : null),
      kind: item.kind,
      webkitGetAsEntry: () => ({ isDirectory: item.isFolder === true }),
    })),
  };
}

describe("filesOf", () => {
  it("keeps files and leaves out folders and strings", () => {
    const data = transfer([
      { kind: "file", name: "a.png" },
      { isFolder: true, kind: "file", name: "photos" },
      { kind: "string", name: "text" },
      { kind: "file", name: "b.pdf" },
    ]);

    expect(filesOf(data).map((file) => file.name)).toStrictEqual(["a.png", "b.pdf"]);
  });

  it("is empty for a drop of only folders", () => {
    expect(filesOf(transfer([{ isFolder: true, kind: "file", name: "photos" }]))).toStrictEqual([]);
  });
});

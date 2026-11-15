import { FILE } from "./file-drop.constants.ts";
import type { DroppedItems } from "./file-drop.types.ts";

/** The files of a drop: folders are left out. */
export function filesOf(data: DroppedItems): File[] {
  return [...data.items].flatMap((item) => {
    if (item.kind !== FILE || item.webkitGetAsEntry?.()?.isDirectory === true) return [];
    const file = item.getAsFile();

    return file === null ? [] : [file];
  });
}

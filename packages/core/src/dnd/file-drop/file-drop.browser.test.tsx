import { afterEach, expect, it } from "vitest";

import { FileDropPage, filesTransfer, fireDrag, textTransfer } from "../__fixtures__/file-drop-page.fixture.tsx";
import { DIRECTIONS, mount, unmount } from "../__fixtures__/mount.fixture.ts";
import { byTestId, order } from "../__fixtures__/page.fixture.ts";

afterEach(unmount);

/** The file drop page's state: files over the window, and over the zone. */
function state(): string {
  return `${byTestId("dragging").textContent}/${byTestId("over").textContent}`;
}

it.each(DIRECTIONS)("createFileDrop tracks the window and the zone, then drops the files (%s)", async (dir) => {
  await mount(() => <FileDropPage />, dir);
  const transfer = filesTransfer(["a.png", "b.pdf"]);
  const zone = byTestId("zone");
  fireDrag(byTestId("outside"), "dragenter", transfer);

  await expect.poll(state).toBe("true/false");
  fireDrag(zone, "dragenter", transfer);
  expect(fireDrag(zone, "dragover", transfer)).toBe(true);
  await expect.poll(state).toBe("true/true");
  expect(zone.hasAttribute("data-over")).toBe(true);
  fireDrag(byTestId("outside"), "dragleave", transfer);
  expect(fireDrag(zone, "drop", transfer)).toBe(true);
  await expect.poll(() => order("files")).toBe("a.png,b.pdf");
  expect(state()).toBe("false/false");
});

it.each(DIRECTIONS)("createFileDrop resets its state when the files leave the window (%s)", async (dir) => {
  await mount(() => <FileDropPage />, dir);
  const transfer = filesTransfer(["a.png"]);
  const zone = byTestId("zone");
  fireDrag(byTestId("outside"), "dragenter", transfer);
  fireDrag(zone, "dragenter", transfer);
  fireDrag(zone, "dragover", transfer);

  await expect.poll(state).toBe("true/true");
  fireDrag(byTestId("outside"), "dragleave", transfer);
  fireDrag(zone, "dragleave", transfer);
  await expect.poll(state).toBe("false/false");
});

it.each(DIRECTIONS)("createFileDrop never lets a stray drop or a disabled zone open the file (%s)", async (dir) => {
  await mount(() => <FileDropPage />, dir);
  const url = location.href;
  const transfer = filesTransfer(["a.png"]);
  const outside = byTestId("outside");
  const disabled = byTestId("disabled-zone");
  fireDrag(outside, "dragenter", transfer);

  expect(fireDrag(outside, "dragover", transfer)).toBe(true);
  expect(fireDrag(disabled, "dragover", transfer)).toBe(true);
  expect(fireDrag(disabled, "drop", transfer)).toBe(true);
  fireDrag(outside, "dragenter", transfer);
  expect(fireDrag(outside, "drop", transfer)).toBe(true);
  expect(order("files")).toBe("");
  expect(location.href).toBe(url);
});

it.each(DIRECTIONS)("createFileDrop leaves native file inputs and text drags alone (%s)", async (dir) => {
  await mount(() => <FileDropPage />, dir);
  const transfer = filesTransfer(["a.png"]);
  const native = byTestId("native");
  fireDrag(native, "dragenter", transfer);

  expect(fireDrag(native, "dragover", transfer)).toBe(false);
  expect(fireDrag(native, "drop", transfer)).toBe(false);
  const text = textTransfer("hello");
  const zone = byTestId("zone");
  fireDrag(zone, "dragenter", text);
  expect(fireDrag(zone, "dragover", text)).toBe(false);
  expect(state()).toBe("false/false");
});

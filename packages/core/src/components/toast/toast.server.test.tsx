import { expect, it } from "vitest";

import { renderServer, slot, slots } from "../../test/server.ts";
import { ToastDemo } from "./__fixtures__/toast-demo.fixture.tsx";

it("Toast on the server renders its empty region and list without warnings", () => {
  const { html, warnings } = renderServer(() => <ToastDemo />);
  const region = slot(html, "toast-region");
  expect(region.name).toBe("section");
  expect(region.attrs["data-side"]).toBe("bottom");
  expect(region.attrs["data-align"]).toBe("end");
  expect(region.attrs.class).toContain("pointer-events-none");
  expect(region.attrs).not.toHaveProperty("role");
  expect(slot(html, "toast-list").name).toBe("ol");
  expect(slots(html, "toast")).toStrictEqual([]);
  expect(warnings).toStrictEqual([]);
});

it("Toast on the server puts the region at the top when asked", () => {
  const { html } = renderServer(() => <ToastDemo side="top" />);
  expect(slot(html, "toast-region").attrs["data-side"]).toBe("top");
});

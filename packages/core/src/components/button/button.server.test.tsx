import { renderServer, tag } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { required } from "../../test/required.ts";
import { Button } from "./index.ts";

it("Button on the server renders a type=button with its variant and size classes", () => {
  const { html, warnings } = renderServer(() => (
    <Button variant="outline" size="sm">
      Save
    </Button>
  ));

  const button = tag(html, { "data-slot": "button" });
  expect(button.name).toBe("button");
  expect(button.attrs.type).toBe("button");
  expect(button.attrs.class).toContain("border-input");
  expect(button.attrs.class).toContain("h-8");
  expect(html).toContain(">Save</span></button>");
  expect(warnings).toStrictEqual([]);
});

it("Button on the server renders disabled as disabled, aria-disabled and data-disabled", () => {
  const { html } = renderServer(() => <Button disabled>Save</Button>);
  const button = tag(html, { "data-slot": "button" });
  expect(button.attrs).toHaveProperty("disabled");
  expect(button.attrs["aria-disabled"]).toBe("true");
  expect(button.attrs).toHaveProperty("data-disabled");
});

it("Button on the server merges the consumer's class over its own", () => {
  const { html } = renderServer(() => <Button class="h-12 px-8">Big</Button>);
  const classes = required(tag(html, { "data-slot": "button" }).attrs.class, "a class").split(" ");
  expect(classes).toContain("h-12");
  expect(classes).not.toContain("h-9");
  expect(classes).not.toContain("px-4");
});

it("Button on the server resolves a class that is a function of its state", () => {
  const { html } = renderServer(() => (
    <Button class={(state) => (state.pending ? "is-pending" : "is-idle")}>Save</Button>
  ));

  expect(tag(html, { "data-slot": "button" }).attrs.class).toContain("is-idle");
});

it("Button on the server renders loading as busy and disabled, with its spinner shown", () => {
  const { html } = renderServer(() => <Button loading>Save</Button>);
  const button = tag(html, { "data-slot": "button" });
  expect(button.attrs["aria-busy"]).toBe("true");
  expect(button.attrs).toHaveProperty("disabled");
  const spinner = tag(html, { "data-slot": "button-spinner" });
  expect(spinner.attrs["aria-label"]).toBe("Loading");
});

it("Button on the server renders no spinner when it is not loading", () => {
  const { html } = renderServer(() => <Button>Save</Button>);
  expect(html).not.toContain("button-spinner");
  expect(tag(html, { "data-slot": "button" }).attrs).not.toHaveProperty("aria-busy");
});

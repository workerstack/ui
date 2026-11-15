import { renderServer, tag, tags } from "@workerstack/testing/web/solid";
import { expect, it } from "vitest";

import { required } from "../../test/required.ts";
import { Input, InputClear, InputGroup } from "./index.ts";

it("Input on the server renders the value and its styles", () => {
  const { html, warnings } = renderServer(() => <Input aria-label="Name" defaultValue="Ada" placeholder="Your name" />);

  const input = tag(html, { "data-slot": "input" });
  expect(input.name).toBe("input");
  expect(input.attrs.value).toBe("Ada");
  expect(input.attrs.placeholder).toBe("Your name");
  expect(input.attrs).toHaveProperty("data-filled");
  expect(input.attrs.class).toContain("rounded-md");
  expect(warnings).toStrictEqual([]);
});

it("Input on the server leaves data-filled off an empty input", () => {
  const { html } = renderServer(() => <Input aria-label="Name" />);
  expect(tag(html, { "data-slot": "input" }).attrs).not.toHaveProperty("data-filled");
});

it("Input on the server merges the consumer's class over its own", () => {
  const { html } = renderServer(() => <Input aria-label="Name" class="h-12" />);
  const classes = required(tag(html, { "data-slot": "input" }).attrs.class, "a class").split(" ");
  expect(classes).toContain("h-12");
  expect(classes).not.toContain("h-9");
});

it("InputGroup on the server renders a group around its input", () => {
  const { html, warnings } = renderServer(() => (
    <InputGroup>
      <Input aria-label="Search" defaultValue="solid" />
      <InputClear aria-label="Clear search" />
    </InputGroup>
  ));

  expect(tag(html, { "data-slot": "input-group" }).attrs.class).toContain("has-[input:focus-visible]:ring-3");
  expect(tag(html, { "data-slot": "input" }).attrs.value).toBe("solid");
  expect(warnings).toStrictEqual([]);
});

// UI SDK 0.1.0-beta.2 renders InputClear only once the group is connected, after mount, so the
// server HTML has no clear button and it appears on hydration. When this passes, drop `.fails`.
it.fails("InputGroup on the server renders the clear button of a filled group", () => {
  const { html } = renderServer(() => (
    <InputGroup>
      <Input aria-label="Search" defaultValue="solid" />
      <InputClear aria-label="Clear search" />
    </InputGroup>
  ));

  expect(tags(html, { "data-slot": "input-clear" })).toHaveLength(1);
});

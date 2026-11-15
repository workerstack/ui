import { cleanup, render, screen } from "@solidjs/testing-library";
import { recordWarnings } from "@workerstack/testing/web/solid";
import { createSignal, flush } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { inputElement, mounted } from "../../../../test/dom.ts";
import { captured, settle, typeInto } from "../form/__fixtures__/form-testing.ts";
import type { FormEngine, FormValues } from "../form/index.ts";
import { ProfileForm } from "./__fixtures__/profile-form.fixture.tsx";
import { discardChanges, rebaseForm } from "./index.ts";

afterEach(cleanup);

function box(name: string): HTMLInputElement {
  return inputElement(screen.getByRole("textbox", { name }));
}

function isChanged(): boolean {
  return screen.queryByText("Unsaved changes") !== null;
}

async function renderProfile(): Promise<FormEngine> {
  const engine = captured<FormEngine>();
  render(() => <ProfileForm keep={engine.set} />);
  await mounted();

  return engine.get();
}

it("rebaseForm takes arrived values as the start: untouched paths fill in, with no unsaved change", async () => {
  const engine = await renderProfile();
  rebaseForm(engine, { email: "ada@example.com", name: "Ada" });
  await settle();
  expect([box("Name").value, box("Email").value]).toStrictEqual(["Ada", "ada@example.com"]);
  expect(isChanged()).toBe(false);
});

it("rebaseForm keeps what the person edited, now compared with the new start", async () => {
  const engine = await renderProfile();
  typeInto(box("Name"), "Grace");
  rebaseForm(engine, { email: "ada@example.com", name: "Ada" });
  await settle();
  expect([box("Name").value, box("Email").value]).toStrictEqual(["Grace", "ada@example.com"]);
  expect(isChanged()).toBe(true);
  typeInto(box("Name"), "Ada");
  await settle();
  expect(isChanged()).toBe(false);
});

it("rebaseForm touches only the paths it is given and keeps field state", async () => {
  const engine = await renderProfile();
  typeInto(box("Email"), "x@example.com");
  rebaseForm(engine, { name: "Ada" });
  await settle();
  expect(engine.form.getFieldMeta("email")?.isTouched).toBe(true);
  expect(box("Email").value).toBe("x@example.com");
});

it("rebaseForm with keepEdited off replaces edited paths too", async () => {
  const engine = await renderProfile();
  typeInto(box("Name"), "Grace");
  rebaseForm(engine, { name: "Ada" }, { keepEdited: false });
  await settle();
  expect(box("Name").value).toBe("Ada");
  expect(isChanged()).toBe(false);
});

it("discardChanges puts the form back where it starts from", async () => {
  const engine = await renderProfile();
  rebaseForm(engine, { name: "Ada" });
  typeInto(box("Name"), "Grace");
  typeInto(box("Email"), "g@example.com");
  discardChanges(engine);
  await settle();
  expect([box("Name").value, box("Email").value]).toStrictEqual(["Ada", ""]);
  expect(isChanged()).toBe(false);
});

it("FormArrivingValues rebases as values load, keeps edits, and logs no Solid warning", async () => {
  const [values, setValues] = createSignal<FormValues | undefined>(undefined, { ownedWrite: true });
  render(() => <ProfileForm arriving={values()} />);
  await mounted();
  typeInto(box("Email"), "mine@example.com");

  const { warnings } = recordWarnings(() => {
    setValues({ email: "server@example.com", name: "Ada" });
    flush();
  });

  await settle();
  expect(warnings).toStrictEqual([]);
  expect([box("Name").value, box("Email").value]).toStrictEqual(["Ada", "mine@example.com"]);
});

it("FormArrivingValues replaces the person's edits when values for another record arrive", async () => {
  const [record, setRecord] = createSignal({ id: 1, values: { name: "Ada" } }, { ownedWrite: true });
  render(() => <ProfileForm arriving={record().values} record={record().id} />);
  await mounted();
  await settle();
  typeInto(box("Name"), "Grace");
  setRecord({ id: 2, values: { name: "Linus" } });
  await settle();
  expect(box("Name").value).toBe("Linus");
  expect(isChanged()).toBe(false);
});

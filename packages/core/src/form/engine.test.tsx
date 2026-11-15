import { cleanup, render } from "@solidjs/testing-library";
import { createForm, useStore } from "@tanstack/solid-form";
import { createSignal, flush, For, Show } from "solid-js";
import { afterEach, expect, it } from "vitest";

import { mounted } from "../test/dom.ts";
import { collectWarnings } from "../test/warnings.ts";
import { captured, deferred, settle, type Captured } from "./__fixtures__/form-testing.ts";
import { formText } from "./__fixtures__/form-text.fixture.tsx";
import { AccountForm } from "./__fixtures__/form.fixture.tsx";
import { Form } from "./index.ts";

// The engine's contract with TanStack on Solid 2: fields mount, unmount and come and go with array
// rows without a Solid warning, and the form store behaves as the engine reads it.

afterEach(cleanup);

/** A tags form whose rows are fields, for the row tests. */
function tagsForm() {
  return createForm(() => ({ defaultValues: { tags: ["a"] } }));
}

it("Form unmounts with its subscribed fields and logs no Solid owner warning", async () => {
  const { unmount } = render(() => <AccountForm />);
  await mounted();
  await settle();

  const { warnings } = collectWarnings(() => {
    unmount();
    flush();
  });

  expect(warnings).toStrictEqual([]);
});

it("Form removes a subscribed field while it stays mounted and logs no Solid owner warning", async () => {
  const [isShown, setShown] = createSignal(true, { ownedWrite: true });
  render(() => {
    const form = createForm(() => ({ defaultValues: { name: "Ada" } }));

    return (
      <Form form={form}>
        <Show when={isShown()}>
          <formText.Root form={form} name="name">
            <formText.Label>Name</formText.Label>
            <formText.Control />
          </formText.Root>
        </Show>
      </Form>
    );
  });
  await mounted();

  const { warnings } = collectWarnings(() => {
    setShown(false);
    flush();
  });

  await settle();
  expect(warnings).toStrictEqual([]);
});

it("formText.Root unmounts an array row's field when its row is removed, without warnings", async () => {
  const form = captured<ReturnType<typeof tagsForm>>();

  const { container } = render(() => {
    const made = form.set(tagsForm());
    const tags = useStore(made.store, (state) => state.values.tags);

    return (
      <For each={tags()}>
        {(_, index) => (
          <formText.Root form={made} name={`tags[${index()}]`} readOnly>
            <formText.Control />
          </formText.Root>
        )}
      </For>
    );
  });

  form.get().pushFieldValue("tags", "research");
  flush();

  const { warnings } = collectWarnings(() => {
    void form.get().removeFieldValue("tags", 0);
    flush();
  });

  await settle();
  expect(container.textContent).toBe("research");
  expect(warnings).toStrictEqual([]);
});

/** A tags form with a late field (shown once `isShown`) and a field per row. */
function LateTagsForm(props: { isShown: () => boolean; form: Captured<ReturnType<typeof tagsForm>> }) {
  const made = props.form.set(tagsForm());
  const tags = useStore(made.store, (state) => state.values.tags);

  return (
    <Form form={made}>
      <Show when={props.isShown()}>
        <formText.Root form={made} name="tags[0]">
          <formText.Control />
        </formText.Root>
      </Show>
      <For each={tags()}>
        {(_, index) => (
          <formText.Root form={made} name={`tags[${index()}]`}>
            <formText.Control />
          </formText.Root>
        )}
      </For>
    </Form>
  );
}

it("formText.Root mounts a late field and a pushed array row's field without warnings", async () => {
  const [isShown, setShown] = createSignal(false, { ownedWrite: true });
  const form = captured<ReturnType<typeof tagsForm>>();

  const { warnings } = collectWarnings(() => {
    render(() => <LateTagsForm isShown={isShown} form={form} />);
    flush();
    setShown(true);
    flush();
    form.get().pushFieldValue("tags", "b");
    flush();
  });

  await settle();
  expect(document.querySelectorAll("input")).toHaveLength(3);
  expect(warnings).toStrictEqual([]);
});

it("createForm keeps a field's server error through handleChange, so the bound field retires it", async () => {
  const form = captured<ReturnType<typeof tagsForm>>();

  const { container } = render(() => {
    const made = form.set(tagsForm());

    return <made.Field name="tags[0]">{(field) => <i>{field().state.meta.errors.join(",")}</i>}</made.Field>;
  });

  form.get().setFieldMeta("tags[0]", (meta) => ({ ...meta, errorMap: { ...meta.errorMap, onServer: "Taken." } }));
  flush();
  form.get().setFieldValue("tags[0]", "b");
  await settle();
  expect(container.textContent).toBe("Taken.");
});

it("createForm follows the submitting lifecycle and counts attempts", async () => {
  const release = deferred();
  const form = captured<ReturnType<typeof tagsForm>>();

  const { container } = render(() => {
    const made = form.set(createForm(() => ({ defaultValues: { tags: ["a"] }, onSubmit: () => release.promise })));
    const submitting = useStore(made.store, (state) => state.isSubmitting);
    const attempts = useStore(made.store, (state) => state.submissionAttempts);

    return <i>{`${String(submitting())}|${String(attempts())}`}</i>;
  });

  expect(container.textContent).toBe("false|0");
  const done = form.get().handleSubmit();
  await settle();
  expect(container.textContent).toBe("true|1");
  release.resolve();
  await done;
  await settle();
  expect(container.textContent).toBe("false|1");
});

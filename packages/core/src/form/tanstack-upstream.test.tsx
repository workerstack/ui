import { render } from "@solidjs/testing-library";
import { createField, createForm } from "@tanstack/solid-form";
import { createSignal, flush, For } from "solid-js";
import { expect, it } from "vitest";

import { collectWarnings } from "../test/warnings.ts";

// Pins for TanStack's own bugs (docs/upstream/tanstack-form.md). Each `it.fails` passes once fixed.

/** A text box bound straight to TanStack's createField, with no engine around it. */
function RawField(props: { form: ReturnType<typeof tagsForm>; name: `tags[${number}]` }) {
  const field = createField(() => ({ form: props.form, name: props.name }));

  return <input value={field().state.value} />;
}

function tagsForm(tags: string[] = ["a"]) {
  return createForm(() => ({ defaultValues: { tags } }));
}

/** One raw field per tag, named by its row's reactive index. */
function RawRows() {
  const form = tagsForm();

  return <For each={["a"]}>{(_, index) => <RawField form={form} name={`tags[${index()}]`} />}</For>;
}

it.fails("createField reads its options without a Solid warning when a field's name is reactive (TF-5)", () => {
  const { warnings } = collectWarnings(() => {
    render(() => <RawRows />);
    flush();
  });

  expect(warnings).toStrictEqual([]);
});

/** A raw field on a form whose default values follow `tags`. */
function ReactiveDefaults(props: { tags: () => string[] }) {
  const form = createForm(() => ({ defaultValues: { tags: props.tags() } }));

  return <RawField form={form} name="tags[0]" />;
}

it.fails("useStore follows a store change made inside an effect without a Solid warning (TF-4)", () => {
  const [tags, setTags] = createSignal(["a"], { ownedWrite: true });

  const { warnings } = collectWarnings(() => {
    render(() => <ReactiveDefaults tags={tags} />);
    flush();
    setTags(["b"]);
    flush();
  });

  expect(warnings).toStrictEqual([]);
});

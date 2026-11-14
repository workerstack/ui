import { expect, it, vi } from "vitest";

import { cleanOnBlur } from "./index.ts";

function blur<Element extends HTMLInputElement | HTMLTextAreaElement>(
  element: Element,
  handler: (event: { currentTarget: Element }) => void,
): void {
  handler({ currentTarget: element });
}

function trim(text: string): string {
  return text.trim();
}

it("stores cleaned text in an input as an edit, then calls onBlur", () => {
  const input = document.createElement("input");
  const onInput = vi.fn<(event: Event) => void>();
  const onBlur = vi.fn<() => void>();

  input.value = "  a ";
  input.addEventListener("input", onInput);
  blur(input, cleanOnBlur({ clean: trim, onBlur }));

  expect(input.value).toBe("a");
  expect(onInput).toHaveBeenCalledTimes(1);
  expect(onInput.mock.calls[0]?.[0].bubbles).toBe(true);
  expect(onBlur).toHaveBeenCalledTimes(1);
});

it("stores cleaned text in a textarea", () => {
  const textarea = document.createElement("textarea");
  const onInput = vi.fn<() => void>();

  textarea.value = "\n\nline\n\n";
  textarea.addEventListener("input", onInput);
  blur(textarea, cleanOnBlur({ clean: trim, onBlur: undefined }));

  expect(textarea.value).toBe("line");
  expect(onInput).toHaveBeenCalledTimes(1);
});

it("fires no edit when the text is already clean", () => {
  const input = document.createElement("input");
  const onInput = vi.fn<() => void>();
  const onBlur = vi.fn<() => void>();

  input.value = "a";
  input.addEventListener("input", onInput);
  blur(input, cleanOnBlur({ clean: trim, onBlur }));

  expect(onInput).not.toHaveBeenCalled();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

it("leaves a read-only control as it is but still calls onBlur", () => {
  const input = document.createElement("input");
  const onInput = vi.fn<() => void>();
  const onBlur = vi.fn<() => void>();

  input.value = " a ";
  input.readOnly = true;
  input.addEventListener("input", onInput);
  blur(input, cleanOnBlur({ clean: trim, onBlur }));

  expect(input.value).toBe(" a ");
  expect(onInput).not.toHaveBeenCalled();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

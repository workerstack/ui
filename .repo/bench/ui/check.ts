import { ARIA_TRUE, POLL_MS, POLLS } from "./bench.constants.ts";
import type { Expected, Labels } from "./expect.ts";

// Bundled into the client entry: these run in the page, on the DOM the candidate rendered.

function shown(element: Element): boolean {
  return element.checkVisibility({ visibilityProperty: true }) && element.closest('[aria-hidden="true"]') === null;
}

function closedProblems(expected: Expected): string[] {
  const text = document.body.innerText;
  const problems = expected.shown.filter((item) => !text.includes(item)).map((item) => `page lacks "${item}"`);

  for (const item of expected.hidden) if (text.includes(item)) problems.push(`page shows "${item}" while closed`);

  for (const [selector, count] of expected.counts) {
    const found = [...document.querySelectorAll(selector)].filter((element) => shown(element)).length;

    if (found !== count) problems.push(`page shows ${found} of ${selector}, want ${count}`);
  }

  return problems;
}

function pause(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, POLL_MS);
  });
}

async function until(condition: () => boolean, attempt = 0): Promise<boolean> {
  if (condition()) return true;

  if (attempt >= POLLS) return false;

  await pause();

  return until(condition, attempt + 1);
}

function byText(selector: string, text: string): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(selector)].find((element) => element.textContent.trim() === text);
}

function showing(text: string): () => boolean {
  return () => document.body.innerText.includes(text);
}

async function interactionProblems(labels: Labels): Promise<string[]> {
  const problems: string[] = [];
  const checkbox = document.querySelector<HTMLElement>("[role=checkbox]");

  checkbox?.click();

  const checked = await until(() => checkbox?.getAttribute("aria-checked") === ARIA_TRUE);

  if (!checked) problems.push("checkbox did not check");

  byText("[role=tab]", labels.tab)?.click();

  if (!(await until(showing(labels.panel)))) problems.push("tab did not show its panel");

  byText("button", labels.toastTrigger)?.click();

  if (!(await until(showing(labels.toast)))) problems.push("toast did not show");

  return problems;
}

/** What the closed app shows wrong, then what did not react to a click on the checkbox, a tab and the toast. */
export async function check(expected: Expected, labels: Labels): Promise<string[]> {
  const closed = closedProblems(expected);
  const interactions = await interactionProblems(labels);

  return [...closed, ...interactions];
}

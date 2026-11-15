import { TEXT } from "./content.ts";

/** What the closed app must show, must not show, and how many of each part it shows. */
export type Expected = { counts: [selector: string, count: number][]; hidden: string[]; shown: string[] };

/** What the in-page interactions click and wait for. */
export type Labels = { panel: string; tab: string; toast: string; toastTrigger: string };

/** Text the closed app shows, and text it must not show until a part opens. */
export const EXPECTED: Expected = {
  counts: [
    ["[role=checkbox]", 1],
    ["[role=switch]", 1],
    ["[role=tab]", 3],
    ["[role=tabpanel]", 1],
    ["input:not([type]), input[type=text]", 2],
    ["[role=dialog], [role=alertdialog]", 0],
    ["[role=menu], [role=menuitem]", 0],
    ["[role=listbox], [role=option]", 0],
    ["[role=tooltip]", 0],
  ],
  hidden: [
    "Billing content",
    "Usage content",
    TEXT.dialogTitle,
    TEXT.popoverTitle,
    TEXT.tooltip,
    "Rename",
    "Duplicate",
    "Editor",
    "Owner",
    "Apple",
    "Banana",
    TEXT.toast,
  ],
  shown: [
    TEXT.button,
    TEXT.checkbox,
    TEXT.switch,
    "Overview",
    "Billing",
    "Usage",
    "Overview content",
    TEXT.dialogTrigger,
    TEXT.popoverTrigger,
    TEXT.tooltipTrigger,
    TEXT.menuTrigger,
    TEXT.select,
    "Viewer",
    TEXT.combobox,
    TEXT.textField,
    TEXT.toastTrigger,
  ],
};

export const LABELS: Labels = {
  panel: "Billing content",
  tab: "Billing",
  toast: TEXT.toast,
  toastTrigger: TEXT.toastTrigger,
};

const SERVER_PARTS: [needle: string, count: number][] = [
  ['role="checkbox"', 1],
  ['role="switch"', 1],
  ['role="tab"', 3],
];

/** What is wrong with the server's HTML: missing text, or the wrong number of a part. */
export function serverProblems(html: string): string[] {
  const problems = EXPECTED.shown.filter((text) => !html.includes(text)).map((text) => `server HTML lacks "${text}"`);

  for (const [needle, count] of SERVER_PARTS) {
    const found = html.split(needle).length - 1;

    if (found !== count) problems.push(`server HTML has ${found} ${needle}, want ${count}`);
  }

  return problems;
}

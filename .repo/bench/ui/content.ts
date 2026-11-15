/** One labelled choice in a select or a combobox. */
export type Choice = { label: string; value: string };

/** One tab and the panel it shows. */
export type Section = { content: string; label: string; value: string };

/** The select's roles; the first is chosen. */
export const ROLES: Choice[] = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Owner", value: "owner" },
];

/** The combobox's fruits; none is chosen. */
export const FRUITS: Choice[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
  { label: "Orange", value: "orange" },
];

/** The tabs; the first is selected. */
export const SECTIONS: Section[] = [
  { content: "Overview content", label: "Overview", value: "overview" },
  { content: "Billing content", label: "Billing", value: "billing" },
  { content: "Usage content", label: "Usage", value: "usage" },
];

/** The menu's actions. */
export const ACTIONS: string[] = ["Rename", "Duplicate", "Delete"];

/** Every string each candidate's app renders, so the three apps show the same content. */
export const TEXT = {
  button: "Save",
  checkbox: "Accept terms",
  combobox: "Fruit",
  comboboxPlaceholder: "Pick a fruit",
  dialogBody: "Anyone with the link can view.",
  dialogClose: "Done",
  dialogTitle: "Share link",
  dialogTrigger: "Open dialog",
  menuTrigger: "Actions",
  popoverBody: "Set the size of the layer.",
  popoverTitle: "Set dimensions",
  popoverTrigger: "Open popover",
  select: "Role",
  switch: "Notifications",
  tabs: "Project",
  textField: "Name",
  toast: "Saved",
  toastTrigger: "Show toast",
  tooltip: "Save your changes",
  tooltipTrigger: "Hover me",
} as const;

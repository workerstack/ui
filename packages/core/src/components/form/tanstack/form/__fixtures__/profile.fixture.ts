import type { JSX } from "@solidjs/web";

import type { FormFor } from "../index.ts";

// The values and options of the profile form the field tests render: one field per control field.

/** A role the Role select offers. */
export type Role = "viewer" | "editor" | "admin";

/** A fruit the Fruit combobox offers. */
export type Fruit = "apple" | "banana" | "cherry";

/** A tag the Tags combobox offers. */
export type Tag = "bug" | "design" | "feature";

/** The profile's values. */
export type Profile = {
  name: string;
  bio: string;
  site: string;
  note: string;
  terms: boolean;
  alerts: boolean;
  toppings: string[];
  plan: string | null;
  role: Role | null;
  fruit: Fruit | null;
  tags: Tag[];
};

/** What every field of the profile form takes. */
export type ProfileFieldProps = {
  /** The profile form. */
  form: FormFor<Profile>;
};

/** A field (or a few) of the profile form, as one folder's fixture renders it. */
export type ProfileField = (props: ProfileFieldProps) => JSX.Element;

/** The Role select's options. */
export const ROLES: { value: Role; label: string }[] = [
  { label: "Viewer", value: "viewer" },
  { label: "Editor", value: "editor" },
  { label: "Admin", value: "admin" },
];

/** The Fruit combobox's items. */
export const FRUITS: { value: Fruit; label: string }[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

/** The Tags combobox's items. */
export const TAGS: { value: Tag; label: string }[] = [
  { label: "Bug", value: "bug" },
  { label: "Design", value: "design" },
  { label: "Feature", value: "feature" },
];

/** The Toppings group's options. */
export const TOPPINGS: { value: string; label: string }[] = [
  { label: "Cheese", value: "cheese" },
  { label: "Ham", value: "ham" },
];

/** The Plan group's options. */
export const PLANS: { value: string; label: string }[] = [
  { label: "Free", value: "free" },
  { label: "Pro", value: "pro" },
];

/** An empty profile. */
export const EMPTY_PROFILE: Profile = {
  alerts: false,
  bio: "",
  fruit: null,
  name: "",
  note: "",
  plan: null,
  role: null,
  site: "",
  tags: [],
  terms: false,
  toppings: [],
};

/** A filled profile, every field valid. */
export const FILLED_PROFILE: Profile = {
  alerts: true,
  bio: "Wrote the first program.",
  fruit: "banana",
  name: "Ada",
  note: "Met at the lab.",
  plan: "pro",
  role: "admin",
  site: "ada.dev",
  tags: ["bug", "design"],
  terms: true,
  toppings: ["ham"],
};

/** Each field's error when it is left empty, in page order. */
export const PROFILE_ERRORS = {
  name: "Enter your name.",
  bio: "Write a bio.",
  site: "Enter your site.",
  note: "Write a note.",
  terms: "Accept the terms.",
  alerts: "Turn on alerts.",
  toppings: "Pick a topping.",
  plan: "Pick a plan.",
  role: "Pick a role.",
  fruit: "Pick a fruit.",
  tags: "Pick a tag.",
} as const;

/** A change validator: `message` while `isEmpty` says the value is missing. */
export function needs<TValue>(isEmpty: (value: TValue) => boolean, message: string) {
  return ({ value }: { value: TValue }): string | undefined => (isEmpty(value) ? message : undefined);
}

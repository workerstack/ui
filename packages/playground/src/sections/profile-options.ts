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
  role: string | null;
  fruit: string | null;
  tags: string[];
};

type Option = { value: string; label: string };

/** The profile form's empty values and the options its choice and list fields offer. */
type ProfileOptions = {
  empty: Profile;
  fruits: Option[];
  plans: Option[];
  roles: Option[];
  tags: Option[];
  toppings: Option[];
};

/** The option lists the profile form's choice and list fields offer, and its empty values. */
export const profileOptions: ProfileOptions = {
  empty: {
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
  },
  fruits: [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ],
  plans: [
    { label: "Free", value: "free" },
    { label: "Pro", value: "pro" },
  ],
  roles: [
    { label: "Viewer", value: "viewer" },
    { label: "Editor", value: "editor" },
    { label: "Admin", value: "admin" },
  ],
  tags: [
    { label: "Bug", value: "bug" },
    { label: "Design", value: "design" },
    { label: "Feature", value: "feature" },
  ],
  toppings: [
    { label: "Cheese", value: "cheese" },
    { label: "Ham", value: "ham" },
  ],
};

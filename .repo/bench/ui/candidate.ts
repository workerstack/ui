/** One library under test. */
export type Candidate = {
  /** The folder its imports resolve from: its node_modules give the library and its Solid. */
  from: string;
  /** What its kit module (`<name>-kit.tsx`) exports the kit as. */
  kit: string;
  name: string;
  /** Builds the library first, when its package is used from its build output. */
  prepare?: () => void;
};

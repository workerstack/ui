import type { JSX } from "@solidjs/web";

import type { FieldDescriptionProps, FieldLabelProps, FieldsetLegendProps } from "../field/index.ts";
import type { BoundField } from "./bound-field-types.ts";
import type { ModuleErrorProps } from "./field-module-error.tsx";
import type { FieldRoot } from "./field-module-types.ts";

/** Renders a module's part from its props and the enclosing Root's field. */
export type PartRender<TProps, TWrites, TShows, TRootData = unknown> = (
  props: TProps,
  field: BoundField<TWrites, TShows, TRootData>,
) => JSX.Element;

/** What `defineFieldModule` takes. */
export type FieldModuleOptions<TShows> = {
  /** The module's name, as apps import it (`textInputField`): errors name it. */
  name: string;
  /** What the control shows while the field is unset. */
  empty: TShows;
  /** The control and its label on one row, the description and error under the label (a checkbox). */
  inline?: true;
};

/** What a module's `control` takes besides its render. */
export type ControlOptions<TProps> = {
  /** What the Control renders while read-only, with the same props. */
  view?: (props: TProps) => JSX.Element;
  /** The part's name in errors. @default "Control" */
  part?: string;
};

/** A field module: its Root and parts, and the builders of its own. */
export type FieldModule<TWrites, TShows = TWrites, TRootData = object> = {
  /** The module's name. */
  readonly name: string;
  /** The Root: a Field bound to one field of the form. */
  readonly Root: FieldRoot<TWrites, TShows, TRootData>;
  /** The field's label. */
  readonly Label: (props: FieldLabelProps) => JSX.Element;
  /** The field's description. */
  readonly Description: (props: FieldDescriptionProps) => JSX.Element;
  /** The field's messages, by the error rule; "Checking…" while an async check runs. */
  readonly Error: (props: ModuleErrorProps) => JSX.Element;
  /** Names a group control (radio group, checkbox group). */
  readonly Legend: (props: FieldsetLegendProps) => JSX.Element;
  /** The enclosing Root's field, for a part built by hand. */
  useField: (part: string) => BoundField<TWrites, TShows, TRootData>;
  /** A part bound to the enclosing Root's field (a select's trigger). */
  part: <TProps>(
    name: string,
    render: PartRender<TProps, TWrites, TShows, TRootData>,
  ) => (props: TProps) => JSX.Element;
  /** The module's View: the field's value read, not edited. */
  view: <TProps>(render: PartRender<TProps, TWrites, TShows, TRootData>) => (props: TProps) => JSX.Element;
  /** The module's Control; read-only (on the Root or the Form) it renders `view` with the same props. */
  control: <TProps>(
    render: PartRender<TProps, TWrites, TShows, TRootData>,
    options?: ControlOptions<TProps>,
  ) => (props: TProps) => JSX.Element;
};

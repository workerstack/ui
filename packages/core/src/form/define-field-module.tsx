import type { JSX } from "@solidjs/web";
import { createField, useStore } from "@tanstack/solid-form";
import { createContext, Show, untrack, useContext, type Context } from "solid-js";

import { cn } from "../cn/index.ts";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldsetLegend,
  type FieldDescriptionProps,
  type FieldLabelProps,
  type FieldOrientation,
  type FieldsetLegendProps,
} from "../field/index.ts";
import type { BoundField } from "./bound-field-types.ts";
import { createBoundField } from "./bound-field.ts";
import { ModuleError, type ModuleErrorProps } from "./field-module-error.tsx";
import type { FieldModule, FieldModuleOptions } from "./field-module-shape.ts";
import type { FieldRoot } from "./field-module-types.ts";
import { anyForm, ERROR_REVEAL_CONTEXT, FORM_READ_ONLY_CONTEXT, type FormFor } from "./form-field.ts";
import { showsErrors } from "./visibility.ts";

// A field module: a Root bound to one TanStack field and the parts inside it (Label, Control,
// Description, Error), from `defineFieldModule`. A part from another module, or outside any Root,
// throws at render naming both modules (JSX children all share one type, so the compiler can't).

/** The innermost Root's module name, for the error a part of another module throws. */
const ENCLOSING_MODULE_CONTEXT: Context<string | null> = /* @__PURE__ */ createContext<string | null>(null);

/** The one Root implementation behind every module's typed Root. */
type ImplementationProps = {
  children?: JSX.Element;
  class?: string;
  form: FormFor<unknown>;
  name: string;
  orientation?: FieldOrientation;
  readOnly?: boolean;
  required?: boolean;
  validators?: AnyValidators;
};

/** Field validators of any form, as `createField` takes them. */
type AnyValidators = NonNullable<ReturnType<Parameters<typeof createField>[0]>["validators"]>;

const INLINE =
  "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1.5 " +
  "[&>[data-slot=field-description]]:col-start-2 [&>[data-slot=field-error]]:col-start-2";

/** What a module's parts share: its name, options and the context its Root provides. */
type ModuleScope<TWrites, TShows, TRootData> = {
  name: string;
  options: FieldModuleOptions<TShows>;
  context: Context<BoundField<TWrites, TShows, TRootData> | null>;
  useField: (part: string) => BoundField<TWrites, TShows, TRootData>;
};

/** Where a part sits wrongly: its module, its name, and the Root it sits in, if any. */
type Misplaced = { module: string; part: string; enclosing: string | null };

function misplaced(names: Misplaced): Error {
  const { enclosing, module, part } = names;

  if (enclosing === null) return new Error(`${module}.${part} must sit inside ${module}.Root.`);

  return new Error(
    `${module}.${part} sits inside ${enclosing}.Root: a field's parts come from its own module ` +
      `(use ${enclosing}.${part}, or wrap it in ${module}.Root).`,
  );
}

function createScope<TWrites, TShows, TRootData>(
  options: FieldModuleOptions<TShows>,
): ModuleScope<TWrites, TShows, TRootData> {
  const context = createContext<BoundField<TWrites, TShows, TRootData> | null>(null);

  return {
    context,
    name: options.name,
    options,
    useField: (part) => {
      const field = useContext(context);

      if (field !== null) return field;

      throw misplaced({ enclosing: useContext(ENCLOSING_MODULE_CONTEXT), module: options.name, part });
    },
  };
}

function useBinding<TWrites, TShows, TRootData>(
  props: ImplementationProps & TRootData,
  empty: TShows,
): BoundField<TWrites, TShows, TRootData> {
  // createField reads its options once, directly in this body, then tracks them in an effect;
  // untrack marks that first read as meant (docs/upstream/tanstack-form.md, TF-5).
  const field = untrack(() =>
    createField(() => ({
      form: anyForm(props.form),
      name: props.name,
      validators: props.validators ?? {},
    })),
  );

  const attempts = useStore(untrack(() => props.form).store, (state) => state.submissionAttempts);
  const formReadOnly = useContext(FORM_READ_ONLY_CONTEXT);
  const early = useContext(ERROR_REVEAL_CONTEXT);

  return createBoundField<TWrites, TShows, TRootData>({
    empty,
    field,
    invalid: () => showsErrors({ attempts: attempts(), early: early(props.name), isValid: field().state.meta.isValid }),
    name: () => props.name,
    readOnly: () => props.readOnly ?? formReadOnly(),
    root: props,
  });
}

function rootOf<TWrites, TShows, TRootData>(
  scope: ModuleScope<TWrites, TShows, TRootData>,
): (props: ImplementationProps & TRootData) => JSX.Element {
  return function Root(props) {
    const bound = useBinding<TWrites, TShows, TRootData>(props, scope.options.empty);

    return (
      <scope.context value={bound}>
        <ENCLOSING_MODULE_CONTEXT value={scope.name}>
          <Field
            name={props.name}
            invalid={bound.invalid()}
            data-validating={bound.validating() ? "" : undefined}
            orientation={props.orientation ?? "vertical"}
            required={props.required === true}
            readOnly={bound.readOnly()}
            data-field-name={props.name}
            class={cn(scope.options.inline === true && INLINE, props.class)}
          >
            {props.children}
          </Field>
        </ENCLOSING_MODULE_CONTEXT>
      </scope.context>
    );
  };
}

function partOf<TWrites, TShows, TRootData>(
  scope: ModuleScope<TWrites, TShows, TRootData>,
): FieldModule<TWrites, TShows, TRootData>["part"] {
  return (name, render) => (props) => render(props, scope.useField(name));
}

function controlOf<TWrites, TShows, TRootData>(
  scope: ModuleScope<TWrites, TShows, TRootData>,
): FieldModule<TWrites, TShows, TRootData>["control"] {
  return (render, controlOptions = {}) =>
    function Control(props) {
      const field = scope.useField(controlOptions.part ?? "Control");
      const view = controlOptions.view;

      if (view === undefined) return render(props, field);

      // Component calls, as JSX makes them: untracked, so each one's reads stay its own.
      return (
        <Show when={field.readOnly()} fallback={untrack(() => render(props, field))}>
          {untrack(() => view(props))}
        </Show>
      );
    };
}

/**
 * Defines a field module whose control writes `TWrites` (and shows `TShows`, when it shows more
 * than it writes). The library's control fields and an app's own controls are built the same way:
 *
 *     const FormRemember = defineFieldModule<boolean>({ empty: false, name: "FormRemember" });
 *     export const Control = FormRemember.control((props: SwitchProps, field) => (
 *       <Switch {...props} checked={field.value()} onCheckedChange={field.change} />
 *     ));
 */
export function defineFieldModule<TWrites, TShows = TWrites, TRootData extends object = object>(
  options: FieldModuleOptions<TShows>,
): FieldModule<TWrites, TShows, TRootData> {
  const scope = createScope<TWrites, TShows, TRootData>(options);
  const part = partOf(scope);

  return {
    Description: part("Description", (props: FieldDescriptionProps) => <FieldDescription {...props} />),
    Error: (props: ModuleErrorProps) => <ModuleError props={props} field={scope.useField("Error")} />,
    Label: part("Label", (props: FieldLabelProps) => <FieldLabel {...props} />),
    Legend: part("Legend", (props: FieldsetLegendProps) => <FieldsetLegend {...props} />),
    // The one implementation stands behind the typed Root callers see.
    Root: rootOf(scope) /* FieldRoot's per-call check is a type over this one implementation */ as FieldRoot<
      TWrites,
      TShows,
      TRootData
    >,
    control: controlOf(scope),
    name: options.name,
    part,
    useField: scope.useField,
    view: (render) => part("View", render),
  };
}

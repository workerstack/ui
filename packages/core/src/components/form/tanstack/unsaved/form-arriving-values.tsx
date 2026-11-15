import type { JSX } from "@solidjs/web";
import { createEffect, untrack } from "solid-js";

import { useFormEngine, type FormValues } from "../form/form-engine.ts";
import { rebaseForm } from "./rebase-form.ts";

/** What `FormArrivingValues` takes. */
export type FormArrivingValuesProps = {
  /** Values that load after the form mounted (all of them or some paths); `undefined` is still loading. */
  values: FormValues | undefined;
  /** Which record the values belong to: values for another record replace the person's edits too. */
  record?: unknown;
};

/** The last values' record, once values arrived. */
type Seen = { isSeen: boolean; record?: unknown };

/**
 * Rebases its Form whenever `values` resolve or change: paths the person has not edited take the
 * new values, their edits stay, and values for another `record` replace everything. Pair it with
 * the Form's `pending` paths, so they show skeletons and a submit waits meanwhile. Renders nothing.
 *
 *     <Form form={form} pending={invoice() ? [] : ["lines"]}>
 *       <FormArrivingValues values={invoice()} record={invoiceId()} />
 */
export function FormArrivingValues(props: FormArrivingValuesProps): JSX.Element {
  const engine = useFormEngine("FormArrivingValues");
  const seen: Seen = { isSeen: false };

  createEffect(
    () => [props.values, props.record] as const,
    ([values, record]) => {
      if (values === undefined) return;

      const isAnother = seen.isSeen && !Object.is(record, seen.record);

      // A form store write inside an effect: untracked, as TanStack's store asks (TF-4).
      untrack(() => rebaseForm(engine, values, { keepEdited: !isAnother }));
      seen.isSeen = true;
      seen.record = record;
    },
  );

  return <></>;
}

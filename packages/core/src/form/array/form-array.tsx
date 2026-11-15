import type { JSX } from "@solidjs/web";

import type { ArrayKeys } from "./array-context.ts";
import {
  FormArrayAdd,
  FormArrayMoveDown,
  FormArrayMoveUp,
  FormArrayRemove,
  type FormArrayAddProps,
  type FormArrayItemButtonProps,
} from "./form-array-buttons.tsx";
import { FormArrayError, type FormArrayErrorProps } from "./form-array-error.tsx";
import { FormArrayHandle, type FormArrayHandleProps } from "./form-array-handle.tsx";
import { FormArrayItems, type FormArrayItemsProps } from "./form-array-items.tsx";
import { FormArrayRoot, type FormArrayRootProps } from "./form-array-root.tsx";

/** `formArray`: a TanStack array field's group and the parts inside it. */
export type FormArray = {
  /** The group, bound to the array field; a FieldsetLegend names it. */
  Root: <TFormData, TName extends ArrayKeys<TFormData>>(props: FormArrayRootProps<TFormData, TName>) => JSX.Element;
  /** One group per item, by index. */
  Items: (props: FormArrayItemsProps) => JSX.Element;
  /** Drags an item, by pointer. */
  Handle: (props: FormArrayHandleProps) => JSX.Element;
  /** Appends an item. */
  Add: <TItem>(props: FormArrayAddProps<TItem>) => JSX.Element;
  /** Removes an item. */
  Remove: (props: FormArrayItemButtonProps) => JSX.Element;
  /** Moves an item up one place. */
  MoveUp: (props: FormArrayItemButtonProps) => JSX.Element;
  /** Moves an item down one place. */
  MoveDown: (props: FormArrayItemButtonProps) => JSX.Element;
  /** The array's own errors. */
  Error: (props: FormArrayErrorProps) => JSX.Element;
};

/**
 * A TanStack array field, sorted by drag and by its buttons. Bind each item's fields by path with
 * the field modules; focus follows Add, Remove and every move:
 *
 *     <formArray.Root form={form} name="invites" max={5}>
 *       <FieldsetLegend>Invites</FieldsetLegend>
 *       <formArray.Items>
 *         {(index) => (
 *           <>
 *             <formArray.Handle index={index} />
 *             <formTextInput.Root form={form} name={`invites[${index}].email`}>…</formTextInput.Root>
 *             <formArray.MoveUp index={index} />
 *             <formArray.MoveDown index={index} />
 *             <formArray.Remove index={index} />
 *           </>
 *         )}
 *       </formArray.Items>
 *       <formArray.Add value={() => ({ email: "" })}>Add invite</formArray.Add>
 *       <formArray.Error />
 *     </formArray.Root>
 */
export const formArray: FormArray = {
  Add: FormArrayAdd,
  Error: FormArrayError,
  Handle: FormArrayHandle,
  Items: FormArrayItems,
  MoveDown: FormArrayMoveDown,
  MoveUp: FormArrayMoveUp,
  Remove: FormArrayRemove,
  Root: FormArrayRoot,
};

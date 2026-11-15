// When and what a TanStack-bound field shows as its error.

/**
 * What a form helper needs of a root element: its `querySelector`, and nothing else, so a Worker's
 * own `Element` type (which contradicts lib.dom's `ParentNode`) still fits.
 */
export type QueryRoot = Pick<Element, "querySelector">;

/** What `showsErrors` reads. */
export type ErrorVisibility = {
  /** Whether the field is valid now. */
  isValid: boolean;
  /** How many times the form was submitted. */
  attempts: number;
  /** Whether the field's errors show before any submit (a step's Next checked it). */
  early?: boolean;
};

/**
 * No errors before the first submit attempt, then they follow validity live: typing a fix clears
 * the error at once, breaking it again shows it at once. `early` shows them before any submit.
 */
export function showsErrors(visibility: ErrorVisibility): boolean {
  return (visibility.attempts > 0 || visibility.early === true) && !visibility.isValid;
}

/** A Standard Schema issue, or any validator result that carries a message. */
type Issue = { message: string };

function isIssue(error: unknown): error is Issue {
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string";
}

function isText(error: unknown): error is string {
  return typeof error === "string";
}

function isList(error: unknown): error is readonly unknown[] {
  return Array.isArray(error);
}

function texts(errors: readonly unknown[]): string[] {
  return errors.flatMap((error) => {
    if (isList(error)) return texts(error);

    if (isText(error)) return [error];

    return isIssue(error) ? [error.message] : [];
  });
}

/** Messages from validator results: strings and Standard Schema issues (`{ message }`), each once. */
export function errorMessages(errors: readonly unknown[]): string[] {
  return [...new Set(texts(errors).filter((message) => message !== ""))];
}

/** Server field errors (`{ email: ["Taken."] }`) as each field's `onServer` error, joined. */
export function serverErrorMap(
  fieldErrors: Readonly<Record<string, readonly string[] | undefined>>,
): Record<string, string> {
  const entries = Object.entries(fieldErrors).flatMap(([name, messages]): [string, string][] =>
    messages === undefined || messages.length === 0 ? [] : [[name, messages.join(" ")]],
  );

  return Object.fromEntries(entries);
}

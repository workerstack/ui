import type { DeepKeys } from "@tanstack/solid-form";

import type { FormFor } from "./form-field.ts";
import { serverErrorMap } from "./visibility.ts";

/** HTTP 401: the session ended, which is no form's problem to show. */
const UNAUTHORIZED = 401;

/**
 * Server field errors keyed by the form's field paths: a literal key must be a path of its values;
 * a result typed loosely (`Record<string, string[]>`, an API's response) still fits.
 */
export type ServerFieldErrors<TFormData> = Partial<Record<DeepKeys<TFormData>, readonly string[]>>;

/** What putting a server error on a form needs of it: the two setters it writes through. */
export type FormErrorSink<TFormData = unknown> = Pick<FormFor<TFormData>, "setErrorMap" | "setFieldMeta">;

/**
 * Puts server field errors on their fields as `onServer` errors; each clears when its field is
 * edited. A field that hasn't mounted yet still takes its error, and one the form doesn't show is
 * listed by the error summary.
 */
export function applyServerErrors<TFormData>(
  form: FormErrorSink<TFormData>,
  fieldErrors: ServerFieldErrors<TFormData>,
): void {
  for (const [name, message] of Object.entries(serverErrorMap(fieldErrors)))
    form.setFieldMeta(name, (meta) => ({ ...meta, errorMap: { ...meta.errorMap, onServer: message } }));
}

/** One problem with a field, as an API reports it. */
export type HttpFieldIssue = {
  /** What a person reads. */
  message?: string;
};

/** An HTTP error's JSON body: field problems by input name, and a message for the form. */
export type HttpErrorBody = {
  /** The problems of each field, by its input name. */
  fields?: Readonly<Record<string, readonly HttpFieldIssue[]>>;
  /** The form's own message. */
  message?: string;
};

/** An HTTP error as an API client throws it: its status and its body. */
export type HttpErrorResponse = {
  /** The HTTP status; a 401 is never the form's to show. */
  status?: number;
  /** The JSON body. */
  body: HttpErrorBody;
};

/** An HTTP error as an API client throws it: a response, or the body itself. */
export type HttpFormError = HttpErrorBody | HttpErrorResponse;

function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIssue(value: unknown): value is HttpFieldIssue {
  return isObject(value) && (!("message" in value) || typeof value.message === "string");
}

function isIssueMap(value: unknown): value is Readonly<Record<string, readonly HttpFieldIssue[]>> {
  return isObject(value) && Object.values(value).every((issues) => Array.isArray(issues) && issues.every(isIssue));
}

function isBody(value: unknown): value is HttpErrorBody {
  if (!isObject(value)) return false;
  const isMessage = !("message" in value) || typeof value.message === "string";

  return isMessage && (!("fields" in value) || isIssueMap(value.fields));
}

/** Whether `error` (a caught value) is an HTTP error with a body `applyHttpFormError` reads. */
export function isHttpFormError(error: unknown): error is HttpFormError {
  if (!isObject(error)) return false;

  if (!("body" in error)) return "fields" in error && isBody(error);

  return (!("status" in error) || typeof error.status === "number") && isBody(error.body);
}

/** Field messages from a body, by input name; empty messages and empty fields left out. */
function bodyFieldErrors(body: HttpErrorBody): Record<string, string[]> {
  const entries = Object.entries(body.fields ?? {}).flatMap(([name, issues]): [string, string[]][] => {
    const messages = issues.flatMap((issue) => issue.message ?? []).filter((message) => message !== "");

    return messages.length > 0 ? [[name, messages]] : [];
  });

  return Object.fromEntries(entries);
}

/**
 * Puts an HTTP error on the form: field messages land on their fields, a message with no fields
 * becomes the form's alert (`FormError`). Returns whether it did; a 401, or a body with neither, is
 * the caller's to rethrow:
 *
 *     catch (error) {
 *       if (!isHttpFormError(error) || !applyHttpFormError(form, error)) throw error;
 *     }
 */
export function applyHttpFormError<TFormData>(form: FormErrorSink<TFormData>, error: HttpFormError): boolean {
  if ("body" in error && error.status === UNAUTHORIZED) return false;
  const body = "body" in error ? error.body : error;
  const fields = bodyFieldErrors(body);

  if (Object.keys(fields).length > 0) {
    applyServerErrors(form, fields);

    return true;
  }

  if (body.message === undefined || body.message === "") return false;
  form.setErrorMap({ onSubmit: body.message });

  return true;
}

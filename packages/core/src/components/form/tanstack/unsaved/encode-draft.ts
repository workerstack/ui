import type { FormValue, FormValues } from "../form/form-engine.ts";
import { isGroup, isList } from "./values-changed.ts";

// A draft is the values a form keeps on this device, in an envelope that says which form wrote it
// and when, so a changed form or an old draft is never restored.

/** What a draft holds: the values, the form that wrote them, and when. */
export type Draft = {
  /** Which fields the form had when it was written (`draftFingerprint`, or FormUnsaved's `fingerprint`). */
  fingerprint: string;
  /** When it was written, in milliseconds since the epoch. */
  savedAt: number;
  /** The values kept. */
  values: FormValues;
};

/** What a stored draft must match to be restored. */
export type DraftExpectation = {
  /** Which fields the form has now. */
  fingerprint: string;
  /** The time now, in milliseconds since the epoch. */
  now: number;
  /** How many milliseconds a draft is kept. */
  ttl: number;
};

/** A value as JSON holds it. */
type Json = string | number | boolean | null | readonly Json[] | JsonObject;

/** A draft as JSON holds it: its fields, and the format it was written in. */
type Envelope = { v: number; fingerprint: string; savedAt: number; values: Json };

/** The envelope's format; a draft written in another is dropped. */
const VERSION = 1;

/** Dates survive the round trip as `{ $date: iso }`. */
const DATE_KEY = "$date";

function isScalar(value: FormValue): value is string | number | boolean | null {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function jsonEntry(entry: [string, FormValue]): [string, Json][] {
  const json = toJson(entry[1]);

  return json === undefined ? [] : [[entry[0], json]];
}

function toJson(value: FormValue): Json | undefined {
  if (value instanceof Date) return { [DATE_KEY]: value.toISOString() };

  if (isList(value)) return value.map((item) => toJson(item) ?? null);

  if (isGroup(value)) return Object.fromEntries(Object.entries(value).flatMap(jsonEntry));

  return isScalar(value) ? value : undefined;
}

/** A JSON value that holds others by key. */
type JsonObject = { readonly [key: string]: Json };

function isJsonList(value: Json): value is readonly Json[] {
  return Array.isArray(value);
}

function isJsonObject(value: Json): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: Json | undefined): value is string {
  return typeof value === "string";
}

function fromJson(value: Json): FormValue {
  if (isJsonList(value)) return value.map((item) => fromJson(item));

  if (!isJsonObject(value)) return value;

  const date = value[DATE_KEY];

  if (Object.keys(value).length === 1 && isText(date)) return new Date(date);

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fromJson(item)]));
}

/** A draft as the text a store keeps. */
export function encodeDraft(draft: Draft): string {
  const envelope: Envelope = { ...draft, v: VERSION, values: toJson(draft.values) ?? {} };

  return JSON.stringify(envelope);
}

/** Whether parsed JSON is a draft envelope of this format (its values are JSON, as parsed). */
function isEnvelope(value: unknown): value is Envelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "v" in value &&
    value.v === VERSION &&
    "fingerprint" in value &&
    typeof value.fingerprint === "string" &&
    "savedAt" in value &&
    typeof value.savedAt === "number" &&
    "values" in value
  );
}

function parse(text: string): Envelope | undefined {
  try {
    const parsed: unknown = JSON.parse(text);

    return isEnvelope(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

/** The draft in `text`, unless it is missing, malformed, from another form, or older than its ttl. */
export function decodeDraft(text: string | null, expect: DraftExpectation): Draft | undefined {
  const envelope = text === null ? undefined : parse(text);

  if (envelope === undefined || envelope.fingerprint !== expect.fingerprint) return undefined;

  if (expect.now - envelope.savedAt > expect.ttl) return undefined;

  const values = fromJson(envelope.values);

  return { fingerprint: envelope.fingerprint, savedAt: envelope.savedAt, values: isGroup(values) ? values : {} };
}

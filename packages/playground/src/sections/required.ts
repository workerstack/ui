type Check<TValue> = ({ value }: { value: TValue }) => string | undefined;

function onChange<TValue>(isMissing: (value: { value: TValue }) => boolean, message: string): Check<TValue> {
  return (change) => (isMissing(change) ? message : undefined);
}

/** Change validators: each gives `message` while its kind of value is missing. */
export const required = {
  items: (message: string): Check<string[]> => onChange(({ value }) => value.length === 0, message),
  on: (message: string): Check<boolean> => onChange(({ value }) => !value, message),
  pick: (message: string): Check<string | null> => onChange(({ value }) => value === null, message),
  text: (message: string): Check<string> => onChange(({ value }) => value === "", message),
};

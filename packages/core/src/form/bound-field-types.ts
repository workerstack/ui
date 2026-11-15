/** A consumer's handler a binding still calls: a function of the same arguments, or none. */
export type Handler<TArgs extends unknown[]> = ((...args: TArgs) => void) | undefined;

/** The value props a bound control takes from its field. */
export type ValueBindings<TWrites, TShows> = {
  /** The field's value. */
  readonly value: TShows;
  /** Writes the field. */
  onValueChange: (value: TWrites) => void;
  /** The Root's, the Form's or the control's own read-only; `undefined` when none is. */
  readonly readOnly: boolean | undefined;
};

/** What a control hands `values`: its own read-only. */
export type OwnReadOnly = {
  /** The control's own read-only. */
  readOnly?: boolean | undefined;
};

/** What a control hands `bind`: its own read-only and blur handler, which still runs. */
export type OwnBlur<TEvent extends FocusEvent> = OwnReadOnly & {
  /** The consumer's blur handler. */
  onBlur?: Handler<[event: TEvent]>;
};

/** What a control hands `bindLeaving`: its own read-only and focusout handler, which still runs. */
export type OwnFocusOut<TEvent extends FocusEvent> = OwnReadOnly & {
  /** The consumer's focusout handler. */
  onFocusOut?: Handler<[event: TEvent]>;
};

/** `bind`'s result: the value bindings and a blur handler. */
export type BlurBindings<TWrites, TShows, TEvent extends FocusEvent> = ValueBindings<TWrites, TShows> & {
  /** Settles the value, blurs the field, then runs the consumer's `onBlur`. */
  onBlur: (event: TEvent) => void;
};

/** `bindLeaving`'s result: the value bindings and a focusout handler. */
export type FocusOutBindings<TWrites, TShows, TEvent extends FocusEvent> = ValueBindings<TWrites, TShows> & {
  /** Blurs the field once focus leaves the whole control, then runs the consumer's `onFocusOut`. */
  onFocusOut: (event: TEvent) => void;
};

/** The enclosing Root's field as a module's parts see it, typed by the module. */
export type BoundField<TWrites, TShows = TWrites, TRootData = unknown> = {
  /** The Root's props, for what else the module's Root takes (a select's items). */
  readonly root: TRootData;
  /** The field's value; the module's `empty` while it is unset. */
  value: () => TShows;
  /** Writes the field; a server error on it retires (it answered the submitted value). */
  change: (value: TWrites) => void;
  /** Marks the field touched and runs its blur validators. */
  blur: () => void;
  /** The Root's (or the Form's) read-only. */
  readOnly: () => boolean;
  /** Whether the field's error shows (hidden until the first submit, then live). */
  invalid: () => boolean;
  /** The field's error messages. */
  messages: () => string[];
  /** Whether an async check of the value is running. */
  validating: () => boolean;
  /** The field's name, a path of the form's values. */
  name: () => string;
  /** A handler that blurs the field, then calls the consumer's `own` with the same arguments. */
  blurring: <TArgs extends unknown[]>(own?: Handler<TArgs>) => (...args: TArgs) => void;
  /** A focusout handler that blurs the field only when focus leaves the whole control. */
  leaving: <TEvent extends FocusEvent>(own?: Handler<[event: TEvent]>) => (event: TEvent) => void;
  /** The value bindings alone, for a control whose blur something around it reports. */
  values: (own: OwnReadOnly) => ValueBindings<TWrites, TShows>;
  /** `value`, `onValueChange`, `readOnly` and `onBlur`; `settle` is the value kept on blur (trimmed text). */
  bind: <TEvent extends FocusEvent>(
    own: OwnBlur<TEvent>,
    settle?: (value: TShows) => TWrites,
  ) => BlurBindings<TWrites, TShows, TEvent>;
  /** As `bind`, with `onFocusOut` blurring once focus leaves the whole control. */
  bindLeaving: <TEvent extends FocusEvent>(own: OwnFocusOut<TEvent>) => FocusOutBindings<TWrites, TShows, TEvent>;
};

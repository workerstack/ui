/** A list's main axis. */
export type Axis = "x" | "y";

/** A box in viewport coordinates. */
export type Rect = {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Width in CSS pixels. */
  width: number;
  /** Height in CSS pixels. */
  height: number;
};

/** A box on a list's main axis. */
export type Span = {
  /** The logical start. */
  start: number;
  /** The logical end. */
  end: number;
};

/** A position in viewport coordinates. */
export type Point = {
  /** Distance from the left edge. */
  x: number;
  /** Distance from the top edge. */
  y: number;
};

/** A physical direction on screen. */
export type Direction = "up" | "down" | "left" | "right";

/** Which way a list runs: its main axis, and whether a horizontal one flows right to left. */
export type Flow = {
  /** The main axis. */
  axis: Axis;
  /** Right to left. */
  rtl: boolean;
};

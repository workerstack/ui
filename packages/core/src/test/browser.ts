import { required } from "./required.ts";

function frame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Waits for the element's transitions and animations (and its children's) to finish. A popup's
 * opening transition starts only once its starting style is dropped, a frame or two after it shows,
 * so this waits two frames before it looks.
 */
export async function settled(el: Element): Promise<void> {
  await frame();
  await frame();
  await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
}

/** What a theme token computes to as a color, to compare with an element's computed style. */
export function token(name: `--ui-${string}`): string {
  const probe = document.createElement("div");
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();

  return color;
}

/** The element's computed style. */
export function style(el: Element): CSSStyleDeclaration {
  return getComputedStyle(el);
}

/** The element's box in the viewport. */
export function rect(el: Element): DOMRect {
  return el.getBoundingClientRect();
}

/** The icon a part draws in its `::before` / `::after`: the mask image, or "none". */
export function drawnIcon(el: Element, pseudo: "::after" | "::before"): string {
  return getComputedStyle(el, pseudo).maskImage;
}

/** What a UI SDK icon token (`--ui-icon-check`, …) computes to as a mask image. */
export function glyph(name: `--ui-icon-${string}`): string {
  const probe = document.createElement("div");
  probe.style.maskImage = `var(${name})`;
  document.body.append(probe);
  const image = getComputedStyle(probe).maskImage;
  probe.remove();

  return image;
}

/** A computed box-shadow that draws nothing: `none`, or only transparent zero-size shadows. */
export const NO_RING = /^(none|((rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)) 0px 0px 0px 0px(, )?)+)$/;

/** The part with `data-slot={name}` inside `el`; throws if there is none. */
export function part(el: Element, name: string): Element {
  return required(el.querySelector(`[data-slot="${name}"]`), `a ${name}`);
}

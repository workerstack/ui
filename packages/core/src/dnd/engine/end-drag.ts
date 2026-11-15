import { dropDuration, type Ending } from "../geometry/drop-duration.ts";
import type { Point } from "../geometry/geometry.types.ts";
import { SHIFT_EASING } from "../motion/motion.constants.ts";
import { listen } from "../pointer/listen.ts";
import { commit } from "./commit.ts";
import type { Drag, Landing } from "./drag.types.ts";
import { update } from "./frame.ts";
import { moveDragged, translateValue } from "./paint.ts";
import { translateTo } from "./slot.ts";
import { setTarget } from "./target.ts";

// Less than a pixel from its slot, the dragged element settles without an animation.
const STILL_PX = 1;

// The drop settles on the shift curve, which ends without a long tail, so the item stops moving when the commit lands
// rather than crawling its last pixel for 150ms first.

/** Animates the dragged element and its followers into the slot, then commits; a new press or any scroll ends it. */
function animateDrop(drag: Drag, landing: Landing, to: Point): void {
  const distance = Math.hypot(to.x - drag.translate.x, to.y - drag.translate.y);
  const ending: Ending = landing.isDrop ? "drop" : "cancel";
  const duration = drag.reduced || distance < STILL_PX ? 0 : dropDuration(distance, ending);
  const frames = [{ translate: translateValue(drag.translate) }, { translate: translateValue(to) }];
  drag.el.dataset.dndDropping = "";
  moveDragged(drag, to);
  let isDone = false;

  function settle(): void {
    if (isDone) return;
    isDone = true;
    commit(drag, landing);
  }

  if (duration === 0) return settle();

  const animations = [drag.el, ...drag.followers].map((node) =>
    node.animate(frames, { duration, easing: SHIFT_EASING }),
  );

  drag.finishDrop = () => {
    for (const animation of animations) animation.finish();
    settle();
  };

  const offScroll = listen("scroll", () => drag.finishDrop?.(), { capture: true, once: true, passive: true });
  void animations[0]?.finished.then(settle, settle).finally(offScroll);
}

/** Ends a running drag: a drop on the gap when wanted and allowed, else a cancel back home. */
export function endDrag(drag: Drag, ending: Ending): void {
  if (drag.phase !== "dragging") return;

  // A release can land between frames: catch up with the last pointer position first.
  if (drag.pointerId !== null) update(drag, performance.now());
  drag.phase = "dropping";
  cancelAnimationFrame(drag.frame);

  for (const off of drag.offs.splice(0)) off();
  const isDrop = ending === "drop" && !drag.blocked && drag.target !== null;

  if (!isDrop) setTarget(drag, drag.homeState, drag.from);
  const list = drag.target ?? drag.homeState;
  const { index } = list;
  animateDrop(drag, { index, isDrop, list }, translateTo(drag, list, index));
}

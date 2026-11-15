import { HarnessList, letters } from "./harness-list.fixture.tsx";

/** Vertical lists: with handles (variable heights, a disabled item), whole items, links, and core alone. */
export function ListPage() {
  return (
    <div class="harness-columns">
      <HarnessList
        id="handles"
        handles
        label="Handles"
        entries={letters(5, { c: { tall: 80 }, e: { disabled: true } })}
      />
      <HarnessList id="whole" label="Whole" entries={letters(4)} />
      <HarnessList id="links" links label="Links" entries={letters(3)} />
      <HarnessList id="core" core handles label="Core" entries={letters(3)} />
    </div>
  );
}

/** A wrap grid of equal tiles, three to a row. */
export function GridPage() {
  return (
    <HarnessList id="tiles" axis="grid" handles class="harness-grid" itemClass="harness-tile" entries={letters(7)} />
  );
}

/** A horizontal list of chips, in the document's reading direction. */
export function HorizontalPage() {
  return <HarnessList id="row" axis="x" handles class="harness-row" itemClass="harness-chip" entries={letters(5)} />;
}

/** A long list in a scrolling panel, inside a page that scrolls too. */
export function ScrollPage() {
  return (
    <div>
      <div class="harness-spacer" />
      <div class="harness-panel" data-testid="panel">
        <HarnessList id="long" entries={letters(26)} />
      </div>
      <div class="harness-spacer harness-tall" />
    </div>
  );
}

/** A list inside a modal dialog. */
export function DialogPage() {
  let dialog: HTMLDialogElement | undefined;
  return (
    <div>
      <button type="button" data-testid="open" onClick={() => dialog?.showModal()}>
        Open dialog
      </button>
      <dialog
        ref={(element: HTMLDialogElement) => {
          dialog = element;
        }}
        aria-label="Reorder"
        class="harness-dialog"
      >
        <HarnessList id="modal" handles label="Dialog list" entries={letters(4)} />
      </dialog>
    </div>
  );
}

import { describe, expect, it } from "vitest";

import { createLedger } from "./ledger.ts";

describe("createLedger", () => {
  it("restores the inline styles an element had, with their priority", () => {
    const el = document.createElement("div");
    el.style.setProperty("color", "red", "important");
    el.style.setProperty("translate", "4px 2px");
    const ledger = createLedger();
    ledger.set(el, { color: "blue", position: "fixed", translate: "10px 20px" });

    expect(el.style.getPropertyValue("position")).toBe("fixed");
    expect(el.style.getPropertyValue("color")).toBe("blue");

    // A second write to the same property keeps the first saved value.
    ledger.set(el, { translate: "11px 21px" });
    ledger.restore();

    expect(el.style.getPropertyValue("color")).toBe("red");
    expect(el.style.getPropertyPriority("color")).toBe("important");
    expect(el.style.getPropertyValue("translate")).toBe("4px 2px");
    expect(el.style.getPropertyValue("position")).toBe("");
  });

  it("restores one element and leaves the others", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const ledger = createLedger();
    ledger.set(a, { opacity: "0.5" });
    ledger.set(b, { opacity: "0.5" });
    ledger.restore(a);

    expect(a.style.opacity).toBe("");
    expect(b.style.opacity).toBe("0.5");
  });
});
